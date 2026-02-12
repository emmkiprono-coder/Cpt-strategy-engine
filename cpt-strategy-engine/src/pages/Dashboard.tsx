import { useState } from "react";
import { SERVICE_LINES, CPT_DATABASE } from "../data/cptData";
import { analyzeServiceLine } from "../utils/agentEngine";
import { InsightCard } from "../components/InsightCard";
import { type Page } from "../App";
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
} from "lucide-react";

const defaultParams = {
  monthlyVolume: 600,
  payerMix: { medicare: 45, commercial: 40, medicaid: 15 },
  staffCount: 3,
  avgProviderCost: 18000,
};

export function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [selectedLine, setSelectedLine] = useState(SERVICE_LINES[0]);
  const analysis = analyzeServiceLine(selectedLine, defaultParams);

  const totalCodes = CPT_DATABASE.length;
  const highRiskCodes = CPT_DATABASE.filter((c) => c.complianceRisk === "high").length;
  const avgRate = CPT_DATABASE.reduce((s, c) => s + c.medicareRate, 0) / totalCodes;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400/70 uppercase tracking-widest font-semibold">
            Live Analysis
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white/95 tracking-tight font-['DM_Sans',sans-serif]">
          Command Center
        </h1>
        <p className="text-sm text-white/35 mt-1">
          Strategic overview of CPT codes, service lines, and revenue intelligence
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "CPT Codes Active", value: totalCodes, icon: <Activity size={16} />, color: "emerald" },
          { label: "Service Lines", value: SERVICE_LINES.length, icon: <TrendingUp size={16} />, color: "cyan" },
          { label: "High Risk Codes", value: highRiskCodes, icon: <AlertTriangle size={16} />, color: "amber" },
          { label: "Avg Medicare Rate", value: `$${avgRate.toFixed(0)}`, icon: <DollarSign size={16} />, color: "violet" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.10] transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-${stat.color}-400/60`}>{stat.icon}</span>
              <span className="text-[11px] text-white/30 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white/90 font-['DM_Sans',sans-serif]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Service Lines Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white/80 mb-4 font-['DM_Sans',sans-serif]">
          Service Lines
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICE_LINES.map((line) => {
            const isActive = selectedLine.id === line.id;
            const codes = CPT_DATABASE.filter((c) => line.cptCodes.includes(c.code));
            return (
              <button
                key={line.id}
                onClick={() => setSelectedLine(line)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/[0.08] border-emerald-500/30"
                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                }`}
              >
                <div className="text-2xl mb-2">{line.icon}</div>
                <div className="text-[13px] font-semibold text-white/85 mb-0.5">{line.name}</div>
                <div className="text-[11px] text-white/30">{codes.length} codes tracked</div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      line.marginProfile === "high"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : line.marginProfile === "medium"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {line.marginProfile} margin
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Service Line Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analysis */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white/90 font-['DM_Sans',sans-serif]">
                  {selectedLine.icon} {selectedLine.name}
                </h3>
                <p className="text-[13px] text-white/40 mt-0.5">{selectedLine.description}</p>
              </div>
              <button
                onClick={() => onNavigate("builder")}
                className="flex items-center gap-1.5 text-[12px] text-emerald-400/80 hover:text-emerald-400 transition-colors"
              >
                Deep dive <ArrowRight size={14} />
              </button>
            </div>

            {/* Revenue Model */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Projected Monthly</div>
                <div className="text-xl font-bold text-emerald-400 font-['DM_Sans',sans-serif]">
                  ${Math.round(analysis.projectedRevenue).toLocaleString()}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Risk Score</div>
                <div className="flex items-center gap-2">
                  <div className={`text-xl font-bold font-['DM_Sans',sans-serif] ${
                    analysis.riskScore > 50 ? "text-red-400" : analysis.riskScore > 25 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {analysis.riskScore}/100
                  </div>
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        analysis.riskScore > 50 ? "bg-red-500" : analysis.riskScore > 25 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${analysis.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[12px] text-white/40">
                <Clock size={13} />
                ROI: {analysis.timeToROI}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-white/40">
                <ShieldCheck size={13} />
                {selectedLine.marginProfile} margin profile
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-white/40">
                <Activity size={13} />
                {selectedLine.volumeSensitivity} volume sensitivity
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-emerald-500/[0.06] to-transparent border border-emerald-500/10 rounded-lg p-4">
              <div className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-1">
                Strategic Recommendation
              </div>
              <p className="text-[13px] text-white/70 leading-relaxed">
                {analysis.recommendation}
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Agent Insights
            </h3>
            {analysis.insights.slice(0, 4).map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>

        {/* Right Column - Quick Actions & Codes */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-3 font-['DM_Sans',sans-serif]">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Run scenario simulation", page: "simulator" as Page, icon: <FlaskConicalIcon /> },
                { label: "Explore CPT codes", page: "explorer" as Page, icon: <SearchIcon /> },
                { label: "Check compliance", page: "compliance" as Page, icon: <ShieldIcon /> },
                { label: "Ask strategy agent", page: "chat" as Page, icon: <ChatIcon /> },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.page)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.10] transition-all text-left group"
                >
                  <span className="text-white/30 group-hover:text-white/50">{action.icon}</span>
                  <span className="text-[13px] text-white/60 group-hover:text-white/80">{action.label}</span>
                  <ArrowRight size={12} className="ml-auto text-white/20 group-hover:text-white/40" />
                </button>
              ))}
            </div>
          </div>

          {/* Tracked Codes */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-3 font-['DM_Sans',sans-serif]">
              {selectedLine.name} Codes
            </h3>
            <div className="space-y-2">
              {CPT_DATABASE.filter((c) => selectedLine.cptCodes.includes(c.code))
                .slice(0, 6)
                .map((code) => (
                  <div
                    key={code.code}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                  >
                    <div>
                      <div className="text-[13px] font-mono text-emerald-400/80">{code.code}</div>
                      <div className="text-[11px] text-white/30 truncate max-w-[160px]">{code.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-medium text-white/60">${code.medicareRate}</div>
                      <div
                        className={`text-[10px] ${
                          code.complianceRisk === "high"
                            ? "text-red-400"
                            : code.complianceRisk === "medium"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {code.complianceRisk} risk
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Staffing Model */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-2 font-['DM_Sans',sans-serif]">Staffing Model</h3>
            <p className="text-[12px] text-white/40 leading-relaxed">{selectedLine.staffingModel}</p>
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <div className="text-[11px] text-white/30 mb-1">Key Metrics</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedLine.keyMetrics.map((metric) => (
                  <span key={metric} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlaskConicalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
