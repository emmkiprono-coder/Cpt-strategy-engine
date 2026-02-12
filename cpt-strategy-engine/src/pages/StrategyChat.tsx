import { useState, useRef, useEffect } from "react";
import { CPT_DATABASE, SERVICE_LINES } from "../data/cptData";
import { analyzeServiceLine, runScenario } from "../utils/agentEngine";
import { InsightCard } from "../components/InsightCard";
import { Send, Zap, Brain, Eye } from "lucide-react";
import type { AgentInsight } from "../utils/agentEngine";

interface Message {
  role: "user" | "agent";
  content: string;
  insights?: AgentInsight[];
  thinking?: string[];
}

const SUGGESTED_PROMPTS = [
  "Build a CPT strategy for a primary care clinic adding remote monitoring",
  "Compare behavioral health vs care management revenue potential",
  "Stress-test my practice under Medicare-only reimbursement",
  "Which CPT mix supports a subscription-style care model?",
  "What are the highest-margin codes with lowest compliance risk?",
  "Design an RPM + CCM stacking strategy for 500 chronic patients",
];

function processQuery(query: string): Message {
  const q = query.toLowerCase();
  const thinking: string[] = [];
  let content = "";
  let insights: AgentInsight[] = [];

  // Pattern matching for agentic reasoning
  if (q.includes("rpm") || q.includes("remote monitor") || q.includes("remote patient")) {
    thinking.push("Detected RPM/Remote Monitoring intent");
    thinking.push("Analyzing telehealth service line codes: 99457, 99458");
    thinking.push("Running RPM overlay scenario with default parameters");
    thinking.push("Cross-referencing CCM stacking opportunities");

    const result = runScenario("rpm-overlay", { eligiblePatients: 300, enrollmentRate: 25, complianceRate: 70, deviceCost: 45 });
    const telehealth = SERVICE_LINES.find(s => s.id === "telehealth")!;
    const analysis = analyzeServiceLine(telehealth, { monthlyVolume: 400, payerMix: { medicare: 50, commercial: 35, medicaid: 15 }, staffCount: 2, avgProviderCost: 15000 });

    content = `**RPM Strategy Blueprint**\n\nRemote Patient Monitoring is your highest-margin recurring revenue play. Here's the framework:\n\n**Core Codes:**\n• 99457 — RPM treatment management ($50.94/patient/month) — requires 16+ days of device data and 20+ min clinical staff time\n• 99458 — Add-on for additional 20 min ($41.17) — bill for high-acuity patients needing >20 min\n\n**Revenue Model (300 eligible patients):**\n• At 25% enrollment → 75 patients enrolled\n• At 70% device compliance → 53 billable patients/month\n• Base revenue: ~$2,700/month from 99457 alone\n• Add CCM stacking (99490): patients qualifying for RPM almost always qualify for CCM, adding ~$62.69/patient/month\n• Dual-enrolled revenue: ~$113+/patient/month\n\n**Critical Success Factors:**\n1. Device compliance is everything — the 16-day transmission rule is non-negotiable\n2. Staff training on RPM workflows takes 4-6 weeks before full productivity\n3. Time documentation must be meticulous — this is the #1 audit trigger\n\n**Recommended Scaling Path:**\nMonth 1-2: Pilot with 50 highest-acuity patients\nMonth 3-4: Expand to 150, add CCM overlay\nMonth 5-6: Full enrollment push to 250+, optimize device compliance\n\nThe real unlock is RPM + CCM dual-enrollment. Don't launch RPM without a CCM capture strategy.`;

    insights = [...result.insights, ...analysis.insights.filter(i => i.type === "foresight")];
  }
  else if (q.includes("subscription") || q.includes("recurring")) {
    thinking.push("Detected subscription/recurring revenue model interest");
    thinking.push("Analyzing care management codes: CCM, PCM, RPM, RTM");
    thinking.push("Modeling recurring revenue per-patient economics");

    content = `**Subscription-Style CPT Strategy**\n\nThe closest thing to SaaS in healthcare billing is layered care management codes. Here's how to build it:\n\n**Tier 1 — Base Subscription Layer:**\n• 99490 (CCM) — $62.69/patient/month — 2+ chronic conditions, 20 min clinical staff time\n• This is your MRR foundation. Every eligible patient should be enrolled.\n\n**Tier 2 — Premium Layer:**\n• 99491 (Complex CCM) — $86.41/patient/month — requires physician/QHP time, not just clinical staff\n• Target your top 20% most complex patients for this upgrade\n\n**Tier 3 — Add-On Revenue:**\n• 99439 (CCM add-on) — $47.32/additional 20 min — stacks on top of 99490\n• 99458 (RPM add-on) — $41.17/additional 20 min — stacks on top of 99457\n\n**Tier 4 — RPM Overlay:**\n• 99457 (RPM management) — $50.94/patient/month — device-based monitoring\n• Dual-enroll CCM + RPM patients for $113+/patient/month\n\n**Per-Patient Monthly Revenue Potential:**\n• Basic CCM only: $62.69\n• CCM + add-on: $110.01\n• CCM + RPM: $113.63\n• CCM + RPM + add-ons: $201.12\n\n**Unit Economics:**\n• 1 FTE care manager ($5,000/month) can manage ~100 CCM patients\n• Revenue per FTE: $6,269 - $20,112/month depending on code stacking\n• Margin: 25-75% depending on mix\n\nThis is the most defensible revenue model in outpatient care. It compounds monthly and has near-zero marginal acquisition cost once patients are enrolled.`;

    insights = [
      { type: "foresight", title: "Enrollment velocity is the key metric", body: "Track weekly enrollment rate, not just total enrolled. Practices that enroll 15+ patients/week in months 1-3 reach profitability 2x faster than those at 5/week.", impact: "high", confidence: 0.85, actionable: true },
      { type: "opportunity", title: "CCM + RPM dual enrollment is underutilized", body: "Only 12% of CCM practices also bill RPM on the same patients. This is pure incremental revenue with overlapping clinical workflows.", impact: "high", confidence: 0.80, actionable: true },
      { type: "risk", title: "Time documentation is the compliance bottleneck", body: "60% of CCM audit failures relate to insufficient time documentation. Invest in automated time tracking before scaling.", impact: "high", confidence: 0.90, actionable: true },
    ];
  }
  else if (q.includes("compare") || q.includes("vs") || q.includes("versus")) {
    thinking.push("Detected comparison request");
    thinking.push("Identifying service lines to compare");
    thinking.push("Running parallel analysis with standard parameters");

    const bhAnalysis = analyzeServiceLine(SERVICE_LINES.find(s => s.id === "behavioral-health")!, { monthlyVolume: 400, payerMix: { medicare: 35, commercial: 50, medicaid: 15 }, staffCount: 4, avgProviderCost: 12000 });
    const cmAnalysis = analyzeServiceLine(SERVICE_LINES.find(s => s.id === "care-management")!, { monthlyVolume: 400, payerMix: { medicare: 50, commercial: 35, medicaid: 15 }, staffCount: 2, avgProviderCost: 8000 });

    content = `**Service Line Comparison: Behavioral Health vs Care Management**\n\n| Dimension | Behavioral Health | Care Management |\n|---|---|---|\n| Revenue Model | Per-session (volume-driven) | Per-patient/month (recurring) |\n| Projected Monthly | $${Math.round(bhAnalysis.projectedRevenue).toLocaleString()} | $${Math.round(cmAnalysis.projectedRevenue).toLocaleString()} |\n| Margin Profile | High | High |\n| Volume Sensitivity | Medium (session-dependent) | Low (enrollment-based) |\n| Staffing | Licensed therapists ($$$) | RN/LPN/MA ($$) |\n| Risk Score | ${bhAnalysis.riskScore}/100 | ${cmAnalysis.riskScore}/100 |\n| Time to ROI | ${bhAnalysis.timeToROI} | ${cmAnalysis.timeToROI} |\n\n**Verdict:**\nBehavioral health has higher per-unit reimbursement but is constrained by provider availability and no-show rates. Care management generates lower per-touch revenue but compounds monthly with minimal provider involvement.\n\n**Best Strategy:** Layer both. Use BH for high-value encounters and CCM/RPM for between-visit recurring revenue. CoCM codes (99492/99493) bridge both worlds by embedding behavioral health into primary care with monthly billing.`;

    insights = [...bhAnalysis.insights.slice(0, 2), ...cmAnalysis.insights.slice(0, 2)];
  }
  else if (q.includes("stress") || q.includes("medicare only") || q.includes("medicare-only")) {
    thinking.push("Detected stress test / Medicare-only scenario");
    thinking.push("Running payer mix stress test");
    thinking.push("Analyzing margin compression risk");

    const result = runScenario("payer-mix-stress", { currentRevenue: 150000, medicarePercent: 45, medicaidPercent: 10 });

    content = `**Medicare-Only Stress Test**\n\nConverting your practice to 100% Medicare reimbursement reveals structural vulnerabilities:\n\n**Revenue Impact:**\n• Current revenue: $${Math.round(result.baseRevenue).toLocaleString()}/month\n• Under Medicare-only: $${Math.round(result.projectedRevenue).toLocaleString()}/month\n• Delta: ${result.delta >= 0 ? "+" : ""}$${Math.round(result.delta).toLocaleString()} (${result.deltaPercent.toFixed(1)}%)\n\n**Why This Matters:**\nMedicare Advantage plans increasingly reimburse near traditional Medicare rates. If your \"commercial\" mix includes MA plans, your actual Medicare-equivalent exposure is higher than you think.\n\n**Defensive Strategies:**\n1. Layer recurring revenue codes (CCM, RPM) — these are Medicare-friendly and compound\n2. Negotiate commercial rates using volume leverage\n3. Pursue value-based contracts with quality bonuses\n4. Shift care management to lower-cost staff (RN/MA) to protect margins\n\nThe practices that survive Medicare-rate convergence are those with diversified code mixes and recurring revenue streams.`;

    insights = result.insights;
  }
  else if (q.includes("highest margin") || q.includes("best margin") || q.includes("most profitable") || q.includes("lowest risk")) {
    thinking.push("Detected margin/profitability optimization query");
    thinking.push("Ranking codes by margin-to-risk ratio");
    thinking.push("Filtering for actionable opportunities");

    const ranked = CPT_DATABASE
      .map(c => ({ ...c, marginScore: (c.medicareRate * c.commercialMultiplier) / c.timeMinutes, riskNum: c.complianceRisk === "low" ? 1 : c.complianceRisk === "medium" ? 2 : 3 }))
      .sort((a, b) => (b.marginScore / b.riskNum) - (a.marginScore / a.riskNum))
      .slice(0, 6);

    content = `**Highest Margin-to-Risk Codes**\n\nRanked by revenue per minute of effort, weighted against compliance exposure:\n\n${ranked.map((c, i) => `${i + 1}. **${c.code}** — ${c.name}\n   • Medicare: $${c.medicareRate} | Commercial: $${(c.medicareRate * c.commercialMultiplier).toFixed(0)} | Time: ${c.timeMinutes}m\n   • Revenue/minute: $${c.marginScore.toFixed(2)} | Risk: ${c.complianceRisk}\n   • Pattern: ${c.strategyPattern}`).join("\n\n")}\n\n**Key Insight:** The best risk-adjusted returns come from care management codes (99490, 99491) because they generate recurring revenue with MA/RN-level staffing costs. Per-encounter codes like 99214 have good margins but cap at provider capacity.`;

    insights = [
      { type: "recommendation", title: "Optimize code mix, not just volume", body: "Adding 2 CCM patients is more valuable than 1 additional 99214 visit when you factor in staff cost and recurring nature. Shift operational focus to enrollment metrics.", impact: "high", confidence: 0.85, actionable: true },
    ];
  }
  else {
    thinking.push("Processing general strategy query");
    thinking.push("Scanning across all service lines for relevant patterns");
    thinking.push("Generating contextual recommendations");

    content = `I can help you with CPT strategy across several dimensions:\n\n**Revenue Optimization** — Which codes maximize margin for your specific practice setup\n**Scenario Modeling** — What-if analysis for telehealth shifts, CCM additions, payer mix changes\n**Compliance Intelligence** — Audit exposure by code, documentation requirements, risk mitigation\n**Service Line Design** — Build and stress-test complete service offerings\n\nTry asking:\n• "Build a CPT strategy for adding remote monitoring"\n• "Compare behavioral health vs care management revenue"\n• "Which CPT mix supports subscription-style revenue?"\n• "Stress-test under Medicare-only reimbursement"\n• "What are the highest-margin codes with lowest risk?"\n\nThe more specific your scenario, the more precise my analysis.`;
  }

  return { role: "agent", content, insights: insights.length > 0 ? insights : undefined, thinking };
}

export function StrategyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const response = processQuery(userMsg.content);
      setMessages(prev => [...prev, response]);
      setIsThinking(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white/90 font-['DM_Sans',sans-serif]">Strategy Agent</h1>
            <p className="text-[11px] text-white/35">CPT-enabled business strategist with agentic reasoning</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400/70">Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto pt-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-violet-500/10">
                <Zap size={28} className="text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white/85 font-['DM_Sans',sans-serif] mb-2">CPT Strategy Agent</h2>
              <p className="text-[13px] text-white/35 max-w-md mx-auto">Ask about CPT codes, service line strategy, revenue modeling, compliance risks, or scenario planning. Every response includes actionable insights and strategic foresight.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button key={i} onClick={() => { setInput(prompt); }}
                  className="text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all">
                  <p className="text-[12px] text-white/50">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`max-w-3xl ${msg.role === "user" ? "ml-auto" : ""}`}>
            {msg.role === "user" ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 inline-block max-w-lg ml-auto">
                <p className="text-[13px] text-white/80">{msg.content}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Thinking process */}
                {msg.thinking && msg.thinking.length > 0 && (
                  <button onClick={() => setExpandedThinking(expandedThinking === i ? null : i)}
                    className="flex items-center gap-2 text-[11px] text-violet-400/60 hover:text-violet-400/80 transition-colors">
                    <Eye size={12} />
                    {expandedThinking === i ? "Hide" : "Show"} reasoning ({msg.thinking.length} steps)
                  </button>
                )}
                {expandedThinking === i && msg.thinking && (
                  <div className="bg-violet-500/[0.04] border border-violet-500/10 rounded-lg p-3 space-y-1">
                    {msg.thinking.map((step, j) => (
                      <div key={j} className="flex items-center gap-2 text-[11px] text-violet-400/50">
                        <span className="w-4 h-4 rounded-full bg-violet-500/10 flex items-center justify-center text-[9px] flex-shrink-0">{j + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                {/* Response content */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-4">
                  <div className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">
                    {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={j} className="text-white/90 font-semibold">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </div>
                </div>

                {/* Insights */}
                {msg.insights && msg.insights.length > 0 && (
                  <div className="space-y-2 pl-2">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider">Agent Insights</span>
                    {msg.insights.slice(0, 3).map((insight, j) => (
                      <InsightCard key={j} insight={insight} compact />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[12px] text-white/30">Agent reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-white/[0.06] bg-[#0a0b0f]">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about CPT strategy, revenue modeling, compliance..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/25 focus:outline-none focus:border-emerald-500/40 transition-colors" />
          <button onClick={handleSend} disabled={!input.trim() || isThinking}
            className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
