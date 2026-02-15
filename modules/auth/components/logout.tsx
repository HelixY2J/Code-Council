"use client"
import React from "react"
import { signOut } from "@/lib/auth-client"

const Logout = ({
    children,
    className
}: {
    children: React.ReactNode,
    className?: string
}) => {
    return (
        <span className={className!} onClick={async () => {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        // Use hard redirect to clear all cached state
                        window.location.href = "/login"
                    }
                }
            })
        }}> {children} </span>
    )
}

export default Logout