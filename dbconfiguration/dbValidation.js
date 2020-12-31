var schema = {
    WSL_GENINFO: new Array('DISCHARGTIME', 'NATIONALID', 'PROVIDERID', 'PAYERID', 'TPAID', 'PROVCLAIMNO', 'MEMBERID', 'POLICYNO', 'PLANTYPE', 'FULLNAME', 'FIRSTNAME', 'MIDDLENAME', 'LASTNAME', 'PATFILENO', 'ACCCODE', 'MEMBERDOB', 'MEMBERAGE', 'UNITAGE', 'GENDER', 'NATIONALITY', 'PHYID', 'PHYNAME', 'PHYCATEGORY', 'DEPTCODE', 'VISITTYPE', 'CLAIMDATE', 'CLAIMTYPE', 'MAINCLAIMREFNO', 'ELIGREFNO', 'APPREFNO', 'ADMISSIONDATE', 'ADMISSIONTIME', 'DISCHARGEDATE', 'DISCHARGETIME', 'LENGTHOFSTAY', 'UNITOFSTAY', 'ROOMNO', 'BEDNO', 'MAINSYMPTOM', 'SIGNIFICANTSIGN', 'OTHERCOND', 'DURATIONOFILLNESS', 'UNITOFDURATION', 'TEMPERATURE', 'BLOODPRESSURE', 'PULSE', 'RESPIRATORYRATE', 'WEIGH', 'LASTMENSTRUATIONPERIOD', 'TOTCLAIMGRSAMT', 'TOTCLAIMDISC', 'TOTCLAIMPATSHARE', 'TOTCLAIMNETAMT', 'EXTRACTION_DATE', 'RADIOREPORT', 'COMMREPORT', 'TOTCLAIMNETVATAMOUNT', 'TOTCLAIMPATSHAREVATAMOUNT'),
    WSL_INVOICES: new Array('TOTINVPATSHARE', 'TOTINVNETAMT', 'TOTINVNETVATAMOUNT', 'TOTINVPATSHAREVATAMOUNT', 'INVOICENO', 'PROVCLAIMNO', 'INVOICEDATE', 'INVOICEDEPT', 'TOTINVGRSAMT', 'TOTINVDISC'),
    WSL_LAB_COMPONENT: new Array('LABTESTCODE', 'PROVCLAIMNO', 'SERIAL', 'LABCOMPCODE', 'LABCOMPDESC', 'LABRESULT', 'LABRESULTUNIT', 'LABRESULTCOMMENT'),
    WSL_LAB_RESULT: new Array('PROVCLAIMNO', 'LABTESTCODE', 'SERIAL', 'LABTESTDATE', 'LABDESC'),
    WSL_SERVICE_DETAILS: new Array('TOTSERVICEDESC', 'INVOICENO', 'SERVICECODE', 'SERVICEDATE', 'SERVICEDESC', 'UNITSERVICEPRICE', 'UNITSERVICETYPE', 'QTY', 'TOOTHNO', 'TOTSERVICEGRSAMT', 'TOTSERVICEDISC', 'TOTSERVICEPATSHARE', 'TOTSERVICENETAMT', 'TOTSERVICENETVATRATE', 'TOTSERVICENETVATAMOUNT', 'TOTSERVICEPATSHAREVATRATE', 'TOTSERVICEPATSHAREVATAMOUNT'),
    WSL_CLAIM_DIAGNOSIS: new Array('PROVCLAIMNO', 'DIAGNOSISCODE', 'DIAGNOSISDESC'),
    WSL_CLAIM_ILLNESS: new Array('PROVCLAIMNO', 'ILLNESSTYPE'),
    WSL_REGLENSSPEC: new Array('SERVICETYPE', 'INVOICENO', 'REGLENSESSPECCODE'),
    WSL_SERVICE_OPTICAL: new Array('INVOICENO', 'SERVICETYPE', 'LENSESTYPE', 'SERVICEDATE', 'REGLENSESTYPE', 'CONLENSESTYPE', 'NOOFPAIRS', 'LENSESGRSAMT', 'LENSESDISC', 'LENSESPATSHARE', 'LENSESNETAMT', 'FRAMEGRSAMT', 'FRAMEDISC', 'FRAMEPATSHARE', 'FRAMENETAMT', 'LENSESNETVATRATE', 'LENSESNETVATAMOUNT', 'LENSESPATSHAREVATRATE', 'LENSESPATSHAREVATAMOUNT', 'FRAMENETVATRATE', 'FRAMENETVATAMOUNT', 'FRAMEPATSHAREVATRATE', 'FRAMEPATSHAREVATAMOUNT'),
    WSL_OPTICAL_DIAGNOSIS: new Array('PROVCLAIMNO', 'RIGHTEYESPHEREDIST', 'RIGHTEYECYLDIST', 'RIGHTEYESPHERENEAR', 'RIGHTEYECYLNEAR', 'LEFTEYESPHEREDIST', 'LEFTEYECYLDIST', 'LEFTEYESPHERENEAR', 'LEFTEYECYLNEAR'),
};

async function validateDatabase(wslConnection, dbParams) {

    wslConnection.checkConnection(dbParams).then(async data => {
        console.log("Connection succesful.")

        if (dbParams.db_type.toUpperCase() == "MYSQL" || dbParams.db_type.toUpperCase() == "SQLSERVER") {

            var warningsColumns = new Array();
            var warningTables = new Array();
            for (var tableName in schema) {

                await wslConnection.query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '" + tableName + "';").then(async data => {

                    var tableColumns = "('" + schema[tableName].join("','") + "')";
                    var que = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tableName + "' AND UPPER(COLUMN_NAME) IN " + tableColumns + ";";

                    await wslConnection.query(que).then(async result => {
                        if (result.length > 0) {
                            await validateColumns(result, schema[tableName], function (unavailabeColumns) {
                                if (unavailabeColumns.length > 0) {
                                    warningsColumns.push("<li>Column " + unavailabeColumns.join(", ") + " not present in table " + tableName + "</li>");
                                }
                            });
                        } else {
                            warningsColumns.push("<li>No columns are not present in " + tableName + "</li>");
                        }
                    }, err => {
                        console.log(err);
                    });
                }, err => {
                    console.log(err);
                    warningTables.push("<li>" + tableName+" not present in database</li>");
                });
            }

            if (warningTables.length > 0) {
                document.getElementById("warning-block").style.display = "block";
                var dbWarnings = document.getElementById("db-warnings");
                warningTables.forEach(function (warning) {
                    dbWarnings.innerHTML += warning;
                });
            }

            if (warningsColumns.length > 0) {
                document.getElementById("warning-block").style.display = "block";
                var dbWarnings = document.getElementById("db-warnings");
                warningsColumns.forEach(function (warning) {
                    dbWarnings.innerHTML += warning;
                });
            }

        } else if (dbParams.db_type.toUpperCase() == "ORACLE") {

            var warningsColumns = new Array();
            var warningTables = new Array();
            for (var tableName in schema) {

                await wslConnection.query("SELECT TABLE_NAME from USER_TABLES where TABLE_NAME='" + tableName + "'").then(async data => {

                    var tableColumns = "('" + schema[tableName].join("','") + "')";
                    await wslConnection.query("SELECT COLUMN_NAME from USER_TAB_COLS where TABLE_NAME = '" + tableName + "' AND UPPER(COLUMN_NAME) IN " + tableColumns).then(async result => {

                        if (result.length > 0) {
                            await validateColumns(result, schema[tableName], function (unavailabeColumns) {
                                if (unavailabeColumns.length > 0) {
                                    warningsColumns.push("<li>Column " + unavailabeColumns.join(", ") + " not present in table " + tableName + "</li>");
                                }
                            });
                        } else {
                            warningsColumns.push("<li>No columns are not present in " + tableName + "</li>");
                        }
                    }, err => {
                        console.log(err);
                    });

                }, err => {
                    warningTables.push("<li>" + tableName+" not present in database</li>");
                });

            }

            if (warningTables.length > 0) {
                document.getElementById("warning-block").style.display = "block";
                var dbWarnings = document.getElementById("db-warnings");
                warningTables.forEach(function (warning) {
                    dbWarnings.innerHTML += warning;
                });
            }

            if (warningsColumns.length > 0) {
                document.getElementById("warning-block").style.display = "block";
                var dbWarnings = document.getElementById("db-warnings");
                warningsColumns.forEach(function (warning) {
                    dbWarnings.innerHTML += warning;
                });
            }
        }

    }, err => {
        console.log(err);

        document.getElementById("error-block").style.display = "block";
        document.getElementById("db-errors").innerHTML += "<li>Unable to connect to database!</li><li>" + err + "</li>"
    });
}

function validateColumns(result, columnsArray, callback) {
    var resultColumns = result.map(column => column.COLUMN_NAME.toUpperCase());
    var unavailabeColumns = columnsArray.filter(column => !resultColumns.includes(column));
    callback(unavailabeColumns);
}