import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ModuleColumnsContext = createContext(null);
export function ModuleColumnsProvider({ children }) {
  const [openColumns, setOpenColumns] = useState(null);
  const registerColumns = useCallback((handler) => {
    setOpenColumns(() => handler);
    return () => setOpenColumns((current) => current === handler ? null : current);
  }, []);
  const value = useMemo(() => ({ openColumns, registerColumns }), [openColumns, registerColumns]);
  return <ModuleColumnsContext.Provider value={value}>{children}</ModuleColumnsContext.Provider>;
}
export const useModuleColumns = () => useContext(ModuleColumnsContext);
