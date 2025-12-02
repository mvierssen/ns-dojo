import {createCompressionMiddleware} from "@ns-dojo/shared-hono";

/**
 * Response compression middleware
 *
 * Automatically compresses responses with gzip or deflate
 * Reduces bandwidth and improves response times
 *
 * Compression is applied based on:
 * - Accept-Encoding header from client
 * - Response size (skips very small responses)
 * - Content-Type (only compresses text-based content)
 *
 * For Node.js, this uses the built-in zlib module.
 */
export const compressionMiddleware = createCompressionMiddleware();
