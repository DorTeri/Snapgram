import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";

type UserCardProps = {
  user: Models.Document;
  currentUser?: any,
  handleFollow?: any,
  isLoadingFollow?: any
};


const UserCard = ({ user, currentUser, handleFollow , isLoadingFollow }: UserCardProps) => {

  console.log('currentUser',currentUser);
  

  const handleFollowClick = (e: React.MouseEvent) => {    
    e.stopPropagation()
    e.preventDefault()

    handleFollow(user.$id , currentUser)
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
        disabled={isLoadingFollow}
        size="sm" className="shad-button_primary px-5"
        onClick={(e) => handleFollowClick(e)}>
        Follow
      </Button>
    </Link>
  );
};

export default UserCard;