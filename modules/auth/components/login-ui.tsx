'use client'
import React from "react"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import { GithubLogoIcon } from '@phosphor-icons/react'
import { Button } from "@/components/ui/button"


const LoginUI = () => {

    const [loading, setLoading] = useState(false)

    const handleGithubLogin = async () => {
        setLoading(true)
        try {
            await signIn.social({
                provider: "github",

            })
        } catch (error) {
            console.error("Failed to login with GitHub", error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-md text-center space-y-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight">
                            Code Council
                        </h1>
                        <p className="text-muted-foreground">
                            An opinionated AI code reviewer for serious teams.
                        </p>
                    </div>

                    {/* Auth */}
                    <Button
                        onClick={handleGithubLogin}
                        disabled={loading}
                        className="w-full gap-2"
                        size="lg"
                    >
                        <GithubLogoIcon />
                        {loading ? "Signing in…" : "Continue with GitHub"}
                    </Button>

                    {/* Trust / footer */}
                    <p className="text-xs text-muted-foreground">
                        We only request access needed to review your code.
                    </p>
                </div>
            </main>

            <footer className="py-4 text-center text-sm text-muted-foreground">
                New to Code Council?{" "}
                <span className="underline underline-offset-4 cursor-pointer">
                    Sign up
                </span>
            </footer>
        </div>
    )

}

export default LoginUI