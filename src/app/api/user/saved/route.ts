import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
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
    const user = await UserModel.findById(payload.userId).lean();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const saves: string[] = (user as { saves?: string[] }).saves ?? [];
    if (saves.length === 0) return NextResponse.json([]);

    const resources = await ResourceModel.find({ _id: { $in: saves } }).lean();

    const serialised = resources.map((r) => ({
      id: (r._id as { toString(): string }).toString(),
      title: r.title,
      description: r.description,
      url: r.url,
      thumbnail: r.thumbnail,
      category: r.category,
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
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
