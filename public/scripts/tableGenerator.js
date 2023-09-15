
//npm install sqlite3

function addNewTableRow(){
    var tableRef = document.getElementById("timeTable");

    var newRow = tableRef.insertRow(-1);
    var newCell1 = newRow.insertCell(0);
    var newCell2 = newRow.insertCell(1);
    var newCell3 = newRow.insertCell(2);
    var newCell4 = newRow.insertCell(3);
    var newCell5 = newRow.insertCell(4);

}






const sqliteAccess = require(sqlite3);

const dataTable = new sqlite3.Database('./db/dataTable.sqlite');

dataTable.run("CREATE TABLE dataTable (id INT, time INT)");

dataTable.run("Insert  dataTable (id INT, time INT)");




{"time": "", "duration": 1200}
{"id": 3}
[{"id": 1, "time": "fffff", "duration_ms": 1000}, {}, {}]