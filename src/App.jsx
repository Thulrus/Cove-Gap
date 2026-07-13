import { useState } from "react";
import "./App.css";
import { useSimRun } from "./ui/hooks/useSimRun.js";
import { ResourcePanel } from "./ui/components/ResourcePanel.jsx";
import { CraftingPanel } from "./ui/components/CraftingPanel.jsx";
import { DeathScreen } from "./ui/components/DeathScreen.jsx";
import { OfflineSummaryBanner } from "./ui/components/OfflineSummaryBanner.jsx";
import { TownPanel } from "./ui/components/TownPanel.jsx";
import { WorkforcePanel } from "./ui/components/WorkforcePanel.jsx";
import { JobsInProgress, AvailableJobs } from "./ui/components/JobsPanel.jsx";
import { DashboardStrip } from "./ui/components/DashboardStrip.jsx";
import { TabNav } from "./ui/components/TabNav.jsx";
import { LogDrawer } from "./ui/components/LogDrawer.jsx";
import { SaveDrawer } from "./ui/components/SaveDrawer.jsx";

const TABS = [
  { id: "town", label: "Town" },
  { id: "workforce", label: "Workforce & Jobs" },
  { id: "crafting", label: "Crafting" },
];

function App() {
  const {
    state,
    registry,
    offlineSummary,
    craft,
    build,
    sendOnMission,
    assign,
    activeJobs,
    startNewRun,
    dismissOfflineSummary,
    exportSave,
    importSave,
  } = useSimRun();

  const [activeTab, setActiveTab] = useState("town");
  const [logOpen, setLogOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);

  return (
    <main className="app">
      <div className="app-header">
        <h1>Cove Gap</h1>
        {state.alive && (
          <div className="header-actions">
            <button type="button" className="icon-button" onClick={() => setLogOpen(true)} aria-label="Activity log" title="Activity log">
              📜
            </button>
            <button type="button" className="icon-button" onClick={() => setSaveOpen(true)} aria-label="Save / load" title="Save / load">
              💾
            </button>
          </div>
        )}
      </div>

      {offlineSummary && <OfflineSummaryBanner summary={offlineSummary} onDismiss={dismissOfflineSummary} />}

      {state.alive ? (
        <>
          <DashboardStrip state={state} registry={registry} />
          <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

          {activeTab === "town" && (
            <div className="panels">
              <TownPanel state={state} registry={registry} />
              <ResourcePanel state={state} registry={registry} />
              <JobsInProgress activeJobs={activeJobs} />
            </div>
          )}

          {activeTab === "workforce" && (
            <div className="panels">
              <WorkforcePanel state={state} registry={registry} onAssign={assign} />
              <AvailableJobs state={state} registry={registry} onBuild={build} onSendOnMission={sendOnMission} />
            </div>
          )}

          {activeTab === "crafting" && (
            <div className="panels">
              <CraftingPanel state={state} registry={registry} onCraft={craft} />
            </div>
          )}

          {logOpen && <LogDrawer state={state} onClose={() => setLogOpen(false)} />}
          {saveOpen && <SaveDrawer onExport={exportSave} onImport={importSave} onClose={() => setSaveOpen(false)} />}
        </>
      ) : (
        <DeathScreen state={state} onStartNewRun={startNewRun} />
      )}
    </main>
  );
}

export default App;
