import React from 'react';
import DefaultLabel from './DefaultLabel';
import { getFormInputClass } from './formInput.styles';


const Select = ({ field, value, onChange, className = '', ...rest }) => {
  const isLocked = Boolean(field.disabled || field.readOnly);
  const options = Array.isArray(field.options) ? field.options : [];
  const isMulti = Boolean(field.multi || field.multiple);
  const selectValue = isMulti ? (Array.isArray(value) ? value.map(String) : []) : (value ?? "");

  const handleChange = (event) => {
    if (!isMulti) {
      onChange?.(event);
      return;
    }

    onChange?.({
      target: {
        name: field.name,
        value: Array.from(event.target.selectedOptions).map((option) => option.value),
      },
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <DefaultLabel label={field.label} required={field.required} />
      <select
        name={field.name}
        value={selectValue}
        onChange={handleChange}
        disabled={isLocked}
        multiple={isMulti}
        size={isMulti ? Math.min(Math.max(options.length, 2), 5) : undefined}
        className={getFormInputClass(false, className)}
        {...rest}
      >
        {!isMulti && <option value="">{field.placeholder || `Select ${field.label}`}</option>}
        {options.map((opt, index) => (
          <option key={opt.key || `${field.name}-${opt.value}-${index}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
