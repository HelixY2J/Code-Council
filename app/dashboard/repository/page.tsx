"use client"
import { useState, useRef, useEffect, useMemo } from "react";
import { useRepositories } from "@/modules/repository/hooks/use-repositories";
import { MagnifyingGlassIcon, ArrowSquareOutIcon, StarIcon, GitForkIcon } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RepositoryListSkeleton } from "@/modules/repository/components/repository-skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Repository {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    description: string | null;
    language: string | null;
    html_url: string;
    topics: string[];
    stargazers_count: number;
    forks: number;
    updated_at: string;
    isConnected?: boolean;
}

export default function RepositoryPage() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useRepositories()
    const [searchQuery, setSearchQuery] = useState("")
    const [isConnecting, setIsConnecting] = useState<Record<number, boolean>>({})

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allRepos = useMemo(() => {
        return data?.pages.flat() as Repository[] || []
    }, [data])

    const filteredRepos = useMemo(() => {
        if (!searchQuery) return allRepos
        return allRepos.filter(repo =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [allRepos, searchQuery])

    const handleConnect = async (repoId: number) => {
        setIsConnecting(prev => ({ ...prev, [repoId]: true }))
        // Placeholder for future implementation
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsConnecting(prev => ({ ...prev, [repoId]: false }))
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
                <p className="text-muted-foreground">
                    Connect your GitHub repositories to start reviewing code.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search repositories..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* Add filter dropdowns here if needed later */}
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <RepositoryListSkeleton />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRepos.map((repo) => (
                            <Card key={repo.id} className="flex flex-col justify-between overflow-hidden transition-all hover:shadow-md border-muted/60">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <CardTitle className="text-base font-semibold truncate flex items-center gap-2">
                                                <span title={repo.full_name}>{repo.name}</span>
                                                {repo.isConnected && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-1">Connected</Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 text-xs h-10">
                                                {repo.description || "No description provided"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 flex-1">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {repo.language && (
                                            <Badge variant="outline" className="text-[10px] font-normal">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-1.5 inline-block" />
                                                {repo.language}
                                            </Badge>
                                        )}
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                                            <StarIcon weight="fill" className="h-3 w-3 text-yellow-500" />
                                            <span>{repo.stargazers_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                                            <GitForkIcon className="h-3 w-3" />
                                            <span>{repo.forks}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Last updated: {new Date(repo.updated_at).toLocaleDateString()}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/20 mt-auto">
                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs gap-1.5">
                                        <Link href={repo.html_url} target="_blank">
                                            View on GitHub <ArrowSquareOutIcon className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={cn("h-8 text-xs", repo.isConnected && "opacity-50 cursor-not-allowed")}
                                        disabled={repo.isConnected || isConnecting[repo.id]}
                                        onClick={() => handleConnect(repo.id)}
                                    >
                                        {isConnecting[repo.id] ? "Connecting..." : repo.isConnected ? "Connected" : "Connect"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && filteredRepos.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No repositories found. Try adjusting your search.</p>
                    </div>
                )}

                {/* Infinite scroll trigger */}
                {hasNextPage && !isLoading && (
                    <div ref={observerTarget} className="flex justify-center p-4">
                        {isFetchingNextPage && (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}