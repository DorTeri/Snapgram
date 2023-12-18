import {
    useQuery,
    useQueryClient,
    useInfiniteQuery,
    useMutation
} from '@tanstack/react-query'
import { createPost, createStory, createUserAccount, deletePost, deleteSavedPost, followUser, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getStories, getUserById, getUserPosts, getUsers, likePost, savePost, searchPosts, signInAccount, signOutAccount, unfollowUser, updatePost, updateUser } from '../appwrite/api'
import { INewPost, INewStory, INewUser, IUpdatePost, IUpdateUser } from '@/types'
import { QUERY_KEYS } from './queryKeys'
import { useUserContext } from '@/context/AuthContext'

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string;
            password: string;
        }) => signInAccount(user),
    });
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    });
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useCreateStory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (story: INewStory) => createStory(story),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}


export const useGetRecentPosts = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS, userId],
        queryFn: () => getRecentPosts(userId),
    });
};


export const useLikePost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) =>
            likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
            savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser
    })
}

export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    })
}

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
        }
    })
}

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
            deletePost(postId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
        },
    });
};

export const useGetPosts = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfinitePosts as any,
        getNextPageParam: (lastPage: any) => {
            // If there's no data, there are no more pages.
            if (lastPage && lastPage.documents.length === 0) {
                return null;
            }

            // Use the $id of the last document as the cursor.
            const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
            return lastId;
        },
        initialPageParam: null
    });
};

export const useGetStories = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_STORIES],
        queryFn: () => getStories(userId)
    });
};


export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm
    })
}

export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: ["getUsers"],
        queryFn: () => getUsers(limit),
    })
}

export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: IUpdateUser) => updateUser(user),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
            });
        },
    });
};

export const useFollowUser = () => {
    const queryClient = useQueryClient();
    const { setUser } = useUserContext()
    return useMutation({
        mutationFn: ({ userId, targetUserId }: { userId: string, targetUserId: string }) =>
            followUser(userId, targetUserId),
        onSuccess: (data) => {
            setUser({
                id: data.user.$id,
                name: data.user.name,
                username: data.user.username,
                email: data.user.email,
                imageUrl: data.user.imageUrl,
                bio: data.user.bio,
                following: data.user.following,
                followers: data.user.followers
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.user?.$id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.targetUser?.$id],
            });
        },
    });
};

export const useUnfollowUser = () => {
    const queryClient = useQueryClient();
    const { setUser } = useUserContext()
    return useMutation({
        mutationFn: ({ userId, targetUserId }: { userId: string, targetUserId: string }) =>
            unfollowUser(userId, targetUserId),
        onSuccess: (data) => {
            setUser({
                id: data.user.$id,
                name: data.user.name,
                username: data.user.username,
                email: data.user.email,
                imageUrl: data.user.imageUrl,
                bio: data.user.bio,
                following: data.user.following,
                followers: data.user.followers
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.user?.$id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.targetUser?.$id],
            });
        },
    });
};


export const useGetUserPosts = (userId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
        queryFn: () => getUserPosts(userId),
        enabled: !!userId,
    });
};