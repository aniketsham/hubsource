import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ResourceModel from "@/models/Resource";
import UserModel from "@/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

// POST /api/resources/:id/save  — toggles save
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
    const alreadySaved = user.saves.includes(resourceId);

    if (alreadySaved) {
      user.saves = user.saves.filter((id) => id !== resourceId);
      resource.savesCount = Math.max(0, resource.savesCount - 1);
    } else {
      user.saves.push(resourceId);
      resource.savesCount += 1;
    }

    await Promise.all([user.save(), resource.save()]);

    return NextResponse.json({
      saved: !alreadySaved,
      savesCount: resource.savesCount,
    });
  } catch (err) {
    console.error("[save]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
