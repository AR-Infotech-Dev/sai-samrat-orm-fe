import { useEffect, useState } from "react";
import { Eye, Edit3, Send, CheckCircle2 } from "lucide-react";
import { proformaModuleSchema } from "./data/module.schema";
import { useProformaTableConfig } from "./hooks/useProformaTableConfig";
import { useProformaModule } from "./hooks/useProformaModule";
import { getNextSortConfig } from "@utils/sorting";
import { useModuleFilters, useAppSelector } from "@store/hooks";
import { selectProformaRows } from "./data/proforma.slice";

import ModuleControls from "@shared/ModuleControls";
import ModulePageLayout from "@shared/ModulePageLayout";
import ModulePagination from "@shared/ModulePagination";
import DynamicFilter from "@components/dynamic-filter";
import ResizableTable from "@components/table/ResizableTable";
import useMenuPermissions from "@auth/utils/useMenuPermissions";
import ProformaForm from "./components/ProformaForm";
import ProformaTableRow from "./components/ProformaTableRow";
import { getPiLifecycleStatus } from "./utils/proforma.utils";
import ProformaPreviewFlyout from "./components/ProformaPreviewFlyout";

function ProformaInvoicePage({ menu_id }) {
  const resolvedMenuID = menu_id || proformaModuleSchema.menu_id || null;
  const permissions = useMenuPermissions(resolvedMenuID);
  const [selectedPi, setSelectedPi] = useState(null);
  const [previewPi, setPreviewPi] = useState(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const piList = useAppSelector(selectProformaRows);
  const { filterState, setSearchText, applyFilterPayload, setSort, clearFilters } = useModuleFilters("proforma-invoice", piList);
  const { pagination, page, loading, deleting, selectedRowIds, getProformaList, handlePageChange, handleToggleRow, handleToggleAllRows, handleDeleteSelected, handleDeleteRow, handleLifecycle } = useProformaModule({ filterState });
  const { sortConfig, resolvedColumns, defaultVisibleColumnKeys, resolvedFilterFields } = useProformaTableConfig({ resolvedMenuID, filterState });

  const handleSortChange = (columnKey) => {
    const nextSort = getNextSortConfig(sortConfig, columnKey);
    if (page !== 1) handlePageChange(1);
    setSort({ order_by: nextSort.key, order: nextSort.direction.toUpperCase() });
  };

  useEffect(() => {
    getProformaList();
  }, [page, filterState.searchText, filterState.order, filterState.order_by, JSON.stringify(filterState.filters)]);

  useEffect(() => {
    if (page !== 1) handlePageChange(1);
  }, [filterState.searchText, filterState.order, filterState.order_by, JSON.stringify(filterState.filters)]);

  const openPreview = (row) => {
    setPreviewPi(row);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <ModulePageLayout
        title={proformaModuleSchema.title}
        description={proformaModuleSchema.description}
        controls={
          <ModuleControls
            canCreate={permissions.canAdd}
            canDelete={permissions.canDelete}
            loading={loading}
            createLabel="Create PI"
            onRefresh={getProformaList}
            onCreate={() => {
              setSelectedPi(null);
              setIsFlyoutOpen(true);
            }}
            onDeleteSelected={handleDeleteSelected}
            showDelete={selectedRowIds.length !== 0}
            deleteDisabled={deleting || loading || selectedRowIds.length === 0}
            deleting={deleting}
            filter={
              <DynamicFilter
                filterState={filterState}
                fields={resolvedFilterFields}
                savedFilters={proformaModuleSchema.savedFilters}
                onSearch={setSearchText}
                onApplyFilters={applyFilterPayload}
                onSaveFilter={() => {}}
                onDeleteFilter={() => {}}
                onSelectSavedFilter={() => {}}
                onClearFilters={clearFilters}
              />
            }
          />
        }
        table={
          <ResizableTable
            loading={loading}
            menuId={resolvedMenuID}
            columns={resolvedColumns}
            rows={piList}
            storageKey="proforma-invoice-column-widths"
            defaultVisibleColumnKeys={defaultVisibleColumnKeys}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            onDeleteRow={permissions.canDelete ? handleDeleteRow : undefined}
            rowActions={[
              { key: "preview", label: "Preview", icon: Eye, onClick: openPreview },
              (row) => permissions.canEdit && getPiLifecycleStatus(row) === "draft" ? { key: "edit", label: "Edit", icon: Edit3, onClick: (record) => { setSelectedPi(record); setIsFlyoutOpen(true); } } : null,
              (row) => getPiLifecycleStatus(row) === "draft" ? { key: "submit", label: "Submit for Approval", icon: Send, onClick: (record) => handleLifecycle(record, "submit") } : null,
              (row) => getPiLifecycleStatus(row) === "waiting" ? { key: "approve", label: "Approve", icon: CheckCircle2, onClick: (record) => handleLifecycle(record, "approve") } : null,
            ]}
            allowSelection={permissions.canDelete}
            selectedRowIds={selectedRowIds}
            onToggleRow={handleToggleRow}
            onToggleAllRows={handleToggleAllRows}
            renderRow={(row, index, columns, table) => (
              <ProformaTableRow row={row} index={index} columns={columns} table={table}
                onEdit={permissions.canEdit && getPiLifecycleStatus(row) === "draft" ? () => { setSelectedPi(row); setIsFlyoutOpen(true); } : undefined}
              />
            )}
          />
        }
        footer={<ModulePagination pagination={pagination} onPageChange={handlePageChange} />}
      />

      <ProformaForm
        isOpen={isFlyoutOpen}
        onClose={() => setIsFlyoutOpen(false)}
        selectedPi={selectedPi}
        onAfterSave={getProformaList}
      />

      <ProformaPreviewFlyout
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pi={previewPi}
      />
    </>
  );
}

export default ProformaInvoicePage;
