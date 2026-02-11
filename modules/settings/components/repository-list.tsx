"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"
import { getConnectedRepositories, disconnectAllRepositories, disconnectRepository } from "@/modules/settings/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Trash, GithubLogo, ArrowSquareOut } from "@phosphor-icons/react"
import Link from "next/link"

export function RepositoryList() {
    const queryClient = useQueryClient();
    const [disconnectAllOpen, setDisconnectAllOpen] = useState(false)
    const [repoToDisconnect, setRepoToDisconnect] = useState<string | null>(null)

    const { data: repositories, isLoading } = useQuery({
        queryKey: ["connected-repositories"],
        queryFn: async () => await getConnectedRepositories(),
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });

    const disconnectMutation = useMutation({
        mutationFn: async (repositoryId: string) => {
            return await disconnectRepository(repositoryId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connected-repositories"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
            toast.success("Repository disconnected successfully")
            setRepoToDisconnect(null)
        },
        onError: () => {
            toast.error("Failed to disconnect repository")
            setRepoToDisconnect(null)
        }
    })

    const disconnectAllMutation = useMutation({
        mutationFn: async () => await disconnectAllRepositories(),
        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ["connected-repositories"] })
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
                toast.success(`Disconnected ${result.count} repositories`)
                setDisconnectAllOpen(false)
            } else {
                toast.error(result?.error || "Failed to disconnect all repositories")
            }
        },
        onError: () => {
            toast.error("Failed to disconnect all repositories")
        }
    })

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Connected Repositories</CardTitle>
                    <CardDescription>Manage your connected repositories</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                    <CardTitle>Connected Repositories</CardTitle>
                    <CardDescription>Manage your connected repositories</CardDescription>
                </div>
                {repositories && repositories.length > 0 && (
                    <AlertDialog open={disconnectAllOpen} onOpenChange={setDisconnectAllOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                Disconnect All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will disconnect all repositories and remove their webhooks.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.preventDefault()
                                        disconnectAllMutation.mutate()
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {disconnectAllMutation.isPending ? "Disconnecting..." : "Disconnect All"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardHeader>
            <CardContent>
                {!repositories || repositories.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center gap-3">
                        <GithubLogo className="h-12 w-12 text-muted-foreground/20" />
                        <div className="space-y-1">
                            <h3 className="font-medium">No repositories connected</h3>
                            <p className="text-sm text-muted-foreground">
                                Connect repositories from the dashboard to see them here.
                            </p>
                        </div>
                        <Button variant="outline" asChild className="mt-2">
                            <Link href="/dashboard/repository">Connect Repository</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Repository</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {repositories.map((repo) => (
                                    <TableRow key={repo.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{repo.name}</span>
                                                    <Link
                                                        href={repo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        <ArrowSquareOut className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{repo.fullName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDistanceToNow(new Date(repo.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog open={repoToDisconnect === repo.id} onOpenChange={(open) => setRepoToDisconnect(open ? repo.id : null)}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                        <span className="sr-only">Disconnect</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Disconnect Repository?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to disconnect <span className="font-medium text-foreground">{repo.fullName}</span>? This will remove the webhook from GitHub.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                disconnectMutation.mutate(repo.id)
                                                            }}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}