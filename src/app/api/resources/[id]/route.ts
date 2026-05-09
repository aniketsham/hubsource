import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ResourceModel from "@/models/Resource";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

type Params = { params: Promise<{ id: string }> };

// GET /api/resources/:id
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();
    const resource = await ResourceModel.findById(id).lean();
    if (!resource)
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({
      ...resource,
      id: resource._id.toString(),
      _id: undefined,
    });
  } catch (err) {
    console.error("[resource GET]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// PUT /api/resources/:id  (admin only — status, featured; owner — fields)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    await connectDB();
    const resource = await ResourceModel.findById(id);
    if (!resource)
      return NextResponse.json({ error: "Not found." }, { status: 404 });

    const isAdmin = payload.role === "ADMIN";
    const isOwner = resource.postedBy.toString() === payload.userId;
    if (!isAdmin && !isOwner)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const body = await req.json();
    const allowedAdminFields = ["status", "isFeatured"];
    const allowedOwnerFields = [
      "title",
      "description",
      "url",
      "category",
      "tags",
    ];
    const allowedFields = isAdmin
      ? [...allowedAdminFields, ...allowedOwnerFields]
      : allowedOwnerFields;

    for (const key of allowedFields) {
      if (key in body) resource[key] = body[key];
    }
    await resource.save();

    return NextResponse.json({
      ...resource.toObject(),
      id: resource._id.toString(),
      _id: undefined,
    });
  } catch (err) {
    console.error("[resource PUT]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// DELETE /api/resources/:id  (admin or owner)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    await connectDB();
    const resource = await ResourceModel.findById(id);
    if (!resource)
      return NextResponse.json({ error: "Not found." }, { status: 404 });

    const isAdmin = payload.role === "ADMIN";
    const isOwner = resource.postedBy.toString() === payload.userId;
    if (!isAdmin && !isOwner)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    await resource.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resource DELETE]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
