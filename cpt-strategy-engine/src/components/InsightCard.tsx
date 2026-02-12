import type { AgentInsight } from "../utils/agentEngine";
import { TrendingUp, AlertTriangle, Lightbulb, ShieldAlert, Eye } from "lucide-react";

const iconMap = {
  opportunity: <TrendingUp size={16} className="text-emerald-400" />,
  risk: <AlertTriangle size={16} className="text-amber-400" />,
  recommendation: <Lightbulb size={16} className="text-cyan-400" />,
  warning: <ShieldAlert size={16} className="text-red-400" />,
  foresight: <Eye size={16} className="text-violet-400" />,
};

const borderMap = {
  opportunity: "border-l-emerald-500/60",
  risk: "border-l-amber-500/60",
  recommendation: "border-l-cyan-500/60",
  warning: "border-l-red-500/60",
  foresight: "border-l-violet-500/60",
};

const bgMap = {
  opportunity: "bg-emerald-500/[0.04]",
  risk: "bg-amber-500/[0.04]",
  recommendation: "bg-cyan-500/[0.04]",
  warning: "bg-red-500/[0.04]",
  foresight: "bg-violet-500/[0.04]",
};

const tagMap = {
  opportunity: "Opportunity",
  risk: "Risk",
  recommendation: "Action",
  warning: "Warning",
  foresight: "Foresight",
};

const tagColorMap = {
  opportunity: "bg-emerald-500/15 text-emerald-400",
  risk: "bg-amber-500/15 text-amber-400",
  recommendation: "bg-cyan-500/15 text-cyan-400",
  warning: "bg-red-500/15 text-red-400",
  foresight: "bg-violet-500/15 text-violet-400",
};

export function InsightCard({ insight, compact }: { insight: AgentInsight; compact?: boolean }) {
  if (compact) {
    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg ${bgMap[insight.type]} border-l-2 ${borderMap[insight.type]}`}>
        <span className="mt-0.5 flex-shrink-0">{iconMap[insight.type]}</span>
        <div className="min-w-0">
          <p className="text-[13px] text-white/80 font-medium leading-snug">{insight.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl ${bgMap[insight.type]} border-l-3 ${borderMap[insight.type]} border border-white/[0.04]`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0">{iconMap[insight.type]}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${tagColorMap[insight.type]}`}>
              {tagMap[insight.type]}
            </span>
            {insight.impact === "high" && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">
                High Impact
              </span>
            )}
            <span className="text-[10px] text-white/25 ml-auto">
              {Math.round(insight.confidence * 100)}% confidence
            </span>
          </div>
          <h4 className="text-[14px] font-semibold text-white/90 leading-snug mb-2">
            {insight.title}
          </h4>
          <p className="text-[13px] text-white/50 leading-relaxed">
            {insight.body}
          </p>
          {insight.relatedCodes && insight.relatedCodes.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {insight.relatedCodes.map((code) => (
                <span key={code} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white/40">
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
