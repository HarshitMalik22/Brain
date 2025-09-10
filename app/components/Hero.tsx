export default function Hero() {
    return (
        <div className="flex justify-center py-20 min-h-screen">
            <div className="flex flex-col items-center text-black">
                <h1 className="text-9xl font-semibold">
                    Plan <span className="bg-gradient-to-r bg-clip-text text-transparent from-blue-500 via-green-500 to-blue-500 animate-text">anything</span>
                </h1>
                <p className="text-2xl text-gray-400 max-w-4xl py-10 text-center">
                    Transform the way you learn with our intelligent platform that adapts to your unique learning style and helps you master any subject.
                </p>
                <div className="w-full max-w-2xl mt-8">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Ask me anything..." 
                            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}