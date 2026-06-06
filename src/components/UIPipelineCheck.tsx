import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Cpu, Server, CheckCircle2, XCircle, RefreshCw, Terminal, Sparkles } from "lucide-react";
import { ServerHealth } from "../types";

export default function UIPipelineCheck() {
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  };

  const fetchHealthPipeline = async () => {
    setLoading(true);
    setErrorStatus(null);
    const start = performance.now();
    addLog("GET /api/health - Dispatching diagnostic ping...");
    try {
      const response = await fetch("/api/health");
      const duration = Math.round(performance.now() - start);
      setLatency(duration);

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const data: ServerHealth = await response.json();
      setHealth(data);
      addLog(`GET /api/health - Succeeded in ${duration}ms! Pipeline fully verified.`);
      addLog(`Status: ${data.status.toUpperCase()} | KeyConfigured: ${data.environment.geminiApiKeyConfigured}`);
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to reach pipeline");
      setHealth(null);
      setLatency(null);
      addLog(`CRITICAL - Channel connection failed: ${err.message || "Connection refused"}`);
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first boot to satisfy directive: "1. The Local Infrastructure Check"
  useEffect(() => {
    fetchHealthPipeline();
  }, []);

  return (
    <div id="ui-pipeline-check" className="bg-[#12101a] border border-[#231b38] rounded-xl p-5 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#231b38] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-900/40 text-violet-400">
              <Layers size={18} className="animate-pulse" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-white">Local Infrastructure Pipeline</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Layer 3 Compliance diagnostics. Direct-mounted local Node.js Express server checking.
          </p>
        </div>

        <button
          onClick={fetchHealthPipeline}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 disabled:opacity-50 transition-all cursor-pointer border border-zinc-700 hover:border-violet-500 glow-btn"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Verifying..." : "Run Pipeline Diagnostic"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Metric 1: Connection Status */}
        <div className="bg-[#181524] rounded-lg p-3.5 border border-[#2b2147] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Pipeline State</div>
            <div className="text-sm font-bold flex items-center gap-1.5 mt-1.5">
              {health ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span className="text-emerald-400 font-mono tracking-tight">VERIFIED</span>
                </>
              ) : errorStatus ? (
                <>
                  <XCircle size={15} className="text-rose-400" />
                  <span className="text-rose-400 font-mono tracking-tight">DISCONNECTED</span>
                </>
              ) : (
                <span className="text-amber-400 font-mono tracking-tight">LAUNCHING...</span>
              )}
            </div>
          </div>
          <Server className={health ? "text-violet-400" : "text-zinc-600"} size={22} />
        </div>

        {/* Metric 2: Uptime Counter */}
        <div className="bg-[#181524] rounded-lg p-3.5 border border-[#2b2147] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Active Server Uptime</div>
            <div className="text-sm font-mono font-bold text-zinc-200 mt-1.5">
              {health ? `${health.uptimeSeconds}s` : "0s"}
            </div>
          </div>
          <Activity className="text-violet-400" size={22} />
        </div>

        {/* Metric 3: Roundtrip Performance */}
        <div className="bg-[#181524] rounded-lg p-3.5 border border-[#2b2147] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Roundtrip Latency</div>
            <div className="text-sm font-mono font-bold mt-1.5">
              {latency !== null ? (
                <span className={latency < 40 ? "text-emerald-400" : latency < 150 ? "text-amber-400" : "text-rose-400"}>
                  {latency} ms
                </span>
              ) : (
                <span className="text-zinc-600">-- ms</span>
              )}
            </div>
          </div>
          <Cpu className="text-violet-400" size={22} />
        </div>

        {/* Metric 4: API Secret Check */}
        <div className="bg-[#181524] rounded-lg p-3.5 border border-[#2b2147] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Gemini API Key</div>
            <div className="text-sm font-mono font-bold mt-1.5">
              {health?.environment.geminiApiKeyConfigured ? (
                <span className="text-cyan-400">CONFIGURED</span>
              ) : (
                <span className="text-amber-500">OFFLINE READY</span>
              )}
            </div>
          </div>
          <Sparkles className={health?.environment.geminiApiKeyConfigured ? "text-cyan-400 animate-pulse" : "text-zinc-600"} size={22} />
        </div>
      </div>

      {/* Terminal logs panel */}
      <div className="bg-[#09080d] rounded-lg border border-[#231b38] p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 mb-2 border-b border-zinc-800/60 pb-1.5">
          <Terminal size={12} className="text-violet-400" />
          <span>LAYER-3 SYSTEM LOG STREAM (SCROLLABLE)</span>
        </div>
        <div className="font-mono text-xs text-zinc-300 h-28 overflow-y-auto space-y-1.5 pr-2 select-text">
          {terminalLogs.length === 0 ? (
            <div className="text-zinc-600 italic">No diagnostic events triggered yet...</div>
          ) : (
            terminalLogs.map((log, i) => (
              <div key={i} className="leading-relaxed border-l-2 border-violet-900/60 pl-2">
                {log.includes("Succeeded") ? (
                  <span className="text-emerald-400">{log}</span>
                ) : log.includes("CRITICAL") ? (
                  <span className="text-rose-400 font-semibold">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))
          )}
        </div>
        {!health?.environment.geminiApiKeyConfigured && (
          <div className="mt-3 bg-amber-500/10 border border-amber-550/20 rounded px-2.5 py-2 text-[11px] text-amber-200 leading-snug">
            💡 <strong>API status:</strong> No active GEMINI_API_KEY detected in the secrets context. The cockpit has primed high-fidelity structured fallback blueprints to guarantee robust functional testing during offline simulations. Open <strong>Settings &gt; Secrets</strong> to inject a live key.
          </div>
        )}
      </div>
    </div>
  );
}

// Add simple layers icon fallback helper inside file to avoid missing exports
function Layers({ ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-10 5 10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}
