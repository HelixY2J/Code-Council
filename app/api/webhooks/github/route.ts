import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event")
        console.log(`got github event:, ${event}`)
        if (event == "ping") return NextResponse.json({ message: "PONG" }, { status: 200 })

        return NextResponse.json({ message: "Event processed" }, { status: 200 })
    } catch (error) {
        console.error("Failed to process webhook", error)
        return NextResponse.json({ message: "Failed to process webhook" }, { status: 500 })
    }
}