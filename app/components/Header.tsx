export default function Header(){
    return (
        <div className="border-b border-black py-6 relative">
            <div className="flex items-center px-6">
                <span className="font-bold text-2xl text-black">Mapy</span>
                <nav className="flex justify-center items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    <a href="#" className="font-bold text-2xl cursor-pointer hover:underline text-gray-500 hover:text-black">Home</a>
                    <a href="#" className="font-bold text-2xl cursor-pointer hover:underline text-gray-500 hover:text-black">Path</a>
                    <a href="#" className="font-bold text-2xl cursor-pointer hover:underline text-gray-500 hover:text-black">Resources</a>
                </nav>
            </div>
        </div>
    )
}