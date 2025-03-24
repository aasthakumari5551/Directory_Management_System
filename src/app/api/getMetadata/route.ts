import { NextResponse } from "next/server";
import { fetchFileMetadata } from "@/lib/metadata";
import { sendMetadataToGroqAI } from "@/lib/groqai";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required." }, { status: 400 });
        }

        // Fetch metadata from the database
        const metadata = await fetchFileMetadata(userId);

        // Send metadata to GroqAI for analysis
        const insights = await sendMetadataToGroqAI(metadata);

        return NextResponse.json({ success: true, metadata, insights }, { status: 200 });
    } catch (error) {
        console.error("Error in metadata API:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch metadata." }, { status: 500 });
    }
}