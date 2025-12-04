import { useState } from "react";
import { Button } from "./ui/button";
import { D3HierarchicalGraph } from "./D3HierarchicalGraph";
import { D3GMMGraph } from "./D3GMMGraph";

interface VisualizationCTAProps {
  onOpenVisualization?: () => void;
}

export function VisualizationCTA({ onOpenVisualization }: VisualizationCTAProps) {
  const [showVisualization, setShowVisualization] = useState(false);
  const [layoutType, setLayoutType] = useState<"hierarchical" | "gmm">("hierarchical");

  const handleOpenVisualization = () => {
    const userConfirmed = window.confirm(
      "Open the interactive D3 product substitution network visualization?\n\nThis will open in a full-screen overlay where you can explore clusters, aisles, and product relationships."
    );
    if (userConfirmed) {
      setLayoutType("hierarchical");
      setShowVisualization(true);
      if (onOpenVisualization) onOpenVisualization();
    }
  };

  const handleCloseVisualization = () => {
    setShowVisualization(false);
  };

  const handleSwitchLayout = (layout: "hierarchical" | "gmm") => {
    setLayoutType(layout);
  };

  return (
    <>
      <div className="space-y-3">
        <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#0F1111", lineHeight: "1.4" }}>
          View Clusters & Graphs
        </h4>
        <p style={{ fontSize: "13px", color: "#565959", lineHeight: "1.5" }}>
          Explore the substitute network powering this match
        </p>
        <Button
          className="w-full hover:bg-[#F7CA00] transition-all"
          style={{
            height: "36px",
            backgroundColor: "#FFD814",
            color: "#0F1111",
            fontSize: "13px",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={handleOpenVisualization}
        >
          Open Visualization
        </Button>
        <p className="flex items-center gap-1" style={{ fontSize: "9px", color: "#667085", lineHeight: "1.4" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Interactive D3 view; opens in a full-screen overlay. Use in-panel switch for GMM.
        </p>
      </div>

      {showVisualization && layoutType === "hierarchical" && (
        <D3HierarchicalGraph onClose={handleCloseVisualization} onSwitchLayout={handleSwitchLayout} />
      )}
      {showVisualization && layoutType === "gmm" && (
        <D3GMMGraph onClose={handleCloseVisualization} onSwitchLayout={handleSwitchLayout} />
      )}
    </>
  );
}
