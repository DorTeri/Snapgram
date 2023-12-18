import PostCard from '@/components/shared/PostCard'
import UserCard from '@/components/shared/UserCard'
import { useFollowUser, useGetRecentPosts, useGetStories, useGetUsers, useUnfollowUser } from '@/lib/react-query/queriesAndMutations'
import { Models } from 'appwrite'
import Loader from "@/components/shared/Loader";
import { useUserContext } from '@/context/AuthContext';
import StoryCard from '@/components/shared/StoryCard';
import CreateStory from '@/components/shared/CreateStory';

// import StorieCard from '@/components/shared/StorieCard'; development


const Home = () => {

  const { data: creators, isPending: isUserLoading, isError: isErrorCreators } = useGetUsers(10);
  const { user } = useUserContext()
  const { data: posts, isPending: isPostLoading, isError: isErrorPosts } = useGetRecentPosts(user.id)
  const { data: stories, isPending: isStoriesLoading, isError: isErrorStories } = useGetStories(user.id)
  const { mutateAsync: followUser, isPending: isLoadingFollow } = useFollowUser()
  const { mutateAsync: unFollowUser, isPending: isLoadingUnfollow } = useUnfollowUser()
  

  console.log("stories",stories )
  const handleFollow = async (targetUserId: string, currentUser: any, type: string) => {

    if (type === 'follow') {
      const data = await followUser({ userId: currentUser.id, targetUserId })
      console.log('follow', data);

    } else {
      const data = await unFollowUser({ userId: currentUser.id, targetUserId })
      console.log('unfollow', data);
    }

  }

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">{user.following.length === 0 ? 'You are not following anyone yet' : 'No posts yet'}.</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-1'>
      <div className='home-container'>

        <div className='hidden'>
          <CreateStory />
        </div>

        <div className="flex justify-start w-full p-4 min-h-[100px] max-w-[600px]
           mx-auto overflow-x-auto relative 
          custom-scrollbar border-b-2 border-[#adadad] md:border-0">
          {stories && Object.keys(stories).map((creatorId) => (
            <StoryCard story={stories[creatorId]} currUserId={user.id} key={creatorId} />
          ))}
        </div>

        <div className='home-posts'>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className='flex flex-col flex-1 gap-9 w-full'>
              {posts?.documents.map((post: Models.Document) => (
                <PostCard post={post} key={post.$id} />
              ))}
            </ul>
          )}
        </div>

      </div>

      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Top Creators</h3>
        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {creators?.documents.map((creator) => (
              <li key={creator?.$id}>
                <UserCard user={creator} currentUser={user} handleFollow={handleFollow} isLoadingFollow={isLoadingFollow} isLoadingUnfollow={isLoadingUnfollow} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>


  )
}

export default Home