import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

// POST /api/users/[id]/follow  — toggle follow/unfollow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization") ?? "");
    if (!token)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });

    const { id: targetId } = await params;

    if (payload.userId === targetId)
      return NextResponse.json(
        { error: "You cannot follow yourself." },
        { status: 400 },
      );

    await connectDB();

    const [me, target] = await Promise.all([
      UserModel.findById(payload.userId),
      UserModel.findById(targetId),
    ]);

    if (!me || !target)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    const myFollowing: string[] = me.following ?? [];
    const isFollowing = myFollowing.includes(targetId);

    if (isFollowing) {
      // Unfollow
      await Promise.all([
        UserModel.findByIdAndUpdate(payload.userId, {
          $pull: { following: targetId },
        }),
        UserModel.findByIdAndUpdate(targetId, {
          $pull: { followers: payload.userId },
        }),
      ]);
    } else {
      // Follow
      await Promise.all([
        UserModel.findByIdAndUpdate(payload.userId, {
          $addToSet: { following: targetId },
        }),
        UserModel.findByIdAndUpdate(targetId, {
          $addToSet: { followers: payload.userId },
        }),
      ]);
    }

    const updated = await UserModel.findById(targetId).lean();
    return NextResponse.json({
      following: !isFollowing,
      followersCount: (updated?.followers ?? []).length,
    });
  } catch (err) {
    console.error("[users/[id]/follow POST]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
