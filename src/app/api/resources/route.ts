import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ResourceModel from "@/models/Resource";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

// GET /api/resources?category=&status=&featured=&search=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") ?? "APPROVED";
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    // Admins can query any status; others are locked to APPROVED
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const payload = token ? verifyToken(token) : null;
    const isAdmin = payload?.role === "ADMIN";

    const filter: Record<string, unknown> = {};
    if (!isAdmin) filter.status = "APPROVED";
    else if (status) filter.status = status;
    if (category && category !== "All") filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (search)
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];

    const [resources, total] = await Promise.all([
      ResourceModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ResourceModel.countDocuments(filter),
    ]);

    const serialised = resources.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
      postedBy: r.postedBy.toString(),
    }));

    return NextResponse.json({ resources: serialised, total, page, limit });
  } catch (err) {
    console.error("[resources GET]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// POST /api/resources  (auth required)
export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const body = await req.json();
    const { title, description, url, category, tags, difficulty } = body;
    if (!title || !description || !url || !category) {
      return NextResponse.json(
        { error: "Required fields missing." },
        { status: 400 },
      );
    }

    await connectDB();

    const resource = await ResourceModel.create({
      title,
      description,
      url,
      category,
      tags: tags ?? [],
      difficulty: difficulty ?? "BEGINNER",
      postedBy: payload.userId,
      postedByName: body.postedByName ?? "Anonymous",
    });

    return NextResponse.json(
      { id: resource._id.toString(), ...resource.toObject() },
      { status: 201 },
    );
  } catch (err) {
    console.error("[resources POST]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
