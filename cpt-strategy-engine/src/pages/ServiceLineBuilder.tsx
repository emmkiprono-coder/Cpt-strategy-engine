import { useState } from "react";
import { SERVICE_LINES, CPT_DATABASE, calculateRevenue } from "../data/cptData";
import { analyzeServiceLine, generateStrategicForesight } from "../utils/agentEngine";
import { InsightCard } from "../components/InsightCard";

export function ServiceLineBuilder() {
  const [selectedLine, setSelectedLine] = useState(SERVICE_LINES[0]);
  const [volume, setVolume] = useState(600);
  const [medicare, setMedicare] = useState(45);
  const [commercial, setCommercial] = useState(40);
  const [staff, setStaff] = useState(3);
  const [providerCost, setProviderCost] = useState(18000);
  const [showForesight, setShowForesight] = useState(false);

  const medicaid = Math.max(0, 100 - medicare - commercial);
  const analysis = analyzeServiceLine(selectedLine, { monthlyVolume: volume, payerMix: { medicare, commercial, medicaid }, staffCount: staff, avgProviderCost: providerCost });
  const codes = CPT_DATABASE.filter((c) => selectedLine.cptCodes.includes(c.code));
  const foresights = generateStrategicForesight(selectedLine, { volume });

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/95 tracking-tight font-['DM_Sans',sans-serif]">Service Line Builder</h1>
        <p className="text-sm text-white/35 mt-1">Design, analyze, and optimize service lines with strategic intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Service Line Selector */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Select Service Line</h3>
          {SERVICE_LINES.map((line) => (
            <button key={line.id} onClick={() => setSelectedLine(line)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selectedLine.id === line.id ? "bg-emerald-500/[0.08] border-emerald-500/30" : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{line.icon}</span>
                <div>
                  <div className="text-[13px] font-semibold text-white/85">{line.name}</div>
                  <div className="text-[10px] text-white/30">{line.cptCodes.length} codes</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Configuration */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 font-['DM_Sans',sans-serif]">Configuration</h3>
          <div className="space-y-4">
            {[
              { label: "Monthly Volume", value: volume, set: setVolume, min: 100, max: 3000, step: 50, fmt: (v: number) => `${v} encounters` },
              { label: "Medicare Mix", value: medicare, set: setMedicare, min: 0, max: 100, step: 5, fmt: (v: number) => `${v}%` },
              { label: "Commercial Mix", value: commercial, set: setCommercial, min: 0, max: 100, step: 5, fmt: (v: number) => `${v}%` },
              { label: "Provider FTEs", value: staff, set: setStaff, min: 1, max: 20, step: 1, fmt: (v: number) => `${v} FTEs` },
              { label: "Avg Provider Cost/mo", value: providerCost, set: setProviderCost, min: 8000, max: 35000, step: 1000, fmt: (v: number) => `$${v.toLocaleString()}` },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex justify-between mb-1.5">
                  <label className="text-[11px] text-white/40">{p.label}</label>
                  <span className="text-[12px] font-mono text-emerald-400">{p.fmt(p.value)}</span>
                </div>
                <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
                  onChange={(e) => p.set(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-emerald-500
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:cursor-pointer" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <div className="text-[11px] text-white/25">Medicaid: {medicaid}% (auto-calculated)</div>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Revenue Overview */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white/90 font-['DM_Sans',sans-serif]">{selectedLine.icon} {selectedLine.name}</h3>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${analysis.riskScore > 50 ? "bg-red-500/15 text-red-400" : analysis.riskScore > 25 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                Risk: {analysis.riskScore}/100
              </span>
            </div>
            <p className="text-[13px] text-white/50 mb-4 leading-relaxed">{analysis.summary}</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-emerald-500/[0.06] rounded-lg p-3 text-center">
                <div className="text-[11px] text-emerald-400/60 uppercase tracking-wider mb-1">Monthly Revenue</div>
                <div className="text-xl font-bold text-emerald-400 font-['DM_Sans',sans-serif]">${Math.round(analysis.projectedRevenue).toLocaleString()}</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Annual</div>
                <div className="text-xl font-bold text-white/70 font-['DM_Sans',sans-serif]">${Math.round(analysis.projectedRevenue * 12).toLocaleString()}</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Time to ROI</div>
                <div className="text-lg font-bold text-white/70 font-['DM_Sans',sans-serif]">{analysis.timeToROI}</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/[0.06] to-transparent border border-cyan-500/10 rounded-lg p-4">
              <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider font-semibold mb-1">Strategic Recommendation</div>
              <p className="text-[13px] text-white/60 leading-relaxed">{analysis.recommendation}</p>
            </div>
          </div>

          {/* Code Breakdown */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white/70 mb-3">Code Revenue Breakdown</h4>
            <div className="space-y-2">
              {codes.map((code) => {
                const rev = calculateRevenue(code, Math.round(volume / codes.length), { medicare, commercial, medicaid });
                return (
                  <div key={code.code} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                    <span className="text-[13px] font-mono text-emerald-400 w-14">{code.code}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/60 truncate">{code.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-semibold text-white/70">${Math.round(rev.total).toLocaleString()}</div>
                      <div className="text-[10px] text-white/30">/month</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Agent Insights</h3>
              <button onClick={() => setShowForesight(!showForesight)}
                className="text-[11px] text-violet-400/70 hover:text-violet-400 transition-colors">
                {showForesight ? "Hide" : "Show"} Strategic Foresight
              </button>
            </div>
            {analysis.insights.map((insight, i) => (<InsightCard key={i} insight={insight} />))}
            {showForesight && foresights.map((f, i) => (<InsightCard key={`f-${i}`} insight={f} />))}
          </div>
        </div>
      </div>
    </div>
  );
}
