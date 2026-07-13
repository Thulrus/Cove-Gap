export function Drawer({ title, onClose, children }) {
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer panel" role="dialog" aria-label={title}>
        <div className="drawer-header">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
