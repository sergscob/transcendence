import { useEffect, useRef, useState } from "react";

function ButtonClose({ onClose, className }) {

  return (
    <button
        type="button"
        onClick={onClose}
        className={`rounded-full px-2 text-md cursor-pointer font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 
          ${className}`}
    >
        ×
    </button>
  );
}

export default ButtonClose;