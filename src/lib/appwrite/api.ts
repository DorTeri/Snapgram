import { ID, Query } from "appwrite";
import { INewPost, INewUser } from "@/types";
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
                imageUrl: uploadedFile.$id,
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

export async function getFilePreview(fileId: string) {
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