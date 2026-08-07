import React from "react";

function ValidationError({ classes, error }) {
  return (
    <div className={`min-h-4.5 w-full absolute left-1 -bottom-3.5 ${classes}`}>
      {error ? (
        <p className={`text-xs text-red-500 mt-1`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default ValidationError;