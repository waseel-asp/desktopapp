const oracledb = require('oracledb');
oracledb.fetchAsString = [oracledb.CLOB];

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
var isOracleInitialized = false;
var tempPath = require('electron-root-path').rootPath;
var oracleClientPath = tempPath + "\\resources\\oracle client 18_5";
var connection;

console.log(oracleClientPath);

module.exports = {
    oracle: async function (dbParams) {
        return new Promise(function (resolve, reject) {
            try {

                if (!isOracleInitialized) {
                    oracledb.initOracleClient({ libDir: oracleClientPath });
                    isOracleInitialized = true;
                }

                oracledb.getConnection({
                    user: dbParams.username,
                    password: dbParams.password,
                    connectString: dbParams.hostname + "/" + dbParams.database_name
                }, function (error, conn) {
                    if (error)
                        reject(error)

                    this.connection = conn;
                    resolve(conn);
                });
            } catch (error) {
                reject(error);
            }

        });
    },
    oracleQuery: async function (queryString) {
        return new Promise(function (resolve, reject) {
            this.connection.execute(queryString, function (err, result) {
                if (err)
                    reject(err);
                resolve(result);
            });

        });
    }

}
