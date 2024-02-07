import { useCommentPost } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { Button } from "@/components/ui/button"
import CommentCard from "./CommentCard";
import { useToast } from "@/components/ui/use-toast"

type Props = {
    toggleCommentsModal: any;
    post: Models.Document;
    user: any;
    isCommentsOpen: Boolean;
}

const CommentsModal = ({ toggleCommentsModal, post, user }: Props) => {

    const { mutate: commentPost } = useCommentPost();
    const [comment, setComment] = useState('')
    const { toast } = useToast()

    const handleCommentPost = () => {

        if (!comment) return

        const commentData = {
            post: post.$id,
            text: comment,
            creator: user.id
        }
        try {
            commentPost({ commentData })
            toast({ title: 'Comment added' })
        } catch (error) {
            toast({ title: 'Something went wrong' })
            console.log('error commenting on a post' , error)
        }
    }

    const closeModal = () => {
        toggleCommentsModal(false)
    }

    return (
        <div className='flex flex-col gap-5 p-5 absolute bottom-0 left-0 z-50
         w-[100%] h-[60%] bg-[#2e2e2e] rounded-t-md transition-transform duration-300'>
            <h1 className='text-center border-b-2 h-10'>Comments</h1>
            <button className="absolute top-[-5px] right-2 mt-4 p-2 text-white rounded"
                onClick={closeModal}>
                X
            </button>
            <div className="overflow-y-auto flex-grow">
                {post.comments.map((comment: { comment: any }) => (
                    <CommentCard comment={comment} />
                ))}
            </div>
            <div className="comment-input flex items-center gap-5">
                <Link to={`/profile/${post.creator.$id}`}>
                    <img
                        src={user?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                        alt="creator"
                        className="rounded-full w-12 lg:h-12"
                    />
                </Link>
                <Input placeholder={`Add a comment for ${post.creator.name}...`}
                    type="text" className="shad-input rounded-2xl"
                    onChange={(e) => setComment(e.target.value)} value={comment} />
                {
                    comment && (
                        <Button onClick={handleCommentPost} className="shad-button_primary hover:opacity-75 transition-all duration-300">
                            Send
                        </Button>
                    )
                }
            </div>
        </div>
    )
}

export default CommentsModal