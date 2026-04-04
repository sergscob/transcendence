import BigButton from "@/components/ui_int/BigButton";

export default function Index() {

  return (
    <div className="w-80 flex flex-col justify-center bg-gray-100 gap-5">
        {/* <BigButton text="Main page" url="/" className="bg-red-500 hover:bg-red-700 border-red-700"/> */}
        <BigButton text="Edit profile" url="/editprofile" className="bg-blue-500 hover:bg-blue-700 border-blue-700"/>
        <BigButton text="Friends" url="/editfriends" className="bg-green-500 hover:bg-green-700 border-green-700"/>
        <BigButton text="Game" url="/game" className="bg-purple-500 hover:bg-purple-700 border-purple-700"/>
    </div>
  );
}
 