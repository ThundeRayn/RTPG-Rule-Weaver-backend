# Use an official, lightweight Node.js image as the base.
# This ensures all necessary runtime components are present.
FROM node:20-slim

# Create a working directory inside the container.
# All subsequent commands will run from this directory.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if present) files.
# We do this first so Docker can cache the 'npm install' step.
COPY package*.json ./

# Install all dependencies (omitting 'devDependencies' to keep the image small).
RUN npm install --omit=dev

# Copy the rest of your application source code into the container.
# This includes index.js and your .gitignore (which is fine).
COPY . .

# Cloud Run expects the application to listen on the PORT environment variable.
# Your index.js already handles this, but it's good practice to set a default.
# We don't need EXPOSE here, as Cloud Run manages port mapping.

# Define the command to run when the container starts.
# This launches your Node.js application.
CMD [ "node", "index.js" ]