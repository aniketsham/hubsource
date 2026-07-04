import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ResourceModel from "@/models/Resource";

export async function GET() {
  try {
    await connectDB();

    const results = await ResourceModel.aggregate([
      { $match: { status: "APPROVED" } },
      {
        $group: {
          _id: "$postedBy",
          postedByName: { $first: "$postedByName" },
          submissionsCount: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" },
          totalSaves: { $sum: "$savesCount" },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$totalLikes", 3] },
              { $multiply: ["$submissionsCount", 5] },
              "$totalSaves",
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          userId: { $toString: "$_id" },
          postedByName: 1,
          submissionsCount: 1,
          totalLikes: 1,
          totalSaves: 1,
          score: 1,
        },
      },
    ]);

    return NextResponse.json(results);
  } catch (err) {
    console.error("[leaderboard GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
