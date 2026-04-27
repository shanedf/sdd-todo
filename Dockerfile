# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy backend production dependencies
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy built artifacts
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create data directory for SQLite and set ownership
RUN mkdir -p /app/data && chown -R node:node /app/data

EXPOSE 3000

USER node
CMD ["node", "backend/dist/server.js"]
