import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CommentModel from "@/models/Comment";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

type Params = { params: Promise<{ id: string; commentId: string }> };

// DELETE /api/resources/:id/comments/:commentId  (owner or admin)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { commentId } = await params;
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    await connectDB();
    const comment = await CommentModel.findById(commentId);
    if (!comment)
      return NextResponse.json({ error: "Not found." }, { status: 404 });

    const isOwner = comment.userId.toString() === payload.userId;
    const isAdmin = payload.role === "ADMIN";
    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    await comment.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[comment DELETE]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
