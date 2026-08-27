import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Brand marks are SVGs and the hero is a static JPEG, both served straight
  // from /public via plain <img> tags — no remote image patterns needed.
  // Files uploaded through the admin are linked for download rather than
  // optimised, so they don't need an entry here either.
};

// withPayload mounts the admin panel and Payload's API into the App Router
// and teaches the bundler about Payload's server-only dependencies.
export default withPayload(nextConfig, { devBundleServerPackages: false });
