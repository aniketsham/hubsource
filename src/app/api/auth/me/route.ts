import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization"));
    if (!token)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401 },
      );

    await connectDB();

    const user = await UserModel.findById(payload.userId);
    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      likes: user.likes,
      saves: user.saves,
      following: user.following ?? [],
      followers: user.followers ?? [],
      followersCount: (user.followers ?? []).length,
      followingCount: (user.following ?? []).length,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
