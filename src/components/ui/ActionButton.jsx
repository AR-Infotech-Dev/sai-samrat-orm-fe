function ActionButton({ children, variant = "ghost", className = "", ...props }) {
  const variantClass =
    variant === "primary"
      ? "gradient-button"
      : variant === "ghostPrimary"
        ? "ghost-button primary"
        : variant === "icon"
          ? "icon-button"
          : variant === "iconSubtle"
            ? "icon-button subtle"
            : variant === "flyoutPrimary"
              ? "flyout-button gradient-button"
              : variant === "flyoutSecondary"
                ? "flyout-button flyout-button-secondary"
                : "ghost-button";

  return (
    <button className={`${variantClass}${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </button>
  );
}

export default ActionButton;
