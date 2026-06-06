import { useState, useEffect } from "react";
import { Server, Activity, Cpu, Sparkles, RefreshCw, Terminal, CheckCircle } from "lucide-react";
import { ServerHealth } from "../types";

export default function AuraDiagnostics() {
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const fetchChannelDiagnostics = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      const duration = Math.round(performance.now() - start);
      setLatency(duration);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelDiagnostics();
    const interval = setInterval(fetchChannelDiagnostics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#12101a] border border-[#231b38] rounded-xl p-4.5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#231b38] pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#241c3e] text-violet-400">
            <Server size={15} />
          </span>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Aura Core Diagnostic Hub</h2>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">CONTAINER INGRESS VERIFICATION</p>
          </div>
        </div>

        <button
          onClick={fetchChannelDiagnostics}
          disabled={loading}
          className="p-1 px-1.5 rounded bg-zinc-800 text-[10px] text-zinc-350 hover:text-white flex items-center gap-1 cursor-pointer hover:border hover:border-zinc-700 font-semibold"
        >
          <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
          <span>Sync Diagnostics</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Status indicator */}
        <div className="bg-[#181524] rounded-lg p-3 border border-[#2b2147]/60">
          <span className="text-[8px] font-mono font-extrabold uppercase text-zinc-550 block">CONNECTION LINE</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-2 h-2 rounded-full ${health ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}></span>
            <span className={`text-xs font-mono font-bold ${health ? "text-emerald-400" : "text-rose-400"}`}>
              {health ? "ONLINE" : "DISCONNECTED"}
            </span>
          </div>
        </div>

        {/* Latency */}
        <div className="bg-[#181524] rounded-lg p-3 border border-[#2b2147]/60">
          <span className="text-[8px] font-mono font-extrabold uppercase text-zinc-550 block font-sans">PORT INGRESS</span>
          <div className="text-xs font-mono font-bold text-zinc-150 mt-1.5 flex items-center gap-1.5">
            <Cpu size={12} className="text-violet-400" />
            <span>3000 (HTTPS Node Gateway)</span>
          </div>
        </div>

        {/* Server Uptime latency tracker */}
        <div className="bg-[#181524] rounded-lg p-3 border border-[#2b2147]/60">
          <span className="text-[8px] font-mono font-extrabold uppercase text-zinc-550 block">CHANNEL SPEED</span>
          <div className="text-xs font-mono font-bold text-zinc-150 mt-1.5 flex items-center gap-1.5">
            <Activity size={12} className="text-emerald-400 animate-pulse" />
            <span>{latency !== null ? `${latency} ms response` : "Pending latency"}</span>
          </div>
        </div>

        {/* Gemini configuration */}
        <div className="bg-[#181524] rounded-lg p-3 border border-[#2b2147]/60">
          <span className="text-[8px] font-mono font-extrabold uppercase text-zinc-550 block">GEMINI ENGINE</span>
          <div className="text-xs font-mono font-bold text-zinc-150 mt-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className={health?.environment.geminiApiKeyConfigured ? "text-cyan-400" : "text-zinc-500"} />
            <span className={health?.environment.geminiApiKeyConfigured ? "text-cyan-400" : "text-amber-500"}>
              {health?.environment.geminiApiKeyConfigured ? "Live 3.5 AI" : "Local Sandbox fallback active"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Short status tip */}
      <p className="text-[10px] text-zinc-450 leading-normal font-sans pt-1">
        ⚡ <strong>Architecture Standard (Layer 3 Verified):</strong> All API queries route locally to the Express server inside standard Cloud Run containers, bypassing dynamic web CDN script latency.
      </p>
    </div>
  );
}
