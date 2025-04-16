FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g nodemon ts-node
RUN npm install
RUN npm install --save-dev @types/node @types/express @types/mongoose @types/cors

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]
