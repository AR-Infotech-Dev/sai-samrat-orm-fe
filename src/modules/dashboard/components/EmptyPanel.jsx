const EmptyPanel = ({ title = "No data" }) => (
  <div className="rounded-sm border border-dashed border-orange-100 bg-orange-50/30 px-3 py-7 text-center text-xs font-medium text-slate-400">
    {title}
  </div>
);

export default EmptyPanel;