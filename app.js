var express = require('express');
var app = express();
var sqlite3 = require('sqlite3');

//setting middleware
app.use(express.static(__dirname + '/public')); //Serves resources from public folder
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

var scheduleDB = new sqlite3.Database("db/schedule.db");

scheduleDB.run("CREATE TABLE IF NOT EXISTS 'schedule' (id INTEGER PRIMARY KEY, time STRING, duration INTEGER)");

app.post('/add_time_to_table', function (request, response) {
  var time = request.body.time;
  var duration = request.body.duration;
  var insertQuery = "INSERT INTO schedule (time, duration) VALUES (?, ?)";
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
  var id = request.body.id;

  var insertQuery = "DELETE FROM schedule WHERE id=(?)";

  scheduleDB.run(insertQuery, id, function(err) {
    if (err) {
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

app.listen(8000);

//scheduleDB.close();

