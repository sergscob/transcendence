import { useEffect, useRef, useState } from "react";

function ButtonClose({ onClose }) {

  return (
    <button
        type="button"
        onClick={onClose}
        className="rounded-full pt-2 pb-2.5 px-3.5 text-md cursor-pointer font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
    >
        ×
    </button>
  );
}

export default ButtonClose;