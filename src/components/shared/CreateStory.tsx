import React, { useEffect, useRef, useState } from 'react'
// import StoryForm from '../forms/StoryForm'
// import FileUploader from './FileUploader';
// import { FileWithPath, useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { useCreateStory } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';
import toast from "react-hot-toast";
import { Stage, Layer, Text, Image } from 'react-konva';
import useImage from 'use-image';

interface CreateStoryProps {
    setIsCreateStoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateStory = ({ setIsCreateStoryOpen }: CreateStoryProps) => {
    const { user } = useUserContext();

    const canvasRef = useRef<any>();
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileUrl, setFileUrl] = useState('/assets/images/default_story1.jpg');
    const [text, setText] = useState('');
    const [textColor, setTextColor] = useState('#ffffff')
    const { mutateAsync: createStory } = useCreateStory()
    const [isDragging, setIsDragging] = useState(false)
    const [x, setX] = useState(50)
    const [y, setY] = useState(50)
    const [imageUrl, setImageUrl] = useState<any>(null)
    const [fontSize, setFontSize] = useState(30)

    useEffect(() => {

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }

        loadImage()
    }, [fileUrl])

    const loadImage = () => {
        setImageUrl(new window.Image());
        setImageUrl((prevState: any) => {
            return {
                ...prevState,
                src: fileUrl || '/assets/images/profile.png',
            };
        });
    };

    const handleSubmit = async () => {
        const uri = canvasRef.current.toDataURL();

        const blob = await fetch(uri).then((res) => res.blob());

        const file = new File([blob], 'canvas_image.png', { type: 'image/png' });

        try {
            const story = {
                userId: user.id,
                file: [file]
            }
            createStory(story)
            toast.success("Story uploaded successfully!");
        } catch (err) {
            console.log("createStory err", err)
            toast.error("Story uploading failed!");
        }
        setIsCreateStoryOpen(false)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setFileUrl(URL.createObjectURL(file));
        }
    };

    const CustomImage = () => {
        const [image] = useImage(fileUrl);

        return <Image image={image} />;
    };

    const handleCloseCreateStory = () => {
        setIsCreateStoryOpen(false)
    }

    const handleFontSize = (size: number) => {
        setFontSize(prevState => {
            return prevState + size
        })
    }


    return (
        <div className='p-10 absolute left-0 top-0 w-full h-screen z-10 bg-dark-1'>
            <div className='text-center mb-10 text-xl'>
                <h1>Story Upload</h1>
            </div>
            <div className='w-full'>
                <div className='relative w-[400px] mx-auto mb-10'>
                    <Stage width={400} height={400} ref={canvasRef}>
                        <Layer>
                            {fileUrl && (
                                <CustomImage />
                            )}
                            <Text
                                text={text}
                                x={x}
                                y={y}
                                draggable
                                fontSize={fontSize}
                                fill={isDragging ? 'green' : textColor}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={(e) => {
                                    setIsDragging(false)
                                    setX(e.target.x())
                                    setY(e.target.y())
                                }}
                            />
                        </Layer>
                    </Stage>
                    <div className='flex gap-3 absolute top-2 left-2'>
                        <div className='bg-dark-1 rounded-md opacity-70 hover:opacity-100 transition-all duration-300 h-[30px] flex items-center'>
                            <Button onClick={() => handleFontSize(1)} className='text-xs px-2'>A+</Button>
                        </div>
                        <div className='bg-dark-1 rounded-md opacity-70 hover:opacity-100 transition-all duration-300 h-[30px] flex items-center'>
                            <Button onClick={() => handleFontSize(-1)} className='text-xs px-2'>A-</Button>
                        </div>
                        <input onChange={(e) => setTextColor(e.target.value)} className='bg-transparent h-[30px] w-[40px]' type="color" id="hs-color-input"
                            value={textColor} title="Choose your color"></input>
                    </div>
                    <Button onClick={handleCloseCreateStory} className='text-white bg-black opacity-70 hover:opacity-100 transition-all duration-300 absolute bottom-2 left-2'>
                        Discard
                    </Button>
                    <Button onClick={handleSubmit} className='text-white bg-black opacity-70 hover:opacity-100 transition-all duration-300 absolute bottom-2 right-2'>Upload Story</Button>
                </div>
                <div className='relative w-[400px] mx-auto'>
                    <input ref={fileInputRef} className='hidden' onChange={(e) => handleImageChange(e)} type='file' id='fiile_input' />
                    <input
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        className={`peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal
                             outline outline-0 focus:outline-0 disabled:bg-blue-gray-50
                             disabled:border-0 transition-all placeholder-shown:border
                              placeholder-shown:border-blue-gray-200 
                              placeholder-shown:border-t-blue-gray-200 border 
                              focus:border-2 focus:border-t-transparent 
                              ${text ? 'border-t-transparent' : ''}
                              text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200
                               focus:border-purple-500`}
                        placeholder="" /><label
                            className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-blue-gray-400 peer-focus:text-purple-500 before:border-blue-gray-200 peer-focus:before:!border-purple-500 after:border-blue-gray-200 peer-focus:after:!border-purple-500">
                        Your story text
                    </label>
                </div>


                {/* <input type='text' className='text-black' placeholder='write here' onChange={(e) => setText(e.target.value)} /> */}
            </div>

        </div>
    );
};

export default CreateStory;