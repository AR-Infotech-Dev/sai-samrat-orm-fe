import React from "react";

const DynamicField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  onClear,
  options = [],
  placeholder = "",
  error = "",
  disabled = false,
  readOnly = false,
}) => {
  const isLocked = Boolean(disabled || readOnly);
  const commonClass =
    "w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-70 read-only:cursor-default";

  const renderField = () => {
    switch (type) {
      case "select":
        return (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={isLocked}
            className={commonClass}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={commonClass}
            rows={3}
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            name={name}
            checked={value || false}
            onChange={onChange}
            disabled={isLocked}
          />
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={commonClass}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1 relative">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div className="relative">
        {renderField()}

        {/* CLEAR BUTTON */}
        {onClear && !isLocked && type !== "checkbox" && value && (
          <button
            type="button"
            onClick={() => onClear(name)}
            className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
          >
            âœ•
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default DynamicField;
