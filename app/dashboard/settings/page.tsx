"use client "

import { ProfileForm } from "@/modules/settings/components/profile-form"
import React from "react"
import { RepositoryList } from "@/modules/settings/components/repository-list"
const SettingsPage = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <div className="space-y-4">
                <div className="space-y-2">

                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>
            </div>
            <ProfileForm />
            <RepositoryList />
        </div>
    )
}

export default SettingsPage
