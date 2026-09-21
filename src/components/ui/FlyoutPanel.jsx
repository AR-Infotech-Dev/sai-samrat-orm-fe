import SpinnerIllustration from "./SpinnerIllustration";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

function FlyoutPanel({ isOpen, onClose, title, subtitle, closeButton, children, footer, panelClassName = "", loading = false }) {

  const [isPresent, setIsPresent] = useState(isOpen);
  const lastOpenContent = useRef({ title, subtitle, closeButton, children, footer, loading });

  useLayoutEffect(() => {
    if (isOpen) {
      lastOpenContent.current = { title, subtitle, closeButton, children, footer, loading };
    }
  }, [isOpen, title, subtitle, closeButton, children, footer, loading]);

  useEffect(() => {
    if (isOpen) {
      setIsPresent(true);
      return;
    }
    // Fallback if animationend is suppressed; reopening cancels this timer.
    const timer = window.setTimeout(() => setIsPresent(false), 250);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen && !isPresent) return null;

  // Keep the previous form visible while parent close handlers reset their data.
  const content = isOpen
    ? { title, subtitle, closeButton, children, footer, loading }
    : lastOpenContent.current;

  return (
    <>
      <div className={`flyout-overlay ${isOpen ? "open" : "close"}`} onClick={isOpen ? onClose : undefined}>
        <aside
          className={`flyout-panel ${isOpen ? "open" : "close"} ${panelClassName}`}
          onClick={(event) => event.stopPropagation()}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && event.animationName === "slideOutRight" && !isOpen) {
              setIsPresent(false);
            }
          }}
        >
          <div className="overlay_header">
            <div className="ws_container">
              <h2 className="page_title">{content.title}</h2>
              <div className="flex gap-1">
                {content.subtitle && <p className="text-xs text-slate-500">{content.subtitle}</p>}
                {content.closeButton}
              </div>
            </div>
          </div>
          <div className={`tab-pane panel_overflow${content.loading ? " flyout-body-loading" : ""}`} aria-busy={content.loading}>
            {content.loading ? <SpinnerIllustration /> : content.children}
          </div>
          <div className="flyout-footer">{content.footer}</div>
        </aside>
      </div>
    </>
  );
}

export default FlyoutPanel;
