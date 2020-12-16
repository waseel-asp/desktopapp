
var db;

exports.getDb = function() {
    return db;
}

exports.close = function() {
    db.close();
}

exports.initSqllite = function(){
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database('./db/midtables_config.db', (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the dbconfig database.');
    
            dbSchema = `CREATE TABLE IF NOT EXISTS dbconfig (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   db_type text NOT NULL,
                   hostname text NOT NULL,
                   port integer NOT NULL,
                   database_name text NOT NULL,
                   username text NOT NULL,
                   password text NOT NULL
               );`
    
            db.exec(dbSchema, function (err) {
                if (err) {
                    console.log(err);
                }
            });
    
        }
    
    });
}