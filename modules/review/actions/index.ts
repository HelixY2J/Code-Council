"use server";


import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { inngest } from "@/inngest/client";

export const getReviews = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const reviews = await prisma.review.findMany({
            where: {
                repository: {
                    userId: session.user.id
                }
            },
            include: {
                repository: true
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        })
        return reviews
    } catch (error) {
        console.error("Failed to fetch reviews", error)
        return []
    }
}