# Use the official Node.js image.
FROM node:16

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code to the container image.
COPY . .

# Make port configurable with an environment variable, defaulting to 3000.
ENV PORT 3000

# Expose the port the app runs on.
EXPOSE $PORT

# Run the web service on container startup.
CMD [ "node", "server.js" ]
