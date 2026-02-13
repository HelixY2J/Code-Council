import prisma from "@/lib/db";
import { inngest } from "../client";
import { getRepoFileContents } from "@/modules/github/lib/github";
import { indexCodebase, retrieveContext } from "@/modules/ai/lib/rag";
import { getPullRequestDiff, postReviewComment } from "@/modules/github/lib/github";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";


export const generateReview = inngest.createFunction(
    { id: "generate-reivew", concurrency: 5 },
    { event: "pr.review.requested" },

    async ({ event, step }) => {
        const { owner, repo, prNumber, userId } = event.data;

        const { diff, title, description, token } = await step.run("fetch-pr-data", async () => {
            const account = await prisma.account.findFirst({
                where: {
                    userId,
                    providerId: "github"
                }
            })
            if (!account?.accessToken) {
                throw new Error("No github access token found")
            }
            const data = await getPullRequestDiff(account.accessToken, owner, repo, prNumber);
            return { ...data, token: account.accessToken }
        });

        const context = await step.run("retrieve-context", async () => {
            const query = `${title}\n${description}`
            return await retrieveContext(query, `${owner}/${repo}`)
        });


        const review = await step.run("generate-ai-review", async () => {
            const prompt = `You are an expert code reviewer. Analyze the following pull request and provide a detailed, constructive code review.

        PR Title: ${title}
        PR Description: ${description || "No description provided"}

        Context from Codebase:
        ${context.join("\n\n")}

        Code Changes:
        \`\`\`diff
        ${diff}
        \`\`\`

        Please provide:
        1. **Walkthrough**: A file-by-file explanation of the changes.
        2. **Summary**: Brief overview.
        3. **Strengths**: What's done well.
        4. **Issues**: Bugs, security concerns, code smells.
        5. **Suggestions**: Specific code improvements.

        Format your response in markdown.`;

            const { text } = await generateText({
                model: google("gemini-2.5-flash"),
                prompt
            })

            return text
        });

        await step.run("post-comment", async () => {
            await postReviewComment(token, owner, repo, prNumber, review)
        })


        await step.run("save-review", async () => {
            const repository = await prisma.repository.findFirst({
                where: {
                    owner,
                    name: repo
                }
            });

            if (repository) {
                await prisma.review.create({
                    data: {
                        repositoryId: repository.id,
                        prNumber,
                        prTitle: title,
                        prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                        review,
                        status: "completed",
                    },
                });
            }
        })
        return { success: true }

    }
)