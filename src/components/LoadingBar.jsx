import { useLoader } from "../context/LoaderContext";
import { useActiveFlyoutLoader } from "../context/flyoutLoadingStore";

function LoadingBar({ flyoutId = null, loading = false }) {
  const { isLoading } = useLoader();
  const activeFlyoutId = useActiveFlyoutLoader();
  const visible = (isLoading || loading) && (flyoutId ? activeFlyoutId === flyoutId : !activeFlyoutId);

  return (
    <div role="progressbar" aria-label="Loading" aria-hidden={!visible} className={`global-loading-bar ${!visible ? "hidden" : ""}`}>
      <div className="global-loading-track"></div>
    </div>
  );
}

export default LoadingBar;
