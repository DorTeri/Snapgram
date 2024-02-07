import { multiFormatDateString } from '@/lib/utils'
import { Link } from 'react-router-dom'

type Props = {
    comment: any;
}

const CommentCard = ({ comment }: Props) => {
    return (
        <div className="flex items-center gap-3 pb-3">
            <Link to={`/profile/${comment?.creator?.$id}`}>
                <img
                    src={comment?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt="creator"
                    className="rounded-full w-9 lg:h-9"
                />
            </Link>

            <div>
                <div className="flex gap-2">
                    <p className="base-medium subtle-semibold text-light-1">{comment?.creator?.name}</p>
                    <div className="flex-center gap-2 text-light-3">
                        <p className="subtle-semibold lg:small-regular">
                            {multiFormatDateString(comment.$createdAt)}
                        </p>
                    </div>
                </div>
                <div>
                    <p className="lg:small-regular">
                        {comment.text}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CommentCard