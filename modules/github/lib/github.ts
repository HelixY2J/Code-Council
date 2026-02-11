import { Octokit } from "octokit";
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { headers } from "next/headers";

// get github access token 
export const getGithubAccessToken = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            providerId: "github"
        }
    })
    if (!account?.accessToken) {
        throw new Error("No github access token found")
    }
    return account.accessToken
}

export async function fetchUserContributions(token: string, username: string) {
    const octokit = new Octokit({ auth: token })

    const query = `
    query($username: String!) {
        user(login: $username) {
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionCount
                            color
                        }
                    }
                }
            }
        }
    }
    `

    // interface contributiondata {
    //     user: {
    //         contributionsCollection: {
    //             contributionCalendar: {
    //                 totalContributions: number,
    //                 weeks: {
    //                     contributionDays: {
    //                         date: string,
    //                         contributionCount: number,
    //                         color: string
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    try {
        const response: any = await octokit.graphql(query, { username })
        return response.user.contributionsCollection.contributionCalendar
    } catch (error) {
        console.error("Failed to fetch user contributions", error)
        return null;
    }
}

export const getRepositories = async (page: number = 1, perPage: number = 10) => {
    const token = await getGithubAccessToken()
    const octokit = new Octokit({ auth: token })
    const { data: repositories } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        direction: "desc",
        visibility: "all",
        page,
        per_page: perPage
    })
    return repositories
}

export const createWebhook = async (owner: string, repo: string) => {
    const token = await getGithubAccessToken()
    const octokit = new Octokit({ auth: token })
    const webhookurl = `${process.env.NEXT_PUBLIC_APP_BASEURL}/api/webhooks/github`

    const { data: hooks } = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    })

    const exisitingHook = hooks.find(hook => hook.config.url === webhookurl)
    if (exisitingHook) {
        return exisitingHook
    }

    const { data } = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
            url: webhookurl,
            content_type: "json",
        },
        events: ["pull_request"],

    })
    return data
}

export const deleteWebhook = async (owner: string, repo: string) => {
    const token = await getGithubAccessToken()
    const octokit = new Octokit({ auth: token })
    const webhookurl = `${process.env.NEXT_PUBLIC_APP_BASEURL}/api/webhooks/github`

    try {
        const { data: hooks } = await octokit.rest.repos.listWebhooks({
            owner,
            repo

        });
        const hookToDelete = hooks.find(hook => hook.config.url === webhookurl)
        if (hookToDelete) {
            await octokit.rest.repos.deleteWebhook({
                owner,
                repo,
                hook_id: hookToDelete.id
            })
            return true
        }


        return false
    } catch (error) {
        console.error("Failed to delete webhook", error)
        return false
    }

}
