import { Spinner } from "@/components/ui/Spinner"

function Loading({ children, className="", loading=true, fullpage=true, ...props }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      { loading ? <Spinner className="size-60"/> : ''}
    </div>
  );
}

export default Button;