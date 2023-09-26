# sprinklerApp
The Sprinkle app allows the user to create their own sprinkle that they can use to water plants at home. The user can choose the time when the sprinkler should work and the duration of watering. The project includes three parts: programming Arduino microcontroller, server-side settings and web interface.

To make this project interactive I created a web interface where a user can set up the time when the sprinkler should start watering the plants and for how long it should run. After the user presses the submit button. Time and duration should be added to the timetable which presents the SQLite database. 


To handle database operations and make HTTP requests and responses in my web application I needed to create a run time environment. To do that I created app.js file inside of which I set up a Node.js application using the Express.js framework and configured middleware for the application.

![image](https://github.com/annaaristova/sprinklerApp/assets/117958582/41a998ee-ca18-440e-9342-3985cbff3af7)

To handle incoming HTTP requests from clients (e.g., web browsers) I added app.listen(8000) at the end of my app.js file. This line instructs the Express application to listen for incoming HTTP requests on port 8000 of the server where the application is running. 

![image](https://github.com/annaaristova/sprinklerApp/assets/117958582/372d684f-fba8-4b67-8f0e-f25ed0413267)



First, I created a web interface where the user can set up the time and timer for the sprinkler. 

Web interface:
1. Developing the web interface with HTML and CSS
2. Applying ejs template to make a responsive web interface 

Server-side settings:
1. Building of the Node js server 
2. Creating a docker container

Technologies Used:
Node js
Express js
Docker containers
SQLite database



