import React from "react";

const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options = [],
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      {label && <label className="text-xs text-gray-500">{label}</label>}

      <div className={`flex gap-4 ${className}`}>
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="accent-orange-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;