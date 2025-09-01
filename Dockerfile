# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# (Optional) match the lockfile's npm
RUN npm i -g npm@11.5.2

# 1) Nuke typical token/envs that trigger auth
ENV NPM_TOKEN=
ENV NODE_AUTH_TOKEN=
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

# 2) Point npm to an EMPTY user/global npmrc so it can't read injected configs
RUN printf '' > /tmp/empty-npmrc
ENV npm_config_userconfig=/tmp/empty-npmrc
ENV npm_config_globalconfig=/tmp/empty-npmrc

# 3) Also remove common npmrc files just in case (won't error if missing)
RUN rm -f /root/.npmrc /etc/npmrc /usr/local/etc/npmrc || true

# 4) (Optional) create a *local* .npmrc that only sets the public registry
#    Not strictly required because we already set NPM_CONFIG_REGISTRY
RUN printf 'registry=https://registry.npmjs.org/\n' > .npmrc

# -- DEBUG: show exactly what npm will use --
RUN echo "---- npm config (long) ----" \
 && npm config list -l \
 && echo "---- env (filtered) ----" \
 && env | sort | grep -E 'NPM|NODE_AUTH|^npm' || true \
 && echo "---- npmrc files (if any) ----" \
 && ( [ -f /root/.npmrc ] && echo '/root/.npmrc' && cat -n /root/.npmrc || echo 'no /root/.npmrc') \
 && ( [ -f /app/.npmrc ] && echo '/app/.npmrc'  && cat -n /app/.npmrc  || echo 'no /app/.npmrc')

# Copy manifests and install
COPY package*.json ./
RUN npm ci --audit=false --fund=false
