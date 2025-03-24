// app/api/root-dir/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Extract userId from headers
    const userId = request.headers.get("x-user-id");
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
      rootdir : user.rootDir.id,
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
