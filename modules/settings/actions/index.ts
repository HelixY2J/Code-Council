"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteWebhook } from "@/modules/github/lib/github";

export const getUserProfile = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,

            }
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user profile", error)
        return null
    }
}

export async function updateUserProfile(data: { name?: string; email?: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const Updateuser = await prisma.user.update({
            where: {
                id: session.user.id
            },
            data: {
                name: data.name,
                email: data.email
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        })
        revalidatePath("/dashboard/settings", "page")
        return {
            success: true,
            message: "User profile updated successfully",
            user: Updateuser
        }
    } catch (error) {
        console.error("Failed to update user profile", error)
        return {
            success: false,
            message: "Failed to update user profile",
            user: null
        }
    }
}

export async function getConnectedRepositories() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const repos = await prisma.repository.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                name: true,

                fullName: true,
                url: true,
                createdAt: true,

            },
            orderBy: {
                createdAt: "desc"
            }
        })
        return repos;
    } catch (error) {
        console.error("Failed to fetch connected repositories", error)
        return []
    }
}
export async function disconnectRepository(repositoryId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const repository = await prisma.repository.findUnique({
            where: {
                id: repositoryId,
                userId: session.user.id

            }
        })
        if (!repository) {
            throw new Error("Repository not found")
        }

        await deleteWebhook(repository.owner, repository.name)

        await prisma.repository.delete({
            where: {
                id: repositoryId,
                userId: session.user.id
            }
        })
        revalidatePath("/dashboard/settings", "page")
        revalidatePath("/dashboard/repository", "page")
        return {
            success: true,

        }
    } catch (error) {
        console.error("Failed to disconnect repository", error)
        return {
            success: false,

        }
    }
}


export async function disconnectAllRepositories() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const repos = await prisma.repository.findMany({
            where: {
                userId: session.user.id
            }
        })
        if (!repos) {
            throw new Error("Repositories not found")
        }

        await Promise.all(repos.map(async (repo) => {
            await deleteWebhook(repo.owner, repo.name)
        }));
        const result = await prisma.repository.deleteMany({
            where: {
                userId: session.user.id
            }
        })
        revalidatePath("/dashboard/settings", "page")
        revalidatePath("/dashboard/repository", "page")
        return {
            success: true,
            count: result.count

        }
    } catch (error) {
        console.error("Failed to disconnect all repositories", error)
        return {
            success: false,
            count: 0,
            error: "Failed to disconnect all repositories"
        }
    }
}