var express = require('express'); //import the Express.js framework
var app = express();  //create an instance of the Express application
var sqlite3 = require('sqlite3'); //import the sqlite3 module
var fs = require('fs');

/* Setting middleware*/
// Configure Express to parse URL-encoded data from incoming requests 
app.use(express.urlencoded({ extended: true }));
// Configure Express to serve static files (such as HTML, CSS, JavaScript, images, etc.) 
// from the "public" folder
app.use(express.static(__dirname + '/public')); 

app.set('view engine', 'ejs');

// Initialize a connection to the database
var scheduleDB = new sqlite3.Database("db/schedule.db");

// Check if the database exists, if not it create a new one
scheduleDB.run("CREATE TABLE IF NOT EXISTS 'schedule' (id INTEGER PRIMARY KEY, time TEXT, duration INTEGER, lastRunTime INTEGER)");

app.post('/add_time_to_table', function (request, response) {

  // Retrieve time and duration from the request body 
  var time = request.body.time;
  var duration = request.body.duration;

  var insertQuery = "INSERT INTO schedule (time, duration) VALUES (strftime('%H:%M', (?)), (?))";
  var valuesArray = [time, duration];
  
  // Add a new row to the database with the time and duration values
  scheduleDB.run(insertQuery, valuesArray, function(err) {
    if (err) {
      return console.log(err.message);
    }
    // Retrieve the row id and send it inside the response body 
    var id = this.lastID;
    response.send(id.toString());
  });
});

app.post('/delete_row', function (request, response) {
  // Retrieve the value of the 'id' field that needs to be deleted from the request body  
  var id = request.body.id;

  var deleteQuery = "DELETE FROM schedule WHERE id=(?)";

  // Delete the row that has the id value
  scheduleDB.run(deleteQuery, id, function(err) {
    if (err){
      return console.log(err.message);
    }
  });

  response.send(id);
});

app.get('/', function (request, response) {

  scheduleDB.all("SELECT * FROM schedule", function(err, rows) {  
    var timeAndDuration = [];

    rows.forEach(function (row) {
      if (err) {
        return console.log(err.message);
      } 

      time = row.time.split(":")
      var hours = time[0];
      var minutes = time[1];
      var newformat = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      hours = hours < 10 ? '0' + hours : hours;
      var setTime = hours + ":" + minutes + " " + newformat;

      // Push an object containing time, duration, and index into the array
      timeAndDuration.push({"index": row.id, "time": setTime, "duration": row.duration});
    });

    // Render the Index page and pass the timeAndDuration data to it to display it in the table
    response.render( 'index', { timeAndDuration : timeAndDuration });
  });
});

app.post('/start_sprinkler', function (request, response) {
  
  var duration = request.body.duration;
  var date = new Date();
  var curDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  var curTime = ('0'+ date.getHours()).slice(-2) + ":" + ('0'+ date.getMinutes()).slice(-2);
  sendSignal(duration, curDate, curTime);

  response.send("The sprinkler is running");
});

// Check the data in the database every minute
setInterval(checkTime, 5000);

function checkTime(){
  var checkTimeQuery = "SELECT time, duration, lastRunTime, id FROM schedule WHERE time=(?)";
  var addLastRunTime = "UPDATE schedule SET lastRunTime=(?) WHERE id=(?)";

  // Get the current time
  var date = new Date();
  var curDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  var curTime = ('0'+ date.getHours()).slice(-2) + ":" + ('0'+ date.getMinutes()).slice(-2);
  var day = date.getDate();

  // Check if the current time matches any time in the database
  scheduleDB.get(checkTimeQuery, curTime, function(err, row){
    if (err) {
      console.log(err.message);
    }
    else {
      if (row) {
        if (row.lastRunTime != day){
          
          var insertData = [day, row.id];

          var duration = parseInt(row.duration);

          sendSignal(duration, curDate, curTime);

          scheduleDB.run(addLastRunTime, insertData, function(err) {
            if (err){
              return console.log(err.message);
            }
          });
        }
      }
    } 
  });
};

function sendSignal(duration, curDate, curTime){
  // Split the duration into two bytes
  var msb = duration >> 8;
  var lsb = duration & 0xFF;

  // Create a buffer to store binary data 
  const buf = Buffer.allocUnsafe(2);

  // Add binary data into the buffer
  buf.writeUInt8(lsb, 0);
  buf.writeUInt8(msb, 1);

  console.log("Current date is " + curDate + ". Current time is " + curTime + ". The sprinkler will water the plants for " + duration + " milliseconds.");
  
  // Write 2 bytes into the file
  fs.writeFile('serial_port', buf, err => {
    if (err) {
      console.error(err);
    }
  });
}

//instruct the Express application to listen for incoming HTTP requests on port 8000 
app.listen(8000);

//scheduleDB.close();