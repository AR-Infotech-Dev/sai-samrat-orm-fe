import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import { defaultSortConfig } from "@utils/sorting";
import { getDefinitions, buildFilterFieldsFromStructure, buildTableColumnsFromStructure } from "@utils/moduleStructure";
import { proformaFallbackColumns, proformaModuleSchema } from "../data/module.schema";

export const useProformaTableConfig = ({ resolvedMenuID, filterState }) => {
  const [fields, setFields] = useState([]);

  const sortConfig = {
    key: filterState.order_by || defaultSortConfig.key,
    direction: String(filterState.order || defaultSortConfig.direction).toLowerCase(),
  };

  const columnOptions = {
    skipFields: proformaModuleSchema.skipFields,
    columnMappings: proformaModuleSchema.columnMappings,
    tableCellConfig: proformaModuleSchema.tableCellConfig,
  };

  const resolvedColumns = useMemo(
    () => buildTableColumnsFromStructure(fields, proformaFallbackColumns, columnOptions),
    [fields]
  );

  const defaultVisibleColumnKeys = useMemo(() => proformaFallbackColumns.map((column) => column.key), []);

  const resolvedFilterFields = useMemo(() =>
    buildFilterFieldsFromStructure(
      fields,
      proformaModuleSchema.defaultColumns.map((key) => ({
        label: proformaFallbackColumns.find((column) => column.key === key)?.label || key,
        value: key,
        type: "text",
      })),
      columnOptions
    ),
    [fields]
  );

  const getColumnList = async () => {
    if (!resolvedMenuID) return;
    const res = await getDefinitions(resolvedMenuID);
    if (res.success) {
      setFields(res.data || []);
      return;
    }
    toast.error(res?.message || "Error while fetching model fields");
  };

  useEffect(() => {
    getColumnList();
  }, [resolvedMenuID]);

  return { sortConfig, resolvedColumns, defaultVisibleColumnKeys, resolvedFilterFields };
};
