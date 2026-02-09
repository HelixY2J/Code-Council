'use client'

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WarningCircle, ArrowLeft } from "@phosphor-icons/react"

const AuthErrorContent = () => {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    const errorMap: Record<string, string> = {
        "Configuration": "There is a problem with the server configuration.",
        "AccessDenied": "Access denied. You may not have permission to access up.",
        "Verification": "The verification link may have expired or has already been used.",
        "OAuthSignin": "Error in constructing an authorization URL.",
        "OAuthCallback": "Error in handling the response from an OAuth provider.",
        "OAuthCreateAccount": "Could not create OAuth account user.",
        "EmailCreateAccount": "Could not create email account user.",
        "Callback": "Error in the OAuth callback handler.",
        "OAuthAccountNotLinked": "To confirm your identity, sign in with the same account you used originally.",
        "SessionRequired": "Please sign in to access this page.",
        "Default": "An unexpected authentication error occurred."
    }

    const errorMessage = error && error in errorMap ? errorMap[error] : errorMap["Default"]

    return (
        <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                    <WarningCircle size={48} weight="duotone" />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Authentication Error</h1>
                <p className="text-muted-foreground">
                    {errorMessage}
                </p>
                {error && (
                    <div className="mt-4 rounded-md bg-muted p-2 text-xs font-mono text-muted-foreground break-all">
                        Code: {error}
                    </div>
                )}
            </div>

            <div className="pt-4">
                <Button asChild className="gap-2" size="lg">
                    <Link href="/login">
                        <ArrowLeft weight="bold" />
                        Back to Login
                    </Link>
                </Button>
            </div>
        </div>
    )
}

const AuthErrorPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Suspense fallback={<div>Loading error details...</div>}>
                <AuthErrorContent />
            </Suspense>
        </div>
    )
}

export default AuthErrorPage
