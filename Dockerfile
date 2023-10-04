
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

#docker run -p 8000:8000 -e TZ=America/Los_Angeles -v C:\Users\Anna\Documents\sprinklerApp\serial_port:/root/serial_port  -v C:\Users\Anna\Documents\sprinklerApp\server\db\schedule.db:/root/db/schedule.db -it sprinkle-app