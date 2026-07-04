import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ResourceModel from "@/models/Resource";
import UserModel from "@/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

// POST /api/resources/:id/like  — toggles like
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: resourceId } = await params;
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    await connectDB();

    const [resource, user] = await Promise.all([
      ResourceModel.findById(resourceId),
      UserModel.findById(payload.userId),
    ]);
    if (!resource || !user)
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    const alreadyLiked = user.likes.includes(resourceId);

    if (alreadyLiked) {
      user.likes = user.likes.filter((id) => id !== resourceId);
      resource.likesCount = Math.max(0, resource.likesCount - 1);
    } else {
      user.likes.push(resourceId);
      resource.likesCount += 1;
    }

    await Promise.all([user.save(), resource.save()]);

    return NextResponse.json({
      liked: !alreadyLiked,
      likesCount: resource.likesCount,
    });
  } catch (err) {
    console.error("[like]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
