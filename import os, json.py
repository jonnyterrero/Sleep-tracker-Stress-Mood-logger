import os, json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, random_split
from sklearn.preprocessing import StandardScaler

# ================================
# CONFIG
# ================================
class Config:
    DATA_FILE = "health_logs.jsonl"
    MODEL_DIR = "models"
    SEQ_LEN = 14
    PRED_HORIZON = 1
    BATCH_SIZE = 32
    HIDDEN_SIZE = 64
    NUM_LAYERS = 2
    DROPOUT = 0.2
    LR = 1e-3
    EPOCHS = 30
    RNN_TYPE = "gru"  # or "lstm"

    # alert thresholds
    LOW_SLEEP_HOURS = 6.0
    HIGH_STRESS = 7.0
    HIGH_RISK_THRESHOLD = 6.5


# ================================
# DATA HANDLING
# ================================
def init_dataset():
    if not os.path.exists(Config.DATA_FILE):
        with open(Config.DATA_FILE, "w") as f:
            pass

def log_entry(date, sleep_start, sleep_end, quality, mood_score, stress_score,
              journal="", voice_note=None, gi_flare=0, skin_flare=0, migraine=0):
    fmt = "%H:%M"
    start = datetime.strptime(sleep_start, fmt)
    end = datetime.strptime(sleep_end, fmt)
    if end < start:
        end += timedelta(days=1)
    duration_hours = (end - start).seconds / 3600

    entry = {
        "date": date,
        "sleep": {
            "start_time": sleep_start,
            "end_time": sleep_end,
            "duration_hours": round(duration_hours, 2),
            "quality_score": quality
        },
        "mood": {
            "mood_score": mood_score,
            "stress_score": stress_score,
            "journal_entry": journal,
            "voice_note_path": voice_note
        },
        "symptoms": {
            "gi_flare": gi_flare,
            "skin_flare": skin_flare,
            "migraine": migraine
        }
    }
    with open(Config.DATA_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")

def load_dataset():
    if os.path.getsize(Config.DATA_FILE) == 0:
        return pd.DataFrame()
    df = pd.read_json(Config.DATA_FILE, lines=True)
    return pd.json_normalize(df.to_dict(orient="records"))

# ================================
# FEATURE ENGINEERING
# ================================
def build_features():
    df = load_dataset()
    if df.empty:
        return df

    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").set_index("date")

    # numeric only
    num_df = df.select_dtypes("number")

    # rolling averages
    for col in num_df.columns:
        for w in [3, 7]:
            num_df[f"{col}_ma{w}"] = num_df[col].rolling(w, min_periods=1).mean()

    return num_df


# ================================
# DATASET
# ================================
class SeqDataset(Dataset):
    def __init__(self, df, feature_cols, target_col, seq_len=14, horizon=1):
        self.X = df[feature_cols].values.astype(np.float32)
        self.y = df[target_col].values.astype(np.float32)
        self.seq_len = seq_len
        self.horizon = horizon
        self.indices = self._build_indices(len(df))

    def _build_indices(self, n):
        idx = []
        L, H = self.seq_len, self.horizon
        for t in range(n - L - H + 1):
            idx.append((t, t+L, t+L+H-1))
        return idx

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, i):
        s, e, t = self.indices[i]
        x_seq = self.X[s:e]
        y_next = self.y[t]
        return torch.from_numpy(x_seq), torch.tensor([y_next], dtype=torch.float32)


# ================================
# MODEL
# ================================
class RNNRegressor(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2, dropout=0.2, rnn_type="gru"):
        super().__init__()
        if rnn_type == "lstm":
            self.rnn = nn.LSTM(input_size, hidden_size, num_layers=num_layers,
                               batch_first=True, dropout=dropout)
        else:
            self.rnn = nn.GRU(input_size, hidden_size, num_layers=num_layers,
                              batch_first=True, dropout=dropout)
        self.head = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, 1)
        )

    def forward(self, x):
        out, _ = self.rnn(x)
        last = out[:, -1, :]
        return self.head(last)


# ================================
# TRAINING
# ================================
def train_model(df, feature_cols, target_col, model_path):
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

    scaler = StandardScaler()
    df_scaled = df.copy()
    df_scaled[feature_cols] = scaler.fit_transform(df[feature_cols])

    dataset = SeqDataset(df_scaled, feature_cols, target_col,
                         seq_len=Config.SEQ_LEN, horizon=Config.PRED_HORIZON)
    if len(dataset) < 20:
        print(f"[WARN] Not enough data to train {target_col}")
        return

    val_size = max(1, int(0.2 * len(dataset)))
    train_size = len(dataset) - val_size
    train_ds, val_ds = random_split(dataset, [train_size, val_size])

    train_dl = DataLoader(train_ds, batch_size=Config.BATCH_SIZE, shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=Config.BATCH_SIZE)

    model = RNNRegressor(len(feature_cols), Config.HIDDEN_SIZE,
                         Config.NUM_LAYERS, Config.DROPOUT, Config.RNN_TYPE).to(DEVICE)
    optim = torch.optim.Adam(model.parameters(), lr=Config.LR)
    loss_fn = nn.MSELoss()

    best_val = float("inf")
    os.makedirs(Config.MODEL_DIR, exist_ok=True)

    for epoch in range(1, Config.EPOCHS+1):
        model.train()
        tr_loss = 0
        for Xb, yb in train_dl:
            Xb, yb = Xb.to(DEVICE), yb.to(DEVICE)
            optim.zero_grad()
            loss = loss_fn(model(Xb), yb)
            loss.backward()
            optim.step()
            tr_loss += loss.item() * Xb.size(0)
        tr_loss /= len(train_dl.dataset)

        model.eval()
        val_loss = 0
        with torch.no_grad():
            for Xb, yb in val_dl:
                Xb, yb = Xb.to(DEVICE), yb.to(DEVICE)
                val_loss += loss_fn(model(Xb), yb).item() * Xb.size(0)
        val_loss /= len(val_dl.dataset)

        if val_loss < best_val:
            best_val = val_loss
            torch.save({"model": model.state_dict(),
                        "scaler_mean": scaler.mean_,
                        "scaler_scale": scaler.scale_,
                        "feature_cols": feature_cols}, model_path)

        if epoch % 5 == 0 or epoch == 1:
            print(f"[{target_col}] Epoch {epoch} | Train {tr_loss:.4f} | Val {val_loss:.4f}")

    print(f"✅ Saved {target_col} model to {model_path}")


# ================================
# INFERENCE + ALERTS
# ================================
def predict_next(df, target_col, model_path):
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    if not os.path.exists(model_path):
        return None

    ckpt = torch.load(model_path, map_location=DEVICE)
    feature_cols = ckpt["feature_cols"]
    scaler = StandardScaler()
    scaler.mean_ = ckpt["scaler_mean"]
    scaler.scale_ = ckpt["scaler_scale"]

    df_ = df.copy()
    df_[feature_cols] = scaler.transform(df_[feature_cols])
    seq = df_.tail(Config.SEQ_LEN)[feature_cols].values.astype(np.float32)
    if len(seq) < Config.SEQ_LEN:
        return None
    x = torch.tensor(seq).unsqueeze(0).to(DEVICE)

    model = RNNRegressor(len(feature_cols), Config.HIDDEN_SIZE,
                         Config.NUM_LAYERS, Config.DROPOUT, Config.RNN_TYPE).to(DEVICE)
    model.load_state_dict(ckpt["model"])
    model.eval()
    with torch.no_grad():
        return model(x).item()

def generate_alerts(df, preds):
    alerts = []
    if df.empty: return alerts
    last = df.tail(1)

    # Rule-based
    sleep = float(last["sleep.duration_hours"].iloc[0])
    stress = float(last["mood.stress_score"].iloc[0])
    if sleep < Config.LOW_SLEEP_HOURS:
        alerts.append(f"Low sleep ({sleep:.1f}h).")
    if stress >= Config.HIGH_STRESS:
        alerts.append(f"High stress ({stress:.1f}/10).")
    if sleep < Config.LOW_SLEEP_HOURS and stress >= Config.HIGH_STRESS:
        alerts.append("Combined risk: low sleep + high stress.")

    # Model-based
    if preds.get("gi_flare") and preds["gi_flare"] >= Config.HIGH_RISK_THRESHOLD:
        alerts.append(f"Model predicts high GI flare risk (~{preds['gi_flare']:.1f}/10).")
    if preds.get("mood") and preds["mood"] <= 4.0:
        alerts.append(f"Model predicts low mood tomorrow (~{preds['mood']:.1f}/10).")

    return alerts


# ================================
# MAIN
# ================================
if __name__ == "__main__":
    init_dataset()

    # Example: log fake entry (comment out when using real logs)
    log_entry("2025-09-26", "23:30", "07:15", 8, 6, 4, gi_flare=2, migraine=1)
    log_entry("2025-09-27", "00:10", "07:00", 7, 5, 6, gi_flare=4, migraine=0)

    df = build_features()
    if df.empty:
        print("No data available yet.")
        exit()

    targets = ["symptoms.gi_flare", "mood.mood_score"]
    feature_cols = [c for c in df.columns if c not in targets]

    # Train models
    train_model(df, feature_cols, "symptoms.gi_flare", os.path.join(Config.MODEL_DIR, "flare.pt"))
    train_model(df, feature_cols, "mood.mood_score", os.path.join(Config.MODEL_DIR, "mood.pt"))

    # Predict next day
    preds = {
        "gi_flare": predict_next(df, "symptoms.gi_flare", os.path.join(Config.MODEL_DIR, "flare.pt")),
        "mood": predict_next(df, "mood.mood_score", os.path.join(Config.MODEL_DIR, "mood.pt"))
    }
    print("\nPredictions:", preds)

    # Alerts
    alerts = generate_alerts(df, preds)
    print("\nAlerts:")
    for a in alerts:
        print("-", a)
