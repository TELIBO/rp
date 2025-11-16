/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'onnxruntime-node': 'commonjs onnxruntime-node',
        '@xenova/transformers': 'commonjs @xenova/transformers',
        'canvas': 'commonjs canvas',
        'sharp': 'commonjs sharp'
      })
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      'mammoth',
      'natural',
      '@xenova/transformers',
      'onnxruntime-node'
    ]
  }
}

module.exports = nextConfig
