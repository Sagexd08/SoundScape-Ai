FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g typescript nodemon ts-node
RUN npm install
RUN npm install --save-dev @types/node @types/express @types/cors

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application in development mode
CMD ["node", "src/index.js"]
