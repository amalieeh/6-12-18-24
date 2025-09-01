# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# Match lockfile npm (optional but good)
RUN npm i -g npm@11.5.2

# Force anonymous installs + clean any inherited auth/registry
ENV NPM_TOKEN=
ENV NODE_AUTH_TOKEN=
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_ALWAYS_AUTH=false

# Remove any npmrc that the platform might inject
RUN rm -f /root/.npmrc /etc/npmrc /usr/local/etc/npmrc || true

# Create a minimal project npmrc that only sets the public registry
RUN printf 'registry=https://registry.npmjs.org/\n' > .npmrc

COPY package*.json ./

RUN echo "---- npm config (long) ----" \
 && npm config list -l \
 && echo "---- env (filtered) ----" \
 && env | sort | grep -E 'NPM|NODE_AUTH|^npm' || true


RUN npm ci
