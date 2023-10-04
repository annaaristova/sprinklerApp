# sprinklerApp
The Sprinkle app allows the user to create their own sprinkle that they can use to water plants at home. The user can choose the time when the sprinkler should work and the duration of watering. The project includes three parts: programming Arduino microcontroller, server-side settings and web interface.

To make this project interactive I created a web interface where a user can set up the time when the sprinkler should start watering the plants and for how long it should run. After the user presses the submit button. Time and duration should be added to the timetable which presents the SQLite database. 

To be able to process requests from the client-side, interact with databases, and generate dynamic content that is sent back to the client I set up Node js run-time environment with Express js framework. Inside my project folder I created app.js file with the following content:

```
var express = require('express'); //import the Express.js framework
var app = express();  //create an instance of the Express application

/*setting middleware*/
//configure Express to parse URL-encoded data from incoming requests 
app.use(express.urlencoded({ extended: true }));
//configure Express to serve static files (such as HTML, CSS, JavaScript, images, etc.) 
//from the "public" folder
app.use(express.static(__dirname + '/public')); 
```

To handle incoming HTTP requests from clients (e.g., web browsers) I added app.listen(8000) at the end of my app.js file. This line instructs the Express application to listen for incoming HTTP requests on port 8000 of the server where the application is running. 

```
//instruct the Express application to listen for incoming HTTP requests on port 8000 
app.listen(8000);
```

Inside my app.js file I created an SQLite database to store the time and duration. The user can add and delete data from the database.

```
//create a new SQLite database object named scheduleDB and open the SQLite database file located at "db/schedule.db"
//It initializes a connection to this database
var scheduleDB = new sqlite3.Database("db/schedule.db");

scheduleDB.run("CREATE TABLE IF NOT EXISTS 'schedule' (id INTEGER PRIMARY KEY, time TEXT, duration INTEGER)");
```
scheduleDB.run() command checks if the database exists and if not it creates a new one.

I used app.get() routing to handle GET request which is sent by the client when they want to open the web-page. When the app receives a request to to the home page route a callback function is called. Inside the callback function I create the response which presents the data from each row of the table (id, time and duration). 
```
app.get('/', function (request, response) {

  scheduleDB.all("SELECT * FROM schedule", function(err, rows) {  
    var timeAndDuration = [];

    rows.forEach(function (row) {
      if (err) {
        return console.log(err.message);
      }  
      timeAndDuration.push({"index": row.id, "time": row.time, "duration": row.duration});
    });
    console.log(timeAndDuration);
    response.render( 'index', { timeAndDuration : timeAndDuration });
  });
});
```

scheduleDB.all("SELECT * FROM schedule", function(err, rows)) retrieves all rows from the table.  If there is an error during this operation, it's passed as the err parameter. If the query is successful, the result rows are passed as the rows parameter.

To render the home page and send a rendered HTML I use response.render() method which takes 'index' argument as the file path to the file to render, and an object  whose properties define local variables for the view. In my case this object is timeAndDuration array inside which I push objects containing three properties: "index," "time," and "duration." 

I wanted to generate content dynamically. To to that I added the following command in my app.js file.

```
app.set('view engine', 'ejs');
```
The first argument in the set() method is the configuration setting I want to modify. In my case, it's the view engine. The second parameter specifies the view engine I want to use which is ejs template that allow me to render HTML content dynamically. 

Index.ejs file presents the copy of my index.html file with the modified table where I inserted JavaScript variable into the HTML table in order to generate the table dynamically based on data from the "timeAndDuration" array. If the user wants to add or delete a row it will also be displayed dynamically.

```
<div id="tableContainer">
    <table id="timeTable">
        <tr>
            <th>Time</th>
            <th>Duration</th>
            <th>Turn on/off</th>
            <th>Delete</th>
        </tr>
        <% timeAndDuration.forEach(function (item, i) {%>
        <tr>
            <td> <%=item.time%> </td>
            <td> <%=item.duration%> </td>
            <td> 
                <label class='switch'>
                    <input type='checkbox'>
                    <span class='slider round'></span>
                </label>
            </td>
            <td>
                <img src="images/delete.png" alt="Delete" class="deleteButton" id="buttonId-<%=item.index%>">
            </td>
        </tr>
        <%});%>
    </table>     
</div>
```


```
app.post('/add_time_to_table', function (request, response) {
  var time = request.body.time;
  var duration = request.body.duration;
  var insertQuery = "INSERT INTO schedule (time, duration) VALUES (strftime('%H:%M', (?)), (?))";
  var valuesArray = [time, duration];
  
  scheduleDB.run(insertQuery, valuesArray, function(err) {
    if (err) {
      return console.log(err.message);
    }
    var id = this.lastID;
    response.send(id.toString());
  });
});
```



```
var deleteButtonOnClick = function() {
                            
    // Get some values from elements on the page:
    var deleteRowBtn = $(this);
    var id = $(this).attr("id").slice(9);

    // Send the data using post
    $.post("/delete_row", {id : id}, 
        function(data, status, jqXHR){
        if (data == id) {
            $(deleteRowBtn).closest("tr").remove();
        }
        
        else {
            alert("An Error Occurred");
        }
    });
};
```

If the user clicked the delete image the row with the corresponding data should be deleted form the database and it also should be dynamically displayed on the web-page. To handle a POST request to delete a row from a database table I use app.post() routing. The application “listens” for requests that match the /delete_row' route, and when it detects a match, it calls a callback function. 

```
app.post('/delete_row', function (request, response) {
  //retrieves the value of the 'id' field that needs to be deleted from the request body  
  var id = request.body.id;

  //SQL query to delete a row from the 'schedule' table
  var deleteQuery = "DELETE FROM schedule WHERE id=(?)";

  scheduleDB.run(deleteQuery, id, function(err) {
    if (err){
      return console.log(err.message);
    }
    console.log(id);
  });

  response.send(id);
});
```

To execute DELETE statement I use the run() method inside the callback function. Here, it executes the SQL DELETE query. It provides the 'id' as the value to replace the placeholder (?) in the query. The callback function checks if there was an error during the execution of the DELETE query.


















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



# server 
I created a linux container for my app. Containers can be used in different environments, it is easier to implement changes when you have an image with all the settings and it by looking at the image I can easily remember all the steps I need to do to set up a container for my app. 

Inside my project folder I created a dockerfile which presents the image of the container. 

img!

To create a container image for my my Node js app I followed the steps mentioned on Node js official website:
https://nodejs.org/en/docs/guides/nodejs-docker-webapp

```
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
```

After I created the image I used shell commands to built the image and than run it.

```
docker build -t sprinkle-app .
docker run -p 8000:8000 -it sprinkle-app
```


