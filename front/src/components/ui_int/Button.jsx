import { Spinner } from "@/components/ui/Spinner"


function Button({ children, className="", loading=false, disabled=false, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`w-full bg-black text-white p-2 rounded-lg disabled:opacity-80  
        ${className} 
        ${loading ? 'flex items-center justify-center' : (disabled ? '' : 'cursor-pointer hover:bg-gray-800')}
        ${disabled ? 'cursor-not-allowed bg-gray-500 hover:bg-gray-500' : ''}
      `}
    >
      { loading ? <Spinner className="size-6"/> : children }
    </button>
  );
}

export default Button;