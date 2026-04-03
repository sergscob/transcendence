import { useEffect, useRef, useState } from "react";
import ButtonClose from "./ButtonClose";
import { useDraggableStore } from "@/stores/draggableStore";

function DraggableWindow({
  name,
  title,
  children,
  onClose,
  className = "",
  headerClassName = "bg-slate-100",
  bodyClassName = "",
  defaultPosition = { x: 0, y: 0 },
  zIndex = 20,
  style = {},
}) {
  const windowRef = useRef(null);
  const dragStateRef = useRef(null);
  const getWindowPosition = useDraggableStore((s) => s.getWindowPosition);
  const setWindowPosition = useDraggableStore((s) => s.setWindowPosition);
  const [position, setPosition] = useState(() =>
    name ? getWindowPosition(name, defaultPosition) : defaultPosition,
  );

  useEffect(() => {
    if (!name) return;

    setPosition(getWindowPosition(name, defaultPosition));
  }, [name, defaultPosition, getWindowPosition]);

  useEffect(() => {
    function onPointerMove(event) {
      if (!dragStateRef.current) return;

      const { offsetX, offsetY } = dragStateRef.current;
      const nextPosition = {
        x: event.clientX - offsetX,
        y: event.clientY - offsetY,
      };

      setPosition(nextPosition);

      if (name) {
        setWindowPosition(name, nextPosition);
      }
    }

    function onPointerUp() {
      dragStateRef.current = null;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  function onPointerDown(event) {
    if (!windowRef.current) return;

    const bounds = windowRef.current.getBoundingClientRect();
    dragStateRef.current = {
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };

    event.preventDefault();
  }

  return (
    <div
      ref={windowRef}
      className={`absolute z-20 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl ${className}`}
      style={{ left: position.x, top: position.y, zIndex, ...style }}
    >
      <div
        onPointerDown={onPointerDown}
        className={`flex cursor-grab items-center justify-between gap-4 border-b border-slate-200  text-slate-800 px-4 py-1 active:cursor-grabbing ${headerClassName}`}
      >
        <div className="select-none text-sm font-semibold ">
          {title}
        </div>
        {onClose ? (<ButtonClose onClose={onClose} />) : null}
     </div>

      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}

export default DraggableWindow;