// app/api/directory/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to safely access the `id`
    const { id: directoryId } = await context.params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the directory and its contents
    const directory = await prisma.directory.findUnique({
      where: { id: directoryId },
      include: {
        files: true,
        subdirs: true,
      },
    });

    if (!directory) {
      return NextResponse.json(
        { error: "Directory not found" },
        { status: 404 }
      );
    }

    // Ensure the directory belongs to the user
    if (directory.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      name : directory.name,
      files: directory.files,
      directories: directory.subdirs,
    });
  } catch (error) {
    console.error("Error fetching directory contents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
