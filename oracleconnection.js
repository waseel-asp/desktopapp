module.exports = {

    run: async function run() {

        const oracledb = require('oracledb');

        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

        const mypw = "ibo2";

        let connection;

        try {
            connection = await oracledb.getConnection({
                user: "ibo2",
                password: mypw,
                connectString: "devzero.waseel.com/dev0"
            });
            console.log("Successfully connected to Oracle!");
            const result = await connection.execute(
                `SELECT * from wsl_geninfo where provclaimno = 20300162655`
            );
            console.log(result.rows);

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.log("Error when closing the database connection: ", err);
                }
            }
        }
    }
};