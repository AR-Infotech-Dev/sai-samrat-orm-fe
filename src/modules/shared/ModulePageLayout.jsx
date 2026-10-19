import "../../components/ui/ActionButton";
import { ModuleColumnsProvider } from "@context/ModuleColumnsContext";

function ModulePageLayout({
  title,
  description,
  controls,
  table,
  footer,
  children,
  classNames="",
  controlsCardClassName = ""
}) {
  const showHeader = Boolean(title || description);

  return (
    <ModuleColumnsProvider>
    <section className="module-page">
      <div className={`module-controls-card ${controlsCardClassName}`}>
        {showHeader ? (
          <div className={`module-page-header ${classNames}`}>
            <div className="module-page-heading">
              {title ? <h2 className="module-page-title">{title}</h2> : null}
              {description ? <p className="module-page-description">{description}</p> : null}
            </div>
          </div>
        ) : null}
        {controls}
        {children}
      </div>
      {table ? <div className="module-table-panel">{table}</div> : null} 
      {footer ? <div className="module-table-footer">{footer}</div> : null}
    </section>
    </ModuleColumnsProvider>
  );
}

export default ModulePageLayout;
