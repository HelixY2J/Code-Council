"use client"
import React from 'react'
import { ActivityCalendar } from "react-activity-calendar"
import { useTheme } from 'next-themes'
import { getContributionStats } from '../actions'
import { useQuery } from '@tanstack/react-query'
const ContributionGraph = () => {


    const { resolvedTheme } = useTheme();

    const { data: contributionData, isLoading } = useQuery({
        queryKey: ["contribution-stats"],
        queryFn: () => getContributionStats(),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!contributionData || !contributionData.contributions.length) {
        return (
            <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                    <h3 className="text-lg font-medium tracking-tight">No contributions found</h3>
                </div>
            </div>
        )
    }
    return (
        <div className='w-full flex flex-col items-center gap-4 p-4 border rounded-xl bg-card text-card-foreground shadow-sm'>
            <div className="flex flex-col items-center gap-1">
                <span className="text-muted-foreground text-sm">Total Contributions</span>
                <span className="text-3xl font-bold">{contributionData.totalContributions}</span>
            </div>

            <div className='w-full overflow-x-auto'>
                <div className='flex justify-center min-w-max px-4 pb-2'>
                    <ActivityCalendar
                        data={contributionData.contributions}
                        colorScheme={resolvedTheme == "dark" ? "dark" : "light"}
                        blockSize={12}
                        blockMargin={4}
                        fontSize={12}
                        showWeekdayLabels={true}
                        showMonthLabels={true}
                        theme={{
                            light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
                            dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
                        }}
                    />
                </div>
            </div>

        </div>
    )
}

export default ContributionGraph