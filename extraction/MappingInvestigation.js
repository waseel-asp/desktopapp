exports.updateLabResultData = async function (claimMap, labResultList, callback) {
    let labResultMap = new Map();

    Array.from(claimMap.keys()).map(key => {
        var temp = labResultList.filter(labResult => labResult.PROVIDERCLAIMNUMBER == key);
        labResultMap.set(key, temp);
    });
    Array.from(labResultMap.keys()).map(async key => {
        var labResultData = labResultMap.get(key);
        var investigationList = [];
        for (var j = 0; j < labResultData.length; j++) {
            //labResultList check current element else fetch
            var tempInvestigation = [];
            if (investigationList.length > 0) {
                tempInvestigation = investigationList.filter(investigation =>
                    investigation.investigationCode == labResultData[j].LABORATORYTESTCODE &&
                    investigation.investigationType == labResultData[j].SERIALNO
                );
            }
            var investigation, observation;
            if (tempInvestigation.length == 0) {
                var observationList = [];
                await setObservation(labResultData[j], function (callback) { observation = callback; })
                observationList.push(observation);
                await setInvestigation(labResultData[j], observationList, function (callback) { investigation = callback });
                investigationList.push(investigation);
            }
            else {
                var tempObservationList = tempInvestigation[0].observation;
                await setObservation(labResultData[j], function (callback) { observation = callback; })
                tempObservationList.push(observation);
                tempInvestigation[0].observation = tempObservationList;
            }
        }
        claimMap.get(key).caseInformation.caseDescription.investigation = investigationList;
    });
    callback(claimMap);
}
async function setObservation(labResultData, callback) {
    const observation = require('../models/Observation.js');
    observation.setObservationCode(labResultData.LABCOMPCODE);
    observation.setObservationDescription(labResultData.LABCOMPDESC);
    observation.setObservationValue(labResultData.LABRESULT);
    observation.setObservationUnit(labResultData.LABRESULTUNIT);
    observation.setObservationComment(labResultData.LABRESULTCOMMENT);
    callback(observation.getObservationInfo());
}
async function setInvestigation(labResultData, observationList, callback) {
    const investigation = require('../models/Investigation.js');
    investigation.setInvestigationCode(labResultData.LABORATORYTESTCODE);
    investigation.setInvestigationDate(labResultData.LABTESTDATE);
    investigation.setInvestigationDescription(labResultData.LABDESC);
    investigation.setInvestigationType(labResultData.SERIALNO);
    investigation.setInvestigationComments(null);
    investigation.setObservation(observationList);
    callback(investigation.getInvestigationInfo());
}