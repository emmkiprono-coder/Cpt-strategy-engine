import { useState } from "react";
import { runScenario } from "../utils/agentEngine";
import { InsightCard } from "../components/InsightCard";
import { TrendingUp, TrendingDown, AlertTriangle, Play } from "lucide-react";

const scenarios = [
  { id: "telehealth-shift", name: "Telehealth Shift", icon: "📱", desc: "Model converting in-person visits to virtual care" },
  { id: "add-ccm", name: "Add CCM Program", icon: "🔄", desc: "Project recurring revenue from chronic care enrollment" },
  { id: "payer-mix-stress", name: "Payer Mix Stress Test", icon: "⚡", desc: "Evaluate viability under Medicare-only reimbursement" },
  { id: "rpm-overlay", name: "RPM Overlay", icon: "📊", desc: "Layer remote patient monitoring onto existing practice" },
];

const paramDefs: Record<string, { label: string; key: string; defaultVal: number; min: number; max: number; step: number; unit: string }[]> = {
  "telehealth-shift": [
    { label: "Monthly Visits", key: "currentVisits", defaultVal: 800, min: 100, max: 3000, step: 50, unit: "" },
    { label: "Shift to Telehealth", key: "shiftPercent", defaultVal: 30, min: 5, max: 80, step: 5, unit: "%" },
  ],
  "add-ccm": [
    { label: "Panel Size", key: "panelSize", defaultVal: 2000, min: 500, max: 10000, step: 100, unit: "" },
    { label: "Chronic Disease Rate", key: "chronicRate", defaultVal: 35, min: 10, max: 70, step: 5, unit: "%" },
    { label: "Enrollment Rate", key: "enrollmentRate", defaultVal: 15, min: 5, max: 40, step: 5, unit: "%" },
    { label: "Monthly Staff Cost", key: "staffCost", defaultVal: 4500, min: 2000, max: 12000, step: 500, unit: "$" },
  ],
  "payer-mix-stress": [
    { label: "Current Monthly Revenue", key: "currentRevenue", defaultVal: 150000, min: 50000, max: 500000, step: 10000, unit: "$" },
    { label: "Medicare %", key: "medicarePercent", defaultVal: 45, min: 10, max: 90, step: 5, unit: "%" },
    { label: "Medicaid %", key: "medicaidPercent", defaultVal: 10, min: 0, max: 40, step: 5, unit: "%" },
  ],
  "rpm-overlay": [
    { label: "Eligible Patients", key: "eligiblePatients", defaultVal: 300, min: 50, max: 2000, step: 25, unit: "" },
    { label: "Enrollment Rate", key: "enrollmentRate", defaultVal: 25, min: 10, max: 50, step: 5, unit: "%" },
    { label: "Device Compliance", key: "complianceRate", defaultVal: 70, min: 40, max: 95, step: 5, unit: "%" },
    { label: "Monthly Device Cost/Patient", key: "deviceCost", defaultVal: 45, min: 20, max: 100, step: 5, unit: "$" },
  ],
};

export function ScenarioSimulator() {
  const [activeScenario, setActiveScenario] = useState(scenarios[0].id);
  const [params, setParams] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ReturnType<typeof runScenario> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const currentParams = paramDefs[activeScenario] || [];

  const getParamValue = (key: string, defaultVal: number) => params[key] ?? defaultVal;

  const handleRun = () => {
    setIsRunning(true);
    const finalParams: Record<string, number> = {};
    currentParams.forEach((p) => { finalParams[p.key] = getParamValue(p.key, p.defaultVal); });
    setTimeout(() => {
      setResult(runScenario(activeScenario, finalParams));
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/95 tracking-tight font-['DM_Sans',sans-serif]">Scenario Lab</h1>
        <p className="text-sm text-white/35 mt-1">What-if modeling with agentic foresight — stress-test service lines and revenue strategies</p>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {scenarios.map((s) => (
          <button key={s.id} onClick={() => { setActiveScenario(s.id); setResult(null); setParams({}); }}
            className={`text-left p-4 rounded-xl border transition-all ${activeScenario === s.id ? "bg-emerald-500/[0.08] border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-[13px] font-semibold text-white/85">{s.name}</div>
            <div className="text-[11px] text-white/30 mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 font-['DM_Sans',sans-serif]">Parameters</h3>
          <div className="space-y-5">
            {currentParams.map((p) => {
              const val = getParamValue(p.key, p.defaultVal);
              return (
                <div key={p.key}>
                  <div className="flex justify-between mb-2">
                    <label className="text-[12px] text-white/50">{p.label}</label>
                    <span className="text-[13px] font-mono text-emerald-400">{p.unit === "$" ? `$${val.toLocaleString()}` : `${val}${p.unit}`}</span>
                  </div>
                  <input type="range" min={p.min} max={p.max} step={p.step} value={val}
                    onChange={(e) => setParams({ ...params, [p.key]: Number(e.target.value) })}
                    className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-emerald-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:cursor-pointer" />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/20">{p.unit === "$" ? `$${p.min.toLocaleString()}` : `${p.min}${p.unit}`}</span>
                    <span className="text-[10px] text-white/20">{p.unit === "$" ? `$${p.max.toLocaleString()}` : `${p.max}${p.unit}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={handleRun} disabled={isRunning}
            className="w-full mt-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isRunning ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Running analysis...</>
            ) : (
              <><Play size={14} /> Run Scenario</>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!result && !isRunning && (
            <div className="bg-white/[0.02] border border-white/[0.06] border-dashed rounded-xl p-12 text-center">
              <div className="text-3xl mb-3">🧪</div>
              <p className="text-[14px] text-white/40">Configure parameters and run scenario</p>
              <p className="text-[12px] text-white/25 mt-1">The agent will analyze revenue impact, risks, and strategic foresight</p>
            </div>
          )}

          {isRunning && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[14px] text-white/50">Agent is analyzing scenario...</p>
              <p className="text-[12px] text-white/25 mt-1">Running financial models, compliance checks, and foresight analysis</p>
            </div>
          )}

          {result && !isRunning && (
            <>
              {/* Revenue Impact */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white/70 mb-4 font-['DM_Sans',sans-serif]">Revenue Impact</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/[0.03] rounded-lg p-4 text-center">
                    <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Base</div>
                    <div className="text-xl font-bold text-white/70 font-['DM_Sans',sans-serif]">
                      ${Math.round(result.baseRevenue).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-4 text-center">
                    <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Projected</div>
                    <div className={`text-xl font-bold font-['DM_Sans',sans-serif] ${result.projectedRevenue > result.baseRevenue ? "text-emerald-400" : "text-red-400"}`}>
                      ${Math.round(result.projectedRevenue).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-4 text-center">
                    <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Delta</div>
                    <div className="flex items-center justify-center gap-1">
                      {result.delta >= 0 ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
                      <span className={`text-xl font-bold font-['DM_Sans',sans-serif] ${result.delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {result.delta >= 0 ? "+" : ""}${Math.round(result.delta).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/30 mt-0.5">
                      {result.deltaPercent >= 0 ? "+" : ""}{result.deltaPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-4">
                  <span className="text-[12px] text-white/40">⏱ Timeline: {result.timeline}</span>
                </div>
              </div>

              {/* Agent Insights */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Agent Analysis</h3>
                {result.insights.map((insight, i) => (<InsightCard key={i} insight={insight} />))}
              </div>

              {/* Risks */}
              {result.risks.length > 0 && (
                <div className="bg-amber-500/[0.04] border border-amber-500/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-amber-400/80 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} /> Execution Risks
                  </h3>
                  <div className="space-y-2">
                    {result.risks.map((risk, i) => (
                      <div key={i} className="flex items-start gap-2 text-[13px] text-white/50">
                        <span className="text-amber-400/60 mt-0.5">△</span>{risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
