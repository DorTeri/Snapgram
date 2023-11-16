import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { useEffect, useState } from "react";

type UserCardProps = {
  user: Models.Document;
  currentUser?: any,
  handleFollow?: any,
  isLoadingFollow?: any,
  isLoadingUnfollow?: any
};


const UserCard = ({ user, currentUser, handleFollow, isLoadingFollow, isLoadingUnfollow }: UserCardProps) => {

  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user is in the list of followed users
    setIsFollowing(currentUser?.following?.includes(user.$id) ?? false);
  }, [currentUser?.following, user.$id]);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isFollowing) {
      await handleFollow(user.$id, currentUser, 'unfollow')
    } else {
      await handleFollow(user.$id, currentUser, 'follow')
    }

    setIsFollowing(!isFollowing);
  }

  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      <Button type="button"
        disabled={isLoadingFollow || isLoadingUnfollow}
        size="sm" className="shad-button_primary px-5"
        onClick={(e) => handleFollowClick(e)}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    </Link>
  );
};

export default UserCard;