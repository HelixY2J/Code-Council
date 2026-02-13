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


export async function getRepoFileContents(
    token: string,
    owner: string,
    repo: string,
    path: string = ""
): Promise<{ path: string, content: string }[]> {
    const octokit = new Octokit({ auth: token })
    const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path
    })

    if (!Array.isArray(data)) {
        if (data.type === "file" && data.content) {
            return [
                {
                    path: data.path,
                    content: Buffer.from(data.content, "base64").toString("utf-8")
                }
            ];
        }
        return [];
    }

    let files: { path: string, content: string }[] = [];

    for (const item of data) {
        if (item.type === "file") {
            const { data: fileData } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: item.path
            })

            if (!Array.isArray(fileData) && fileData.type === "file" && fileData.content) {
                if (!item.path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|pdf|zip|tar|gz|rar)$/i)) {
                    files.push({
                        path: item.path,
                        content: Buffer.from(fileData.content, "base64").toString("utf-8")
                    }) // filtering out non code files
                }
            }
        }

        else if (item.type === "dir") {
            const subFiles = await getRepoFileContents(token, owner, repo, item.path)
            files = files.concat(subFiles)
        }
    }
    return files

}


export async function getPullRequestDiff(token: string, owner: string, repo: string, prNumber: number) {
    const octokit = new Octokit({ auth: token });

    const { data: pr } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber
    })

    const { data: diff } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: {
            format: "diff"
        }
    });

    return {
        title: pr.title,
        diff: diff as unknown as string,
        description: pr.body || "",
    }
}


export async function postReviewComment(token: string, owner: string, repo: string, prNumber: number, review: string) {
    const octokit = new Octokit({ auth: token });
    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: `## The Council have reviewed your vibecode, this is what they are saying: \n\n ${review}\n\n`
    })
}