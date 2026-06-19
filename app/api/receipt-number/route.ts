import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function GET() {
  try {
    let num = await redis.get<number>("receipt_counter");
    if (!num) num = 713;

    const prefix = "REC/DIG/";
    const nextNumber = `${prefix}${String(num).padStart(3, "0")}`;
    
    return NextResponse.json({ 
      success: true, 
      receiptNumber: nextNumber,
      rawNumber: num
    });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch receipt number" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { currentNumber } = body;

    let num = 714;
    let prefix = "REC/DIG/";
    let padLength = 3;

    if (currentNumber) {
      // Parse custom formatting if provided
      const match = currentNumber.match(/^(.*?)(\d+)$/);
      if (match) {
        prefix = match[1];
        const numStr = match[2];
        padLength = numStr.length;
        num = parseInt(numStr, 10) + 1;
        
        // Update global counter to match this new manually entered number
        await redis.set("receipt_counter", num);
      } else {
        // Fallback: just increment global
        num = await redis.incr("receipt_counter");
      }
    } else {
      // Increment global counter
      num = await redis.incr("receipt_counter");
      
      // Initialize if it's the first run
      if (num === 1) {
        num = 714;
        await redis.set("receipt_counter", num);
      }
    }

    const nextNumber = `${prefix}${String(num).padStart(padLength, "0")}`;
    
    return NextResponse.json({ 
      success: true, 
      receiptNumber: nextNumber,
      rawNumber: num
    });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate receipt number" },
      { status: 500 }
    );
  }
}
