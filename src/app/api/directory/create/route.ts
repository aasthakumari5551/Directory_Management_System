// app/api/directory/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { parentId, name } = await request.json();

    if (!parentId || !name) {
      return NextResponse.json(
        { error: "Parent directory ID and directory name are required" },
        { status: 400 }
      );
    }

    // Fetch the parent directory to ensure it exists
    const parentDirectory = await prisma.directory.findUnique({
      where: { id: parentId },
    });

    if (!parentDirectory) {
      return NextResponse.json(
        { error: "Parent directory not found" },
        { status: 404 }
      );
    }

    // Create the new subdirectory
    const newDirectory = await prisma.directory.create({
      data: {
        name,
        userId: parentDirectory.userId, // Inherit the user ID from the parent directory
        parentId: parentId, // Link the new directory to the parent directory
      },
    });

    return NextResponse.json({ success: true, directory: newDirectory });
  } catch (error) {
    console.error("Error creating directory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
