import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CommentModel from "@/models/Comment";
import ResourceModel from "@/models/Resource";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

type Params = { params: Promise<{ id: string }> };

type SerialisedComment = {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  resourceId: string;
  parentId: string | null;
  createdAt: string;
  replies: SerialisedComment[];
};

function serialise(
  c: InstanceType<typeof CommentModel> | Record<string, unknown>,
  replies: SerialisedComment[] = [],
): SerialisedComment {
  return {
    id: (c._id as { toString(): string }).toString(),
    content: c.content as string,
    userId: (c.userId as { toString(): string }).toString(),
    userName: c.userName as string,
    userAvatar: c.userAvatar as string | undefined,
    resourceId: (c.resourceId as { toString(): string }).toString(),
    parentId: c.parentId
      ? (c.parentId as { toString(): string }).toString()
      : null,
    createdAt:
      c.createdAt instanceof Date
        ? c.createdAt.toISOString()
        : String(c.createdAt),
    replies,
  };
}

// GET /api/resources/:id/comments  — returns threaded (top-level + one level of replies)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();

    // Fetch all comments for the resource
    const all = await CommentModel.find({ resourceId: id })
      .sort({ createdAt: 1 })
      .lean();

    // Build map for O(1) lookup
    const byId = new Map(all.map((c) => [c._id.toString(), c]));

    // Group replies under parents
    const topLevel: typeof all = [];
    const repliesMap = new Map<string, typeof all>();

    for (const c of all) {
      const pid = c.parentId?.toString() ?? null;
      if (!pid || !byId.has(pid)) {
        topLevel.push(c);
      } else {
        if (!repliesMap.has(pid)) repliesMap.set(pid, []);
        repliesMap.get(pid)!.push(c);
      }
    }

    // Serialise top-level newest-first, replies oldest-first (already sorted asc)
    const result = topLevel
      .slice()
      .reverse()
      .map((c) => {
        const cid = c._id.toString();
        const replies = (repliesMap.get(cid) ?? []).map((r) =>
          serialise(r as unknown as Record<string, unknown>),
        );
        return serialise(c as unknown as Record<string, unknown>, replies);
      });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[comments GET]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// POST /api/resources/:id/comments  (auth required)
// Body: { content: string, parentId?: string }
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getTokenFromHeader(req.headers.get("authorization"));
    const payload = token ? verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const { content, parentId } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 },
      );
    }

    await connectDB();

    const resource = await ResourceModel.findById(id);
    if (!resource)
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 },
      );

    // Validate parentId depth — only allow 1 level of nesting
    if (parentId) {
      const parent = await CommentModel.findById(parentId);
      if (!parent)
        return NextResponse.json(
          { error: "Parent comment not found." },
          { status: 404 },
        );
      if (parent.parentId)
        return NextResponse.json(
          { error: "Replies can only be one level deep." },
          { status: 400 },
        );
    }

    const comment = await CommentModel.create({
      content: content.trim(),
      userId: payload.userId,
      userName: payload.email.split("@")[0],
      resourceId: id,
      parentId: parentId ?? null,
    });

    const { default: UserModel } = await import("@/models/User");
    const user = await UserModel.findById(payload.userId);
    if (user) {
      comment.userName = user.name;
      comment.userAvatar = user.avatar;
      await comment.save();
    }

    return NextResponse.json(
      serialise(comment as unknown as Record<string, unknown>),
      { status: 201 },
    );
  } catch (err) {
    console.error("[comments POST]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
