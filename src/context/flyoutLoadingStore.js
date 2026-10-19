import { useSyncExternalStore } from "react";

const openFlyouts = [];
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());
const getSnapshot = () => openFlyouts.at(-1) || null;
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };

export const registerFlyoutLoader = (id) => {
  openFlyouts.push(id);
  notify();
  return () => {
    const index = openFlyouts.indexOf(id);
    if (index !== -1) openFlyouts.splice(index, 1);
    notify();
  };
};

export const useActiveFlyoutLoader = () => useSyncExternalStore(subscribe, getSnapshot, () => null);
