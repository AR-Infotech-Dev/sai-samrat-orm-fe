import { useEffect } from "react";

export const usePreviewScale = (frameRef, html) => {
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !html) return;
    const fitPage = () => {
      const page = frame.contentDocument?.querySelector(".pi-page");
      if (!page || !page.offsetWidth) return;
      // Fill the preview viewport without changing the backend PDF template.
      page.style.zoom = String(Math.min(1.25, Math.max(0.1, (frame.clientWidth - 24) / page.offsetWidth)));
      page.style.transform = "none";
    };
    frame.addEventListener("load", fitPage);
    const observer = new ResizeObserver(fitPage);
    observer.observe(frame);
    fitPage();
    return () => {
      frame.removeEventListener("load", fitPage);
      observer.disconnect();
    };
  }, [frameRef, html]);
};
