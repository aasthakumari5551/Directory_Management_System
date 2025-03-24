// app/api/file/upload/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Client, Storage, ID } from "appwrite";

// Configure Appwrite client
const appwriteClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(appwriteClient);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const directoryId = formData.get("directoryId") as string;
    const userId = formData.get("userId") as string;

    // Input validation
    if (!file || !directoryId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "File, directory ID, and user ID are required.",
        },
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
    const fileUrl = storage
      .getFileView(bucketId, appwriteResponse.$id)
      .toString();

    // Step 2: Save file metadata in the database
    const newFile = await prisma.file.create({
      data: {
        name: file.name.split(".").slice(0, -1).join("."),
        extension: file.name.split(".").pop() || "",
        fileUrl: fileUrl,
        dirId: directoryId, // Directory ID provided in the request
        userId: userId, // User ID provided in the request
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully.",
      file: newFile,
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
