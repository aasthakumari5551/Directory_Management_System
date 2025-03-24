import { NextResponse } from "next/server";
import admin from "../../../../firebase/fireBaseAdmin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to extract error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export async function POST(req: Request) {
  try {
    console.log("Starting /api/auth POST request...");

    // Validate Content-Type header
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid Content-Type header:", contentType);
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected application/json." },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Parsed request body:", body);
    } catch (parseError) {
      console.error(
        "Failed to parse request body:",
        getErrorMessage(parseError)
      );
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { token, name, image } = body;

    // Validate required fields
    if (!token || !name || !image) {
      console.error("Missing required fields in request body:", {
        token,
        name,
        image,
      });
      return NextResponse.json(
        { error: "Missing required fields: token, name, or image" },
        { status: 400 }
      );
    }

    console.log("Verifying Firebase token...");
    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Decoded Firebase token:", decodedToken);
    } catch (firebaseError) {
      console.error("Firebase auth error:", getErrorMessage(firebaseError));
      if (
        firebaseError instanceof Error &&
        firebaseError.message.includes("id-token-expired")
      ) {
        return NextResponse.json({ error: "Token expired" }, { status: 401 });
      }
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { uid, email } = decodedToken;
    console.log("Extracted UID and email from decoded token:", { uid, email });

    // Handle user creation and root directory in a transaction
    console.log("Creating/updating user and checking root directory...");
    let user;
    try {
      // Use a transaction to ensure data consistency
      user = await prisma.$transaction(async (tx) => {
        // First check if the user already exists
        const existingUser = await tx.user.findUnique({
          where: { id: uid },
          include: { rootDir: true },
        });

        if (existingUser) {
          // User exists, just update the name
          const updatedUser = await tx.user.update({
            where: { id: uid },
            data: { name },
            include: { rootDir: true },
          });

          // If user doesn't have a root directory yet, create one
          if (!updatedUser.rootDir) {
            const rootDir = await tx.directory.create({
              data: {
                name: "Root Directory",
                userId: uid,
              },
            });

            // Update user with root directory reference
            return await tx.user.update({
              where: { id: uid },
              data: { rootDirId: rootDir.id },
              include: { rootDir: true },
            });
          }

          return updatedUser;
        } else {
          // User does not exist, create user first
          const newUser = await tx.user.create({
            data: {
              id: uid,
              email: email ?? "unknown@example.com",
              name,
            },
          });

          // Then create the root directory
          const rootDir = await tx.directory.create({
            data: {
              name: "Root Directory",
              userId: uid,
            },
          });

          // Update user with root directory reference
          return await tx.user.update({
            where: { id: uid },
            data: { rootDirId: rootDir.id },
            include: { rootDir: true },
          });
        }
      });

      console.log("User and root directory handled successfully:", user);
    } catch (prismaError) {
      console.error(
        "Prisma error during transaction:",
        getErrorMessage(prismaError)
      );
      return NextResponse.json(
        { error: "Database error", details: getErrorMessage(prismaError) },
        { status: 500 }
      );
    }

    console.log("Returning successful response...");
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", getErrorMessage(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
