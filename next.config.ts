import type { NextConfig } from "next";

const nextConfig = { // Remova o tipo explícito aqui temporariamente
  output: 'standalone',
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  // Tente mover de volta para experimental se na raiz falhou
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  } as any, // O 'as any' evita que o build trave por erro de tipagem no config

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', port: '5097' },
    ],
  },
} satisfies NextConfig; // O 'satisfies' valida o resto sem quebrar no 'turbo'

export default nextConfig;