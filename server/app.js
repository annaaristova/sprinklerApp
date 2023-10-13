
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
scheduleDB.run("CREATE TABLE IF NOT EXISTS 'schedule' (id INTEGER PRIMARY KEY, time TEXT, duration INTEGER)");

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

      // Push an object containing time, duration, and index into the array
      timeAndDuration.push({"index": row.id, "time": row.time, "duration": row.duration});
    });

    // Render the Index page and pass the timeAndDuration data to it to display it in the table
    response.render( 'index', { timeAndDuration : timeAndDuration });
  });
});

// Check the data in the database every minute
setInterval(checkTime, 60000);

function checkTime(){
  var checkTimeQuery = "SELECT time, duration FROM schedule WHERE time=(?)";

  // Get the current time
  var date = new Date();
  var curTime = date.getHours() + ":" + date.getMinutes();

  // Check if the current time matches any time in the database
  scheduleDB.get(checkTimeQuery, curTime, function(err, row){
    if (err) {
      console.log(err.message);
    }
    else {
      if (row) {
        var duration = parseInt(row.duration);

        // Split the duration into two bytes
        var msb = duration >> 8;
        var lsb = duration & 0xFF;

        // Create a buffer to store binary data 
        const buf = Buffer.allocUnsafe(2);

        // Add binary data into the buffer
        buf.writeUInt8(lsb, 0);
        buf.writeUInt8(msb, 1);

        console.log("The time is " + row.time + " The sprinkler will water the plants for " + duration + " milliseconds");
        
        // Write 2 bytes into the file
        fs.writeFile('serial_port', buf, err => {
          if (err) {
            console.error(err);
          }
        });
      }
    } 
  });
};

setInterval(powerbankActivate, 5000);

function powerbankActivate(){
  var sendSignal = 5000;

  // Split the duration into two bytes
  var msb = sendSignal >> 8;
  var lsb = sendSignal & 0xFF;

  // Create a buffer to store binary data 
  const buf = Buffer.allocUnsafe(2);

  // Add binary data into the buffer
  buf.writeUInt8(lsb, 0);
  buf.writeUInt8(msb, 1);

  console.log(buf);
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