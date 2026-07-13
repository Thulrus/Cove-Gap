import { Drawer } from "./Drawer.jsx";
import { SaveControls } from "./SaveControls.jsx";

export function SaveDrawer({ onExport, onImport, onClose }) {
  return (
    <Drawer title="Save / Load" onClose={onClose}>
      <SaveControls onExport={onExport} onImport={onImport} />
    </Drawer>
  );
}
