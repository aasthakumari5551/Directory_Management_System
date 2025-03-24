// app/api/directory/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, directoryName } = await request.json();

    if (!userId || !directoryName) {
      return NextResponse.json(
        { error: "User ID and directory name are required" },
        { status: 400 }
      );
    }

    // Fetch the user and their root directory
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { rootDir: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.rootDirId) {
      return NextResponse.json(
        { error: "Root directory not found for the user" },
        { status: 404 }
      );
    }

    // Create the new directory under the root directory
    const newDirectory = await prisma.directory.create({
      data: {
        name: directoryName,
        userId: user.id,
        parentId: user.rootDirId, // Link the new directory to the root directory
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
