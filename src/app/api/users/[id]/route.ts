import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    const user = await UserModel.findById(id).lean();
    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      followersCount: (user.followers ?? []).length,
      followingCount: (user.following ?? []).length,
      createdAt: (user.createdAt as Date).toISOString(),
    });
  } catch (err) {
    console.error("[users/[id] GET]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
