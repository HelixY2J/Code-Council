"use client";
import { customer, checkout } from "@/lib/auth-client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSubscriptionData, syncSubscriptionStatus } from "@/modules/payment/actions";
import { useQuery } from "@tanstack/react-query";
import {
    SpinnerGap,
    CheckCircle,
    XCircle,
    Crown,
    Rocket,
    GitBranch,
    GitPullRequest,
    ArrowRight,
    ArrowsClockwise,
    Gear,
    Infinity,
    Check
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const PLAN_FEATURES = {
    free: [
        {
            name: "Up to 7 repositories",
            included: true
        },
        {
            name: "Up to 7 reviews per repository",
            included: true
        },
        {
            name: "Basic code review",
            included: true
        },
        {
            name: "Deep code analysis",
            included: true
        },
        {
            name: "Community support",
            included: true
        }
    ],
    pro: [
        {
            name: "Unlimited repositories",
            included: true
        },
        {
            name: "Unlimited reviews",
            included: true
        },
        {
            name: "Advanced code review",
            included: true
        },
        {
            name: "Email notifications",
            included: true
        },
        {
            name: "Priority support",
            included: true
        }
    ],
}


export default function SubscriptionPage() {
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [portalLoading, setPortalLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["subscription-data"],
        queryFn: getSubscriptionData,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (success === "true") {
            setShowSuccessAlert(true);
            toast.success("Subscription updated successfully!");
            // Remove the success param from URL
            window.history.replaceState({}, '', '/dashboard/subscription');
            // Refetch data to get updated subscription
            refetch();
        }
    }, [success, refetch]);

    const handleSync = async () => {
        setSyncLoading(true);
        try {
            const result = await syncSubscriptionStatus();
            if (result.success) {
                toast.success("Subscription synced successfully!");
                refetch();
            } else {
                toast.error(result.message || "Failed to sync subscription");
            }
        } catch (error) {
            toast.error("Failed to sync subscription");
        } finally {
            setSyncLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setCheckoutLoading(true);
        try {
            // The checkout function should use the slug defined in auth.ts
            // which maps to the productId: "500d00ba-f6bf-43b9-8cb3-b492aa9b5842"
            const result = await checkout({
                productId: "500d00ba-f6bf-43b9-8cb3-b492aa9b5842",
                slug: "Pro"
            });

            if (result?.url) {
                window.location.href = result.url;
            } else {
                console.error("Checkout result:", result);
                toast.error("Failed to create checkout session - no URL returned");
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(error?.message || "Failed to start checkout");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setPortalLoading(true);
        try {
            const result = await customer.portal();

            if (result.url) {
                window.location.href = result.url;
            } else {
                toast.error("Failed to open customer portal");
            }
        } catch (error) {
            console.error("Portal error:", error);
            toast.error("Failed to open customer portal");
        } finally {
            setPortalLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <SpinnerGap className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground">Loading subscription data...</p>
                </div>
            </div>
        )
    }

    if (!data?.user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
                    <p className="text-muted-foreground">Please sign in to view subscription data</p>
                </div>
            </div>
        )
    }

    const currentTier = data.user.subscriptionTier as "FREE" | "PRO";
    const isPro = currentTier === "PRO";
    const isActive = data.user.subscriptionStatus === "ACTIVE";
    const limits = data.limits;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Subscription Plans
                    </h1>
                    <p className="text-muted-foreground text-lg mt-2">
                        Manage your subscription and billing
                    </p>
                </div>

                <Button
                    onClick={handleSync}
                    disabled={syncLoading}
                    variant="outline"
                    className="gap-2"
                >
                    <ArrowsClockwise className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
                    {syncLoading ? "Syncing..." : "Sync Subscription"}
                </Button>
            </div>

            {/* Success Alert */}
            {showSuccessAlert && (
                <Alert className="mb-6 bg-primary/10 border-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <AlertDescription className="text-primary font-medium">
                        Your subscription has been updated successfully!
                    </AlertDescription>
                </Alert>
            )}

            {/* Current Plan Badge */}
            <div className="mb-8">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {isPro ? (
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Crown className="w-8 h-8 text-primary" weight="fill" />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <Rocket className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-2">
                                        {currentTier} Plan
                                        {isPro && isActive && (
                                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                                Active
                                            </Badge>
                                        )}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {isPro
                                            ? "Unlimited access to all features"
                                            : "Limited access with upgrade available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Statistics */}
            {limits && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Current Usage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Repositories Usage */}
                        <Card className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitBranch className="w-5 h-5 text-primary" />
                                    Repositories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold">{limits.repositories.current}</span>
                                        <span className="text-2xl text-muted-foreground mb-1">
                                            / {limits.repositories.limit || (
                                                <Infinity className="inline w-6 h-6" weight="bold" />
                                            )}
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{
                                                width: limits.repositories.limit
                                                    ? `${Math.min((limits.repositories.current / limits.repositories.limit) * 100, 100)}%`
                                                    : '0%'
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {limits.repositories.canAdd
                                            ? "You can add more repositories"
                                            : "Repository limit reached"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews Usage */}
                        <Card className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitPullRequest className="w-5 h-5 text-primary" />
                                    Reviews Per Repository
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold">
                                            {isPro ? (
                                                <Infinity className="w-12 h-12" weight="bold" />
                                            ) : "7"}
                                        </span>
                                        <span className="text-2xl text-muted-foreground mb-1">
                                            {isPro ? "unlimited" : "per repo"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {isPro
                                            ? "Unlimited reviews for all repositories"
                                            : "Up to 7 reviews per repository"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Plan Cards */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Free Plan */}
                    <Card className={`relative overflow-hidden ${!isPro ? 'border-2 border-primary' : ''}`}>
                        {!isPro && (
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-primary text-primary-foreground">
                                    Current Plan
                                </Badge>
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-muted rounded-lg">
                                    <Rocket className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-2xl">Free</CardTitle>
                            </div>
                            <CardDescription>
                                <span className="text-4xl font-bold text-foreground">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {PLAN_FEATURES.free.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
                                        <span className="text-sm">{feature.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant="outline"
                                disabled={!isPro}
                            >
                                {!isPro ? "Current Plan" : "Downgrade"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className={`relative overflow-hidden border-2 ${isPro ? 'border-primary bg-gradient-to-br from-primary/5 to-transparent' : 'border-primary/50'}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        {isPro && (
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-primary text-primary-foreground">
                                    Current Plan
                                </Badge>
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Crown className="w-6 h-6 text-primary" weight="fill" />
                                </div>
                                <CardTitle className="text-2xl">Pro</CardTitle>
                            </div>
                            <CardDescription>
                                <span className="text-4xl font-bold text-foreground">$10</span>
                                <span className="text-muted-foreground">/month</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {PLAN_FEATURES.pro.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
                                        <span className="text-sm font-medium">{feature.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            {isPro ? (
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleManageSubscription}
                                    disabled={portalLoading}
                                >
                                    {portalLoading ? (
                                        <>
                                            <SpinnerGap className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Gear className="w-4 h-4" />
                                            Manage Subscription
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                                    onClick={handleUpgrade}
                                    disabled={checkoutLoading}
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <SpinnerGap className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Upgrade to Pro
                                            <ArrowRight className="w-4 h-4" weight="bold" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Additional Info */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <div>
                            <h4 className="font-semibold mb-1">Need help?</h4>
                            <p className="text-sm text-muted-foreground">
                                Contact our support team if you have any questions about your subscription or billing.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}