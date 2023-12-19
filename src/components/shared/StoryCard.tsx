'use client'
import { useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa6";


type Props = {
    story: any
    currUserId: string
    openCreateStory: () => void
}
const StoryCard = ({ story, currUserId , openCreateStory }: Props) => {

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

                if (currentImageIndex === story.length - 1) {
                    closeModal();
                }
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

    if (!story) return

    return (
        <div className="relative min-w-[60px] mr-6 cursor-pointer">
            <div
                className="rounded-full relative border-2 border-pink-500 p-1"
                onClick={() => openModal()}>
                <img
                    src={story[0].creator.imageUrl}
                    alt="storie"
                    className="rounded-full w-12 h-12"
                />
                {
                    story[0].creator.$id === currUserId &&
                    <div className="absolute bg-[#2c8ce6] bottom-[-5px] h- w-6 pl-[2.5px] pt-[2.5px] right-[-5px] border-2 border-black rounded-full"
                        onClick={openCreateStory}>
                        <FaPlus />
                    </div>
                }
            </div>
            <div
                className="flex items-center justify-center pt-1">
                <p className="text-gray-300 text-xs">
                    {story[0].creator.$id === currUserId ?
                        'Your story' :
                        story[0].creator.username
                    }
                </p>
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