
# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /root

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the application code into the container
COPY server ./

EXPOSE 8000
# Specify the command to run your application
CMD ["node", "app.js"]

#docker run -p 8000:8000 -e TZ=America/Los_Angeles -mount type=bind, source="$(pwd)"/serial_port, target=/serial_port sprinkle-app