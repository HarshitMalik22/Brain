export default function Header(){
    return (
        <div className="border-b border-black py-6">
            
            <nav className="flex justify-center gap-8">
                    <a href="#" className="font-bold text-2xl cursor-pointer hover:underline text-gray-500 hover:text-black">Home</a>
                    <a href="#" className="font-bold text-2xl cursor-pointer hover:underline text-gray-500 hover:text-black">Path</a>
                    <a href="#" className="font-bold text-2xl cursor-pointer hover:underline text-gray-500 hover:text-black">Resources</a>
            </nav>
        </div>
    )
}