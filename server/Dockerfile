FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

ENV NODE_ENV=production
ENV MONGO_URI=mongodb://127.0.0.1:27017/rms
ENV JWT_SECRET=dev_secret_change_me
ENV CLIENT_ORIGIN=http://localhost:5173

EXPOSE 4000

CMD ["node", "src/index.js"]


