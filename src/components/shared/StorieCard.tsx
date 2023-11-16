
const StorieCard = () => {
    return (
        <div className="relative min-w-[60px] mr-6 cursor-pointer">
            <div className="rounded-full border-2 border-pink-500 p-1">
                <img
                    src="/assets/images/logo.svg"
                    alt="storie"
                    className="rounded-full w-12 h-12"
                />
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-3 h-3"></div>
            </div>
        </div>
    )
}

export default StorieCard