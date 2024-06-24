import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { labels } from "utils/constants";
import "assets/AxisSelectionCanvas.css";

const HelpWindow = ({ isOpen, markdown, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-window"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background //
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // Ensure it covers other elements
      }}
    >
      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(255,255,255, 0.8)",
          borderRadius: "px",
          maxWidth: "1600px",
          maxHeight: "80%",
          overflow: "auto",
        }}
      >
        <button onClick={onClose} style={{ float: "right", marginTop: "50px"}}>
          Close
        </button>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        <button onClick={onClose} style={{ float: "right"}}>
          Close
        </button>
      </div>
    </div>
  );
};

export const ShowHelp = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/HELP.md")
      .then((response) => response.text())
      .then((text) => setMarkdown(text));
  }, []);

  return (
    <div>
      <button className="btn" onClick={() => setShowHelp(true)}>
        {labels.help}
      </button>
      <HelpWindow
        isOpen={showHelp}
        markdown={markdown}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
};
