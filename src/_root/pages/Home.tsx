import PostCard from '@/components/shared/PostCard'
import UserCard from '@/components/shared/UserCard'
import { useFollowUser, useGetRecentPosts, useGetUsers, useUnfollowUser } from '@/lib/react-query/queriesAndMutations'
import { Models } from 'appwrite'
import Loader from "@/components/shared/Loader";
import { useUserContext } from '@/context/AuthContext';
import StorieCard from '@/components/shared/StorieCard';


const Home = () => {

  const { data: creators, isPending: isUserLoading, isError: isErrorCreators } = useGetUsers(10);
  const { user } = useUserContext()
  const { data: posts, isPending: isPostLoading, isError: isErrorPosts } = useGetRecentPosts(user.id)
  const { mutateAsync: followUser, isPending: isLoadingFollow } = useFollowUser()
  const { mutateAsync: unFollowUser, isPending: isLoadingUnfollow } = useUnfollowUser()


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

        <div className="flex p-4 min-h-[100px] max-w-[300px] lg:max-w-[650px] sm:max-w-[400px] xs:max-w-[400px] xxs:max-w-[290px] mx-auto overflow-x-auto relative custom-scrollbar">
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
          <StorieCard />
        </div>


        <div className='home-posts'>
          <h2 className='h3-bold md:h2-bold text-left w-full'>
            Home Feed
          </h2>
          {user.following.length === 0 ? (
            <h2 className='h3-bold md:h2-bold text-left w-full'>
              You are not following anyone yet.
            </h2>
          ) : (
            <>
              {isPostLoading && !posts ? (
                <Loader />
              ) : (
                <ul className='flex flex-col flex-1 gap-9 w-full'>
                  {posts?.documents.map((post: Models.Document) => (
                    <PostCard post={post} key={post.$id} />
                  ))}
                </ul>
              )}
            </>
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