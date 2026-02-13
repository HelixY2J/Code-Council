"use server";

import prisma from "@/lib/db";
import { retrieveContext } from "../lib/rag";
import { getPullRequestDiff } from "@/modules/github/lib/github";
import { inngest } from "@/inngest/client";

export async function reviewPullRequest(owner: string, repo: string, prNumber: number) {
    try {
        const repository = await prisma.repository.findFirst({
            where: {
                owner,
                name: repo
            },
            include: {
                user: {
                    include: {
                        accounts: {
                            where: {
                                providerId: "github"
                            }
                        }
                    }
                }
            }
        })

        if (!repository) {
            throw new Error("Repository not found")
        }

        const githubAccount = repository.user.accounts[0];
        if (!githubAccount?.accessToken) {
            throw new Error("Github account token not found for owner")
        }

        await inngest.send({
            name: "pr.review.requested",
            data: {
                owner,
                repo,
                prNumber,
                userId: repository.user.id
            }
        })
        return { success: true, message: "Review Queued" }

    } catch (error) {
        try {
            const repository = await prisma.repository.findFirst({
                where: {
                    owner,
                    name: repo
                }
            })
            if (repository) {
                await prisma.review.create({
                    data: {
                        repositoryId: repository.id,
                        prNumber,
                        prTitle: "Failed to fetch PR",
                        prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                        review: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                        status: "FAILED",
                    }
                })
            }

        } catch (dbError) {
            console.error("Failed to save error to DB", dbError)
        }
    }
}

