let connection;
module.exports = {
    connect: function () {
        // oracle(function () {
        //     oracleQuery("");
        // });
        oracle();
        // mssql(function () {
        //     mssqlQuery("");
        // });
    },
    query: function (queryString) {
        // mssql(queryString);
        oracleQuery(queryString);
    }
};


function mssql(callback) {

    const sql = require('mssql');
    var dbConfig = {
        server: "192.168.0.14\\SQL2016",
        authentication: {
            type: "default",
            options: {
                userName: "manoj",
                password: "manoj"
            }
        },
        database: "wslmidtables"
    };
    sql.connect(dbConfig, err => {
        if (err) {
            throw err;
        } else {
            console.log("Connection Successful !");
            this.connection = sql;
            callback();
        }
    });
}

async function oracle() {

    const oracledb = require('oracledb');

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    const mypw = "ibo123";

    try {
        const oracle = await oracledb.getConnection({
            user: "ibo",
            password: mypw,
            connectString: "192.168.0.11/xe"
        });
        console.log("Successfully connected to Oracle!");
        this.connection = oracle;
        // callback();

    } catch (err) {
        console.error(err);
    }
}

function mssqlQuery(queryString) {

    console.log(this.connection);

    new this.connection.Request().query('select * from wsl_geninfo', (err, result) => {

        if (err) {
            return err;
        } else {
            console.log(result);
            return result;
        }
    });


}

async function oracleQuery(queryString) {
    console.log(this.connection);

    try {

        const result = await this.connection.execute(
            queryString
        );
        console.log("ddd" , result.rows);
        return result.rows;

    } catch (err) {
        console.log(err)
        return err;
    }
}