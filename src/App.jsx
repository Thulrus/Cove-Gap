import "./App.css";
import { useSimRun } from "./ui/hooks/useSimRun.js";
import { ResourcePanel } from "./ui/components/ResourcePanel.jsx";
import { ActivityLog } from "./ui/components/ActivityLog.jsx";
import { CraftingPanel } from "./ui/components/CraftingPanel.jsx";
import { SaveControls } from "./ui/components/SaveControls.jsx";
import { DeathScreen } from "./ui/components/DeathScreen.jsx";
import { OfflineSummaryBanner } from "./ui/components/OfflineSummaryBanner.jsx";

function App() {
  const { state, registry, offlineSummary, craft, startNewRun, dismissOfflineSummary, exportSave, importSave } =
    useSimRun();

  return (
    <main className="app">
      <h1>Cove Gap</h1>

      {offlineSummary && <OfflineSummaryBanner summary={offlineSummary} onDismiss={dismissOfflineSummary} />}

      {state.alive ? (
        <div className="panels">
          <ResourcePanel state={state} registry={registry} />
          <CraftingPanel state={state} registry={registry} onCraft={craft} />
          <ActivityLog state={state} />
          <SaveControls onExport={exportSave} onImport={importSave} />
        </div>
      ) : (
        <DeathScreen state={state} onStartNewRun={startNewRun} />
      )}
    </main>
  );
}

export default App;
