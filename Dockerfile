# ---- deps (installs with full dev deps so the build can run) ----
FROM node:20-alpine AS deps
WORKDIR /app
# align npm with your lockfile if needed
RUN npm i -g npm@11.5.2
COPY package*.json ./
RUN npm ci

# ---- build (runs the actual build) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# your build command (change if your package.json uses something else)
RUN npm run build

# ---- runtime (only production deps + built assets) ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# copy node_modules then prune dev deps out
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev
# copy the build output (adjust paths to your template’s output)
COPY --from=build /app/build ./build
# expose and start (adjust to your start script/entrypoint)
EXPOSE 3000
CMD ["npm", "start"]
