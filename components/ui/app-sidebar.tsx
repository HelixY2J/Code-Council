"use client";
import React from "react"
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    GithubLogoIcon,
    GearSixIcon,
    CoinsIcon,
    BookIcon,
    TreeViewIcon,
    MoonIcon,
    SunIcon,
    SignOutIcon,
    CaretUpIcon
} from "@phosphor-icons/react";
import { useSession } from "@/lib/auth-client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logout from "@/modules/auth/components/logout";


export const AppSidebar = () => {

    const [mounted, setMounted] = React.useState(false)
    const { setTheme, resolvedTheme } = useTheme()
    const pathname = usePathname()
    const { data: session, isPending } = useSession()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: GithubLogoIcon },
        { href: "/dashboard/repository", label: "Repositories", icon: BookIcon },
        { href: "/dashboard/reviews", label: "Reviews", icon: TreeViewIcon },
        { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CoinsIcon },
        { href: "/dashboard/settings", label: "Settings", icon: GearSixIcon },
    ]

    const isActive = (url: string) => {
        if (url === "/dashboard") {
            return pathname === url
        }
        return pathname === url || pathname.startsWith(url + "/")
    }

    const user = session?.user
    const userName = user?.name || "User"
    const userEmail = user?.email || ""
    const userAvatar = user?.image || ""
    const userInitials = userName ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"

    if (!mounted) return (
        <Sidebar>
            <SidebarContent />
        </Sidebar>
    )

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GithubLogoIcon className="h-5 w-5" weight="fill" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold">Code Council</span>
                        <span className="text-xs text-muted-foreground">v1.0.0</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={item.label}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {isPending ? (
                            <div className="flex items-center gap-2 p-2">
                                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                                <div className="space-y-1">
                                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                                    <div className="h-2 w-16 bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={userAvatar || undefined} alt={userName} />
                                            <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{userName}</span>
                                            <span className="truncate text-xs">{userEmail}</span>
                                        </div>
                                        <CaretUpIcon className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                    align="start"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                                        {resolvedTheme === "dark" ? <SunIcon className="mr-2 h-4 w-4" /> : <MoonIcon className="mr-2 h-4 w-4" />}
                                        Toggle Theme
                                    </DropdownMenuItem>
                                    <Logout className="w-full cursor-pointer">
                                        <DropdownMenuItem>
                                            <SignOutIcon className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </Logout>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}