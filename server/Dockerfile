FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

ENV NODE_ENV=production
ARG MONGO_URI
ARG JWT_SECRET
ARG CLIENT_ORIGIN
ENV MONGO_URI=${MONGO_URI}
ENV JWT_SECRET=${JWT_SECRET}
ENV CLIENT_ORIGIN=${CLIENT_ORIGIN}

EXPOSE 4000

CMD ["node", "src/index.js"]


