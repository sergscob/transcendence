import { Spinner } from "@/components/ui/spinner"


function Button({ children, className="", loading=false, ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`w-full bg-black text-white p-2 rounded-lg disabled:opacity-80  
        ${className} 
        ${loading ? 'flex items-center justify-center' : 'cursor-pointer hover:bg-gray-800'}
      `}
    >
      { loading ? <Spinner className="size-6"/> : children }
    </button>
  );
}

export default Button;