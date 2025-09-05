FROM node:20-alpine AS development-dependencies-env
COPY ./package.json ./package-lock.json* /app/
WORKDIR /app
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json ./package-lock.json* /app/
WORKDIR /app
RUN npm config set registry https://registry.npmjs.org/ \
  && npm config delete "//registry.npmjs.org/:_authToken" || true \
  && echo "using registry: $(npm config get registry)" \
  && npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
COPY ./package.json ./package-lock.json* /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./deploy-init.js /app/
WORKDIR /app

# Initialize database on container start (if needed)
# In production, the database initialization happens automatically via the database.server.ts

CMD ["npm", "run", "start"]