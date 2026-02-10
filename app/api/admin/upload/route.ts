import { requireAdmin } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/api/http";

function cloudinarySignature(params: Record<string, string>, secret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const crypto = require("crypto") as typeof import("crypto");
  return crypto.createHash("sha1").update(`${sorted}${secret}`).digest("hex");
}

export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud || !key || !secret) {
    return fail("Cloudinary env vars не настроены", 500);
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "aidagis/events";
  const signature = cloudinarySignature({ folder, timestamp }, secret);

  return ok({
    cloudName: cloud,
    apiKey: key,
    timestamp,
    folder,
    signature
  });
}