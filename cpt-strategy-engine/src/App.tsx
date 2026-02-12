import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { CodeExplorer } from "./pages/CodeExplorer";
import { ScenarioSimulator } from "./pages/ScenarioSimulator";
import { ServiceLineBuilder } from "./pages/ServiceLineBuilder";
import { ComplianceAudit } from "./pages/ComplianceAudit";
import { StrategyChat } from "./pages/StrategyChat";

export type Page = "dashboard" | "explorer" | "simulator" | "builder" | "compliance" | "chat";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard onNavigate={setActivePage} />;
      case "explorer": return <CodeExplorer />;
      case "simulator": return <ScenarioSimulator />;
      case "builder": return <ServiceLineBuilder />;
      case "compliance": return <ComplianceAudit />;
      case "chat": return <StrategyChat />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0b0f] text-white overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-y-auto">{renderPage()}</main>
    </div>
  );
}

export default App;
