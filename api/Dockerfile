FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Debug: Check the build output
RUN echo "Checking /usr/src/app directory" && ls -la /usr/src/app
RUN echo "Checking /usr/src/app/dist directory" && ls -la /usr/src/app/dist || echo "Dist directory not found"
RUN echo "Checking /usr/src/app/dist/src directory" && ls -la /usr/src/app/dist/src || echo "Dist/src directory not found"

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

RUN npm install --only=production

EXPOSE 5000

CMD ["node", "dist/main"]
