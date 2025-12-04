import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface InfoHoverCardProps {
  label: string;
  children?: React.ReactNode;
  tabs?: Array<{ label: string; content: React.ReactNode }>;
  headerContent?: React.ReactNode;
}

export function InfoHoverCard({ label, children, tabs, headerContent }: InfoHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClick = () => {
    setIsOpen(!isOpen);
    setActiveTab(0); // Reset to first tab when opening
  };

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#007185] focus:ring-offset-1"
        style={{ width: "18px", height: "18px" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: "#667085" }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 16V12M12 8H12.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "rgba(15, 17, 17, 0.6)" }}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ 
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
              <h2
                id="modal-title"
                style={{ 
                  fontSize: "20px", 
                  fontWeight: "700", 
                  color: "#0F1111",
                  letterSpacing: "-0.01em"
                }}
              >
                {label}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#007185] shadow-sm"
                aria-label="Close"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
              >
                <X size={22} style={{ color: "#565959" }} strokeWidth={2.5} />
              </button>
            </div>

            {/* Header Content (above tabs) */}
            {headerContent && (
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
                {headerContent}
              </div>
            )}

            {/* Tabs (if provided) */}
            {tabs && tabs.length > 0 && (
              <div className="border-b border-gray-200 px-8 pt-1 bg-gray-50">
                <div className="flex gap-1">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`px-5 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-[#007185] focus:ring-inset relative rounded-t-lg ${
                        activeTab === index
                          ? "bg-white"
                          : "hover:bg-white/50"
                      }`}
                      style={{
                        fontSize: "14px",
                        fontWeight: activeTab === index ? "600" : "500",
                        color: activeTab === index ? "#0F1111" : "#565959",
                      }}
                    >
                      {tab.label}
                      {activeTab === index && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-[#007185] rounded-t"
                          style={{ transition: "all 0.2s" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div 
              className="px-8 py-7 overflow-y-auto" 
              style={{ 
                maxHeight: "calc(85vh - 160px)",
                scrollbarWidth: "thin",
                scrollbarColor: "#CBD5E0 #F7FAFC"
              }}
            >
              {tabs && tabs.length > 0 ? tabs[activeTab].content : children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface InfoCardContentProps {
  title?: string;
  body: string | React.ReactNode;
  callout?: string;
  footer?: string;
  bullets?: string[];
  showcase?: Array<{ label: string; description: string }>;
  metrics?: string[];
  cta?: React.ReactNode;
  highlight?: string;
}

export function InfoCardContent({
  title,
  body,
  callout,
  footer,
  bullets,
  showcase,
  metrics,
  cta,
  highlight,
}: InfoCardContentProps) {
  return (
    <div className="space-y-5">
      {/* Title */}
      {title && (
        <h3 style={{ 
          fontSize: "17px", 
          fontWeight: "700", 
          color: "#0F1111", 
          lineHeight: "1.3",
          letterSpacing: "-0.01em"
        }}>
          {title}
        </h3>
      )}

      {/* Body */}
      <div style={{ 
        fontSize: "15px", 
        color: "#3a3a3a", 
        lineHeight: "1.7",
        letterSpacing: "-0.003em"
      }}>
        {body}
      </div>

      {/* Highlight Box */}
      {highlight && (
        <div
          className="bg-gradient-to-r from-[#E6F7F7] to-[#F0F9F9] border-l-4 border-[#007185] p-4 rounded-lg"
          style={{ fontSize: "14px", color: "#0F1111", lineHeight: "1.6", fontWeight: "500" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="#007185"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>{highlight}</div>
          </div>
        </div>
      )}

      {/* Callout */}
      {callout && (
        <div
          className="bg-gradient-to-r from-[#FFF9E6] to-[#FFFDF5] border-l-4 border-[#FFD814] p-4 rounded-lg"
          style={{ fontSize: "14px", color: "#0F1111", lineHeight: "1.6", fontWeight: "500" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="#B7791F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>{callout}</div>
          </div>
        </div>
      )}

      {/* Showcase bar */}
      {showcase && (
        <div className="space-y-4">
          <div
            className="pb-2.5 border-b-2 border-gray-200"
            style={{ fontSize: "14px", fontWeight: "700", color: "#0F1111", letterSpacing: "-0.01em" }}
          >
            Pipeline Stages
          </div>
          <div className="space-y-3.5">
            {showcase.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="#16A34A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F1111", marginBottom: "4px" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "14px", color: "#565959", lineHeight: "1.5" }}>
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="space-y-3">
          <div
            style={{ fontSize: "14px", fontWeight: "700", color: "#0F1111", letterSpacing: "-0.01em" }}
          >
            Performance Metrics
          </div>
          <div className="flex flex-wrap gap-2.5">
            {metrics.map((metric, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-gradient-to-b from-white to-gray-50 px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-[#007185] transition-colors shadow-sm"
                style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111" }}
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bullets */}
      {bullets && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex flex-wrap gap-x-4 gap-y-2" style={{ fontSize: "13px", color: "#3a3a3a", fontWeight: "500" }}>
            {bullets.map((bullet, index) => (
              <span key={index} className="flex items-center gap-2">
                <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="2" cy="2" r="2" fill="#007185"/>
                </svg>
                {bullet}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div
          className="pt-4 border-t-2 border-gray-200 bg-gray-50 -mx-8 px-8 py-4 -mb-7"
          style={{ fontSize: "13px", color: "#565959", lineHeight: "1.6", fontStyle: "italic" }}
        >
          {footer}
        </div>
      )}

      {/* CTA */}
      {cta && (
        <div className="pt-5 border-t-2 border-gray-200">
          {cta}
        </div>
      )}
    </div>
  );
}
