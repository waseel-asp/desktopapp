const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const mypw = "ibo2";

async function run() {

    let connection;

    try {
        connection = await oracledb.getConnection({
            user: "ibo2",
            password: mypw,
            connectString: "devzero.waseel.com/dev0"
        });

        const result = await connection.execute(
            `SELECT * from wsl_geninfo where provclaimno = 20300162655`
        );
        console.log(result.rows);

    } catch (err) {
        console.error(err);
    }
}

run();