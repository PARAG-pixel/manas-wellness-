import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, Terminal, Sparkles, Brain, Clock, HelpCircle, 
  User, Check, ChevronRight, Activity, Smile, Frown, Shield, Sun, CloudRain, 
  CloudLightning, Compass, Plus, Lightbulb, BookOpen, RotateCcw, AlertTriangle
} from "lucide-react";

import CognitiveTests from "./components/CognitiveTests";
import WellnessHistoryLogs from "./components/WellnessHistoryLogs";
import AuraDiagnostics from "./components/AuraDiagnostics";
import { CognitivePerformance, WellnessLog } from "./types";

const ACADEMIC_PRESETS = [
  { label: "📚 College Finals Stress", pursuit: "Undergraduate Finals (Weekly Exams)" },
  { label: "🧪 JEE Advanced (Engg. Entrance)", pursuit: "IIT-JEE Advanced Entrance Exam Preparation" },
  { label: "🩺 Medical Boards / MCAT", pursuit: "Medical Board Licensure revisions" },
  { label: "📝 SAT / AP Examinations", pursuit: "AP College Preparatory workload stress" }
];

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Progressive Wizard Steps
  // Step 0: Academic Profile Portrait
  // Step 1: Comfort Dialogue Space
  // Step 2: Screen & Sitting Audits
  // Step 3: Progressive Cognitive Agility Test
  // Step 4: Balance Evaluation & Advice Dashboard
  const [wizardStep, setWizardStep] = useState<number>(0);

  // Phase 0: Academic inputs
  const [studentName, setStudentName] = useState("");
  const [academicPursuit, setAcademicPursuit] = useState("");

  // Phase 1: Feelings answers
  const [comfortLevel, setComfortLevel] = useState("Calm");
  const [energyLevel, setEnergyLevel] = useState("Bright & Sunny");
  const [anxietySeverity, setAnxietySeverity] = useState("Mild");
  const [studentNote, setStudentNote] = useState("");

  // Phase 2: Study variables
  const [dailyHours, setDailyHours] = useState(7);
  const [consecutiveSitting, setConsecutiveSitting] = useState(90);
  const [screenTimeHours, setScreenTimeHours] = useState(8);
  const [intenseWorkMinutes, setIntenseWorkMinutes] = useState(45);

  // Phase 3: Cognitive test variables
  const [cognitiveResults, setCognitiveResults] = useState<CognitivePerformance | null>(null);

  // Compiled results display
  const [latestAssessment, setLatestAssessment] = useState<WellnessLog | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Helper selectors
  const loadPreset = (pursuitText: string) => {
    setAcademicPursuit(pursuitText);
  };

  const handleCognitiveComplete = (perfResponse: CognitivePerformance) => {
    setCognitiveResults(perfResponse);
    triggerClinicalPostEvaluation(perfResponse);
  };

  // POST endpoint sync triggers clinical analysis score compiles
  const triggerClinicalPostEvaluation = async (activePerf: CognitivePerformance) => {
    setIsEvaluating(true);
    try {
      const postBody = {
        studentName: studentName.trim() || "Anonymous Student",
        academicPursuit: academicPursuit.trim() || "Routine Academic Term stress",
        feelingsAnswers: {
          comfortLevel,
          energyLevel,
          anxietySeverity,
          oneLinerNote: studentNote
        },
        studyProfile: {
          dailyHours,
          intenseMinutesFocus: intenseWorkMinutes,
          uninterruptedSittingMins: consecutiveSitting,
          screenTimeHrs: screenTimeHours
        },
        cognitivePerformance: activePerf
      };

      const res = await fetch("/api/wellness-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody)
      });

      if (!res.ok) {
        throw new Error("Wellness diagnostics endpoint call failed.");
      }

      const generatedAssessment: WellnessLog = await res.json();
      setLatestAssessment(generatedAssessment);
      setWizardStep(4); // Advance to evaluation panel
      // Refresh timeline list metrics
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert("Error compiling wellness dashboard: " + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const restartDiagnosticWizard = () => {
    // Reset wizard variables to start blank
    setStudentName("");
    setAcademicPursuit("");
    setComfortLevel("Calm");
    setEnergyLevel("Bright & Sunny");
    setAnxietySeverity("Mild");
    setStudentNote("");
    setDailyHours(7);
    setConsecutiveSitting(90);
    setScreenTimeHours(8);
    setIntenseWorkMinutes(45);
    setCognitiveResults(null);
    setLatestAssessment(null);
    setWizardStep(0);
  };

  return (
    <div className="min-h-screen bg-[#0c0a0f] text-zinc-150 flex flex-col antialiased selection:bg-violet-600 selection:text-white relative">
      {/* Visual top dark gradient grids */}
      <div className="absolute top-0 left-0 w-full h-[550px] bg-gradient-to-b from-violet-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Top Header Branding */}
      <header className="border-b border-[#231b38]/70 bg-[#0d0b13]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 shadow-xl text-white">
              <Brain size={22} className="text-white fill-[#fff]/10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-white tracking-tight font-sans">
                  Nirvana Student Wellness Cockpit
                </h1>
                <span className="text-[9px] font-mono font-bold bg-[#1d1538] text-violet-300 border border-violet-800/45 px-1.5 py-0.5 rounded">
                  DEPLOYED
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Evaluates screen strain ratios, reviews emotional weather, and maps brain alertness levels under high stress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs bg-[#12101a] border border-[#2b214a] px-3 py-1.5 rounded-lg text-zinc-350 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Wellness Core Port:</span>
              <strong className="text-zinc-100">3000</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Workspace Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LHS Main Desk Area (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* PROGRESS BAR WIZARD TRACKER */}
            <div className="bg-[#12101a] p-3 border border-[#231b38]/80 rounded-xl flex items-center justify-between gap-2 overflow-x-auto">
              {[
                { stepId: 0, title: "1. Profile Portrait" },
                { stepId: 1, title: "2. Comfort Dialogue" },
                { stepId: 2, title: "3. Schedule Audit" },
                { stepId: 3, title: "4. Cognitive Lab" },
                { stepId: 4, title: "5. Wellness Evaluation" }
              ].map((item) => {
                const isActive = wizardStep === item.stepId;
                const isPassed = wizardStep > item.stepId;
                return (
                  <div 
                    key={item.stepId}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive 
                        ? "bg-violet-950/40 text-violet-300 border border-violet-800/50" 
                        : isPassed 
                        ? "text-emerald-400" 
                        : "text-zinc-550"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full text-[9px] font-mono flex items-center justify-center ${
                      isActive 
                        ? "bg-violet-500 text-white" 
                        : isPassed 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {isPassed ? "✓" : item.stepId + 1}
                    </span>
                    <span>{item.title}</span>
                  </div>
                );
              })}
            </div>

            {/* INTERACTIVE COMPANION CARD */}
            <div className="bg-[#12101a] border border-[#231b38] rounded-xl p-6.5 shadow-sm min-h-[360px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {/* PHASE 0: Academic Details Portrait */}
                {wizardStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight">Academic Portrait Setup</h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        First, introduce yourself and set the focus goal or test you are actively preparing for.
                      </p>
                    </div>

                    <div className="space-y-4 max-w-xl">
                      {/* Name fields */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          E.g. Student Identifier Name:
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                            <User size={15} />
                          </span>
                          <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-[#181524] border border-[#2b2147] rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-550 focus:outline-none focus:border-violet-500 tracking-tight glow-card"
                          />
                        </div>
                      </div>

                      {/* Course / exams details */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          What academic pursuit or high-stakes exam goals are you pursuing?
                        </label>
                        <input
                          type="text"
                          value={academicPursuit}
                          onChange={(e) => setAcademicPursuit(e.target.value)}
                          placeholder="e.g. JEE entrance, College finals or Med-school revisions"
                          className="w-full bg-[#181524] border border-[#2b2147] rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-550 focus:outline-none focus:border-violet-500 tracking-tight glow-card"
                        />
                      </div>

                      {/* Preset triggers */}
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                          Rapid Preset Loaders:
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {ACADEMIC_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!studentName) setStudentName("Maya Patel");
                                loadPreset(preset.pursuit);
                              }}
                              className="text-xs text-zinc-300 bg-[#211d33] hover:bg-[#2e2947] px-3 py-1.5 rounded-lg border border-[#342a54] hover:border-violet-600 transition-all cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-800/50 flex justify-end">
                      <button
                        onClick={() => setWizardStep(1)}
                        disabled={!studentName.trim() || !academicPursuit.trim()}
                        className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer glow-btn inline-flex items-center gap-1.5"
                      >
                        <span>Enter Conversation Space</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* PHASE 1: Friendly Comfort Dialogue (One-Liners) */}
                {wizardStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight">Comfort Conversation Desk</h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Hi <strong className="text-violet-400">{studentName}</strong>. Revision seasons are long. Let's align how you have felt on-task today. All inputs are local and anonymous.
                      </p>
                    </div>

                    <div className="space-y-5 max-w-2xl">
                      {/* Q1: Comfort tactile buttons */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          1. How does your workspace feel when staring at books/screens?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { val: "Ergonomic & Calm", label: "Cozy & Calm", icon: <Smile className="text-emerald-400" size={14} /> },
                            { val: "Neck ache & stiff", label: "Body is stiff", icon: <Frown className="text-amber-400" size={14} /> },
                            { val: "Heavy screen strain", label: "Visually strained", icon: <AlertTriangle className="text-rose-400" size={14} /> }
                          ].map((item) => (
                            <button
                              key={item.val}
                              onClick={() => setComfortLevel(item.val)}
                              className={`flex items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                comfortLevel === item.val
                                  ? "bg-violet-950/40 text-violet-300 border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                                  : "bg-[#181524] border-[#2b2147] text-zinc-300 hover:border-[#382b5d]"
                              }`}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Q2: Mental forecast */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          2. If your focus levels were a weather statement, what describes them right now?
                        </label>
                        <div className="grid grid-cols-4 gap-2.5">
                          {[
                            { value: "Bright & Sunny", text: "Sunny Forecast", icon: <Sun className="text-amber-400" size={14} /> },
                            { value: "Overcast clouds", text: "Cloudy Fog", icon: <Compass className="text-cyan-400" size={14} /> },
                            { value: "Drizzle / Wandering", text: "Drifting Mist", icon: <CloudRain className="text-[#8B5CF6]" size={14} /> },
                            { value: "Severe storm / Burnout", text: "Storm Pressure", icon: <CloudLightning className="text-rose-400" size={14} /> }
                          ].map((weather) => (
                            <button
                              key={weather.value}
                              onClick={() => setEnergyLevel(weather.value)}
                              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all text-center ${
                                energyLevel === weather.value
                                  ? "bg-violet-950/40 text-violet-300 border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                                  : "bg-[#181524] border-[#2b2147] text-zinc-300 hover:border-[#382b5d]"
                              }`}
                            >
                              {weather.icon}
                              <span>{weather.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Q3: Anxiety level */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          3. What is your present chest and neck tension rate?
                        </label>
                        <div className="flex gap-3">
                          {["Mild", "Medium", "High", "Severe"].map((level) => (
                            <button
                              key={level}
                              onClick={() => setAnxietySeverity(level)}
                              className={`flex-1 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                anxietySeverity === level
                                  ? level === "Severe" || level === "High"
                                    ? "bg-rose-955/40 text-rose-350 border-rose-600 font-bold"
                                    : "bg-violet-950/40 text-violet-300 border-violet-500"
                                  : "bg-[#181524] border-[#2b2147] text-zinc-400 hover:border-[#382b5d]"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes Box */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Add a quick one-liner note about what made you feel this way today (optional)
                        </label>
                        <input
                          type="text"
                          value={studentNote}
                          onChange={(e) => setStudentNote(e.target.value)}
                          placeholder="e.g. Too much MCQ workload, or nervous about biochemistry slides..."
                          className="w-full bg-[#181524] border border-[#2b2147] rounded-lg px-4 py-2 text-xs text-zinc-150 placeholder-zinc-550 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-800/50 flex justify-between">
                      <button
                        onClick={() => setWizardStep(0)}
                        className="px-4 py-2 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 text-xs font-semibold"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setWizardStep(2)}
                        className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all cursor-pointer glow-btn inline-flex items-center gap-1.5"
                      >
                        <span>Audit Study Schedule</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* PHASE 2: Screen and Sitting Audits */}
                {wizardStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight">Sitting & Screen Audit</h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Use the sliding gauges below to record your study rhythm variables accurately. 
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                      {/* study hours */}
                      <div className="space-y-2.5 bg-[#181524] p-4.5 rounded-xl border border-[#2b2147]/60">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <span>1. Daily Revision block</span>
                          <span className="text-violet-400 font-mono text-sm">{dailyHours} Hours / Day</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="16"
                          value={dailyHours}
                          onChange={(e) => setDailyHours(Number(e.target.value))}
                          className="w-full accent-violet-600 h-1.5 bg-[#0c0a0f] rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Out of 24hr calendar, how much combined hours do you actively revise?
                        </p>
                      </div>

                      {/* Screen exposure */}
                      <div className="space-y-2.5 bg-[#181524] p-4.5 rounded-xl border border-[#2b2147]/60">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <span>2. Combined Monitor Time</span>
                          <span className="text-violet-400 font-mono text-sm">{screenTimeHours} hrs</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="18"
                          value={screenTimeHours}
                          onChange={(e) => setScreenTimeHours(Number(e.target.value))}
                          className="w-full accent-violet-600 h-1.5 bg-[#0c0a0f] rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Includes laptop reads, videos, class tablets, and cell phones combined.
                        </p>
                      </div>

                      {/* Uninterrupted sitting duration */}
                      <div className="space-y-2.5 bg-[#181524] p-4.5 rounded-xl border border-[#2b2147]/60">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <span>3. Continuous Sitting Duration</span>
                          <span className="text-violet-400 font-mono text-sm">{consecutiveSitting} min stretch</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="240"
                          step="15"
                          value={consecutiveSitting}
                          onChange={(e) => setConsecutiveSitting(Number(e.target.value))}
                          className="w-full accent-violet-600 h-1.5 bg-[#0c0a0f] rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          How long do you continuously sit in one stance without walking around or stretching?
                        </p>
                      </div>

                      {/* intense minutes */}
                      <div className="space-y-2.5 bg-[#181524] p-4.5 rounded-xl border border-[#2b2147]/60">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <span>4. Intentional Deep-Flow Limits</span>
                          <span className="text-violet-450 font-mono text-sm">{intenseWorkMinutes} Minutes</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="120"
                          step="5"
                          value={intenseWorkMinutes}
                          onChange={(e) => setIntenseWorkMinutes(Number(e.target.value))}
                          className="w-full accent-violet-600 h-1.5 bg-[#0c0a0f] rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Target duration before mental distraction or checking phone devices takes toll on focus.
                        </p>
                      </div>
                    </div>

                    {/* Dynamic warnings based on changes */}
                    {consecutiveSitting >= 120 && (
                      <div className="bg-amber-500/10 border border-amber-650/20 rounded-lg p-3 text-xs text-amber-250 leading-relaxed flex items-center gap-2">
                        <Clock size={16} className="text-amber-400 shrink-0 animate-pulse" />
                        <span>💡 Continuous sitting over 2 hours significantly induces lower spine exhaustion and reduces vascular blood flow. Consider scaling down to 45-minute blocks.</span>
                      </div>
                    )}

                    <div className="pt-6 border-t border-zinc-800/50 flex justify-between">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="px-4 py-2 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 text-xs font-semibold"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setWizardStep(3)}
                        className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all cursor-pointer glow-btn inline-flex items-center gap-1.5"
                      >
                        <span>Enter Cognitive Lab Test</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* PHASE 3: Cognitive Agility Lab */}
                {wizardStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight">Brain Agility Assessment Games</h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Run the browser visual diagnostic suite to compute accuracy indexes directly on your keyboard/screen.
                      </p>
                    </div>

                    <CognitiveTests onComplete={handleCognitiveComplete} />

                    {isEvaluating && (
                      <div className="p-4 rounded-xl bg-[#1b172a] border border-[#2b214c] flex items-center justify-center gap-2">
                        <Activity size={16} className="animate-spin text-violet-400" />
                        <span className="text-xs font-semibold text-zinc-300">Evaluating mental profiles across local servers, crafting recommendations...</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* PHASE 4: Wellness Portfolio dashboard summary */}
                {wizardStep === 4 && latestAssessment && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Header score block */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-r from-violet-950/30 to-[#19152b] border border-[#2c214c] p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full filter blur-xl pointer-events-none" />
                      
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                          <Activity size={12} />
                          <span>EVALUATION COMPLETED (NIRVANA INDEX)</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1.5">
                          Wellness Report Card for {latestAssessment.studentName}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed truncate max-w-sm" title={latestAssessment.academicPursuit}>
                          Target Goal: {latestAssessment.academicPursuit}
                        </p>
                      </div>

                      {/* SVG Gauge score */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="#1d1b2a" strokeWidth="4" fill="transparent" />
                            <circle 
                              cx="32" 
                              cy="32" 
                              r="28" 
                              stroke="#8B5CF6" 
                              strokeWidth="4" 
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 28}
                              strokeDashoffset={2 * Math.PI * 28 * (1 - (latestAssessment.wellnessScore / 100))}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-sm font-bold text-white font-mono">{latestAssessment.wellnessScore}%</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] uppercase font-bold text-zinc-550 block">Wellness Grade</span>
                          <span className="text-xs font-extrabold text-violet-300">
                            {latestAssessment.wellnessScore >= 80 
                              ? "EXCELLENT HARMONY" 
                              : latestAssessment.wellnessScore >= 60 
                              ? "STABLE FLOW" 
                              : latestAssessment.wellnessScore >= 45 
                              ? "FATIGUED LOAD" 
                              : "SEVERE DEGRADATION"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                      
                      {/* Left: Study parameters */}
                      <div className="bg-[#181524] rounded-xl p-4 border border-[#2b2147] space-y-3">
                        <h3 className="text-xs font-bold text-[#b7addc] uppercase tracking-wider">Vitals Strain Audit</h3>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                            <span className="text-zinc-400">Total Revision blocks:</span>
                            <strong className="text-zinc-200">{latestAssessment.studyProfile.dailyHours} hrs/day</strong>
                          </div>
                          <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                            <span className="text-zinc-400">Continuous Static sitting:</span>
                            <strong className="text-zinc-200">{latestAssessment.studyProfile.uninterruptedSittingMins} minsstretch</strong>
                          </div>
                          <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                            <span className="text-zinc-400">Combined monitor exposure:</span>
                            <strong className="text-zinc-200">{latestAssessment.studyProfile.screenTimeHrs} hours/day</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Intelligent flow blocks:</span>
                            <strong className="text-zinc-200">{latestAssessment.studyProfile.intenseMinutesFocus} mins</strong>
                          </div>
                        </div>
                      </div>

                      {/* Right: Cognitive game parameters */}
                      <div className="bg-[#181524] rounded-xl p-4 border border-[#2b2147] space-y-3">
                        <h3 className="text-xs font-bold text-[#b7addc] uppercase tracking-wider">Cognitive Accuracy Indexes</h3>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                            <span className="text-zinc-400">Stroop Attention speed:</span>
                            <strong className="text-violet-400">{latestAssessment.cognitivePerformance.stroopScore}/4 Correct</strong>
                          </div>
                          <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                            <span className="text-zinc-400">Retrieval Memory Span:</span>
                            <strong className="text-cyan-400">{latestAssessment.cognitivePerformance.memoryScore}/3 Span</strong>
                          </div>
                          <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                            <span className="text-zinc-400">Reaction motor Grid count:</span>
                            <strong className="text-pink-400">{latestAssessment.cognitivePerformance.attentionScore} clicks hit</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Response Speed Latency:</span>
                            <strong className="text-[#a78bfa]">{latestAssessment.cognitivePerformance.stroopAvgSpeedMs} ms</strong>
                          </div>
                        </div>
                      </div>

                      {/* Therapeutic Direct Advice Cards */}
                      <div className="bg-[#161322] border border-violet-900/40 rounded-xl p-5 md:col-span-2 space-y-3.5">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="text-amber-400" size={16} />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Direct Action-Plan Recommendations compiled for {latestAssessment.studentName}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {latestAssessment.recommendations.map((tip, tIdx) => (
                            <div key={tIdx} className="bg-[#0f0e13] p-3.5 border border-[#2c224a]/80 rounded-lg relative overflow-hidden flex flex-col justify-between hover:scale-101 border-zinc-800 hover:border-violet-600 transition-all">
                              <span className="text-xs leading-relaxed text-zinc-300 font-sans">{tip}</span>
                              <div className="border-t border-[#2d234c] pt-2 mt-2 flex justify-between items-center">
                                <span className="text-[8px] font-mono font-bold text-violet-400 tracking-wider">PROTOCOL {tIdx + 1}</span>
                                <Check size={11} className="text-emerald-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-800/50 flex justify-center">
                      <button
                        onClick={restartDiagnosticWizard}
                        className="px-6 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RotateCcw size={13} />
                        <span>Run Another Diagnostic Assessment</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

          {/* RHS Sidebar Panel Desk (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Active historical log timelines */}
            <WellnessHistoryLogs refreshTrigger={refreshTrigger} />

            {/* Ingress status diagnostics check */}
            <AuraDiagnostics />

            {/* Stress reduction guidelines bento card */}
            <div className="bg-[#12101a] border border-[#231b38] rounded-xl p-5 space-y-3.5 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#8473a5]" />
                <span>Stress Relief Reference Protocol</span>
              </h3>

              <div className="space-y-3">
                <div className="flex gap-2.5 items-start text-xs text-zinc-350">
                  <span className="p-1 rounded bg-[#1e1735] text-violet-400 font-mono text-[9px] mt-0.5 shrink-0">1</span>
                  <div className="leading-normal">
                    <strong className="text-white text-[11px] block">20-20-20 Visual Hygiene:</strong>
                    Every 20 minutes of screens, stare at a target 20 feet away for 20 continuous seconds.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start text-xs text-zinc-350">
                  <span className="p-1 rounded bg-[#1e1735] text-violet-400 font-mono text-[9px] mt-0.5 shrink-0">2</span>
                  <div className="leading-normal">
                    <strong className="text-white text-[11px] block">Lymphatic Circulatory Breaks:</strong>
                    Continuous sitting drains energy. Stand up, pace, or raise your heels for 90 seconds every hour.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start text-xs text-zinc-350">
                  <span className="p-1 rounded bg-[#1e1735] text-violet-400 font-mono text-[9px] mt-0.5 shrink-0">3</span>
                  <div className="leading-normal">
                    <strong className="text-white text-[11px] block">Intraparietal Cognitive Focus:</strong>
                    Continuous bookwork reduces retention. Limit deep revisions to a maximum of 45-minute cycles.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Primary Dashboard footer */}
      <footer className="border-t border-[#231b38]/50 bg-[#07060a] py-6 px-6 mt-12 text-center text-xs text-zinc-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Nirvana Student Wellness Cockpit — Serving local mental diagnostics.
          </div>
          <div className="font-mono text-[10px]">
            Server Target Ingress: Host <span className="text-violet-400 font-bold">0.0.0.0</span> | Gateway <span className="text-violet-400 font-bold">3000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
