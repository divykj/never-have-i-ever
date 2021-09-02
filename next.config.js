const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  assetPrefix:
    process.env.NODE_ENV === "production" ? "/never-have-i-ever/" : "",
});
