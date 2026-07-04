import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ResourceModel from "@/models/Resource";
import { getTokenFromHeader, verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization") ?? "");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();

    const resources = await ResourceModel.find({ postedBy: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    const serialised = resources.map((r) => ({
      id: (r._id as { toString(): string }).toString(),
      title: r.title,
      description: r.description,
      url: r.url,
      thumbnail: r.thumbnail,
      category: r.category,
      difficulty: r.difficulty,
      tags: r.tags,
      postedBy: r.postedBy?.toString() ?? "",
      postedByName: r.postedByName,
      status: r.status,
      isFeatured: r.isFeatured,
      likesCount: r.likesCount,
      savesCount: r.savesCount,
      createdAt: (r.createdAt as Date).toISOString(),
      updatedAt: (r.updatedAt as Date).toISOString(),
    }));

    return NextResponse.json(serialised);
  } catch (err) {
    console.error("[user/submissions GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
