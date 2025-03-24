import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Client, Storage, ID } from "appwrite";

// Initialize Prisma client
const prisma = new PrismaClient();

// Configure Appwrite client
const appwriteClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(appwriteClient);

/**
 * Handles file upload to Appwrite bucket and saves metadata in the database.
 */
export async function POST(req: NextRequest) {
  try {
    // Extract data from request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is missing." },
        { status: 400 }
      );
    }

    // Step 1: Upload file to Appwrite bucket
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
    const appwriteResponse = await storage.createFile(
      bucketId, // Bucket ID
      ID.unique(), // Generate a unique ID for the file
      file // File object
    );

    // Get public file URL
    const fileUrl = storage.getFileView(bucketId, appwriteResponse.$id);

    // Step 2: Retrieve or create the user's root directory
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { rootDir: true }, // Include the root directory relation
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    let rootDir = user.rootDir;
    if (!rootDir) {
      // Create root directory if it doesn't exist
      rootDir = await prisma.directory.create({
        data: {
          name: "Root",
          userId: user.id,
        },
      });

      // Link root directory to the user
      await prisma.user.update({
        where: { id: user.id },
        data: { rootDirId: rootDir.id },
      });
    }

    // Step 3: Save file metadata in the database
    const fileMetadata = await prisma.file.create({
      data: {
        userId: user.id,
        dirId: rootDir.id,
        name: file.name,
        extension: file.name.split(".").pop() || "",
        fileUrl: fileUrl.toString(),
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully.",
      file: fileMetadata,
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while uploading the file.",
      },
      { status: 500 }
    );
  }
}
