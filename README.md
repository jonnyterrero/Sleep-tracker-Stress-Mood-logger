# Sleep & Stress + App

A comprehensive sleep and stress tracking application built with React Native and Expo, designed to monitor sleep quality, mood, stress levels, and symptoms with ML and LLM integration capabilities.

## Features

### Core Sleep & Stress Tracking
- **Sleep Tracking**: Monitor sleep duration, quality, and patterns
- **Mood & Stress Monitoring**: Track emotional well-being and stress levels
- **Symptom Tracking**: Log GI flares, skin issues, and migraines
- **Journal Entries**: Record daily thoughts and experiences

### Data Schema
The app uses a structured data format that matches your Python analysis system:

```json
{
  "date": "2025-09-26",
  "sleep": {
    "start_time": "23:30",
    "end_time": "07:15",
    "duration_hours": 7.75,
    "quality_score": 8
  },
  "mood": {
    "mood_score": 6,
    "stress_score": 4,
    "journal_entry": "Felt anxious but slept okay.",
    "voice_note_path": "data/audio/2025-09-26.wav"
  },
  "symptoms": {
    "gi_flare": 2,
    "skin_flare": 0,
    "migraine": 1
  }
}
```

### Planned ML & LLM Features
- **Pattern Recognition**: Identify correlations between sleep, mood, and symptoms
- **Predictive Analytics**: Forecast potential sleep and stress issues
- **AI Sleep & Stress Assistant**: LLM-powered recommendations
- **Smart Insights**: Personalized sleep and stress insights

## Tech Stack

- **Frontend**: React Native with Expo
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation 6
- **UI Components**: Custom design system with TypeScript
- **Data Storage**: AsyncStorage for local data, API integration ready
- **Backend**: Node.js/Express with JSON file storage
- **Database**: JSON file storage (PostgreSQL planned for production)
- **ML/AI**: Python integration for correlation analysis

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # Theme, colors, and app constants
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # App screens
│   ├── auth/          # Authentication screens
│   ├── main/          # Main app screens
│   ├── tracking/      # Health tracking screens
│   └── insights/      # Analytics and insights screens
├── services/           # API and data services
├── store/              # Redux store and slices
└── types/              # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd health-ecosystem-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## Development

### Available Scripts
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run on web browser
- `npm run server` - Start backend server (when implemented)
- `npm run dev` - Run both frontend and backend concurrently
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Data Integration with Python

The app is designed to work seamlessly with your Python analysis system:

1. **Data Export**: Use `healthService.exportDataAsJSON()` to export data in the format your Python scripts expect
2. **Correlation Analysis**: Import results from your Python correlation analysis using `insightsService.importPythonAnalysisResults()`
3. **Real-time Sync**: The app can sync with your Python backend for real-time analysis

### Example Python Integration

```typescript
// Export data for Python analysis
const correlationData = await healthService.getCorrelationData();
const jsonData = JSON.stringify(correlationData);

// Import analysis results
const analysisResults = await insightsService.importPythonAnalysisResults(pythonResults);
```

## Key Components

### Sleep & Stress Tracking Screens
- **SleepTrackingScreen**: Track sleep duration and quality
- **MoodTrackingScreen**: Log mood, stress, and journal entries
- **SymptomTrackingScreen**: Monitor GI flares, skin issues, and migraines

### Data Services
- **healthService**: Core sleep and stress data management
- **insightsService**: ML insights and analysis
- **authService**: User authentication and management

### State Management
- **authSlice**: User authentication state
- **healthSlice**: Sleep and stress data and entries
- **insightsSlice**: AI insights and recommendations
- **settingsSlice**: User preferences and settings

## Future Enhancements

### Phase 1: Core Features ✅
- [x] Basic sleep and stress tracking (sleep, mood, symptoms)
- [x] Data persistence and local storage
- [x] User authentication
- [x] Modern UI/UX design
- [x] Backend API with JSON file storage

### Phase 2: ML Integration (In Progress)
- [x] Python backend integration
- [ ] Real-time correlation analysis
- [ ] Pattern recognition algorithms
- [ ] Predictive sleep and stress models

### Phase 3: LLM Features (Planned)
- [ ] AI sleep and stress assistant
- [ ] Natural language insights
- [ ] Personalized recommendations
- [ ] Voice note analysis

### Phase 4: Advanced Features (Planned)
- [ ] Wearable device integration
- [ ] Telehealth capabilities
- [ ] Community features
- [ ] Healthcare provider dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@sleepstressplus.app or join our Discord community.

---

Built with ❤️ using React Native, Expo, Node.js, and modern web technologies.

