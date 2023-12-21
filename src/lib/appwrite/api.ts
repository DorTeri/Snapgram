import { ID, Query } from "appwrite";
import { INewPost, INewStory, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name)

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl
        })

        return newUser

    } catch (error) {
        console.log('createUserAccount error', error)
        return error
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {

    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        )

        return newUser

    } catch (error) {
        console.log('saveUserToDB error', error)
    }
}

export async function signInAccount(user: { email: string; password: string; }) {
    try {
        const session = await account.createEmailSession(user.email, user.password)

        return session
    } catch (error) {
        console.log('signInAccount error', error)
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();


        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )


        if (!currentUser) throw Error;

        return currentUser.documents[0]
    } catch (error) {
        console.log('getCurrentUser error', error)
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession('current')

        return session
    } catch (error) {
        console.log('signOutAccount error', signOutAccount)
    }
}

export async function createPost(post: INewPost) {
    try {
        // Upload image to storage
        const uploadedFile = await uploadFile(post.file[0])

        if (!uploadedFile) throw Error;

        const fileUrl = getFilePreview(uploadedFile.$id)

        if (!fileUrl) {
            deleteFile(uploadedFile.$id)
            throw Error;
        }

        // Convert tags into an array

        const tags = post.tags?.replace(/  /g, '').split(',') || []

        // Save post to database

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags
            }
        )

        if (!newPost) {
            await deleteFile(uploadedFile.$id)
            throw Error
        }

        return newPost

    } catch (error) {
        console.log('createPost error', error)
    }
}

export async function createStory(story: INewStory) {
    try {
        // Upload image to storage
        console.log("story.file[0]", story.file)
        const uploadedFile = await uploadFile(story.file[0])

        if (!uploadedFile) throw Error;

        const fileUrl = getFilePreview(uploadedFile.$id)

        if (!fileUrl) {
            deleteFile(uploadedFile.$id)
            throw Error;
        }

        // Save post to database

        const newStory = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.storiesCollectionId,
            ID.unique(),
            {
                creator: story.userId,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
            }
        )

        if (!newStory) {
            await deleteFile(uploadedFile.$id)
            throw Error
        }

        return newStory

    } catch (error) {
        console.log('createStroy error', error)
    }
}

export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        )
        return uploadedFile
    } catch (error) {
        console.log('uploadFile error', error)
    }
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        )

        return fileUrl
    } catch (error) {
        console.log('getFilePreview error', error)
    }
}

export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(
            appwriteConfig.storageId,
            fileId
        )

        return { status: 'ok' }
    } catch (error) {
        console.log('deleteFile error', error)
    }
}

export async function getRecentPosts(userId: string) {
    // Get the list of users you are following
    const currentUser = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
    );


    if (!currentUser) throw Error;

    if (currentUser.following.length === 0) {
        const allPosts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [
                Query.orderDesc('$createdAt'),
            ]
        );

        return allPosts
    }

    const followingUsers = currentUser.following;
    followingUsers.push(currentUser.$id)

    // Use type assertion to inform TypeScript that Query.in is available
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [
            Query.orderDesc('$createdAt'),
            Query.equal('creator', followingUsers),
            Query.limit(20),
        ]
    );

    return posts;
}

export async function getStories(userId: string) {
    console.log(userId)
    // Get the list of users you are following
    const currentUser = await getCurrentUser()


    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
    twentyFourHoursAgo.setMilliseconds(0);



    if (!currentUser) throw Error;


    if (currentUser.following.length === 0) {
        const allStories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.storiesCollectionId,
            [
                Query.orderAsc('$createdAt'),
                Query.greaterThanEqual("$createdAt", twentyFourHoursAgo.toISOString()),
            ]
        );

        const idx = allStories.documents.findIndex(story =>
            story.creator.$id === currentUser.$id)

        if (idx === -1) {
            const story: any = {
                creator: currentUser
            }
            allStories.documents.unshift(story)
        }


        const orderedStories = sortStories(allStories)

        return orderedStories
    }

    const followingUsers = currentUser.following;
    followingUsers.push(currentUser.$id)

    // Use type assertion to inform TypeScript that Query.in is available
    const stories = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.storiesCollectionId,
        [
            Query.orderAsc('$createdAt'),
            Query.greaterThanEqual("$createdAt", twentyFourHoursAgo.toISOString()),
            Query.equal('creator', followingUsers),
        ]
    );

    const idx = stories.documents.findIndex(story =>
        story.creator.$id === currentUser.$id)

    if (idx === -1) {
        const story: any = {
            creator: currentUser
        }
        stories.documents.unshift(story)
        
    } else {
        const temp = stories.documents[idx]
        stories.documents.splice(idx, 1);
        stories.documents.unshift(temp)
    }

    const orderedStories = sortStories(stories)

    return orderedStories;
}

function sortStories(stories: any) {
    const orderedStories = stories.documents.reduce((groupedStories: any, story: any) => {
        const creatorId = story.creator.$id; // Assuming 'creator' is the field containing the creator's ID

        // Check if there is already an entry for the creator
        if (!groupedStories[creatorId]) {
            // If not, create a new entry with an array containing the first story
            groupedStories[creatorId] = [story];
        } else {
            // If yes, push the current story to the existing array
            groupedStories[creatorId].push(story);
        }

        return groupedStories;
    }, {});

    return orderedStories
}


export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )

        if (!updatedPost) throw Error

        return updatedPost

    } catch (error) {
        console.log('likePost error', error)
    }
}

export async function savePost(postId: string, userid: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userid,
                post: postId,
            }
        )

        if (!updatedPost) throw Error

        return updatedPost

    } catch (error) {
        console.log('likePost error', error)
    }
}

export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )

        if (!statusCode) throw Error

        return { status: 'ok' }

    } catch (error) {
        console.log('likePost error', error)
    }
}

export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        return post;
    } catch (error) {
        console.log('getPostById error', error)
    }
}

export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;
    try {

        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId
        }

        if (hasFileToUpdate) {
            const uploadedFile = await uploadFile(post.file[0])

            if (!uploadedFile) throw Error;

            const fileUrl = getFilePreview(uploadedFile.$id)

            if (!fileUrl) {
                deleteFile(uploadedFile.$id)
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
        }



        const tags = post.tags?.replace(/  /g, '').split(',') || []


        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags
            }
        )

        if (!updatedPost) {
            await deleteFile(post.imageId)
            throw Error
        }

        return updatedPost

    } catch (error) {
        console.log('createPost error', error)
    }
}

export async function deletePost(postId?: string, imageId?: string) {
    if (!postId || !imageId) return;

    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );

        if (!statusCode) throw Error;

        await deleteFile(imageId);

        return { status: "Ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}


export async function searchPosts(searchTerm: string) {

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        )

        if (!posts) throw Error

        return posts
    } catch (error) {
        console.log('getInfinitePosts error', error)
    }
}

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];

    if (limit) {
        queries.push(Query.limit(limit));
    }

    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            queries
        );

        if (!users) throw Error;

        return users;

        return users
    } catch (error) {
        console.log('getUsers error', error);
    }
}

export async function getUserById(userId: string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        if (!user) throw Error;

        return user;
    } catch (error) {
        console.log(error);
    }
}

export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
        let image = {
            imageUrl: user.imageUrl,
            imageId: user.imageId,
        };

        if (hasFileToUpdate) {
            // Upload new file to appwrite storage
            const uploadedFile = await uploadFile(user.file[0]);
            if (!uploadedFile) throw Error;

            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }

        //  Update user
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                bio: user.bio,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
            }
        );

        // Failed to update
        if (!updatedUser) {
            // Delete new file that has been recently uploaded
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }
            // If no new file uploaded, just throw error
            throw Error;
        }

        // Safely delete old file after successful update
        if (user.imageId && hasFileToUpdate) {
            await deleteFile(user.imageId);
        }

        return updatedUser;
    } catch (error) {
        console.log(error);
    }
}

export async function followUser(userId: string, targetUserId: string) {
    try {
        // Get the current user document
        const currentUser = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        // Get the current 'following' array or initialize it as an empty array
        const followingArray = currentUser.following || [];

        // Update the 'following' array for the current user by appending the targetUserId
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            {
                following: appwriteConfig.appwrite.functions.arrayAppend(targetUserId, followingArray),
            }
        );

        // Failed to update
        if (!updatedUser) {
            throw new Error('Failed to update following array for the current user.');
        }

        // Get the target user document
        const targetUser = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            targetUserId
        );

        // Get the current 'followers' array or initialize it as an empty array
        const followersArray = targetUser.followers || [];

        // Update the 'followers' array for the target user by appending the userId
        const updatedTargetUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            targetUserId,
            {
                followers: appwriteConfig.appwrite.functions.arrayAppend(userId, followersArray),
            }
        );

        // Failed to update
        if (!updatedTargetUser) {
            // Roll back the 'following' array update for the current user
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                {
                    following: appwriteConfig.appwrite.functions.arrayRemove(targetUserId, followingArray),
                }
            );
            throw new Error('Failed to update followers array for the target user.');
        }

        return { user: updatedUser, targetUser: updatedTargetUser };
    } catch (error) {
        console.error('Error in followUser:', error);
        throw error;
    }
}


export async function unfollowUser(userId: string, targetUserId: string) {
    try {
        // Get the current user document
        const currentUser = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        // Get the current 'following' array or initialize it as an empty array
        const followingArray = currentUser.following || [];

        // Update the 'following' array for the current user by removing the targetUserId
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            {
                following: appwriteConfig.appwrite.functions.arrayRemove(targetUserId, followingArray),
            }
        );

        // Failed to update
        if (!updatedUser) {
            throw new Error('Failed to update following array for the current user.');
        }

        // Get the target user document
        const targetUser = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            targetUserId
        );

        // Get the current 'followers' array or initialize it as an empty array
        const followersArray = targetUser.followers || [];

        // Update the 'followers' array for the target user by removing the userId
        const updatedTargetUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            targetUserId,
            {
                followers: appwriteConfig.appwrite.functions.arrayRemove(userId, followersArray),
            }
        );

        // Failed to update
        if (!updatedTargetUser) {
            // Roll back the 'following' array update for the current user
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                {
                    following: appwriteConfig.appwrite.functions.arrayAppend(targetUserId, followingArray),
                }
            );
            throw new Error('Failed to update followers array for the target user.');
        }

        return { user: updatedUser, targetUser: updatedTargetUser };
    } catch (error) {
        console.error('Error in unfollowUser:', error);
        throw error; // Re-throw the error to propagate it further if needed
    }
}



export async function getUserPosts(userId?: string) {
    if (!userId) return;

    try {
        const post = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
        );

        if (!post) throw Error;

        return post;
    } catch (error) {
        console.log(error);
    }
}