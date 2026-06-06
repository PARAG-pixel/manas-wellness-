import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, RefreshCw, Layers, Sparkles, TrendingUp, User, BookOpen, Clock, Activity } from "lucide-react";
import { WellnessLog } from "../types";

interface WellnessHistoryLogsProps {
  refreshTrigger: number;
}

export default function WellnessHistoryLogs({ refreshTrigger }: WellnessHistoryLogsProps) {
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchSessionLogs = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch("/api/wellness-logs");
      if (!res.ok) {
        throw new Error("Failed to contact student wellness logs pipeline.");
      }
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setErrorText(err.message || "Pipeline unreachable");
    } finally {
      setLoading(false);
    }
  };

  const deleteSessionLog = async (id: string) => {
    try {
      const res = await fetch(`/api/wellness-logs/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // Optimistically filter lists
        setLogs((prev) => prev.filter((log) => log.id !== id));
      } else {
        throw new Error("Unable to delete previous session log");
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove log element");
    }
  };

  useEffect(() => {
    fetchSessionLogs();
  }, [refreshTrigger]);

  // Compute stats for simple SVG trend visualization
  const historyTrends = [...logs].reverse();
  const maxScore = 100;
  const chartHeight = 80;
  const chartWidth = 320;

  return (
    <div className="bg-[#12101a] border border-[#231b38] rounded-xl p-5 shadow-sm space-y-6">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#231b38] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Wellness Trend Vault</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare progress matrices and review historical student wellness dashboards.
          </p>
        </div>

        <button
          onClick={fetchSessionLogs}
          disabled={loading}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-zinc-100 disabled:opacity-50 transition-all cursor-pointer hover:border hover:border-zinc-700"
          title="Refresh History Database"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && logs.length === 0 && (
        <div className="py-12 text-center text-xs font-mono text-zinc-500">
          Fetching stored academic logs...
        </div>
      )}

      {errorText && (
        <div className="bg-rose-950/20 border border-rose-900/35 rounded-lg p-4 text-center text-rose-450 text-xs font-semibold">
          Error contacting channel: {errorText}
        </div>
      )}

      {/* Structured Trend Graphics (Minimal High-Contrast SVG) */}
      {!loading && logs.length >= 2 && (
        <div className="bg-[#181524] rounded-lg p-4 border border-[#2b2147] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <TrendingUp size={14} className="text-violet-400" />
              <span>Wellness Score Cycle Trail</span>
            </div>
            <span className="text-[10px] bg-[#221c37] text-violet-300 px-1.5 py-0.5 rounded font-mono font-bold border border-violet-800/20">
              {logs.length} Runs Logged
            </span>
          </div>

          {/* SVG line graphics chart */}
          <div className="relative w-full overflow-x-auto pt-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-20 overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1={chartHeight * 0.2} x2={chartWidth} y2={chartHeight * 0.2} stroke="#211b33" strokeDasharray="3,3" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#211b33" strokeDasharray="3,3" />
              <line x1="0" y1={chartHeight * 0.8} x2={chartWidth} y2={chartHeight * 0.8} stroke="#211b33" strokeDasharray="3,3" />

              {/* Data points mapping */}
              {(() => {
                const stepX = chartWidth / (historyTrends.length - 1 || 1);
                const points = historyTrends.map((log, index) => {
                  const x = index * stepX;
                  // Inverted Y: 0 is top (100 score), chartHeight is bottom (0 score).
                  const percent = log.wellnessScore / maxScore;
                  const y = chartHeight - (percent * (chartHeight - 16)) - 8;
                  return { x, y, score: log.wellnessScore, name: log.studentName };
                });

                const pathD = points.reduce((acc, p, i) => {
                  return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                }, "");

                const areaD = points.length > 0
                  ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
                  : "";

                return (
                  <>
                    {/* Fill Area gradient under line */}
                    {areaD && <path d={areaD} fill="url(#chartGradient)" opacity="0.15" />}
                    
                    {/* Central trend curve stroke */}
                    {pathD && <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                    {/* Circular markers & Text indicators */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="#ffffff"
                          stroke="#8B5CF6"
                          strokeWidth="2.5"
                          className="hover:scale-125 transition-transform"
                        />
                        {/* Short index scores */}
                        <text
                          x={p.x}
                          y={p.y - 8}
                          fontSize="9"
                          fill="#a3a3a3"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor={idx === 0 ? "start" : idx === points.length - 1 ? "end" : "middle"}
                        >
                          {p.score}%
                        </text>
                      </g>
                    ))}

                    {/* Gradient definers */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase px-1">
            <span>First Cycle Run</span>
            <span>Latest Wellness Diagnostic</span>
          </div>
        </div>
      )}

      {/* Logs Deck */}
      {!loading && logs.length === 0 && (
        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
          <Layers className="mx-auto text-zinc-600" size={24} />
          <p className="text-xs font-semibold text-zinc-400">Vault registers empty</p>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-normal">
            Your saved wellness assessment sessions will appear here. Answer the progressive dialogue card and run cognitive agility games above to submit your first wellness portrait!
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1b172a] border border-[#2b214c] rounded-xl p-4.5 relative overflow-hidden group glow-card"
              >
                {/* Left vertical border highlight based on wellness rank score */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{
                    backgroundColor: log.wellnessScore >= 80 
                      ? "#10B981" 
                      : log.wellnessScore >= 60 
                      ? "#3B82F6" 
                      : log.wellnessScore >= 45 
                      ? "#F59E0B" 
                      : "#EF4444"
                  }}
                />

                <div className="pl-2.5">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      {/* Name + Pursuit details */}
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-[#241c3e] text-violet-400">
                          <User size={13} />
                        </span>
                        <h3 className="text-sm font-bold text-white tracking-tight">{log.studentName}</h3>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] text-zinc-400 mt-1.5 font-mono">
                        <BookOpen size={11} className="text-zinc-500" />
                        <span className="truncate max-w-[180px]" title={log.academicPursuit}>{log.academicPursuit}</span>
                      </div>
                    </div>

                    {/* Circular gauge indicator */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Wellness Index</div>
                          <div 
                            className="text-base font-extrabold font-mono"
                            style={{
                              color: log.wellnessScore >= 80 
                                ? "#10B981" 
                                : log.wellnessScore >= 60 
                                ? "#60A5FA" 
                                : log.wellnessScore >= 45 
                                ? "#F59E0B" 
                                : "#EF4444"
                            }}
                          >
                            {log.wellnessScore}%
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSessionLog(log.id)}
                          className="p-1.5 text-zinc-550 hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition-all cursor-pointer"
                          title="Remove Historic Entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body highlights / schedule variables */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3.5 border-t border-zinc-800/50">
                    <div className="text-center bg-[#130f21] py-1.5 rounded border border-zinc-900">
                      <div className="text-[8px] font-mono uppercase text-zinc-500">Screen Time</div>
                      <div className="text-[11px] font-mono font-bold text-zinc-200 mt-0.5">{log.studyProfile.screenTimeHrs} hrs</div>
                    </div>
                    <div className="text-center bg-[#130f21] py-1.5 rounded border border-zinc-900">
                      <div className="text-[8px] font-mono uppercase text-zinc-500">Consecutive Sit</div>
                      <div className="text-[11px] font-mono font-bold text-zinc-200 mt-0.5">{log.studyProfile.uninterruptedSittingMins}m</div>
                    </div>
                    <div className="text-center bg-[#130f21] py-1.5 rounded border border-zinc-900">
                      <div className="text-[8px] font-mono uppercase text-zinc-500">Cognitive Hit</div>
                      <div className="text-[11px] font-mono font-bold text-violet-400 mt-0.5">{log.cognitivePerformance.stroopScore + log.cognitivePerformance.memoryScore}/7</div>
                    </div>
                  </div>

                  {/* Recommendations accordion slice */}
                  <div className="mt-3.5 space-y-1.5 bg-[#120f21] p-3 rounded-lg border border-[#2b2147]/30">
                    <div className="text-[10px] font-extrabold uppercase text-[#7363a8] tracking-widest flex items-center gap-1">
                      <Activity size={10} />
                      <span>Coaching Insight</span>
                      {log.isAiConsulted && (
                        <span className="ml-auto text-[8px] bg-cyan-950 text-cyan-400 px-1 py-0.2 rounded border border-cyan-800/30">
                          AI ADVISOR ACTIVE
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {log.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="text-[11px] text-zinc-350 leading-relaxed list-disc list-inside">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
