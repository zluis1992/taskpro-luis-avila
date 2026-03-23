FROM node:20-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY
ENV NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY=$NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static

# When using standalone output, server.js is in .next/standalone/server.js
# and we copy the content of standalone to root.
# If Next.js nests the output because of project structure, we need to find where it is.
# Based on previous logs, let's try to copy everything from standalone and see.
COPY --from=build /app/.next/standalone ./

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is located in the root of the standalone folder
# We use a robust way to find and run it
CMD ["sh", "-c", "SERVER_JS=$(find . -name server.js | head -n 1); if [ -n \"$SERVER_JS\" ]; then node \"$SERVER_JS\"; else echo \"server.js not found\"; exit 1; fi"]
