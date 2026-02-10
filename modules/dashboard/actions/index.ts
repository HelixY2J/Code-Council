"use server"

import { fetchUserContributions, getGithubAccessToken } from "@/modules/github/lib/github"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Octokit } from "octokit"


export async function getContributionStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const accessToken = await getGithubAccessToken()
        const octokit = new Octokit({ auth: accessToken })
        const { data: user } = await octokit.rest.users.getAuthenticated()
        const calendar = await fetchUserContributions(accessToken, user.login)

        if (!calendar) return null;
        const contributions = calendar.weeks.flatMap((week: any) => week.contributionDays.map((day: any) => ({
            date: day.date,
            count: day.contributionCount,
            level: Math.min(4, Math.floor(day.contributionCount / 3)),
        })))
        return {
            contributions,
            totalContributions: calendar.totalContributions
        }
    } catch (error) {
        console.error("Failed to fetch contribution stats", error)
        return null
    }
}
export async function getDashboardStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const accessToken = await getGithubAccessToken()
        const octokit = new Octokit({ auth: accessToken })
        const { data: user } = await octokit.rest.users.getAuthenticated()
        // TODO: FETRCH TOTAL CONNECTED REPO FROM DB LATER NOT NOW 
        const totalRepos = 88;

        const calendar = await fetchUserContributions(accessToken, user.login)
        const totalContributions = calendar.totalContributions

        const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr`,
            type: "Code",
            sort: "updated",
            order: "desc",
            per_page: 1
        })
        const totalPullRequests = prs.total_count

        // TODOD COUNT AI REVIEWS FROM DB, NOT NOW 
        const totalAiReviews = 10;

        return {
            totalRepos,
            totalContributions,
            totalPullRequests,
            totalAiReviews
        }
    } catch (error) {
        console.error("Failed to fetch dashboard stats", error)
        return {
            totalRepos: 0,
            totalContributions: 0,
            totalPullRequests: 0,
            totalAiReviews: 0
        }
    }
}

export async function getMonthlyActivity() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }

        const accessToken = await getGithubAccessToken()
        const octokit = new Octokit({ auth: accessToken })
        const { data: user } = await octokit.rest.users.getAuthenticated()
        const calendar = await fetchUserContributions(accessToken, user.login)
        if (!calendar) {
            return []
        }

        const monthlyData: {
            [key: string]: { commits: number, prs: number, reviews: number }
        } = {}

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // intit last 6 monyhs 

        const now = new Date()
        const currentMonth = now.getMonth()

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i)
            const monthKey = monthNames[date.getMonth()]
            monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 }
        }

        calendar.weeks.forEach((week: any) => {
            week.contributionDays.forEach((day: any) => {
                const date = new Date(day.date)
                const monthKey = monthNames[date.getMonth()];
                if (monthlyData[monthKey]) {
                    monthlyData[monthKey].commits += day.contributionCount
                }
            })
        })

        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6)
        // TODO REVIEW'S REAL DATA - NOT NOW 

        // stimulating data for now 

        const generateSampleReviews = () => {
            const sampleReviews = [];
            const now = new Date();

            for (let i = 0; i < 45; i++) {
                const randomDaysAgo = Math.floor(Math.random() * 45);
                const reviewDate = new Date(now);
                reviewDate.setDate(now.getDate() - randomDaysAgo);
                sampleReviews.push({
                    id: crypto.randomUUID(),
                    createdAt: reviewDate,
                    updatedAt: reviewDate,

                });
            }
            return sampleReviews;
        };

        const reviews = generateSampleReviews();
        reviews.forEach((review) => {
            const monthKey = monthNames[review.createdAt.getMonth()];
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].reviews += 1;
            }
        })

        const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr created:>${sixMonthsAgo.toISOString().split("T")[0]}`,
            type: "Code",
            sort: "updated",
            order: "desc",
            per_page: 100
        })


        prs.items.forEach((pr: any) => {
            const date = new Date(pr.created_at);
            const monthKey = monthNames[date.getMonth()];
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].prs += 1;
            }
        });

        return Object.keys(monthlyData).map((name) => ({
            name,
            ...monthlyData[name]
        }))


    } catch (error) {
        console.error("Error fetching monthly activity:", error);
        return [];
    }
}