import React from 'react';
import DefaultLabel from './DefaultLabel';
import ValidationError from './ValidationError';
import { getFormInputClass } from './formInput.styles';


const Input = ({ field, value, onChange, placeholder, className = '', disabled, error, ...rest }) => {
  const isDisabled = Boolean(disabled || field.disabled);
  const isReadOnly = Boolean(field.readOnly);

  return (
    <div className="flex min-w-0 flex-col gap-1 p-0 relative">
      <DefaultLabel label={field.label} required={field.required} />
      <input
        type={field.type}
        name={field.name || ''}
        value={value ?? ""}
        onChange={onChange}
        placeholder={field.placeholder}
        required={field.required}
        className={getFormInputClass(error, className)}
        disabled={isDisabled}
        readOnly={isReadOnly}
        {...rest}
      />
      {error && (
        <ValidationError error={error} />
      )}
    </div>
  );
};

export default Input;
