import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Brain, RefreshCw, Eye, Sparkles, Check, CheckCircle2, ChevronRight } from "lucide-react";
import { CognitivePerformance } from "../types";

interface CognitiveTestsProps {
  onComplete: (performance: CognitivePerformance) => void;
}

const STROOP_CONFS = [
  { word: "RED", fontColor: "#A855F7", fontName: "Purple" }, // Violet/Purple
  { word: "BLUE", fontColor: "#22C55E", fontName: "Green" }, // Green
  { word: "GREEN", fontColor: "#EF4444", fontName: "Red" }, // Red
  { word: "PURPLE", fontColor: "#3B82F6", fontName: "Blue" }, // Blue
  { word: "RED", fontColor: "#06B6D4", fontName: "Cyan" }, // Cyan
  { word: "YELLOW", fontColor: "#A855F7", fontName: "Purple" }, // Purple
];

export default function CognitiveTests({ onComplete }: CognitiveTestsProps) {
  const [activeTab, setActiveTab] = useState<"intro" | "stroop" | "memory" | "vigilance" | "result">("intro");

  // Game 1: Stroop Test
  const [stroopTrial, setStroopTrial] = useState(0);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopCurrent, setStroopCurrent] = useState(STROOP_CONFS[0]);
  const [stroopOptions, setStroopOptions] = useState<string[]>([]);
  const [stroopSpeedHistory, setStroopSpeedHistory] = useState<number[]>([]);
  const stroopStartTimeRef = useRef<number>(0);

  // Game 2: Memory Recall
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [memoryPhase, setMemoryPhase] = useState<"flash" | "input">("flash");
  const [memoryTrial, setMemoryTrial] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryInput, setMemoryInput] = useState<string>("");
  const [memoryFlashLeft, setMemoryFlashLeft] = useState(1.8);

  // Game 3: Vigilance Click reflexes
  const [gridActiveIndex, setGridActiveIndex] = useState<number>(-1);
  const [vigilanceScore, setVigilanceScore] = useState(0);
  const [vigilanceClicksLimit, setVigilanceClicksLimit] = useState(0);
  const [vigilanceTimeLeft, setVigilanceTimeLeft] = useState(10);
  const [vigilanceActive, setVigilanceActive] = useState(false);

  // General state
  useEffect(() => {
    if (activeTab === "stroop") {
      setupStroopTrial(0);
    } else if (activeTab === "memory") {
      setupMemoryTrial(0);
    }
  }, [activeTab]);

  // --- STROOP GAME CONTROLS ---
  const setupStroopTrial = (index: number) => {
    if (index >= 4) {
      setActiveTab("memory");
      return;
    }
    const current = STROOP_CONFS[index % STROOP_CONFS.length];
    setStroopCurrent(current);
    
    // Choose 3 random options + the correct answer
    const incorrect = ["Red", "Blue", "Green", "Purple", "Cyan"].filter(c => c !== current.fontName);
    const shuffledIncorrect = incorrect.sort(() => 0.5 - Math.random()).slice(0, 2);
    const options = [current.fontName, ...shuffledIncorrect].sort(() => 0.5 - Math.random());
    setStroopOptions(options);
    
    setStroopTrial(index);
    stroopStartTimeRef.current = performance.now();
  };

  const handleStroopAnswer = (chosenName: string) => {
    const responseTime = performance.now() - stroopStartTimeRef.current;
    setStroopSpeedHistory(prev => [...prev, responseTime]);

    if (chosenName === stroopCurrent.fontName) {
      setStroopScore(prev => prev + 1);
    }
    setupStroopTrial(stroopTrial + 1);
  };

  // --- MEMORY RECALL SYSTEM ---
  const setupMemoryTrial = (index: number) => {
    if (index >= 3) {
      setActiveTab("vigilance");
      return;
    }
    // Generate random 4-digit sequence
    const seq = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1);
    setMemorySequence(seq);
    setMemoryPhase("flash");
    setMemoryInput("");
    setMemoryTrial(index);
    setMemoryFlashLeft(1.8);

    // Countdown flashing display
    let timer = setInterval(() => {
      setMemoryFlashLeft(prev => {
        if (prev <= 0.2) {
          clearInterval(timer);
          setMemoryPhase("input");
          return 0;
        }
        return prev - 0.2;
      });
    }, 200);
  };

  const verifyMemoryAnswer = () => {
    const finalAnswer = memorySequence.join("");
    if (memoryInput.trim() === finalAnswer) {
      setMemoryScore(prev => prev + 1);
    }
    setupMemoryTrial(memoryTrial + 1);
  };


  // --- VIGILANCE CLICK GRID ---
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let gridId: NodeJS.Timeout;

    if (activeTab === "vigilance" && vigilanceActive) {
      timerId = setInterval(() => {
        setVigilanceTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            clearInterval(gridId);
            setVigilanceActive(false);
            setGridActiveIndex(-1);
            // End of tests suite
            compileAndPushResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Randomly blink a 3x3 card slot (0 to 8 index)
      const blinkCell = () => {
        let nextIndex = Math.floor(Math.random() * 9);
        setGridActiveIndex(nextIndex);
      };
      
      blinkCell();
      gridId = setInterval(blinkCell, 900);
    }

    return () => {
      clearInterval(timerId);
      clearInterval(gridId);
    };
  }, [activeTab, vigilanceActive]);

  const startVigilanceTest = () => {
    setVigilanceScore(0);
    setVigilanceClicksLimit(0);
    setVigilanceTimeLeft(10);
    setVigilanceActive(true);
  };

  const handleCellClick = (idx: number) => {
    if (!vigilanceActive) return;
    setVigilanceClicksLimit(prev => prev + 1);
    if (idx === gridActiveIndex) {
      setVigilanceScore(prev => prev + 1);
      // Flash immediate next target cell
      setGridActiveIndex(Math.floor(Math.random() * 9));
    }
  };

  const compileAndPushResults = () => {
    // Compile and normalize score
    const avgSpeed = stroopSpeedHistory.length > 0 
      ? Math.round(stroopSpeedHistory.reduce((a,b)=>a+b,0) / stroopSpeedHistory.length) 
      : 1500;

    const accumulated = stroopScore + memoryScore + Math.min(vigilanceScore, 8);

    onComplete({
      stroopScore,
      stroopTotal: 4,
      stroopAvgSpeedMs: avgSpeed,
      memoryScore,
      memoryTotal: 3,
      attentionScore: vigilanceScore,
      attentionTotal: 8,
      accumulatedScore: accumulated
    });
    setActiveTab("result");
  };

  return (
    <div className="bg-[#12101a] border border-[#231b38] rounded-xl overflow-hidden shadow-md">
      {/* Visual Game Header Tab lines */}
      <div className="grid grid-cols-4 text-center border-b border-[#231b38] bg-[#0c0a10]">
        <div className={`py-3 text-[11px] font-bold tracking-tight border-r border-[#231b38] transition-colors ${activeTab === 'stroop' ? 'text-violet-400 bg-violet-950/20' : 'text-zinc-500'}`}>
          1. Color Stroop
        </div>
        <div className={`py-3 text-[11px] font-bold tracking-tight border-r border-[#231b38] transition-colors ${activeTab === 'memory' ? 'text-violet-400 bg-violet-950/20' : 'text-zinc-500'}`}>
          2. Logic Memory
        </div>
        <div className={`py-3 text-[11px] font-bold tracking-tight border-r border-[#231b38] transition-colors ${activeTab === 'vigilance' ? 'text-violet-400 bg-violet-950/20' : 'text-zinc-500'}`}>
          3. Fast Vigilance
        </div>
        <div className={`py-3 text-[11px] font-bold tracking-tight transition-colors ${activeTab === 'result' ? 'text-emerald-400 bg-emerald-950/10' : 'text-zinc-500'}`}>
          4. Performance Core
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* STEP 0: Introduction landing panel */}
          {activeTab === "intro" && (
            <motion.div
              key="intro-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-6"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-violet-950/40 text-violet-400 flex items-center justify-center mb-4 border border-violet-800/30">
                <Brain size={24} className="animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Active Cognitive Health Assessment</h3>
              <p className="text-xs text-zinc-300 mt-2 max-w-md mx-auto leading-relaxed">
                Take a 45-second micro-game session directly in your browser. This evaluates visual-motor speed, attention retention under stress, and working memory. We map these results to yield deep health indicators.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("stroop")}
                className="mt-6 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-lg transition-all glow-btn cursor-pointer inline-flex items-center gap-2"
              >
                <span>Initiate Brain Mission</span>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {/* STEP 1: Stroop Focus Game */}
          {activeTab === "stroop" && (
            <motion.div
              key="stroop-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center bg-[#181524] p-3 rounded-lg border border-[#2b2147] mb-2">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">STROOP SPEED FOCUS</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Click the actual FONT COLOR of the word shown on screen!</p>
                </div>
                <div className="text-xs font-mono font-bold bg-[#26203cf2] px-2.5 py-1 rounded text-violet-300 border border-violet-800/40">
                  Trial: {stroopTrial + 1} / 4
                </div>
              </div>

              {/* Central text target */}
              <div className="bg-[#09080e] rounded-xl border border-zinc-800/60 py-12 flex items-center justify-center">
                <span 
                  className="text-4xl font-extrabold tracking-widest select-none animate-pulse"
                  style={{ color: stroopCurrent.fontColor }}
                >
                  {stroopCurrent.word}
                </span>
              </div>

              {/* Interactive buttons */}
              <div className="grid grid-cols-3 gap-3">
                {stroopOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleStroopAnswer(opt)}
                    className="bg-[#181524] hover:bg-[#211d33] border border-[#2b2147] hover:border-violet-600 text-sm font-semibold text-zinc-200 py-3 rounded-lg transition-all cursor-pointer glow-btn"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Logic Memory Span Game */}
          {activeTab === "memory" && (
            <motion.div
              key="memory-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center bg-[#181524] p-3 rounded-lg border border-[#2b2147] mb-2">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">WORKING MEMORY RETENTION</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Observe the flashed numeric sequence, then type it from head!</p>
                </div>
                <div className="text-xs font-mono font-bold bg-[#26203cf2] px-2.5 py-1 rounded text-violet-300 border border-violet-800/40">
                  Trial: {memoryTrial + 1} / 3
                </div>
              </div>

              {memoryPhase === "flash" ? (
                <div className="bg-[#09080e] rounded-xl border border-zinc-800/60 py-12 flex flex-col items-center justify-center">
                  <div className="text-4xl font-extrabold font-mono text-cyan-400 tracking-[0.45em] pl-4 select-none">
                    {memorySequence.join("")}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                    <Eye size={13} className="text-cyan-400 animate-pulse" />
                    <span>Watch carefully! Digits hide in {Math.ceil(memoryFlashLeft)}s</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#09080e] rounded-xl border border-zinc-800/60 py-10 px-5 flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs space-y-3">
                    <label className="block text-[11px] font-bold text-zinc-400 text-center uppercase tracking-wider">
                      Re-type the sequence in order:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={memoryInput}
                      onChange={(e) => setMemoryInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-digits"
                      className="w-full bg-[#1b172a] text-center border border-[#3b2e61] rounded-lg py-3 text-lg font-mono font-extrabold text-white focus:outline-none focus:border-cyan-400 tracking-[0.3em]"
                      onKeyDown={(e) => e.key === "Enter" && verifyMemoryAnswer()}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={verifyMemoryAnswer}
                      disabled={memoryInput.length !== 4}
                      className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-xs text-white font-semibold rounded-lg transition-all cursor-pointer glow-btn"
                    >
                      Verify Sequence
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Grid Vigilance React test */}
          {activeTab === "vigilance" && (
            <motion.div
              key="vigilance-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center bg-[#181524] p-3 rounded-lg border border-[#2b2147] mb-2">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">VIGILANCE TARGET RESPONSE</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Click the active flashing glowing targets before they relocate!</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-pink-400 bg-pink-950/20 px-2 py-1 rounded border border-pink-900/30">
                     Time Remaining: {vigilanceTimeLeft}s
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30">
                    Hits: {vigilanceScore}
                  </span>
                </div>
              </div>

              {!vigilanceActive ? (
                <div className="bg-[#09080e] rounded-xl border border-zinc-800/60 py-12 text-center">
                  <p className="text-sm font-bold text-zinc-200">Reflex Grid Ready</p>
                  <p className="text-xs text-zinc-450 mt-1 max-w-xs mx-auto">
                    Test how fast your nervous reflexes react to flashing grid targets when fatigue is present.
                  </p>
                  <button
                    onClick={startVigilanceTest}
                    className="mt-5 px-5 py-2 hover:scale-103 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs rounded-lg transition-all glow-btn cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Zap size={13} />
                    <span>Engage Grid Trial (10 Sec)</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 p-2 bg-[#09080e] rounded-xl border border-[#231b38] max-w-sm mx-auto">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const isActive = idx === gridActiveIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleCellClick(idx)}
                        className={`aspect-square rounded-lg border cursor-pointer transition-all duration-150 flex items-center justify-center ${
                          isActive
                            ? "bg-pink-550 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.6)] animate-pulse scale-103"
                            : "bg-[#120f21] border-[#221a36] hover:bg-[#18142c]"
                        }`}
                      >
                        {isActive && <Zap size={18} className="text-white fill-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: Success Result compilation */}
          {activeTab === "result" && (
            <motion.div
              key="result-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center border border-emerald-800/30">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Cognitive Diagnostics Fully Formed</h3>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                Excellent focus. Your brain attention profiles have been compiled and mapped into your overall mental wellness report dashboard.
              </p>

              <div className="text-xs p-3 bg-[#181524] border border-[#2b2147] rounded-lg max-w-xs mx-auto font-mono text-zinc-300 space-y-1.5 text-left">
                <div className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span>Stroop executive:</span> 
                  <strong className="text-violet-400">{stroopScore}/4 correct</strong>
                </div>
                <div className="flex justify-between border-b border-zinc-800/60 pb-1">
                  <span>Working Memory span:</span> 
                  <strong className="text-cyan-400">{memoryScore}/3 correct</strong>
                </div>
                <div className="flex justify-between pb-1">
                  <span>Click motor reaction:</span> 
                  <strong className="text-pink-400">{vigilanceScore} hits</strong>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                PROCEED BELOW TO REVIEW PERSONALIZED WELLNESS SCORE
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
