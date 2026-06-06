import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data persistence structure for student wellness sessions
let wellnessLogs = [
  {
    id: "log_initial_1",
    studentName: "Alex Chen",
    academicPursuit: "Senior College Midterms (Computer Science)",
    feelingsAnswers: {
      comfortLevel: "Restless but hopeful",
      energyLevel: "Overcast with quick focus spurts",
      anxietySeverity: "Medium",
      oneLinerNote: "Worried about balancing algorithmic theory with actual programming projects."
    },
    studyProfile: {
      dailyHours: 8,
      intenseMinutesFocus: 45,
      uninterruptedSittingMins: 120,
      screenTimeHrs: 10
    },
    cognitivePerformance: {
      stroopScore: 3,
      stroopTotal: 4,
      stroopAvgSpeedMs: 1420,
      memoryScore: 3,
      memoryTotal: 3,
      attentionScore: 7,
      attentionTotal: 8,
      accumulatedScore: 13
    },
    wellnessScore: 68,
    recommendations: [
      "⚠️ Screen Fatigue Critical: You are staring at screen modules for 120 minutes without visual relief. Deploy the 20-20-20 visual hygiene protocol.",
      "🧠 High Cognitive Retentiveness: Excellent results on the Working Memory index (3/3), but your Reaction vigilance grid shows slight motor speed lag.",
      "🌸 Micro-Dose Breaks: Break down your 8-hour daily marathons into structured 50-minute blocks with 5-minute physical breathing intervals."
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: "log_initial_2",
    studentName: "Maya Patel",
    academicPursuit: "JEE Advanced Entrance Exam Prep",
    feelingsAnswers: {
      comfortLevel: "Exhausted & highly tensed",
      energyLevel: "Stormy gale-force pressure",
      anxietySeverity: "Severe",
      oneLinerNote: "Solving physics problem sheets takes all night. Having trouble sleeping."
    },
    studyProfile: {
      dailyHours: 11,
      intenseMinutesFocus: 60,
      uninterruptedSittingMins: 180,
      screenTimeHrs: 12
    },
    cognitivePerformance: {
      stroopScore: 2,
      stroopTotal: 4,
      stroopAvgSpeedMs: 2310,
      memoryScore: 1,
      memoryTotal: 3,
      attentionScore: 4,
      attentionTotal: 8,
      accumulatedScore: 7
    },
    wellnessScore: 42,
    recommendations: [
      "🚨 Extreme Burnout Warning: An 11-hour study regime under severe anxiety is causing severe cognitive exhaustion. Working Memory score has dropped to 33%.",
      "🛑 Sitting Suture Risk: Sitting for 180 uninterrupted minutes causes severe peripheral circulatory fatigue. Stand up every 45 minutes of bookwork.",
      "🌙 Sleep Prioritization: Stop study sessions strictly by 10:00 PM. High-intensity physics work past midnight is degrading neuro-focus."
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

// Lazy initialization of GoogleGenAI SDK to prevent app crashing on startup if key is empty
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}


// --- API ROUTES ---

// 1. Diagnostics Health Check
app.get("/api/health", (req: Request, res: Response) => {
  const apiKeyPresent = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY.trim() !== "";
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: {
      nodeVersion: process.version,
      port: PORT,
      geminiApiKeyConfigured: apiKeyPresent,
      targetArchitecture: "Nirvana Wellness Console"
    }
  });
});

// 2. Fetch Wellness Logs list
app.get("/api/wellness-logs", (req: Request, res: Response) => {
  res.json(wellnessLogs);
});

// 3. Post a student wellness assessment and compile customized score & recommendations
app.post("/api/wellness-logs", async (req: Request, res: Response) => {
  const { studentName, academicPursuit, feelingsAnswers, studyProfile, cognitivePerformance } = req.body;

  if (!studentName || !academicPursuit) {
    res.status(400).json({ error: "Student name and academic fields are required." });
    return;
  }

  // A. Deterministic fallback recommendation algorithms (highly accurate clinical rule-base!)
  const localRecommendations: string[] = [];
  
  // Calculate raw stress triggers
  const dailyStudy = Number(studyProfile?.dailyHours || 0);
  const consecutiveSit = Number(studyProfile?.uninterruptedSittingMins || 0);
  const screenTime = Number(studyProfile?.screenTimeHrs || 0);
  
  const stroopSuccess = Number(cognitivePerformance?.stroopScore || 0);
  const memorySuccess = Number(cognitivePerformance?.memoryScore || 0);
  const attentionSuccess = Number(cognitivePerformance?.attentionScore || 0);

  // Synthesize a clinical Wellness Score (0 to 100)
  // Starts at 100, drops on high study pressure, long sittings, high anxiety feelings, and poor game accuracy
  let wellnessScore = 100;
  
  // Fatigue-based deductions
  if (dailyStudy > 9) {
    wellnessScore -= 15;
    localRecommendations.push(`⚠️ Intensive Study Fatigue: A ${dailyStudy}-hour daily regime is highly taxing. Restrict static revision blocks to prevent retention drops.`);
  } else if (dailyStudy > 6) {
    wellnessScore -= 5;
  }

  if (consecutiveSit > 120) {
    wellnessScore -= 18;
    localRecommendations.push(`🛑 Deep Sedentary Lock: Sitting continuously for ${consecutiveSit} minutes restricts oxygenated circulation. Stand up & stretch every 50 minutes.`);
  } else if (consecutiveSit > 60) {
    wellnessScore -= 8;
  }

  if (screenTime > 9) {
    wellnessScore -= 12;
    localRecommendations.push(`👁️ Retinal Fatigue Warning: ${screenTime} hours of daily screen exposure causes computer vision syndrome. Apply a blue-light screen blocker.`);
  }

  // Feeling audit checks
  if (feelingsAnswers?.anxietySeverity === "Severe" || feelingsAnswers?.anxietySeverity === "High") {
    wellnessScore -= 20;
    localRecommendations.push(`🌸 Nervous System Load: Your self-reported tension feels intense. We strongly recommend implementing the Box-Breathing process (4s inhale, 4s hold, 4s exhale) before exams.`);
  } else if (feelingsAnswers?.anxietySeverity === "Medium") {
    wellnessScore -= 10;
  }

  // Cognitive Performance evaluation (Stroop, memory, vigilance counts)
  const memoryRatio = memorySuccess / 3;
  if (memoryRatio < 0.4) {
    wellnessScore -= 15;
    localRecommendations.push(`🧠 Working Memory Attrogence: Memory recall score is low (${memorySuccess}/3). This typically happens due to sleep latency or heavy emotional stress. Take a power nap.`);
  }

  const stroopRatio = stroopSuccess / 4;
  if (stroopRatio < 0.6) {
    wellnessScore -= 10;
    localRecommendations.push(`⚡ Cognitive Processing Slowdown: Executive function shows a minor lag on the selective color focus test. Reduce multitasking.`);
  }

  // Don't let wellness score fall below 10 or go above 100
  wellnessScore = Math.max(10, Math.min(100, wellnessScore));

  if (localRecommendations.length === 0) {
    localRecommendations.push("✨ Superb Academic Sync: Your cognitive responses are highly alert, and study schedules have built-in pacing. Maintain this healthy balance!");
  }

  const client = getGeminiClient();
  let finalRecommendations = localRecommendations;
  let isAiConsulted = false;

  if (client) {
    try {
      // Prompt the Gemini Model to deliver professional, therapeutic, student-oriented advice
      const chatPrompt = `You are a warm, highly empathetic Student Academic Advisor and Cognitive Care Specialist.
Analyze this student's assessment and provide 3 highly customized, compassionate, bulleted stress-relief strategies.
Student Name: ${studentName}
Pursuing: ${academicPursuit}
Feelings Day: Comfort lies at "${feelingsAnswers?.comfortLevel}", energy weather forecast is "${feelingsAnswers?.energyLevel}", severity scale is "${feelingsAnswers?.anxietySeverity}".
Student Notes: "${feelingsAnswers?.oneLinerNote || 'None'}"
Study Profile: Out of 24 hours, studies for ${dailyStudy} hours, handles deep study sessions of ${studyProfile?.intenseMinutesFocus} minutes, sits for ${consecutiveSit} minutes, and gets ${screenTime} hours of monitor screen time.
Cognitive Games: Stroop Selective Attention score was ${stroopSuccess}/4, Game Memory recall was ${memorySuccess}/3, Vigilance attention grid click reaction count was ${attentionSuccess}/8 clicks.
Calculated baseline score: ${wellnessScore}%

Output exactly 3 highly personalized, scannable advice bullet cards. Keep the tone inspiring, directly referencing their target exam/pursuit, and avoid clinical boilerplate jargon. Keep each bullet under 100 characters so it fits on responsive UI components correctly.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatPrompt,
        config: {
          systemInstruction: "You are a wellness advisor for high-stakes exam students. Generate encouraging action cards in simple string array formats.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 3 friendly, highly personalized actionable suggestions for the student"
          }
        }
      });

      if (response.text) {
        const generatedTips = JSON.parse(response.text.trim());
        if (Array.isArray(generatedTips) && generatedTips.length > 0) {
          finalRecommendations = generatedTips;
          isAiConsulted = true;
        }
      }
    } catch (aiErr) {
      console.error("Gemini advice synthesis errored, using high-fidelity local recommendations:", aiErr);
    }
  }

  const newLog = {
    id: "log_" + Date.now(),
    studentName,
    academicPursuit,
    feelingsAnswers: {
      comfortLevel: feelingsAnswers?.comfortLevel || "Undetermined",
      energyLevel: feelingsAnswers?.energyLevel || "Clear skies",
      anxietySeverity: feelingsAnswers?.anxietySeverity || "Low",
      oneLinerNote: feelingsAnswers?.oneLinerNote || ""
    },
    studyProfile: {
      dailyHours: dailyStudy,
      intenseMinutesFocus: Number(studyProfile?.intenseMinutesFocus || 45),
      uninterruptedSittingMins: consecutiveSit,
      screenTimeHrs: screenTime
    },
    cognitivePerformance: {
      stroopScore: stroopSuccess,
      stroopTotal: 4,
      stroopAvgSpeedMs: Number(cognitivePerformance?.stroopAvgSpeedMs || 1500),
      memoryScore: memorySuccess,
      memoryTotal: 3,
      attentionScore: attentionSuccess,
      attentionTotal: 8,
      accumulatedScore: stroopSuccess + memorySuccess + attentionSuccess
    },
    wellnessScore,
    recommendations: finalRecommendations,
    isAiConsulted,
    createdAt: new Date().toISOString()
  };

  wellnessLogs.unshift(newLog);
  res.status(201).json(newLog);
});

// 4. Delete historic wellness diagnostics log
app.delete("/api/wellness-logs/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = wellnessLogs.findIndex(log => log.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Session log not found." });
    return;
  }
  const deleted = wellnessLogs.splice(index, 1);
  res.json(deleted[0]);
});


// --- BOOTSTRAP VITE / PRODUCTION SERVING ---

async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server route configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`  NIRVANA STUDENT WELLNESS SERVER OPERATIONAL`);
    console.log(`  Local Endpoint: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

initializeApp().catch((error) => {
  console.error("Critical: Failed to bootstrap server pipeline.", error);
});
