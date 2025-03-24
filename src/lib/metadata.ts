import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fetch metadata for all files in the database.
 */
export async function fetchFileMetadata(userId: string) {
    try {
        const metadata = await prisma.file.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                extension: true,
                fileUrl: true,
                createdAt: true,
            },
        });

        return metadata;
    } catch (error) {
        console.error("Error fetching metadata:", error);
        throw new Error("Failed to fetch metadata.");
    }
}