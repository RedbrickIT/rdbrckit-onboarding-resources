import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation webhook.
 *
 * Point a Strapi webhook at POST /api/revalidate so publishing a change
 * refreshes the site immediately instead of waiting out the 60s window.
 * Send the shared secret either as `Authorization: Bearer <secret>` or as an
 * `x-revalidate-secret` header.
 *
 * Returns 404 while REVALIDATE_SECRET is unset, so an unconfigured deployment
 * doesn't expose an open revalidation endpoint.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  // Compare lengths first so the constant-time compare below never throws on
  // mismatched buffer sizes.
  const expected = Buffer.from(secret);
  const actual = Buffer.from(provided);
  const authorized =
    expected.length === actual.length &&
    (await import("node:crypto")).timingSafeEqual(expected, actual);

  if (!authorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // `{ expire: 0 }` purges immediately rather than allowing a stale window —
  // the point of the webhook is that a publish shows up right away.
  revalidateTag("resource-sections", { expire: 0 });

  return NextResponse.json({ revalidated: true });
}
