
var express = require('express'); //import the Express.js framework
var app = express();  //create an instance of the Express application
var sqlite3 = require('sqlite3'); //import the sqlite3 module
var fs = require('fs');

/*setting middleware*/
//configure Express to parse URL-encoded data from incoming requests 
app.use(express.urlencoded({ extended: true }));
//configure Express to serve static files (such as HTML, CSS, JavaScript, images, etc.) 
//from the "public" folder
app.use(express.static(__dirname + '/public')); 

app.set('view engine', 'ejs');

//create a new SQLite database object named scheduleDB and opens the SQLite database file located at "db/schedule.db"
//It initializes a connection to this database
var scheduleDB = new sqlite3.Database("db/schedule.db");

scheduleDB.run("CREATE TABLE IF NOT EXISTS 'schedule' (id INTEGER PRIMARY KEY, time TEXT, duration INTEGER)");

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

setInterval(checkTime, 10000);

function checkTime(){
  var checkTimeQuery = "SELECT time, duration FROM schedule WHERE time=(?)";
  var date = new Date();
  var curTime = date.getHours() + ":" + date.getMinutes();
  scheduleDB.get(checkTimeQuery, curTime, function(err, row){
    if (err) {
      console.log(err.message);
    }
    else {
      if (row) {
        var duration = parseInt(row.duration);
        var msb = duration >> 8;
        var lsb = duration & 0xFF;

        const buf = Buffer.allocUnsafe(2);
        buf.writeUInt8(msb, 0);
        buf.writeUInt8(lsb, 1);
        console.log(buf);
        
        fs.writeFile('serial_port', buf, err => {
          if (err) {
            console.error(err);
          }
        });
      }
    } 
  });
};


//instruct the Express application to listen for incoming HTTP requests on port 8000 
app.listen(8000);

//scheduleDB.close();