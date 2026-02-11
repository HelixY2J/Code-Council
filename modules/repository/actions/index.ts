"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Octokit } from "octokit"
import { getGithubAccessToken, getRepositories as getGithubRepositories, createWebhook } from "@/modules/github/lib/github"

export async function getRepositories(page: number = 1, perPage: number = 10) { // pagenumber
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const githubRepos = await getGithubRepositories(page, perPage)
        const dbRepos = await prisma.repository.findMany({
            where: {
                userId: session.user.id
            }
        })

        const connectedRepoIds = new Set(dbRepos.map(repo => repo.githubId))

        return githubRepos.map(repo => ({
            ...repo,
            isConnected: connectedRepoIds.has(BigInt(repo.id))
        }))
    } catch (error) {
        console.error("Failed to fetch repositories", error)
        return []
    }
}

export const connectRepository = async (owner: string, repo: string, githubId: number) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }


        // TDODO CHECK IF USER CAN CONNECT TO MORE REPO RO NOT

        const webhook = await createWebhook(owner, repo)

        if (webhook) {
            await prisma.repository.create({
                data: {
                    githubId: BigInt(githubId),
                    userId: session.user.id,
                    name: repo,
                    owner,
                    fullName: `${owner}/${repo}`,
                    url: `https://github.com/${owner}/${repo}`,

                }
            })
        }

        // TODO INCREMENET REPO COUNT FOR USAGE TRACKING

        // TODO TRIGGER REPO INDEXING FOR RAG 

        return webhook



    } catch (error) {
        console.error("Failed to connect repository", error)
        return null
    }
}