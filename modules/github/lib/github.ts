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
        throw error
    }
}