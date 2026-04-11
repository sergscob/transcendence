import { useState } from "react";
import { Link } from "react-router-dom";

export default function Index({text, url, className}) {
  return (
    <Link className="simple-link" to={url}>
        <div className={
            `w-full text-white text-center py-4 px-14 border text-lg rounded-3xl hover:transition hover:duration-300 shadow-xl
             ${className}
            ` } >
            {text}
        </div>
    </Link>
  );
}
