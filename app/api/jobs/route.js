import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("fleet_db");
    const jobs = await db.collection("jobs").find({}).sort({ date: -1 }).toArray();
    return NextResponse.json(jobs);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db("fleet_db");

    // Check Time (Rule 1 & 2)
    const arrivalHr = parseInt(data.arrival.split(':')[0]);
    const isLateOrEarly = (arrivalHr < 8 || arrivalHr >= 18);

    // Check Job Count (Rule 3)
    const countToday = await db.collection("jobs").countDocuments({
      tech: data.tech,
      date: data.date
    });

    // Determine Hour Type
    const hourType = (isLateOrEarly && countToday > 0) ? "After Hours" : "Regular";

    const jobRecord = { ...data, hourType, createdAt: new Date() };
    await db.collection("jobs").insertOne(jobRecord);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
