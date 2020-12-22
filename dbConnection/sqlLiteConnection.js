const sqlite3 = require('sqlite3').verbose();

var db;

exports.getDb = function() {
    return db;
}

exports.close = function() {
    db.close();
}

exports.initSqllite = function(){
    db = new sqlite3.Database('./midtables_config.db', (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the dbconfig database.');
    
            dbSchema = `CREATE TABLE IF NOT EXISTS dbconfig (
                   provider_id INTEGER,
                   db_type text NOT NULL,
                   hostname text NOT NULL,
                   port integer NOT NULL,
                   database_name text NOT NULL,
                   username text NOT NULL,
                   password text NOT NULL
               );
               CREATE TABLE IF NOT EXISTS payer_mapping (
                provider_id INTEGER,
                payer_id INTEGER,
                payer_name text,
                mapping_value text
            );
            CREATE TABLE IF NOT EXISTS claim_mapping (
                provider_id INTEGER,
                claim_name text,
                mapping_value text
            );`

    
            db.exec(dbSchema, function (err) {
                if (err) {
                    console.log(err);
                }
            });
    
        }
    
    });
}