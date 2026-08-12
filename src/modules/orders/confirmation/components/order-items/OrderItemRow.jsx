import { Trash2 } from "lucide-react";
import { gstOptions, formatIndianCurrency, getLineValue } from "../../utils/orders.utils";
import ProductSmartSelect from "@components/form-inputs/ProductSmartSelect";

const fieldClassName = `
  h-8 w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2
  text-xs font-medium text-slate-700 outline-none transition
  placeholder:text-slate-400 hover:border-slate-300
  focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/15
`;

const TextInput = ({ value, type = "text", placeholder, onChange, min }) => (
    <input
        type={type}
        value={value}
        min={min}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClassName} text-xs`}
    />
);

const SelectInput = ({ value, options, onChange }) => (
    <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClassName} cursor-pointer pr-7`}
    >
        {options.map((option) => (
            <option key={option} value={option}>
                {option}
            </option>
        ))}
    </select>
);

function OrderItemRow({
    index = 0,
    item = {},
    handleFieldChange,
    handleProductSelect,
    handleDeleteRow,
    className = "grid grid-cols-[28px_minmax(160px,1.8fr)_minmax(96px,1fr)_58px_64px_82px_58px_96px_34px]",
}) {
    const lineValue = getLineValue(item);

    return (
        <div className={`items-center gap-2 px-2.5 py-2 transition hover:bg-orange-50/30 ${className}`}>
            <span className="text-xs font-semibold text-slate-500">{index + 1}</span>
            <ProductSmartSelect
                value={item.product}
                onSelect={(product) => handleProductSelect?.(item.id, product)}
            />


            <TextInput
                type="text"
                placeholder={'Series'}
                value={item.model}
                onChange={(value) => handleFieldChange(item.id, "model", value)}
            />

            <TextInput
                type="number"
                min="0"
                value={item.weight}
                onChange={(value) => handleFieldChange(item.id, "weight", value)}
            />

            <TextInput
                type="number"
                min="0"
                value={item.qty}
                onChange={(value) => handleFieldChange(item.id, "qty", value)}
            />

            <TextInput
                type="number"
                min="0"
                value={item.unitRate}
                onChange={(value) => handleFieldChange(item.id, "unitRate", value)}
            />

            <SelectInput
                value={item.gst}
                options={gstOptions}
                onChange={(value) => handleFieldChange(item.id, "gst", value)}
            />

            <p className="truncate text-xs font-semibold text-slate-700">₹ {formatIndianCurrency(lineValue)}</p>

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={() => handleDeleteRow(item.id)}
                    aria-label={`Delete row ${index + 1}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <Trash2 size={13} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}

export default OrderItemRow;
