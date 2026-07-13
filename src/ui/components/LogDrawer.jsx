import { Drawer } from "./Drawer.jsx";
import { ActivityLog } from "./ActivityLog.jsx";

export function LogDrawer({ state, onClose }) {
  return (
    <Drawer title="Activity Log" onClose={onClose}>
      <ActivityLog state={state} />
    </Drawer>
  );
}
