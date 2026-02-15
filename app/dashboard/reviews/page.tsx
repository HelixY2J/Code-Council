"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/modules/review/actions";
import { ExternalLink, Search, Filter, GitPullRequest, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type Review = {
    id: string;
    prNumber: number;
    prTitle: string;
    prUrl: string;
    review: string;
    status: string;
    createdAt: Date;
    repository: {
        name: string;
        fullName: string;
        owner: string;
    };
};

export default function ReviewsPage() {
    const { data: reviews, isLoading } = useQuery({
        queryKey: ["reviews"],
        queryFn: getReviews
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Filter and search reviews
    const filteredReviews = useMemo(() => {
        if (!reviews) return [];

        return reviews.filter((review) => {
            const matchesSearch =
                review.prTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.repository.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.prNumber.toString().includes(searchQuery);

            const matchesStatus = statusFilter === "all" || review.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [reviews, searchQuery, statusFilter]);

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return <CheckCircle2 className="w-4 h-4" />;
            case "pending":
                return <Clock className="w-4 h-4" />;
            case "failed":
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <CheckCircle2 className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-primary/10 text-primary border-primary/20";
            case "pending":
                return "bg-accent/10 text-accent-foreground border-accent/20";
            case "failed":
                return "bg-destructive/10 text-destructive border-destructive/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Code Reviews
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            AI-powered reviews for your pull requests
                        </p>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by PR title, repository, or number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card border-border focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="flex gap-2 items-center">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <div className="flex gap-2">
                                <Button
                                    variant={statusFilter === "all" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("all")}
                                    className="transition-all"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={statusFilter === "completed" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("completed")}
                                    className="transition-all"
                                >
                                    Completed
                                </Button>
                                <Button
                                    variant={statusFilter === "pending" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("pending")}
                                    className="transition-all"
                                >
                                    Pending
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <GitPullRequest className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{reviews?.length || 0}</p>
                                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {reviews?.filter(r => r.status === "completed").length || 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/10 rounded-lg">
                                    <Clock className="w-5 h-5 text-accent-foreground" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {reviews?.filter(r => r.status === "pending").length || 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-muted-foreground">Loading reviews...</p>
                        </div>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4 text-center max-w-md">
                            <div className="p-4 bg-muted rounded-full">
                                <GitPullRequest className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
                                <p className="text-muted-foreground">
                                    {searchQuery || statusFilter !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "Reviews will appear here once PRs are analyzed"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredReviews.map((review) => (
                            <Card
                                key={review.id}
                                className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 bg-card overflow-hidden"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    #{review.prNumber}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`flex items-center gap-1 ${getStatusColor(review.status)}`}
                                                >
                                                    {getStatusIcon(review.status)}
                                                    <span className="capitalize">{review.status}</span>
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                                                {review.prTitle}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-foreground/80">
                                                    {review.repository.fullName}
                                                </span>
                                            </CardDescription>
                                        </div>

                                        <Link
                                            href={review.prUrl}
                                            target="_blank"
                                            className="shrink-0"
                                        >
                                            <Button
                                                size="sm"
                                                className="gap-2 bg-primary hover:bg-primary/90 transition-all"
                                            >
                                                <span>View on GitHub</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>

                                <CardContent className="pb-4">
                                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                        <h4 className="text-sm font-semibold mb-3 text-foreground/90 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-primary rounded-full" />
                                            AI Review Summary
                                        </h4>
                                        <div className="prose prose-sm max-w-none text-foreground/80 line-clamp-4">
                                            {review.review.substring(0, 300)}
                                            {review.review.length > 300 && "..."}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-4 border-t border-border bg-muted/20">
                                    <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(review.createdAt)}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                        >
                                            View Full Review →
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}