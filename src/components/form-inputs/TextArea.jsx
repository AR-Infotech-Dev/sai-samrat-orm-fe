import React from 'react'
import DefaultLabel from './DefaultLabel'
import { getFormInputClass } from './formInput.styles'

function TextArea({field , value , onChange}) {
    const isDisabled = Boolean(field.disabled);
    const isReadOnly = Boolean(field.readOnly);

    return (
        <div className="flex flex-col gap-1">
            <DefaultLabel label={field.label} required={field.required} />
            <textarea
                name={field.name}
                rows={field.rows || 4}
                value={value}
                onChange={onChange}
                placeholder={field.placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                className={getFormInputClass(false, "py-2")}
            />
        </div>
    )
}

export default TextArea
