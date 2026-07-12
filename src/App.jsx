import "./App.css";
import { useSimRun } from "./ui/hooks/useSimRun.js";
import { ResourcePanel } from "./ui/components/ResourcePanel.jsx";
import { ActivityLog } from "./ui/components/ActivityLog.jsx";
import { CraftingPanel } from "./ui/components/CraftingPanel.jsx";
import { SaveControls } from "./ui/components/SaveControls.jsx";
import { DeathScreen } from "./ui/components/DeathScreen.jsx";
import { OfflineSummaryBanner } from "./ui/components/OfflineSummaryBanner.jsx";
import { TownPanel } from "./ui/components/TownPanel.jsx";
import { WorkforcePanel } from "./ui/components/WorkforcePanel.jsx";
import { JobsPanel } from "./ui/components/JobsPanel.jsx";

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

  return (
    <main className="app">
      <h1>Cove Gap</h1>

      {offlineSummary && <OfflineSummaryBanner summary={offlineSummary} onDismiss={dismissOfflineSummary} />}

      {state.alive ? (
        <>
          <TownPanel state={state} registry={registry} />
          <div className="panels">
            <ResourcePanel state={state} registry={registry} />
            <WorkforcePanel state={state} registry={registry} onAssign={assign} />
            <JobsPanel state={state} registry={registry} activeJobs={activeJobs} onBuild={build} onSendOnMission={sendOnMission} />
            <CraftingPanel state={state} registry={registry} onCraft={craft} />
            <ActivityLog state={state} />
            <SaveControls onExport={exportSave} onImport={importSave} />
          </div>
        </>
      ) : (
        <DeathScreen state={state} onStartNewRun={startNewRun} />
      )}
    </main>
  );
}

export default App;
