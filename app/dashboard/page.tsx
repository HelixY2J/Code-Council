import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, GithubLogo } from "@phosphor-icons/react/dist/ssr"; // Ensure correct import for SSR if needed, or just standard
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MainPage = () => {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Header / Stats Area */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
                        <GithubLogo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <div className="h-4 w-4 text-muted-foreground">
                            {/* Icon placeholder if needed */}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            -
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                        {/* Icon placeholder */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Free</div>
                        <p className="text-xs text-muted-foreground">
                            Upgrade for more
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content / Empty State */}
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min flex items-center justify-center border-dashed border-2 border-muted">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No repositories added
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        You have not added any repositories to review yet.
                    </p>
                    <Button className="mt-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus weight="bold" />
                        Add Repository
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MainPage