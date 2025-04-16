# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install -g nodemon ts-node
RUN npm install
RUN npm install --save-dev @types/node @types/express @types/cors

# Copy the rest of the application code
COPY . .

# Make port 5002 available to the world outside this container
EXPOSE 5002

# Define environment variable
ENV NODE_ENV=development

# Run the app when the container launches
CMD [ "npm", "run", "dev" ]