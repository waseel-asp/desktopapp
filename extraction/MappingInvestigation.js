exports.updateLabResultData = function (claimMap, labResultList, callback) {
    let labResultMap = new Map();

    Array.from(claimMap.keys()).map(key => {
        var temp = labResultList.filter(labResult => labResult.PROVIDERCLAIMNUMBER == key);
        labResultMap.set(key, temp);
    });
    Array.from(labResultMap.keys()).map(key => {
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
            const investigation = require('../models/Investigation.js');
            const observation = require('../models/Observation.js');

            if (tempInvestigation.length == 0) {
                investigation.setInvestigationCode(labResultData[j].LABORATORYTESTCODE);
                investigation.setInvestigationDate(labResultData[j].LABTESTDATE);
                investigation.setInvestigationDescription(labResultData[j].LABDESC);
                investigation.setInvestigationType(labResultData[j].SERIALNO);
                investigation.setInvestigationComments(null);
                var observationList = [];
                observation.setObservationCode(labResultData[j].LABCOMPCODE);
                observation.setObservationDescription(labResultData[j].LABCOMPDESC);
                observation.setObservationValue(labResultData[j].LABRESULT);
                observation.setObservationUnit(labResultData[j].LABRESULTUNIT);
                observation.setObservationComment(labResultData[j].LABRESULTCOMMENT);
                observationList.push(observation.getObservationInfo());
                investigation.setObservation(observationList);
                investigationList.push(investigation.getInvestigationInfo());
            }
            else {
                var tempObservationList = tempInvestigation[0].observation;
                observation.setObservationCode(labResultData[j].LABCOMPCODE);
                observation.setObservationDescription(labResultData[j].LABCOMPDESC);
                observation.setObservationValue(labResultData[j].LABRESULT);
                observation.setObservationUnit(labResultData[j].LABRESULTUNIT);
                observation.setObservationComment(labResultData[j].LABRESULTCOMMENT);
                tempObservationList.push(observation.getObservationInfo());
                tempInvestigation[0].observation = tempObservationList;
            }
        }
        claimMap.get(key).caseInformation.caseDescription.investigation = investigationList;
    });
    callback(claimMap);
}