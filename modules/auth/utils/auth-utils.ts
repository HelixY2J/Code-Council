"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

// not gonna use next proxy
// this will run insdie request lifecycle

export const requireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers()

    })

    if (!session) {
        redirect("/login")
    }

    return session
}

export const requireUnAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers()

    })

    if (session) {
        redirect("/")
    }

    return session
}