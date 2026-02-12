import { type Page } from "../App";
import {
  LayoutDashboard,
  Search,
  FlaskConical,
  Layers,
  ShieldCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode; description: string }[] = [
  { page: "dashboard", label: "Command Center", icon: <LayoutDashboard size={20} />, description: "Strategic overview" },
  { page: "explorer", label: "Code Explorer", icon: <Search size={20} />, description: "Deep-dive CPT analysis" },
  { page: "simulator", label: "Scenario Lab", icon: <FlaskConical size={20} />, description: "What-if modeling" },
  { page: "builder", label: "Service Builder", icon: <Layers size={20} />, description: "Design service lines" },
  { page: "compliance", label: "Compliance Scan", icon: <ShieldCheck size={20} />, description: "Risk assessment" },
  { page: "chat", label: "Strategy Agent", icon: <MessageSquare size={20} />, description: "AI-powered advisor" },
];

export function Sidebar({ activePage, onNavigate, isOpen, onToggle }: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col bg-[#0d0e14] border-r border-white/[0.06] transition-all duration-300 ${
        isOpen ? "w-[260px]" : "w-[72px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-black" />
        </div>
        {isOpen && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold tracking-tight text-white/90 font-['DM_Sans',sans-serif]">
              CPT Strategy
            </h1>
            <p className="text-[10px] text-white/40 tracking-wider uppercase">
              Engine v2.0
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white/60"}`}>
                {item.icon}
              </span>
              {isOpen && (
                <div className="text-left overflow-hidden">
                  <div className="text-[13px] font-medium leading-tight">{item.label}</div>
                  <div className="text-[10px] text-white/30 leading-tight mt-0.5">{item.description}</div>
                </div>
              )}
              {isActive && isOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1a1b24] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all z-10"
      >
        {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        {isOpen && (
          <div className="text-[10px] text-white/20 leading-relaxed">
            Agentic reasoning engine<br />
            Not medical/legal advice
          </div>
        )}
      </div>
    </aside>
  );
}
