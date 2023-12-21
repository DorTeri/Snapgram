'use client'
import { getTimeAgo } from "@/lib/utils";
import { useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";



type Props = {
    story: any
    currUserId: string
    openCreateStory: (e: any) => void
}
const StoryCard = ({ story, currUserId, openCreateStory }: Props) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);


    const openModal = () => {
        setIsModalOpen(true);
        setCurrentImageIndex(0);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const closeOnOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    let intervalId: NodeJS.Timeout;

    useEffect(() => {

        if (isModalOpen) {
            intervalId = setInterval(() => {
                setCurrentImageIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % story.length;

                    if (nextIndex === 0) {
                        // If next index is 0, it means we have viewed all stories
                        closeModal();
                        clearInterval(intervalId);
                    }

                    return nextIndex;
                });
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

    const startInterval = () => {
        intervalId = setInterval(() => {
            handleArrowClick('right');
        }, 5000);
    };

    const handleArrowClick = (direction: 'left' | 'right') => {
        clearInterval(intervalId);

        setCurrentImageIndex((prevIndex) => {
            let nextIndex;

            if (direction === 'right') {
                nextIndex = (prevIndex + 1) % story.length;
            } else {
                nextIndex = (prevIndex - 1 + story.length) % story.length;
            }

            if (nextIndex === 0) {
                closeModal();
            } else {
                startInterval()
            }

            return nextIndex;
        });
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
                        onClick={(e) => openCreateStory(e)}>
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
                <div onClick={closeOnOverlayClick}
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center cursor-default z-10">
                    <div className="max-w-md w-full p-4 bg-white rounded-lg">
                        <div className="flex justify-center mb-2">{
                            renderProgressLines()}
                        </div>
                        <div className="relative">
                            <div className="flex gap-2 items-center absolute top-[10px] left-[10px]">
                                <img src={story[0].creator.imageUrl}
                                    className="rounded-full w-[30px] h-[30px]" />
                                <p className="text-white text-md">
                                    {story[0].creator.$id === currUserId ?
                                        'Your story' :
                                        story[0].creator.username
                                    }
                                </p>
                                <p className="text-white text-sm">
                                    {
                                        story[currentImageIndex].$createdAt &&
                                        getTimeAgo(story[currentImageIndex].$createdAt)
                                    }
                                </p>
                            </div>
                            <div className="absolute right-2 top-[180px] text-4xl cursor-pointer hover:opacity-75" onClick={() => handleArrowClick('right')}>
                                <IoIosArrowForward />
                            </div>
                            <div className="absolute left-2 top-[180px] text-4xl cursor-pointer hover:opacity-75" onClick={() => handleArrowClick('left')}>
                                <IoIosArrowBack />
                            </div>
                            <button className="absolute top-[-10px] right-2 mt-4 p-2 text-white rounded"
                                onClick={closeModal}>
                                X
                            </button>
                            <img src={story[currentImageIndex].imageUrl} alt="Story" className="w-full h-auto" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StoryCard