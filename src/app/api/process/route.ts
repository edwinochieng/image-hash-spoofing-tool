import { type NextRequest } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const hashPrefix = formData.get("hashPrefix") as string;
  try {
    if (!file || !hashPrefix) {
      return Response.json({ error: "File and hashPrefix are required." });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const originalHash = crypto
      .createHash("sha512")
      .update(fileBuffer)
      .digest("hex");

    // Modify the image to achieve the desired hash prefix
    let modifiedBuffer = fileBuffer;
    let modifiedHash = "";
    for (let i = 0; i < 1000; i++) {
      // Modify the buffer by appending a random byte to it
      modifiedBuffer = Buffer.concat([modifiedBuffer, crypto.randomBytes(1)]);

      modifiedHash = crypto
        .createHash("sha512")
        .update(modifiedBuffer)
        .digest("hex");

      if (modifiedHash.startsWith(hashPrefix)) {
        break;
      }
    }

    // Save the modified image to disk
    const modifiedFilename = `modified_${Date.now()}.png`;
    const outputPath = path.join(process.cwd(), "public", modifiedFilename);
    fs.writeFileSync(outputPath, modifiedBuffer);

    return Response.json({
      originalHash,
      modifiedHash,
      modifiedImageUrl: `/public/${modifiedFilename}`,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return Response.json({ error: "Internal server error." });
  }
}
