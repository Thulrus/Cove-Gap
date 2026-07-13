import { useState } from "react";

export function SaveControls({ onExport, onImport }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  function handleExport() {
    const { run } = onExport();
    setText(run);
    setError(null);
  }

  function handleImport() {
    try {
      onImport(text.trim());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <p className="dashboard-stat-label">Export/import your run as a save string.</p>
      <textarea
        rows={4}
        className="save-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Base64 save string"
      />
      <div className="save-actions">
        <button type="button" className="primary" onClick={handleExport}>
          Export
        </button>
        <button type="button" onClick={handleImport}>
          Import
        </button>
      </div>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}
