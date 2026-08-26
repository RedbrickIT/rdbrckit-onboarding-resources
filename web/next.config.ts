import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Brand marks are SVGs and the hero is a static JPEG, both served straight
  // from /public via plain <img> tags — no remote image patterns needed.
  // Files uploaded to Strapi are linked for download rather than optimised,
  // so they don't need an entry here either.
};

export default nextConfig;
