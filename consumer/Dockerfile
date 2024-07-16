# First stage: build the application
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Check directories (optional)
RUN echo "Checking /usr/src/app directory" && ls -la /usr/src/app
RUN echo "Checking /usr/src/app/dist directory" && ls -la /usr/src/app/dist || echo "Dist directory not found"

# Second stage: create the production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only necessary files from the build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm install --only=production

# Optional: Install bash if required
RUN apk add --no-cache bash

# Expose the application's port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main"]
