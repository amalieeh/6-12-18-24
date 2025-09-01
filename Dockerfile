# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# Make npm version match your lockfile, optional:
RUN npm i -g npm@11.5.2

# ⛏️ Force anon installs & delete any injected token/always-auth
ENV NPM_TOKEN= \
    NODE_AUTH_TOKEN=
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config delete '//registry.npmjs.org/:_authToken' || true \
 && npm config delete '@*:registry' || true \
 && npm config set always-auth false

COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["npm", "start"]
