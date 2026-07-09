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
    <section>
      <h2>Save</h2>
      <textarea
        rows={4}
        style={{ width: "100%" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Base64 save string"
      />
      <div>
        <button type="button" onClick={handleExport}>
          Export
        </button>
        <button type="button" onClick={handleImport}>
          Import
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}
