'use client'
import React from "react"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import { GithubLogoIcon, Atom, ShieldCheck } from '@phosphor-icons/react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-primary/30 selection:text-primary">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <main className="flex flex-1 items-center justify-center p-6 z-10">
                <div className="w-full max-w-sm space-y-8">

                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_-3px_var(--primary)] text-primary">
                            <Atom size={24} weight="fill" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Code Council
                            </h1>
                            <p className="text-zinc-400 text-sm">
                                AI-powered code reviews for engineering teams.
                            </p>
                        </div>
                    </div>

                    {/* Auth Container */}
                    <div className="space-y-4">
                        <Button
                            onClick={handleGithubLogin}
                            disabled={loading}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            size="lg"
                        >
                            <GithubLogoIcon size={20} weight="fill" className="mr-2" />
                            {loading ? "Connecting..." : "Continue with GitHub"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-2 text-zinc-500">Secure Access</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border border-white/5 bg-white/5 text-xs text-zinc-400">
                                <ShieldCheck size={16} className="text-primary" />
                                <span>SOC2 Compliant</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border border-white/5 bg-white/5 text-xs text-zinc-400">
                                <GithubLogoIcon size={16} className="text-white" />
                                <span>Official Partner</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-zinc-500 px-4">
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