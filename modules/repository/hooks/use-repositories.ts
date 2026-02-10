"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { getRepositories } from "../actions"

export const useRepositories = () => {
    return useInfiniteQuery({
        queryKey: ["repositories"],
        queryFn: async ({ pageParam = 1 }) => await getRepositories(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 10) {
                return null
            }
            return allPages.length + 1
        }
    })
}