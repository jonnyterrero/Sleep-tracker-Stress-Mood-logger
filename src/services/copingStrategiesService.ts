import { HealthEntry } from '../types';

export interface CopingStrategy {
  id: string;
  name: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'physical' | 'cognitive' | 'social';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effectiveness: number; // 1-5 scale
  instructions: string[];
  benefits: string[];
  whenToUse: string[];
}

export interface MoodBooster {
  id: string;
  name: string;
  description: string;
  category: 'activity' | 'social' | 'creative' | 'nature' | 'mindfulness';
  duration: number; // in minutes
  moodImpact: number; // 1-5 scale
  energyLevel: 'low' | 'medium' | 'high';
  instructions: string[];
  tips: string[];
}

class CopingStrategiesService {
  private static instance: CopingStrategiesService;

  static getInstance(): CopingStrategiesService {
    if (!CopingStrategiesService.instance) {
      CopingStrategiesService.instance = new CopingStrategiesService();
    }
    return CopingStrategiesService.instance;
  }

  getCopingStrategies(): CopingStrategy[] {
    return [
      {
        id: 'box_breathing',
        name: 'Box Breathing',
        description: 'A simple breathing technique to quickly reduce stress and anxiety',
        category: 'breathing',
        duration: 5,
        difficulty: 'beginner',
        effectiveness: 4,
        instructions: [
          'Sit comfortably with your back straight',
          'Inhale slowly for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly for 4 counts',
          'Hold empty for 4 counts',
          'Repeat for 5-10 cycles'
        ],
        benefits: [
          'Reduces stress and anxiety',
          'Improves focus and concentration',
          'Activates the parasympathetic nervous system',
          'Can be done anywhere, anytime'
        ],
        whenToUse: [
          'Before important meetings or presentations',
          'When feeling overwhelmed',
          'During panic attacks or anxiety episodes',
          'Before bedtime to promote relaxation'
        ]
      },
      {
        id: 'progressive_muscle_relaxation',
        name: 'Progressive Muscle Relaxation',
        description: 'Systematically tense and relax muscle groups to release physical tension',
        category: 'physical',
        duration: 15,
        difficulty: 'beginner',
        effectiveness: 4,
        instructions: [
          'Find a quiet, comfortable place to lie down',
          'Start with your toes - tense for 5 seconds, then relax',
          'Move up to your calves, thighs, and glutes',
          'Continue with your abdomen, chest, and back',
          'Tense and relax your arms, hands, and fingers',
          'Finish with your neck, face, and jaw',
          'Take deep breaths and notice the relaxation'
        ],
        benefits: [
          'Reduces muscle tension and pain',
          'Improves sleep quality',
          'Decreases anxiety and stress',
          'Increases body awareness'
        ],
        whenToUse: [
          'When experiencing muscle tension or pain',
          'Before bedtime for better sleep',
          'After a stressful day',
          'When feeling physically tense'
        ]
      },
      {
        id: 'mindful_breathing',
        name: 'Mindful Breathing',
        description: 'Focus on your breath to anchor yourself in the present moment',
        category: 'mindfulness',
        duration: 10,
        difficulty: 'beginner',
        effectiveness: 3,
        instructions: [
          'Sit or lie in a comfortable position',
          'Close your eyes or soften your gaze',
          'Focus on your natural breathing rhythm',
          'Notice the sensation of air entering and leaving your nostrils',
          'When your mind wanders, gently return to your breath',
          'Continue for 10 minutes or as long as comfortable'
        ],
        benefits: [
          'Reduces stress and anxiety',
          'Improves focus and attention',
          'Increases emotional regulation',
          'Promotes relaxation and calm'
        ],
        whenToUse: [
          'When feeling scattered or unfocused',
          'During moments of high stress',
          'As a daily mindfulness practice',
          'When you need to center yourself'
        ]
      },
      {
        id: 'cognitive_reframing',
        name: 'Cognitive Reframing',
        description: 'Challenge negative thoughts and replace them with more balanced perspectives',
        category: 'cognitive',
        duration: 10,
        difficulty: 'intermediate',
        effectiveness: 4,
        instructions: [
          'Identify the negative thought or situation',
          'Ask yourself: "Is this thought 100% true?"',
          'Consider alternative explanations or perspectives',
          'Look for evidence that contradicts the negative thought',
          'Reframe the situation in a more balanced way',
          'Practice the new, more helpful thought'
        ],
        benefits: [
          'Reduces negative thinking patterns',
          'Improves emotional regulation',
          'Increases resilience and coping skills',
          'Promotes more balanced perspective'
        ],
        whenToUse: [
          'When experiencing negative self-talk',
          'During challenging situations',
          'When feeling overwhelmed by problems',
          'As a regular mental health practice'
        ]
      },
      {
        id: 'grounding_technique',
        name: '5-4-3-2-1 Grounding',
        description: 'Use your senses to ground yourself in the present moment',
        category: 'mindfulness',
        duration: 5,
        difficulty: 'beginner',
        effectiveness: 3,
        instructions: [
          'Name 5 things you can see around you',
          'Name 4 things you can touch or feel',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste',
          'Take a deep breath and notice how you feel'
        ],
        benefits: [
          'Reduces anxiety and panic',
          'Brings attention to the present moment',
          'Interrupts negative thought spirals',
          'Can be done anywhere, anytime'
        ],
        whenToUse: [
          'During panic attacks or high anxiety',
          'When feeling disconnected or dissociated',
          'When overwhelmed by emotions',
          'As a quick stress relief technique'
        ]
      }
    ];
  }

  getMoodBoosters(): MoodBooster[] {
    return [
      {
        id: 'nature_walk',
        name: 'Nature Walk',
        description: 'Take a walk in nature to boost your mood and energy',
        category: 'nature',
        duration: 20,
        moodImpact: 4,
        energyLevel: 'medium',
        instructions: [
          'Find a nearby park, trail, or green space',
          'Leave your phone behind or put it on silent',
          'Walk at a comfortable pace',
          'Notice the sights, sounds, and smells around you',
          'Take deep breaths of fresh air',
          'Spend at least 20 minutes outdoors'
        ],
        tips: [
          'Even a 10-minute walk can help',
          'Try to go during daylight hours',
          'Bring water and wear comfortable shoes',
          'Focus on being present rather than exercising'
        ]
      },
      {
        id: 'music_therapy',
        name: 'Music Therapy',
        description: 'Listen to uplifting music to improve your mood',
        category: 'activity',
        duration: 15,
        moodImpact: 4,
        energyLevel: 'low',
        instructions: [
          'Choose music that makes you feel good',
          'Create a playlist of your favorite uplifting songs',
          'Find a comfortable place to listen',
          'Close your eyes and focus on the music',
          'Allow yourself to feel the emotions the music evokes',
          'Consider singing along or moving to the beat'
        ],
        tips: [
          'Upbeat, major-key songs tend to be most uplifting',
          'Avoid sad or angry music when feeling down',
          'Try different genres to find what works for you',
          'Consider creating different playlists for different moods'
        ]
      },
      {
        id: 'gratitude_journal',
        name: 'Gratitude Journaling',
        description: 'Write down things you\'re grateful for to shift your perspective',
        category: 'mindfulness',
        duration: 10,
        moodImpact: 3,
        energyLevel: 'low',
        instructions: [
          'Get a notebook or use a journaling app',
          'Write down 3-5 things you\'re grateful for today',
          'Be specific and detailed in your descriptions',
          'Include both big and small things',
          'Reflect on why you\'re grateful for each item',
          'Read back over previous entries when feeling down'
        ],
        tips: [
          'Try to write at the same time each day',
          'Don\'t worry about being profound - simple things count',
          'Include people, experiences, and even challenges',
          'Consider sharing your gratitude with others'
        ]
      },
      {
        id: 'creative_expression',
        name: 'Creative Expression',
        description: 'Engage in creative activities to express emotions and boost mood',
        category: 'creative',
        duration: 30,
        moodImpact: 4,
        energyLevel: 'medium',
        instructions: [
          'Choose a creative activity you enjoy (drawing, writing, crafting)',
          'Set aside dedicated time without distractions',
          'Don\'t worry about the outcome - focus on the process',
          'Express your current emotions through your chosen medium',
          'Allow yourself to experiment and play',
          'Take breaks if you feel frustrated'
        ],
        tips: [
          'Keep art supplies easily accessible',
          'Try different mediums to find what you enjoy',
          'Consider joining a creative group or class',
          'Remember that creativity is about expression, not perfection'
        ]
      },
      {
        id: 'social_connection',
        name: 'Social Connection',
        description: 'Reach out to friends or family for emotional support and connection',
        category: 'social',
        duration: 20,
        moodImpact: 5,
        energyLevel: 'medium',
        instructions: [
          'Think of someone you care about and who cares about you',
          'Reach out via call, text, or in person',
          'Be honest about how you\'re feeling',
          'Ask for support if you need it',
          'Listen actively to their response',
          'Offer support in return if appropriate'
        ],
        tips: [
          'Don\'t wait until you\'re in crisis to reach out',
          'Quality of connection matters more than quantity',
          'Consider joining support groups or communities',
          'Be open to both giving and receiving support'
        ]
      },
      {
        id: 'physical_activity',
        name: 'Gentle Movement',
        description: 'Engage in light physical activity to boost mood and energy',
        category: 'physical',
        duration: 15,
        moodImpact: 4,
        energyLevel: 'high',
        instructions: [
          'Choose an activity you enjoy (dancing, yoga, stretching)',
          'Start with gentle movements',
          'Focus on how your body feels',
          'Don\'t push yourself too hard',
          'Listen to your body and rest when needed',
          'End with some deep breathing'
        ],
        tips: [
          'Even 5-10 minutes of movement can help',
          'Choose activities that feel good, not punishing',
          'Consider following along with online videos',
          'Focus on enjoyment rather than intensity'
        ]
      }
    ];
  }

  getRecommendedStrategies(currentMood: number, stressLevel: number, energyLevel: number): CopingStrategy[] {
    const allStrategies = this.getCopingStrategies();
    
    // Filter strategies based on current state
    let recommended = allStrategies.filter(strategy => {
      // If mood is very low, prioritize high-effectiveness strategies
      if (currentMood <= 3) {
        return strategy.effectiveness >= 4;
      }
      
      // If stress is very high, prioritize quick strategies
      if (stressLevel >= 8) {
        return strategy.duration <= 10;
      }
      
      // If energy is low, avoid physically demanding strategies
      if (energyLevel <= 3) {
        return strategy.category !== 'physical' || strategy.difficulty === 'beginner';
      }
      
      return true;
    });

    // Sort by effectiveness and duration
    return recommended.sort((a, b) => {
      if (a.effectiveness !== b.effectiveness) {
        return b.effectiveness - a.effectiveness;
      }
      return a.duration - b.duration;
    });
  }

  getRecommendedMoodBoosters(currentMood: number, energyLevel: number): MoodBooster[] {
    const allBoosters = this.getMoodBoosters();
    
    // Filter based on current state
    let recommended = allBoosters.filter(booster => {
      // If mood is very low, prioritize high-impact boosters
      if (currentMood <= 3) {
        return booster.moodImpact >= 4;
      }
      
      // If energy is low, avoid high-energy activities
      if (energyLevel <= 3) {
        return booster.energyLevel !== 'high';
      }
      
      return true;
    });

    // Sort by mood impact
    return recommended.sort((a, b) => b.moodImpact - a.moodImpact);
  }
}

export const copingStrategiesService = CopingStrategiesService.getInstance();

