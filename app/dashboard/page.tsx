"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, GithubLogo, GitBranch, GitCommit, GitPullRequest, GitDiff } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getMonthlyActivity, getDashboardStats } from "@/modules/dashboard/actions";
import ContributionGraph from "@/modules/dashboard/components/contribution-graph";
import ActivityChart from "@/modules/dashboard/components/activity-chart";
const MainPage = () => {
    const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => getDashboardStats(),
        refetchOnWindowFocus: false,
    })

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
            {/* Header / Stats Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? "..." : dashboardStats?.totalRepos || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active repositories
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                        <GitCommit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? "..." : dashboardStats?.totalContributions || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Commits across all time
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
                        <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? "..." : dashboardStats?.totalPullRequests || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total PRs created
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Reviews</CardTitle>
                        <GitDiff className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? "..." : dashboardStats?.totalAiReviews || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Automated code reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Contribution Graph */}
            <div className="grid gap-4 md:grid-cols-1">
                <ContributionGraph />
            </div>

            {/* Activity Chart */}
            <div className="grid gap-4 md:grid-cols-1">
                <ActivityChart />
            </div>
        </div>
    )
}

export default MainPage