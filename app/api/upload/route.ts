import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "dinedesk/avatars";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in request." },
        { status: 400 }
      );
    }

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary credentials missing in environment variables.",
        },
        { status: 500 }
      );
    }

    // 1. Generate UNIX timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // 2. Strict alphabetical signature parameters: folder -> timestamp
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    // 3. Prepare direct multipart upload form
    const cloudinaryBody = new FormData();
    cloudinaryBody.append("file", file);
    cloudinaryBody.append("api_key", apiKey);
    cloudinaryBody.append("timestamp", timestamp.toString());
    cloudinaryBody.append("folder", folder);
    cloudinaryBody.append("signature", signature);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryBody,
      }
    );

    const cloudinaryData = await cloudinaryRes.json();

    if (!cloudinaryRes.ok || !cloudinaryData?.secure_url) {
      console.error("Cloudinary API rejected upload:", cloudinaryData);
      return NextResponse.json(
        {
          success: false,
          error:
            cloudinaryData?.error?.message ||
            "Cloudinary rejected image upload.",
        },
        { status: cloudinaryRes.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      provider: "cloudinary",
      bytes: cloudinaryData.bytes,
      format: cloudinaryData.format,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process image upload",
      },
      { status: 500 }
    );
  }
}