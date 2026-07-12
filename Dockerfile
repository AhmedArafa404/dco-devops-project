# ---- Stage 1: Build ----
# Install dependencies in a full node image (has all build tools if needed)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first to leverage Docker layer caching:
# dependencies only get reinstalled when package.json actually changes
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application source
COPY . .

# ---- Stage 2: Production ----
# Start from a clean, minimal image and copy only what's needed to run
FROM node:18-alpine AS production

WORKDIR /app

# Run as a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/metrics.js ./metrics.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

USER appuser

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Basic container-level health check (used by Docker/orchestrators)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "index.js"]
