import Input  from "../form-inputs/Input";

function FormField({ field, value, onChange, onClear }) {
  {console.log(field)}

  switch (field.type) {
    case 'text':
        return (<Input  />)
      break;
  
    default:
      break;
  }

  // const label = (
    
  //   <label className="form-label" htmlFor={field.name}>
  //     {field.label}
  //     {field.required ? <span className="error"> *</span> : null}
  //   </label>
  // );

  if (field.type === "assignee") {
    return (
      <div className="form-group form-float">
        <div className="form-line">
          {field.label || ''}
          <div className="form-shell form-shell-with-action">
            <input
              id={field.name}
              className="form-control"
              name={field.name}
              
              value={value}
              onChange={onChange}
              placeholder={field.placeholder ?? ""}
              autoComplete="off"
            />
            {value ? (
              <button
                type="button"
                className="field-inline-action"
                onClick={onClear}
                aria-label={`Clear ${field.label}`}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "phone") {
    return (
      <div className="form-group form-float">
        <div className="form-line">
          {field.label || ''}
          <div className="form-shell">
            <div className="ws-input-group">
              <span className="phone-prefix">
                <span className="flag">IN</span>
                <ChevronDown size={14} />
              </span>
              <input
                id={field.name}
                className="form-control"
                name={field.name}
                value={value}
                onChange={onChange}
                placeholder={field.placeholder}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group form-float">
      <div className="form-line">
        {field.label || ''}
        <input
          id={field.name}
          type="text"
          className="form-control"
          name={field.name}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

export default FormField;


// import React from 'react'

// function FormField({field, value, onChange, onClea}) {
//   return (
//     <>
//     </>
//   )
// }

// export default FormField