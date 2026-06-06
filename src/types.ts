export interface FeelingsAnswers {
  comfortLevel: string;
  energyLevel: string;
  anxietySeverity: string;
  oneLinerNote: string;
}

export interface StudyProfile {
  dailyHours: number;
  intenseMinutesFocus: number;
  uninterruptedSittingMins: number;
  screenTimeHrs: number;
}

export interface CognitivePerformance {
  stroopScore: number;
  stroopTotal: number;
  stroopAvgSpeedMs: number;
  memoryScore: number;
  memoryTotal: number;
  attentionScore: number;
  attentionTotal: number;
  accumulatedScore: number;
}

export interface WellnessLog {
  id: string;
  studentName: string;
  academicPursuit: string;
  feelingsAnswers: FeelingsAnswers;
  studyProfile: StudyProfile;
  cognitivePerformance: CognitivePerformance;
  wellnessScore: number;
  recommendations: string[];
  isAiConsulted?: boolean;
  createdAt: string;
}

export interface ServerHealth {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: {
    nodeVersion: string;
    port: number;
    geminiApiKeyConfigured: boolean;
    targetArchitecture: string;
  };
}
