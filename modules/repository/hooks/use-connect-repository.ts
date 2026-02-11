"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectRepository } from "../actions";
import { toast } from "sonner";

export const useConnectRepository = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ owner, repo, githubId }: { owner: string, repo: string, githubId: number }) => {
            return connectRepository(owner, repo, githubId)
        },
        onSuccess: () => {
            toast.success("Repository has been connected successfully")
            queryClient.invalidateQueries({
                queryKey: ["repositories"]
            })
            queryClient.invalidateQueries({
                queryKey: ["connected-repositories"]
            })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
}