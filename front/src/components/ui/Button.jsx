function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default Button;