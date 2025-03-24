import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const directory = await prisma.directory.findFirst({
      orderBy: { accessCount: "desc" },
    });

    return NextResponse.json({ directory });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch directory" },
      { status: 500 }
    );
  }
}