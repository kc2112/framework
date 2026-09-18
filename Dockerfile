FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund --workspaces
ENV NODE_ENV=production
ARG SERVICE=stage-1
ENV SERVICE=${SERVICE}
EXPOSE 3000 9229
CMD ["sh", "-c", "if [ \"$DEBUG\" = \"1\" ]; then exec node --inspect=0.0.0.0:9229 apps/${SERVICE}/src/server.js; else exec node apps/${SERVICE}/src/server.js; fi"]
