import React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { requireAuth } from "@/modules/auth/utils/auth-utils";
const DashboardLayout = async (
    { children }: { children: React.ReactNode }
) => {
    await requireAuth()
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex items-center gap-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <h1 className="text-lg font-semibold text-foreground"> Dashboard</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-4">{children} </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default DashboardLayout