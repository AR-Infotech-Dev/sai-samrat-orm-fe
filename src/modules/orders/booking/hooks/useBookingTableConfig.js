import { toast } from "react-toastify";
import { useMemo, useState, useEffect } from "react";
import { defaultSortConfig } from "@utils/sorting";
import { getDefinitions, buildFilterFieldsFromStructure, buildTableColumnsFromStructure, } from "@utils/moduleStructure";
import { ordersFallbackColumns, ordersModuleSchema } from "../data/module.schema";

export const useOrderBookingTableConfig = ({ resolvedMenuID, filterState }) => {

    const [fields, setFields] = useState([]);

    const sortConfig = {
        key: filterState.order_by || defaultSortConfig.key,
        direction: String(filterState.order || defaultSortConfig.direction).toLowerCase(),
    };

    const columnOptions = {
        skipFields: ordersModuleSchema.skipFields,
        columnMappings: ordersModuleSchema.columnMappings,
        tableCellConfig: ordersModuleSchema.tableCellConfig,
    };

    const resolvedColumns = useMemo(
        () => buildTableColumnsFromStructure(fields, ordersFallbackColumns, columnOptions),
        [fields]
    );

    const defaultVisibleColumnKeys = useMemo(
        () => ordersFallbackColumns.map((column) => column.key),
        []
    );

    const resolvedFilterFields = useMemo(() =>
        buildFilterFieldsFromStructure(
            fields,
            ordersModuleSchema.defaultColumns.map((key) => ({
                label:
                    ordersFallbackColumns.find((column) => column.key === key)?.label || key,
                value: key,
                type: "text",
            })),
            columnOptions
        ),
        [fields]
    );
    const getColumnList = async () => {
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

    return {
        sortConfig,
        resolvedColumns,
        defaultVisibleColumnKeys,
        resolvedFilterFields,
    };
}
