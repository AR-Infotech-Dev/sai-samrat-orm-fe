import React from 'react';

const Checkbox = ({ label, checked, onChange, className = '', ...rest }) => (
  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`accent-orange-500 ${className}`}
      {...rest}
    />
    {label}
  </label>
);

export default Checkbox;
