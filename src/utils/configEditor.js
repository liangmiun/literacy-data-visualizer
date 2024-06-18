import React, { useState } from "react";
import "assets/AxisSelectionCanvas.css";
import { labels } from "utils/constants";

let editorConfigs = {
  _comments: "Keep all comments within this pair of quotes.",
  seasonBoundaries: {
    springEnd: "03-15",
    summerEnd: "06-30",
    autumnEnd: "10-15",
  },
  removeAggrOfSizeLowerThan: 0,
  tenureTagFormat: {
    tenureTemplate:
      "${tenureInitialYear}-${tenureInitialGrade}${classLetter} till ${latestYear}-${latestGrade}${classLetter}",
    _description:
      "Variables for formatting include: classLetter,latestYear, latestGrade,tenureInitialYear, tenureInitialGrade,tenureFinalYear,tenureFinalGrade, schoolEntryYear, schoolGraduationYear, ",
  },
};

export function aggregationConfigs() {
  const seasonBoundaries = editorConfigs.seasonBoundaries;
  const removeAggrOfSizeLowerThan = editorConfigs.removeAggrOfSizeLowerThan;

  return { seasonBoundaries, removeAggrOfSizeLowerThan };
}

export function schoolTreeViewConfigs() {
  const tenureTagFormat = editorConfigs.tenureTagFormat;
  return { tenureTagFormat };
}

function setEditorConfigs(newConfigs) {
  editorConfigs.seasonBoundaries = newConfigs.seasonBoundaries;
  editorConfigs.removeAggrOfSizeLowerThan =
    newConfigs.removeAggrOfSizeLowerThan;
  editorConfigs.tenureTagFormat = newConfigs.tenureTagFormat;
}

export function Editor({ triggerRenderByConfigChange }) {
  // Initial state set to the stringified JSON
  const [editorContent, setEditorContent] = useState(
    JSON.stringify(editorConfigs, null, 2)
  );

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
      //alert("Invalid JSON format. Please correct and try again.");
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
            width: "800px", // Adjust width as necessary
            height: "400px", // Adjust height as necessary
            display: "flex", // Use flex to organize children
            flexDirection: "column", // Stack children vertically
            gap: "10px", // Add gap between children
          }}
        >
          <textarea
            height="100%"
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            rows={20}
            cols={50}
          />
          <button onClick={handleSave}>{labels.saveConfig}</button>
        </div>
      ) : (
        <button
          className="btn"
          onClick={() => setIsEditing(true)}
          style={{ marginLeft: "5px" }}
        >
          {labels.editConfig}
        </button>
      )}
    </div>
  );
}
