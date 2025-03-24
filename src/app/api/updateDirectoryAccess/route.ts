import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { directoryId } = await req.json();

    if (!directoryId) {
      return new Response(JSON.stringify({ error: "Directory ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.directory.update({
      where: { id: directoryId },
      data: { accessCount: { increment: 1 } },
    });

    return new Response(JSON.stringify({ message: "Access count updated" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update access count" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}