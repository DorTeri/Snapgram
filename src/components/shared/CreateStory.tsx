import React, { useEffect, useRef, useState } from 'react'
// import StoryForm from '../forms/StoryForm'
// import FileUploader from './FileUploader';
// import { FileWithPath, useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { useCreateStory } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';

// type Props = {}

// type FileUploaderProps = {
//     canvasContext: any;
//     setFileUrl: React.Dispatch<React.SetStateAction<string>>
// };

// const FileUploader = ({ canvasContext, setFileUrl }: FileUploaderProps) => {
//     const onDrop = (acceptedFiles: FileWithPath[]) => {
//         const image = new Image();
//         image.src = URL.createObjectURL(acceptedFiles[0]);

//         image.onload = () => {
//             // Draw the image to cover the entire canvas
//             canvasContext.drawImage(
//                 image,
//                 0,
//                 0,
//                 canvasContext.canvas.width,
//                 canvasContext.canvas.height
//             );
//         };

//         setFileUrl(image.src); // Update the fileUrl in the parent component
//     };

    // const { getRootProps, getInputProps } = useDropzone({
    //     onDrop,
    //     accept: {
    //         'image/*': ['.png', '.jpeg', '.jpg', '.svg'],
    //     },
    // });

//     return (
//         <div
//             {...getRootProps()}
//             className='flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer'
//         >
//             <input {...getInputProps()} className='cursor-pointer' />
//             <div className='file_uploader-box'>
//                 <img
//                     src='/assets/icons/file-upload.svg'
//                     width={96}
//                     height={77}
//                     alt='file-upload'
//                 />

//                 <h3 className='base-medium text-light-2 mb-2 mt-6'>Drag photo here</h3>
//                 <p className='text-light-4 small-regular mb-6'>SVG , PNG , JPG</p>

//                 <Button className='shad-button_dark_4'>Select from computer</Button>
//             </div>
//         </div>
//     );
// };

const CreateStory = () => {
    const { user } = useUserContext();

    const [canvasContext, setCanvasContext] = useState<any>(null);
    const canvasRef = useRef<any>();
    const [fileUrl, setFileUrl] = useState('');
    const [text, setText] = useState('');
    const [isEditingText, setIsEditingText] = useState(false);
    const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
    const [isMovingText, setIsMovingText] = useState(false);
    const { mutateAsync: createStory} = useCreateStory()


    useEffect(() => {
        const windowWidth = 400;
        const windowHeight = 400;

        const canvas = canvasRef.current;

        canvas.width = windowWidth;
        canvas.height = windowHeight;

        const context = canvas.getContext('2d');
        setCanvasContext(context);
    }, [canvasRef]);

    const handleSubmit = async () => {
        const canvasDataURL = canvasRef.current.toDataURL('image/png');
        const res = await fetch(canvasDataURL)
        const blob = await res.blob()

        // Create File from Blob
        const file = new File([blob], 'canvas_image.png', { type: 'image/png' });

        // Update the state


        try {
            const story = {
                userId: user.id,
                file: [file]
            }
            createStory(story)
        } catch (err) {
            console.log("createStory err", err)
        }
    }

    const handleCanvasClick = () => {
        if (fileUrl) return
        const inputElement = document.getElementById('file-input');
        if (!isEditingText) {
            setIsEditingText(true);
        }
        if (inputElement) {
            inputElement.click();
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const handleAddText = () => {
        // Draw the text on the canvas
        canvasContext.font = '30px Arial';
        canvasContext.fillStyle = 'white';
        canvasContext.fillText(text, textPosition.x, textPosition.y);

        // Reset the text state and flag
        setIsEditingText(false);
        setTextPosition({ x: 50, y: 50 });
    };

    const isLineClicked = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvasRect = canvasRef.current.getBoundingClientRect();

        const canvasX = e.clientX - canvasRect.left;
        const canvasY = e.clientY - canvasRect.top;
        const font = '30px Arial';
        canvasContext.font = font;
        const width = canvasContext.measureText(text).width
        const height = parseInt(canvasContext.font.match(/\d+/), 10)
        if (canvasX > textPosition.x - width / 2 && canvasX < textPosition.x + width / 2 &&
            canvasY > textPosition.y - height / 2 && canvasY < textPosition.y + height / 2) {
            setIsMovingText(true)
            console.log("inside")
        }
    }

    const handleTextMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isMovingText) return

        const canvasRect = canvasRef.current.getBoundingClientRect();

        const canvasX = e.clientX - canvasRect.left;
        const canvasY = e.clientY - canvasRect.top;

        if (fileUrl) {
            const image = new Image();
            image.src = fileUrl;
            canvasContext.drawImage(
                image,
                0,
                0,
                canvasContext.canvas.width,
                canvasContext.canvas.height
            );
        }

        textPosition.x = canvasX
        textPosition.y = canvasY

        canvasContext.font = '30px Arial';
        canvasContext.fillStyle = 'white';
        canvasContext.fillText(text, textPosition.x, textPosition.y);
    }


    return (
        <div className='p-10 absolute left-0 top-0 w-full h-full z-10 bg-dark-1'>
            {/* <StoryForm action='Create'/> */}
            <canvas
                ref={canvasRef}
                style={{ border: '1px solid #ccc' }}
                onClick={handleCanvasClick}
                onMouseDown={isLineClicked}
                onMouseMove={handleTextMove}
                onMouseUp={() => setIsMovingText(false)}
            ></canvas>

            <div>
                <input
                    type='text'
                    value={text}
                    onChange={handleTextChange}
                    placeholder='Enter text'
                    className='text-black'
                />
                <Button onClick={handleAddText}>Add Text</Button>
            </div>
            <input
                id='file-input'
                type='file'
                style={{ display: 'none' }}
                onChange={(e) => {
                    if (e.target.files) {
                        // Handle the file selection when an image is dropped onto the canvas
                        const imageFile = e.target.files[0];
                        const image = new Image();
                        image.src = URL.createObjectURL(imageFile);

                        image.onload = () => {
                            // Draw the image to cover the entire canvas
                            canvasContext.drawImage(
                                image,
                                0,
                                0,
                                canvasContext.canvas.width,
                                canvasContext.canvas.height
                            );
                        };

                        setFileUrl(image.src); // Update the fileUrl in the parent component
                    }
                }}
            />
            <div>
                <Button onClick={handleSubmit}>Create Story</Button>
            </div>
        </div>
    );
};

export default CreateStory;