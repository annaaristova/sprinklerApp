# $ cd /path/to/getting-started-app
# $ docker build -t getting-started .

# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR ~

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the application code into the container
COPY server ./

EXPOSE 8000
# Specify the command to run your application
CMD ["node", "app.js"]