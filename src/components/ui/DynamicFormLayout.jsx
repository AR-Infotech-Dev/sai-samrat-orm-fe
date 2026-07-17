import FormField from "./FormField";

export default function DynamicFormLayout({ layout,handleChange }) {
  const colSpanClass = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
  };


  return (
    <div className="space-y-6">
      {layout.map((section, i) => (
        <div key={i}>
          {section.label && (
            <h2 className="text-lg font-semibold mb-2">
              {section.label}
            </h2>
          )}

          {section.row.map((row, j) => (
            <div key={j} className="grid grid-cols-3 gap-4">
              {row.map((item, k) => (
                <div
                  key={k}
                  className={colSpanClass[item.colSpan || 1]}
                >
                  <FormField  
                    field={{
                      name: item.field || item.custom,
                      label: item.lable || item.custom,
                      required : item.required || false,
                      type: "text",
                    }}
                    value={null}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}