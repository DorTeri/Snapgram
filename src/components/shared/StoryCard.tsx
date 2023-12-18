'use client'
import { useEffect, useState } from "react"

type Props = {
    story: any
}
const StoryCard = ({ story }: Props) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openModal = () => {
        setIsModalOpen(true);
        setCurrentImageIndex(0);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isModalOpen) {
            intervalId = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % story.length);
            }, 5000);
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [isModalOpen, story.length]);

    const renderProgressLines = () => {
        const lines = [];

        for (let i = 0; i < story.length; i++) {
            lines.push(
                <div
                    key={i}
                    className={`h-2 w-full mx-1 rounded-full ${i < currentImageIndex ? "bg-gray-800" : "bg-gray-300"
                        }`}
                ></div>
            );
        }

        return lines;
    };

    return (
        <div className="relative min-w-[60px] mr-6 cursor-pointer">
            <div
                className="rounded-full border-2 border-pink-500 p-1"
                onClick={() => openModal()}>
                <img
                    src={story[0].creator.imageUrl}
                    alt="storie"
                    className="rounded-full w-12 h-12"
                />
            </div>

            {isModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center">
                    <div className="max-w-md w-full p-4 bg-white rounded-lg">
                        <div className="flex justify-center mb-2">{
                            renderProgressLines()}
                        </div>
                        <img src={story[currentImageIndex].imageUrl} alt="Story" className="w-full h-auto" />

                        <button className="mt-4 p-2 bg-gray-800 text-white rounded"
                            onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StoryCard