import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import FlyoutPanel from "@components/ui/FlyoutPanel";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

function isLockedColumn(column) {
  return column?.checkbox || column?.className === "icon-col";
}

function SortableColumnRow({ column, checked, disabled = false, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.key,
    disabled: !checked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`column-arranger-row ${checked ? "is-selected" : "is-hidden"} ${isDragging ? "is-dragging" : ""}`}
    >
      <span className="column-arranger-grip" {...attributes} {...listeners}>
        {checked ? <GripVertical size={12} /> : null}
      </span>
      <label className="column-arranger-label">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onToggle(column.key, event.target.checked)}
        />
        <span>{column.label}</span>
      </label>
    </div>
  );
}

function StaticColumnRow({ column, onToggle }) {
  return (
    <div className="column-arranger-row is-hidden">
      <span className="column-arranger-grip" />
      <label className="column-arranger-label">
        <input
          type="checkbox"
          checked={false}
          onChange={(event) => onToggle(column.key, event.target.checked)}
        />
        <span>{column.label}</span>
      </label>
    </div>
  );
}

function ColumnArranger({
  setIsColumnMenuOpen,
  isColumnMenuOpen,
  columns = [],
  visibleColumnKeys = [],
  onApplyColumnKeys,
}) {
  const [draftSelectedKeys, setDraftSelectedKeys] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const manageableColumns = useMemo(
    () => columns.filter((column) => column && !isLockedColumn(column)),
    [columns]
  );

  const manageableKeySet = useMemo(
    () => new Set(manageableColumns.map((column) => column.key)),
    [manageableColumns]
  );

  const alwaysVisibleKeySet = useMemo(
    () => new Set(manageableColumns.filter((column) => column.isAlwaysVisible).map((column) => column.key)),
    [manageableColumns]
  );

  useEffect(() => {
    if (!isColumnMenuOpen) {
      return;
    }

    const selectedKeys = visibleColumnKeys.filter((key) => manageableKeySet.has(key));
    const missingAlwaysVisibleKeys = [...alwaysVisibleKeySet].filter((key) => !selectedKeys.includes(key));
    setDraftSelectedKeys([...selectedKeys, ...missingAlwaysVisibleKeys]);
  }, [alwaysVisibleKeySet, isColumnMenuOpen, manageableKeySet, visibleColumnKeys]);

  const selectedColumns = useMemo(
    () =>
      draftSelectedKeys
        .map((key) => manageableColumns.find((column) => column.key === key))
        .filter(Boolean),
    [draftSelectedKeys, manageableColumns]
  );

  const hiddenColumns = useMemo(
    () => manageableColumns.filter((column) => !draftSelectedKeys.includes(column.key)),
    [draftSelectedKeys, manageableColumns]
  );


  const handleToggleColumn = (columnKey, checked) => {
    if (alwaysVisibleKeySet.has(columnKey)) {
      return;
    }

    setDraftSelectedKeys((current) => {
      if (checked) {
        return current.includes(columnKey) ? current : [...current, columnKey];
      }

      return current.filter((key) => key !== columnKey);
    });
  };

  // Reorders only the checked columns. Unchecked columns always remain below.
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setDraftSelectedKeys((current) => {
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleCancel = () => {
    setIsColumnMenuOpen(false);
  };

  const handleApply = () => {
    const lockedKeys = columns.filter(isLockedColumn).map((column) => column.key);
    onApplyColumnKeys?.([...lockedKeys, ...draftSelectedKeys]);
    setIsColumnMenuOpen(false);
  };

  return createPortal(
    <FlyoutPanel
      isOpen={isColumnMenuOpen}
      onClose={handleCancel}
      title="Manage Columns"
      subtitle={`${selectedColumns.length} selected`}
      panelClassName="!w-[360px] max-w-full"
      closeButton={<button type="button" className="flyout-close" onClick={handleCancel} aria-label="Close column arranger"><X size={18} /></button>}
      footer={<div className="flex justify-end gap-2 px-3 py-2">
        <button type="button" className="column-arranger-button secondary" onClick={handleCancel}>Cancel</button>
        <button type="button" className="column-arranger-button primary" onClick={handleApply}>Apply</button>
      </div>}
    >
      <div className="column-arranger-partitions h-full space-y-4 overflow-y-auto bg-white p-3 [scrollbar-width:thin]">
        <section aria-labelledby="selected-columns-heading">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 id="selected-columns-heading" className="text-xs font-semibold text-slate-800">Selected Columns</h3>
            <span className="rounded-sm bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600">{selectedColumns.length}</span>
          </div>
          <p className="mb-2 text-[10px] text-slate-400">Drag the handle to change the display order.</p>
          <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={draftSelectedKeys} strategy={verticalListSortingStrategy}>
            {selectedColumns.map((column) => (
              <SortableColumnRow
                key={column.key}
                column={column}
                checked
                disabled={alwaysVisibleKeySet.has(column.key)}
                onToggle={handleToggleColumn}
              />
            ))}
          </SortableContext>
        </DndContext>
          {selectedColumns.length === 0 && <p className="rounded-sm bg-slate-50 p-3 text-xs text-slate-400">No columns selected.</p>}
          </div>
        </section>

        <section className="border-t border-slate-100 pt-3" aria-labelledby="unselected-columns-heading">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 id="unselected-columns-heading" className="text-xs font-semibold text-slate-600">Unselected Columns</h3>
            <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{hiddenColumns.length}</span>
          </div>
          <p className="mb-2 text-[10px] text-slate-400">Select a column to add it to the table.</p>
          <div className="space-y-1.5">
        {hiddenColumns.map((column) => (
          <StaticColumnRow key={column.key} column={column} onToggle={handleToggleColumn} />
        ))}
          {hiddenColumns.length === 0 && <p className="rounded-sm bg-slate-50 p-3 text-xs text-slate-400">All columns are selected.</p>}
          </div>
        </section>
      </div>

    </FlyoutPanel>, document.body
  );
}

export default ColumnArranger;
