# Use an official Node.js image for building
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .
COPY .env .env

# Build the frontend
RUN npm run build

# Use a lightweight web server to serve the built files
FROM nginx:stable-alpine

# Copy build output to nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]