import { useState, useMemo } from "react";
import { CPT_DATABASE, SERVICE_LINES, calculateRevenue } from "../data/cptData";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

export function CodeExplorer() {
  const [search, setSearch] = useState("");
  const [selectedServiceLine, setSelectedServiceLine] = useState("all");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"code" | "rate" | "risk">("code");

  const filteredCodes = useMemo(() => {
    let codes = [...CPT_DATABASE];
    if (search) {
      const q = search.toLowerCase();
      codes = codes.filter(
        (c) => c.code.includes(q) || c.name.toLowerCase().includes(q) || c.plainEnglish.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      );
    }
    if (selectedServiceLine !== "all") codes = codes.filter((c) => c.serviceLine === selectedServiceLine);
    if (sortBy === "rate") codes.sort((a, b) => b.medicareRate - a.medicareRate);
    else if (sortBy === "risk") {
      const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      codes.sort((a, b) => riskOrder[a.complianceRisk] - riskOrder[b.complianceRisk]);
    } else codes.sort((a, b) => a.code.localeCompare(b.code));
    return codes;
  }, [search, selectedServiceLine, sortBy]);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/95 tracking-tight font-['DM_Sans',sans-serif]">Code Explorer</h1>
        <p className="text-sm text-white/35 mt-1">Deep-dive CPT analysis — plain English, strategy, compliance, financial modeling</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" placeholder="Search by code, name, description..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/25 focus:outline-none focus:border-emerald-500/40 transition-colors" />
        </div>
        <select value={selectedServiceLine} onChange={(e) => setSelectedServiceLine(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/60 text-[13px] focus:outline-none appearance-none cursor-pointer">
          <option value="all">All Service Lines</option>
          {SERVICE_LINES.map((sl) => (<option key={sl.id} value={sl.id}>{sl.icon} {sl.name}</option>))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/60 text-[13px] focus:outline-none appearance-none cursor-pointer">
          <option value="code">Sort: Code</option>
          <option value="rate">Sort: Rate ↓</option>
          <option value="risk">Sort: Risk ↓</option>
        </select>
      </div>

      <div className="text-[12px] text-white/30 mb-4">{filteredCodes.length} codes found</div>

      <div className="space-y-2">
        {filteredCodes.map((code) => {
          const isExpanded = expandedCode === code.code;
          const rev = calculateRevenue(code, 100, { medicare: 45, commercial: 40, medicaid: 15 });
          return (
            <div key={code.code} className={`border rounded-xl transition-all duration-200 ${isExpanded ? "bg-white/[0.04] border-emerald-500/20" : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.10]"}`}>
              <button onClick={() => setExpandedCode(isExpanded ? null : code.code)} className="w-full flex items-center gap-4 p-4 text-left">
                <div className="w-16 text-center">
                  <div className="text-[15px] font-mono font-bold text-emerald-400">{code.code}</div>
                  <div className={`text-[10px] mt-0.5 px-2 py-0.5 rounded-full inline-block ${code.complianceRisk === "high" ? "bg-red-500/15 text-red-400" : code.complianceRisk === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                    {code.complianceRisk}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white/85">{code.name}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">{code.category} · {SERVICE_LINES.find(s => s.id === code.serviceLine)?.name}</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[14px] font-semibold text-white/70">${code.medicareRate}</div>
                  <div className="text-[10px] text-white/30">Medicare</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[14px] font-semibold text-cyan-400/70">${(code.medicareRate * code.commercialMultiplier).toFixed(0)}</div>
                  <div className="text-[10px] text-white/30">Commercial</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[14px] font-semibold text-white/50">{code.timeMinutes}m</div>
                  <div className="text-[10px] text-white/30">Time</div>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-5 pt-2 border-t border-white/[0.06]">
                  {/* Plain English */}
                  <div className="mb-5">
                    <h4 className="text-[11px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-2">Plain English</h4>
                    <p className="text-[13px] text-white/60 leading-relaxed">{code.plainEnglish}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {/* Strategy Pattern */}
                    <div className="bg-white/[0.03] rounded-lg p-4">
                      <h4 className="text-[11px] text-cyan-400/60 uppercase tracking-wider font-semibold mb-2">Strategy Pattern</h4>
                      <p className="text-[13px] text-white/70 font-medium">{code.strategyPattern}</p>
                    </div>
                    {/* Financial */}
                    <div className="bg-white/[0.03] rounded-lg p-4">
                      <h4 className="text-[11px] text-violet-400/60 uppercase tracking-wider font-semibold mb-2">Revenue @ 100 units/mo</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><div className="text-[14px] font-bold text-white/70">${Math.round(rev.breakdown.medicare).toLocaleString()}</div><div className="text-[10px] text-white/30">Medicare</div></div>
                        <div><div className="text-[14px] font-bold text-cyan-400/70">${Math.round(rev.breakdown.commercial).toLocaleString()}</div><div className="text-[10px] text-white/30">Commercial</div></div>
                        <div><div className="text-[14px] font-bold text-amber-400/70">${Math.round(rev.breakdown.medicaid).toLocaleString()}</div><div className="text-[10px] text-white/30">Medicaid</div></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {/* Best For */}
                    <div>
                      <h4 className="text-[11px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-2">✓ Best For</h4>
                      <div className="space-y-1">
                        {code.bestFor.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-[12px] text-white/50"><span className="text-emerald-400/60 mt-0.5">•</span>{b}</div>
                        ))}
                      </div>
                    </div>
                    {/* Avoid When */}
                    <div>
                      <h4 className="text-[11px] text-red-400/60 uppercase tracking-wider font-semibold mb-2">✗ Avoid When</h4>
                      <div className="space-y-1">
                        {code.avoidWhen.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-[12px] text-white/50"><span className="text-red-400/60 mt-0.5">•</span>{a}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Audit Flags */}
                  <div className="mb-4">
                    <h4 className="text-[11px] text-amber-400/60 uppercase tracking-wider font-semibold mb-2">⚠ Audit Flags</h4>
                    <div className="space-y-1">
                      {code.auditFlags.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-[12px] text-white/50"><span className="text-amber-400/60 mt-0.5">△</span>{f}</div>
                      ))}
                    </div>
                  </div>

                  {/* Documentation */}
                  <div>
                    <h4 className="text-[11px] text-white/30 uppercase tracking-wider font-semibold mb-2">Documentation Requirements</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {code.documentationReqs.map((d, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/40 border border-white/[0.06]">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
