import React, { useState } from "react";

export let editorConfigs = {
  seasonBoundaries: {
    springEnd: "03-15",
    summerEnd: "06-30",
    autumnEnd: "10-15",
  },
  removeAggrOfSizeLowerThan: 3,
};

function setEditorConfigs(newConfigs) {
  editorConfigs.seasonBoundaries = newConfigs.seasonBoundaries;
  editorConfigs.removeAggrOfSizeLowerThan =
    newConfigs.removeAggrOfSizeLowerThan;
}

export function Editor({ triggerRenderByConfigChange }) {
  // Initial state set to the stringified JSON
  const [editorContent, setEditorContent] = useState(
    JSON.stringify(editorConfigs, null, 2)
  ); // Pretty print the JSON for easier editing

  // State to control the visibility of the text area
  const [isEditing, setIsEditing] = useState(false);

  // Function to handle saving the edited content back to bbb
  const handleSave = () => {
    setIsEditing(false);
    try {
      setEditorConfigs(JSON.parse(editorContent));
      triggerRenderByConfigChange();
    } catch (e) {
      console.error(e);
      alert("Invalid JSON format. Please correct and try again.");
    }
  };

  return (
    <div>
      {isEditing ? (
        <div
          style={{
            position: "fixed", // Use fixed to position relative to the viewport
            top: "50%", // Center vertically
            left: "50%", // Center horizontally
            transform: "translate(-50%, -50%)", // Adjust position to truly center the div
            zIndex: 1000, // Ensure it's on top of other elements
            backgroundColor: "lightgrey", // Set a background color
            padding: "20px", // Add some padding
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional: Add a shadow for better visibility
            width: "auto", // Adjust width as necessary
            height: "auto", // Adjust height as necessary
            display: "flex", // Use flex to organize children
            flexDirection: "column", // Stack children vertically
            gap: "10px", // Add gap between children
          }}
        >
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            rows={10}
            cols={50}
          />
          <button onClick={handleSave}>Save Config</button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          style={{ marginLeft: "5px" }}
        >
          Edit Config
        </button>
      )}
    </div>
  );
}
