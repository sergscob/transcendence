function Input(props) {
  return (
    <input
      {...props}
      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
    />
  );
}

export default Input;