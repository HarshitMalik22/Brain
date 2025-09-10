export default function Hero() {
    return (
        <div className="flex justify-center py-20 min-h-screen">
            <div className="flex flex-col items-center text-black">
                <h1 className="text-6xl font-semibold">
                    Plan <span className="bg-gradient-to-r bg-clip-text text-transparent from-blue-500 via-green-500 to-blue-500 animate-text">anything</span>
                </h1>
                <p className="text-xl mb-6">Your AI-powered learning companion</p>
                <p className="text-lg text-gray-600 max-w-2xl text-center">
                    Transform the way you learn with our intelligent platform that adapts to your unique learning style and helps you master any subject.
                </p>
            </div>
        </div>
    )
}