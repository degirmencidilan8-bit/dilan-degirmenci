import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every next/image is answered from the derivatives scripts/images.mjs
    // builds, not from the on-demand optimizer. See src/lib/image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // These two lists are the widths next/image puts in a srcset, and so
    // the widths it asks the loader for. They are the ladder the script
    // builds — keep them identical to WIDTHS in scripts/images.mjs, or the
    // srcset will advertise a width that was never made.
    deviceSizes: [640, 1024, 1600, 2400],
    imageSizes: [160, 320, 480],
  },
};

export default nextConfig;
