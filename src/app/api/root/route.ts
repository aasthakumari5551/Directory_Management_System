// app/api/root-directory/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import your Prisma client instance

export async function GET(request: Request) {
  try {
    // Extract user ID from the session (assuming you're using authentication middleware)
    const userId = request.headers.get("x-user-id"); // Replace with your actual auth logic
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the root directory for the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rootDir: {
          include: {
            files: true,
            subdirs: true,
          },
        },
      },
    });

    if (!user || !user.rootDir) {
      return NextResponse.json(
        { error: "Root directory not found" },
        { status: 404 }
      );
    }

    // Return the root directory contents
    return NextResponse.json({
      files: user.rootDir.files,
      directories: user.rootDir.subdirs,
    });
  } catch (error) {
    console.error("Error fetching root directory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
