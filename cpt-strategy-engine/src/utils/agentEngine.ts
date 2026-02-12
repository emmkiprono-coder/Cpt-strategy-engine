import type { CPTCode, ServiceLine } from "../data/cptData";
import { CPT_DATABASE, calculateRevenue } from "../data/cptData";

export interface AgentInsight {
  type: "opportunity" | "risk" | "recommendation" | "warning" | "foresight";
  title: string;
  body: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  relatedCodes?: string[];
  actionable: boolean;
}

export interface StrategyAnalysis {
  summary: string;
  insights: AgentInsight[];
  projectedRevenue: number;
  riskScore: number;
  timeToROI: string;
  recommendation: string;
}

export interface ScenarioResult {
  scenarioName: string;
  baseRevenue: number;
  projectedRevenue: number;
  delta: number;
  deltaPercent: number;
  insights: AgentInsight[];
  risks: string[];
  timeline: string;
}

// AGENTIC REASONING ENGINE
export function analyzeServiceLine(
  serviceLine: ServiceLine,
  params: {
    monthlyVolume: number;
    payerMix: { medicare: number; commercial: number; medicaid: number };
    staffCount: number;
    avgProviderCost: number;
  }
): StrategyAnalysis {
  const codes = CPT_DATABASE.filter((c) => serviceLine.cptCodes.includes(c.code));
  const insights: AgentInsight[] = [];
  let totalRevenue = 0;
  let riskScore = 0;

  codes.forEach((code) => {
    const rev = calculateRevenue(code, params.monthlyVolume / codes.length, params.payerMix);
    totalRevenue += rev.total;

    if (code.complianceRisk === "high") {
      riskScore += 25;
      insights.push({
        type: "risk",
        title: `${code.code} carries high audit exposure`,
        body: `${code.name} is flagged for frequent audits. ${code.auditFlags[0]}. With ${params.payerMix.medicare}% Medicare mix, OIG scrutiny is elevated. Ensure documentation protocols are bulletproof before scaling volume.`,
        impact: "high",
        confidence: 0.88,
        relatedCodes: [code.code],
        actionable: true,
      });
    }

    if (params.payerMix.medicare > 60 && code.commercialMultiplier > 1.35) {
      insights.push({
        type: "opportunity",
        title: `Commercial shift could boost ${code.code} margin by ${Math.round((code.commercialMultiplier - 1) * 100)}%`,
        body: `Your Medicare-heavy mix is leaving money on the table. ${code.code} pays ${Math.round(code.commercialMultiplier * 100 - 100)}% more from commercial payers. Shifting 10% from Medicare to commercial would add ~$${Math.round(code.medicareRate * (code.commercialMultiplier - 1) * params.monthlyVolume * 0.1 / codes.length).toLocaleString()} monthly.`,
        impact: "high",
        confidence: 0.82,
        relatedCodes: [code.code],
        actionable: true,
      });
    }
  });

  // Strategic foresight insights
  if (serviceLine.id === "care-management") {
    insights.push({
      type: "foresight",
      title: "CCM enrollment compound growth opportunity",
      body: `At ${params.monthlyVolume} monthly encounters, your practice likely has ${Math.round(params.monthlyVolume * 0.4)} patients eligible for CCM but only ~${Math.round(params.monthlyVolume * 0.08)} enrolled. Industry benchmarks show practices capturing 20-25% of eligible patients within 12 months of dedicated enrollment. This represents $${Math.round(params.monthlyVolume * 0.15 * 62.69).toLocaleString()} in untapped monthly recurring revenue.`,
      impact: "high",
      confidence: 0.78,
      actionable: true,
    });
  }

  if (serviceLine.id === "behavioral-health") {
    insights.push({
      type: "foresight",
      title: "CoCM integration unlocks primary care revenue",
      body: "Psychiatric collaborative care (99492/99493) is the highest-margin behavioral health play in primary care settings. Practices integrating CoCM report 15-22% increases in BH-attributed revenue within 6 months. The infrastructure cost (care manager + consulting psychiatrist) pays back within 90 days at 50+ enrolled patients.",
      impact: "high",
      confidence: 0.85,
      actionable: true,
    });
  }

  if (serviceLine.id === "telehealth") {
    insights.push({
      type: "foresight",
      title: "RPM + CCM stacking is the highest-margin play",
      body: "Patients enrolled in BOTH RPM (99457) and CCM (99490) generate $110-130/month in combined management revenue per patient. The time spent does NOT fully overlap — regulatory requires separate documentation — but clinical workflows can be integrated. At 200 enrolled patients, this is $22K-26K/month in pure recurring revenue.",
      impact: "high",
      confidence: 0.90,
      actionable: true,
    });
  }

  // Volume-based insights
  const providerCapacity = params.staffCount * 20 * 22; // 20 visits/day, 22 days/month
  if (params.monthlyVolume > providerCapacity * 0.85) {
    insights.push({
      type: "warning",
      title: "Provider capacity approaching saturation",
      body: `At ${params.monthlyVolume} monthly encounters with ${params.staffCount} providers, you're at ${Math.round((params.monthlyVolume / providerCapacity) * 100)}% capacity. Above 85%, quality metrics typically decline. Consider: (1) Add mid-level providers, (2) Shift to delegation model, (3) Deploy telehealth for lower-acuity visits.`,
      impact: "high",
      confidence: 0.92,
      actionable: true,
    });
  }

  const staffCostMonthly = params.staffCount * params.avgProviderCost;
  const margin = ((totalRevenue - staffCostMonthly) / totalRevenue) * 100;
  let recommendation = "";

  if (margin < 20) {
    recommendation = `This service line is margin-thin at ${margin.toFixed(1)}%. Consider: restructuring payer contracts, increasing volume through extended hours, or layering recurring revenue codes (CCM/RPM) to boost per-patient revenue without proportional cost increase.`;
    riskScore += 30;
  } else if (margin < 40) {
    recommendation = `Healthy margin at ${margin.toFixed(1)}%. Optimize by: targeting higher-reimbursement codes where documentation supports it, negotiating commercial rates using volume leverage, and ensuring coding accuracy to prevent revenue leakage.`;
  } else {
    recommendation = `Strong margin at ${margin.toFixed(1)}%. Scale this service line. Key levers: geographic expansion, adding satellite locations, or licensing the model. Watch for audit exposure as volume grows.`;
  }

  return {
    summary: `${serviceLine.name} projects $${Math.round(totalRevenue).toLocaleString()}/month at current parameters. ${serviceLine.marginProfile === "high" ? "High-margin profile supports scaling." : "Margin requires careful cost management."}`,
    insights,
    projectedRevenue: totalRevenue,
    riskScore: Math.min(riskScore, 100),
    timeToROI: riskScore > 50 ? "6-12 months" : riskScore > 25 ? "3-6 months" : "1-3 months",
    recommendation,
  };
}

export function runScenario(
  scenarioType: string,
  params: Record<string, number>
): ScenarioResult {
  const insights: AgentInsight[] = [];
  const risks: string[] = [];
  let baseRevenue = 0;
  let projectedRevenue = 0;

  switch (scenarioType) {
    case "telehealth-shift": {
      const visits = params.currentVisits || 800;
      const shiftPercent = params.shiftPercent || 30;
      const currentAvgRate = 131.20; // avg 99214
      const teleAvgRate = 131.20 * 0.95; // slight telehealth discount
      const costSavingPerVisit = 18; // overhead savings
      baseRevenue = visits * currentAvgRate;
      const remainingInPerson = visits * (1 - shiftPercent / 100);
      const teleVisits = visits * (shiftPercent / 100);
      projectedRevenue = remainingInPerson * currentAvgRate + teleVisits * (teleAvgRate + costSavingPerVisit);

      insights.push({
        type: "opportunity",
        title: "Net-positive telehealth conversion",
        body: `Shifting ${shiftPercent}% to telehealth saves ~$${Math.round(teleVisits * costSavingPerVisit).toLocaleString()}/month in overhead while only reducing per-visit revenue by ~5%. Net impact is positive.`,
        impact: "high",
        confidence: 0.85,
        actionable: true,
      });
      insights.push({
        type: "foresight",
        title: "Telehealth opens geographic expansion",
        body: "Once telehealth infrastructure is operational, adding patients outside your physical radius costs near-zero marginal overhead. Practices report 15-30% panel growth within 6 months of telehealth launch.",
        impact: "high",
        confidence: 0.75,
        actionable: true,
      });
      risks.push("Payer-specific telehealth reimbursement varies — verify contracts");
      risks.push("Audio-only vs video parity not guaranteed post-PHE");
      risks.push("Patient no-show patterns may shift (can improve or worsen)");
      break;
    }

    case "add-ccm": {
      const panel = params.panelSize || 2000;
      const chronicRate = (params.chronicRate || 35) / 100;
      const enrollRate = (params.enrollmentRate || 15) / 100;
      const staffCost = params.staffCost || 4500;
      const eligiblePatients = Math.round(panel * chronicRate);
      const enrolled = Math.round(eligiblePatients * enrollRate);
      baseRevenue = 0; // new service line
      const ccmRevPerPatient = 62.69; // 99490
      const addOnRevPerPatient = 47.32 * 0.3; // 30% get add-on
      projectedRevenue = enrolled * (ccmRevPerPatient + addOnRevPerPatient) - staffCost;

      insights.push({
        type: "opportunity",
        title: `${enrolled} patients generate $${Math.round(enrolled * ccmRevPerPatient).toLocaleString()}/month`,
        body: `With ${panel.toLocaleString()} panel patients, ${eligiblePatients} are CCM-eligible. At ${(enrollRate * 100).toFixed(0)}% enrollment, ${enrolled} patients enrolled × $62.69 base = $${Math.round(enrolled * ccmRevPerPatient).toLocaleString()}/month before add-ons.`,
        impact: "high",
        confidence: 0.88,
        actionable: true,
      });
      insights.push({
        type: "foresight",
        title: "CCM enrollment compounds — month 6 is the inflection",
        body: `Initial enrollment typically reaches 8-10% in month 1-2, accelerates to 15-20% by month 4-6 as workflows mature. Your month-6 run rate could reach $${Math.round(eligiblePatients * 0.20 * ccmRevPerPatient).toLocaleString()}/month — ${Math.round((eligiblePatients * 0.20 * ccmRevPerPatient) / projectedRevenue * 100 - 100)}% above current projection.`,
        impact: "high",
        confidence: 0.72,
        actionable: true,
      });
      insights.push({
        type: "recommendation",
        title: "Stack 99439 add-on for high-acuity patients",
        body: "Patients spending 40+ minutes/month in care coordination qualify for 99439 add-on ($47.32). Target your top 20-30% complex patients. This alone can add 25-30% to CCM revenue.",
        impact: "medium",
        confidence: 0.82,
        actionable: true,
      });
      risks.push("Patient consent collection is the #1 enrollment bottleneck");
      risks.push("Time documentation failures are the #1 audit finding in CCM");
      risks.push("Staff turnover disrupts enrolled patient relationships");
      break;
    }

    case "payer-mix-stress": {
      const currentRevenue = params.currentRevenue || 150000;
      const medicarePercent = params.medicarePercent || 45;
      const commercialPercent = 100 - medicarePercent - (params.medicaidPercent || 10);
      baseRevenue = currentRevenue;
      // Under 100% Medicare
      const avgCommercialMultiplier = 1.38;
      const commercialPortion = currentRevenue * (commercialPercent / 100);
      const revenueAtMedicare = currentRevenue - commercialPortion + commercialPortion / avgCommercialMultiplier;
      projectedRevenue = revenueAtMedicare;

      insights.push({
        type: "warning",
        title: `Medicare-only scenario: ${Math.round(((baseRevenue - projectedRevenue) / baseRevenue) * 100)}% revenue decline`,
        body: `Converting to 100% Medicare eliminates commercial premium (avg ${Math.round((avgCommercialMultiplier - 1) * 100)}% above Medicare). Revenue drops from $${Math.round(baseRevenue).toLocaleString()} to $${Math.round(projectedRevenue).toLocaleString()} monthly — a $${Math.round(baseRevenue - projectedRevenue).toLocaleString()} hit.`,
        impact: "high",
        confidence: 0.92,
        actionable: true,
      });
      insights.push({
        type: "foresight",
        title: "MA plan growth is effectively Medicare-rate convergence",
        body: "Medicare Advantage plans increasingly reimburse at or near traditional Medicare rates. If your commercial mix includes MA plans coded as 'commercial,' your actual Medicare-equivalent exposure may be 10-15% higher than reported. Audit your payer mix by actual reimbursement rates, not plan labels.",
        impact: "high",
        confidence: 0.80,
        actionable: true,
      });
      risks.push("Medicare rate updates don't keep pace with cost inflation");
      risks.push("CMS policy changes can eliminate codes or reduce coverage");
      risks.push("MIPS/quality penalties can reduce payments by up to 9%");
      break;
    }

    case "rpm-overlay": {
      const eligible = params.eligiblePatients || 300;
      const complianceRate = (params.complianceRate || 70) / 100;
      const deviceCost = params.deviceCost || 45;
      const enrollRate = (params.enrollmentRate || 25) / 100;
      const enrolled = Math.round(eligible * enrollRate);
      const compliant = Math.round(enrolled * complianceRate);
      const rpmRevPerPatient = 50.94; // 99457
      const addOnRev = 41.17 * 0.2; // 20% get add-on
      const deviceMonthly = enrolled * deviceCost;
      const staffCost = Math.ceil(compliant / 100) * 5000; // 1 FTE per 100 patients
      baseRevenue = 0;
      projectedRevenue = compliant * (rpmRevPerPatient + addOnRev) - deviceMonthly - staffCost;

      insights.push({
        type: "opportunity",
        title: `RPM layer: $${Math.round(projectedRevenue).toLocaleString()}/month net after costs`,
        body: `${enrolled} enrolled → ${compliant} compliant (16+ days data). Revenue: $${Math.round(compliant * rpmRevPerPatient).toLocaleString()}/month. Less devices ($${deviceMonthly.toLocaleString()}) and staff ($${staffCost.toLocaleString()}).`,
        impact: projectedRevenue > 5000 ? "high" : "medium",
        confidence: 0.80,
        actionable: true,
      });
      insights.push({
        type: "foresight",
        title: "RPM + CCM dual-enrollment maximizes per-patient yield",
        body: `Patients eligible for RPM almost always qualify for CCM (99490). Dual-enrolled patients generate $113+/month vs $51 for RPM alone. With ${compliant} compliant RPM patients, potential CCM overlay adds $${Math.round(compliant * 62.69).toLocaleString()}/month.`,
        impact: "high",
        confidence: 0.85,
        actionable: true,
      });
      risks.push("Device compliance (16-day rule) is the primary revenue risk");
      risks.push("Device costs are upfront; revenue is delayed by billing cycles");
      risks.push("Staff training on RPM workflows takes 4-6 weeks");
      break;
    }

    default: {
      baseRevenue = params.currentRevenue || 100000;
      projectedRevenue = baseRevenue;
      insights.push({
        type: "recommendation",
        title: "Select a specific scenario for detailed modeling",
        body: "Choose from: telehealth shift, CCM addition, MA delegation, payer mix stress test, or RPM overlay.",
        impact: "low",
        confidence: 1,
        actionable: false,
      });
    }
  }

  return {
    scenarioName: scenarioType,
    baseRevenue,
    projectedRevenue,
    delta: projectedRevenue - baseRevenue,
    deltaPercent: baseRevenue > 0 ? ((projectedRevenue - baseRevenue) / baseRevenue) * 100 : 100,
    insights,
    risks,
    timeline: projectedRevenue > baseRevenue * 1.1 ? "3-6 months to full ROI" : "6-12 months to stabilize",
  };
}

export function getComplianceScore(codes: string[]): {
  score: number;
  flags: { code: string; risk: string; detail: string }[];
} {
  const codeData = codes.map((c) => CPT_DATABASE.find((d) => d.code === c)).filter(Boolean) as CPTCode[];
  const flags: { code: string; risk: string; detail: string }[] = [];
  let totalRisk = 0;

  codeData.forEach((code) => {
    const riskValue = code.complianceRisk === "high" ? 30 : code.complianceRisk === "medium" ? 15 : 5;
    totalRisk += riskValue;
    code.auditFlags.forEach((flag) => {
      flags.push({ code: code.code, risk: code.complianceRisk, detail: flag });
    });
  });

  const score = Math.max(0, 100 - totalRisk);
  return { score, flags };
}

export function generateStrategicForesight(
  serviceLine: ServiceLine,
  _currentMetrics: Record<string, number>
): AgentInsight[] {
  const foresights: AgentInsight[] = [];

  // Market dynamics
  foresights.push({
    type: "foresight",
    title: `${serviceLine.name}: 12-month trajectory analysis`,
    body: serviceLine.marginProfile === "high"
      ? `High-margin service lines like ${serviceLine.name} face increasing competitive pressure as more practices adopt similar models. First-mover advantage in your market is time-limited. Recommendation: scale enrollment aggressively in the next 6 months while investing in operational efficiency to maintain margins as competition intensifies.`
      : `${serviceLine.name} operates on thin margins that require disciplined volume management. Expected CMS rate adjustments may further compress margins by 2-4% annually. Counter-strategy: layer higher-margin codes (CCM, RPM) onto existing patient relationships to increase per-patient revenue without proportional cost increase.`,
    impact: "high",
    confidence: 0.70,
    actionable: true,
  });

  // Regulatory foresight
  foresights.push({
    type: "foresight",
    title: "Regulatory horizon: What's changing",
    body: "CMS continues expanding telehealth and care management coverage while increasing documentation requirements. The trend favors practices with robust EHR workflows, time-tracking systems, and compliance infrastructure. Practices without these capabilities will lose access to the highest-growth CPT categories (RPM, CCM, CoCM) within 24 months.",
    impact: "medium",
    confidence: 0.75,
    actionable: true,
  });

  return foresights;
}
