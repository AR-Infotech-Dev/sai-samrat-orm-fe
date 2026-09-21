function SpinnerIllustration() {
  return (
    <div className="flyout-loading-illustration" role="status" aria-live="polite">
      <img src={import.meta.env.BASE_URL + "svg/loading.svg"} width="200" height="150" alt="" />
      <p className="flyout-loading-description">Please wait a moment</p>
    </div>
  );
}

export default SpinnerIllustration;
