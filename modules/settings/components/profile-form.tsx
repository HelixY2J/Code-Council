"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/modules/settings/actions";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@phosphor-icons/react";

export function ProfileForm() {
    const queryClient = useQueryClient()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [image, setImage] = useState("")

    const { data: profile, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => await getUserProfile(),
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setEmail(profile.email || "")
            setImage(profile.image || "")
        }
    }, [profile]);


    const updateMutation = useMutation({
        mutationFn: async (data: { name: string; email: string }) => await updateUserProfile(data),
        onSuccess: (result) => {
            if (result?.success) {
                toast.success("Profile updated successfully")
                queryClient.invalidateQueries({
                    queryKey: ["user"],
                })
            } else {
                toast.error("Failed to update profile")
            }
        },
        onError: (error) => {
            toast.error("Failed to update profile")
        }
    })


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        updateMutation.mutate({ name, email })
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-10 bg-muted rounded animate-pulse"></div>
                        <div className="h-10 bg-muted rounded animate-pulse"></div>
                    </div>
                </CardContent>

            </Card>

        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage src={image} alt={name} />
                            <AvatarFallback className="bg-primary/10">
                                <User className="h-8 w-8 text-primary" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg leading-none">{name || "User"}</h3>
                            <p className="text-sm text-muted-foreground">{email || "No email provided"}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full border border-gray-300 focus:border-primary"

                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 focus:border-primary"

                            />
                        </div>
                        <div className="pt-2">
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Updating..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}