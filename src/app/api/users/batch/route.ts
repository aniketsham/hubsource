import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

// GET /api/users/batch?ids=id1,id2,...
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization") ?? "");
    if (!token)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });

    const ids = req.nextUrl.searchParams.get("ids") ?? "";
    const idList = ids.split(",").filter(Boolean);
    if (idList.length === 0) return NextResponse.json([]);

    await connectDB();

    const users = await UserModel.find({ _id: { $in: idList } }).lean();

    const result = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      bio: u.bio,
      followersCount: (u.followers ?? []).length,
      followingCount: (u.following ?? []).length,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[users/batch GET]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
