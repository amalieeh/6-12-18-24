# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# Optional: match the lockfile's npm
RUN npm i -g npm@11.5.2

# 1) Nuke any tokens
ENV NPM_TOKEN= \
    NODE_AUTH_TOKEN=

# 2) Give npm two *different* empty configs so it can't read injected npmrc
RUN printf '' > /tmp/empty-user-npmrc \
 && printf '' > /tmp/empty-global-npmrc
ENV npm_config_userconfig=/tmp/empty-user-npmrc
ENV npm_config_globalconfig=/tmp/empty-global-npmrc

# 3) Force the public registry (no auth)
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

# 4) Also remove common npmrc locations, just in case
RUN rm -f /root/.npmrc /etc/npmrc /usr/local/etc/npmrc || true

# 5) (Optional) local project npmrc with only the registry
RUN printf 'registry=https://registry.npmjs.org/\n' > .npmrc

# -- DEBUG: inspect what npm will use --
RUN echo "---- npm config (long) ----" \
 && npm config list -l || true \
 && echo "---- env (filtered) ----" \
 && env | sort | grep -E 'NPM|NODE_AUTH|^npm' || true \
 && echo "---- npmrc files ----" \
 && ( [ -f /root/.npmrc ] && echo '/root/.npmrc' && cat -n /root/.npmrc || echo 'no /root/.npmrc') \
 && ( [ -f /app/.npmrc ] && echo '/app/.npmrc'  && cat -n /app/.npmrc  || echo 'no /app/.npmrc') \
 && ( [ -f /tmp/empty-user-npmrc ] && echo '/tmp/empty-user-npmrc (user)' && wc -c /tmp/empty-user-npmrc ) \
 && ( [ -f /tmp/empty-global-npmrc ] && echo '/tmp/empty-global-npmrc (global)' && wc -c /tmp/empty-global-npmrc )

# Copy manifests and install
COPY package*.json ./
# You can also add --registry=... on the command to be extra explicit:
RUN npm ci --audit=false --fund=false --registry=https://registry.npmjs.org/
