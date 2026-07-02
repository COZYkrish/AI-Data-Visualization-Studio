# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /workspace

# Install pnpm
RUN npm install -g pnpm

# Copy root configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/config/ ./packages/config/
COPY packages/types/ ./packages/types/
COPY packages/ui/ ./packages/ui/
COPY apps/frontend/package.json ./apps/frontend/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/frontend/ ./apps/frontend/

# Build application
RUN pnpm --filter @studio/ui build
RUN pnpm --filter @studio/frontend build

# --- Production Server Stage ---
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /workspace/apps/frontend/dist .

# Configure Nginx custom header and port routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Configure security for non-root execution
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx

USER nginx

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
