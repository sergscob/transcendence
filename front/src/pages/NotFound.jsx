import { Link } from "react-router-dom";

export default function NotFound({ text }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">{text || "Page not found"}</p>
        <Link to="/" className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          To main page
        </Link>
      </div>
    </div>
  );
}
