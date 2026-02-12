import { useState } from "react";
import { CPT_DATABASE } from "../data/cptData";
import { getComplianceScore } from "../utils/agentEngine";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";

export function ComplianceAudit() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["99214", "99490", "90834"]);
  const [customCode, setCustomCode] = useState("");

  const addCode = (code: string) => {
    const c = code.trim();
    if (c && !selectedCodes.includes(c) && CPT_DATABASE.some((d) => d.code === c)) {
      setSelectedCodes([...selectedCodes, c]);
      setCustomCode("");
    }
  };

  const removeCode = (code: string) => setSelectedCodes(selectedCodes.filter((c) => c !== code));
  const result = getComplianceScore(selectedCodes);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/95 tracking-tight font-['DM_Sans',sans-serif]">Compliance Scan</h1>
        <p className="text-sm text-white/35 mt-1">Audit exposure analysis — identify documentation risks, payer denial patterns, and compliance gaps</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Selection */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 font-['DM_Sans',sans-serif]">Select Codes to Audit</h3>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Add CPT code..." value={customCode} onChange={(e) => setCustomCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCode(customCode)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/80 text-[13px] placeholder-white/25 focus:outline-none focus:border-emerald-500/40" />
            <button onClick={() => addCode(customCode)}
              className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-[13px] font-medium hover:bg-emerald-500/30 transition-colors">Add</button>
          </div>

          <div className="space-y-1.5 mb-4">
            {selectedCodes.map((code) => {
              const data = CPT_DATABASE.find((c) => c.code === code);
              return (
                <div key={code} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-mono text-emerald-400">{code}</span>
                    <span className="text-[11px] text-white/30 truncate max-w-[120px]">{data?.name}</span>
                  </div>
                  <button onClick={() => removeCode(code)} className="text-white/20 hover:text-red-400 transition-colors">
                    <XCircle size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-white/25 mb-3">Quick Add:</div>
          <div className="flex flex-wrap gap-1.5">
            {CPT_DATABASE.filter((c) => !selectedCodes.includes(c.code)).slice(0, 8).map((code) => (
              <button key={code.code} onClick={() => addCode(code.code)}
                className="text-[11px] px-2 py-1 rounded bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-colors">
                {code.code}
              </button>
            ))}
          </div>
        </div>

        {/* Compliance Score */}
        <div className="lg:col-span-2 space-y-4">
          {/* Score Card */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${result.score > 70 ? "bg-emerald-500/10" : result.score > 40 ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                <span className={`text-3xl font-bold font-['DM_Sans',sans-serif] ${result.score > 70 ? "text-emerald-400" : result.score > 40 ? "text-amber-400" : "text-red-400"}`}>
                  {result.score}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white/90 font-['DM_Sans',sans-serif]">Compliance Score</h3>
                <p className="text-[13px] text-white/40 mt-0.5">
                  {result.score > 70 ? "Low risk profile — standard documentation should suffice" :
                   result.score > 40 ? "Moderate risk — enhanced documentation and time tracking recommended" :
                   "High risk — significant audit exposure requires immediate attention"}
                </p>
              </div>
            </div>

            <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-500 ${result.score > 70 ? "bg-emerald-500" : result.score > 40 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${result.score}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/20">
              <span>High Risk</span><span>Medium</span><span>Low Risk</span>
            </div>
          </div>

          {/* Audit Flags */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4 font-['DM_Sans',sans-serif] flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" /> Audit Flags ({result.flags.length})
            </h3>
            <div className="space-y-2">
              {result.flags.map((flag, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border-l-2 ${flag.risk === "high" ? "bg-red-500/[0.04] border-l-red-500/60" : flag.risk === "medium" ? "bg-amber-500/[0.04] border-l-amber-500/60" : "bg-white/[0.02] border-l-white/20"}`}>
                  <span className="text-[13px] font-mono text-white/50 w-14 flex-shrink-0">{flag.code}</span>
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${flag.risk === "high" ? "text-red-400" : flag.risk === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {flag.risk} risk
                    </span>
                    <p className="text-[13px] text-white/60 mt-0.5">{flag.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code-Specific Risk Details */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4 font-['DM_Sans',sans-serif]">Code Risk Profiles</h3>
            <div className="space-y-3">
              {selectedCodes.map((code) => {
                const data = CPT_DATABASE.find((c) => c.code === code);
                if (!data) return null;
                return (
                  <div key={code} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-mono font-bold text-emerald-400">{code}</span>
                        <span className="text-[12px] text-white/40">{data.name}</span>
                      </div>
                      <span className={`flex items-center gap-1 text-[11px] font-semibold ${data.complianceRisk === "high" ? "text-red-400" : data.complianceRisk === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                        {data.complianceRisk === "high" ? <XCircle size={12} /> : data.complianceRisk === "medium" ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {data.complianceRisk} risk
                      </span>
                    </div>
                    <div className="text-[11px] text-white/30 mb-2">Documentation requirements:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.documentationReqs.map((req, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-white/40">{req}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
