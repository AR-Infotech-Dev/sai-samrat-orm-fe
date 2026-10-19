import { useCallback, useEffect, useRef } from "react";

export function useFloatingRowActions() {
  const activeToolbar = useRef(null);
  const activeCell = useRef(null);
  const frame = useRef(null);
  const hideTimers = useRef(new Map());
  const clear = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const toolbar = activeToolbar.current;
    if (toolbar) {
      toolbar.style.opacity = "0";
      toolbar.style.pointerEvents = "none";
      const previousTimer = hideTimers.current.get(toolbar);
      if (previousTimer) clearTimeout(previousTimer);
      const timer = setTimeout(() => {
        toolbar.classList.remove("is-cell-floating");
        for (const property of ["left", "top", "opacity", "pointer-events"]) toolbar.style.removeProperty(property);
        hideTimers.current.delete(toolbar);
      }, 180);
      hideTimers.current.set(toolbar, timer);
    }
    activeToolbar.current = null;
    activeCell.current = null;
  }, []);
  useEffect(() => {
    window.addEventListener("resize", clear);
    window.addEventListener("scroll", clear, true);
    return () => {
      clear();
      for (const [toolbar, timer] of hideTimers.current) {
        clearTimeout(timer);
        toolbar.classList.remove("is-cell-floating");
        for (const property of ["left", "top", "opacity", "pointer-events"]) toolbar.style.removeProperty(property);
      }
      hideTimers.current.clear();
      window.removeEventListener("resize", clear);
      window.removeEventListener("scroll", clear, true);
    };
  }, [clear]);
  const onPointerOver = useCallback((event) => {
    if (event.pointerType === "touch") return;
    const currentRect = activeToolbar.current?.getBoundingClientRect();
    if (currentRect && event.clientX >= currentRect.left && event.clientX <= currentRect.right && event.clientY >= currentRect.top - 6 && event.clientY <= currentRect.bottom) return;
    const cell = event.target.closest("td");
    if (!cell || !event.currentTarget.contains(cell)) { clear(); return; }
    if (cell.classList.contains("table-actions-cell")) return;
    const row = cell.closest("tr");
    const toolbar = row?.querySelector(".table-actions-cell .table-row-actions");
    if (!toolbar) { clear(); return; }
    if (activeToolbar.current !== toolbar) clear();
    const pendingHide = hideTimers.current.get(toolbar);
    if (pendingHide) { clearTimeout(pendingHide); hideTimers.current.delete(toolbar); }
    const viewport = event.currentTarget.querySelector(".table-scroll-x").getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const width = toolbarRect.width;
    const height = toolbarRect.height;
    const cellRect = cell.getBoundingClientRect();
    const left = Math.max(viewport.left + 4, Math.min(event.clientX, viewport.right - width - 4));
    const top = cellRect.bottom + height + 4 <= Math.min(viewport.bottom, window.innerHeight)
      ? cellRect.bottom + 4
      : cellRect.top - height - 4;
    const baseLeft = toolbarRect.left - (parseFloat(toolbar.style.left) || 0);
    const baseTop = toolbarRect.top - (parseFloat(toolbar.style.top) || 0);
    toolbar.style.left = `${left - baseLeft}px`;
    toolbar.style.top = `${top - baseTop}px`;
    toolbar.classList.add("is-cell-floating");
    toolbar.style.removeProperty("opacity");
    toolbar.style.removeProperty("pointer-events");
    activeToolbar.current = toolbar;
    activeCell.current = cell;
  }, [clear]);
  const onPointerMove = useCallback((event) => {
    const snapshot = { target: event.target, currentTarget: event.currentTarget, clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType };
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => { frame.current = null; onPointerOver(snapshot); });
  }, [onPointerOver]);
  return { onPointerMove, onPointerLeave: clear };
}
