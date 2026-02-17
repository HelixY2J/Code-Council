import { reviewPullRequest } from "@/modules/ai/action";
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event")
        console.log(`got github event:, ${event}`)
        if (event == "ping") return NextResponse.json({ message: "PONG" }, { status: 200 })

        if (event == "pull_request") {
            const action = body.action;
            const repo = body.repository.full_name;
            const prNumber = body.pull_request.number;

            const [owner, repoName] = repo.split("/");
            reviewPullRequest(owner, repoName, prNumber)
                .then(() => console.log(`PR review completed for ${repo} #${prNumber}`))
                .catch((error) => console.error(`Review failed for ${repo} #${prNumber}`, error))
        }
        return NextResponse.json({ message: "Event processed" }, { status: 200 })
    } catch (error) {
        console.error("Failed to process webhook", error)
        return NextResponse.json({ message: "Failed to process webhook" }, { status: 500 })
    }
}