'use client'
import React from "react"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import { GithubLogoIcon, ShieldCheck } from '@phosphor-icons/react'
import { Button } from "@/components/ui/button"
import { TextRotator } from "@/components/ui/text-rotatot"

const LoginUI = () => {

    const [loading, setLoading] = useState(false)

    const handleGithubLogin = async () => {
        setLoading(true)
        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/dashboard" // Ensure redirects to dashboard
            })
        } catch (error) {
            console.error("Failed to login with GitHub", error)
            // Redirect to error page
            window.location.href = `/auth/error?error=OAuthCallback&message=${encodeURIComponent(String(error))}`
        } finally {
            setLoading(false)
        }
    }

    const rotatorWords = ["before you merge", "written by AI", "before CI fails"]

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <main className="flex flex-1 items-center justify-between gap-8 p-6 md:p-12 z-10 max-w-6xl mx-auto w-full flex-col lg:flex-row">
                {/* Left: Branding */}
                <div className="flex flex-1 flex-col items-center lg:items-start text-center lg:text-left gap-6 order-2 lg:order-1">
                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            Ship Production-Ready Code
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground min-h-[1.5em]">
                            <TextRotator
                                words={rotatorWords}
                                className="text-primary font-semibold"
                                typingDelayMs={100}
                                holdAtFullMs={1500}
                            />
                        </p>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-md">
                        AI-powered code reviews for engineering teams.
                    </p>
                </div>

                {/* Right: Auth */}
                <div className="w-full max-w-sm space-y-6 flex-shrink-0 order-1 lg:order-2">
                    <div className="space-y-4">
                        <Button
                            onClick={handleGithubLogin}
                            disabled={loading}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            size="lg"
                        >
                            <GithubLogoIcon size={20} weight="fill" className="mr-2" />
                            {loading ? "Connecting..." : "Continue with GitHub"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Secure Access</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground">
                                <ShieldCheck size={16} className="text-primary" />
                                <span>SOC2 Compliant</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground">
                                <GithubLogoIcon size={16} className="text-foreground" />
                                <span>Official Partner</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground px-4">
                        By continuing, you agree to our{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</a>.
                    </p>
                </div>
            </main>
        </div>
    )

}

export default LoginUI