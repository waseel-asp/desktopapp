exports.updateLabResultData = function (claimMap, labResultList, callback) {

    let labResultMap = new Map();
    let labResultCheck = new Map();

    labResultList.forEach(labResultData => {

        var claimKey = labResultData.PROVIDERCLAIMNUMBER;
        const investigation = require('../models/Investigation.js');
        const observation = require('../models/Observation.js');

        investigation.setInvestigationCode(labResultData.LABORATORYTESTCODE);
        investigation.setInvestigationDate(labResultData.LABTESTDATE);
        investigation.setInvestigationDescription(labResultData.LABDESC);
        investigation.setInvestigationType(labResultData.SERIALNO);
        investigation.setInvestigationComments(null);

        observation.setObservationCode(labResultData.LABCOMPCODE);
        observation.setObservationDescription(labResultData.LABCOMPDESC);
        observation.setObservationValue(labResultData.LABRESULT);
        observation.setObservationUnit(labResultData.LABRESULTUNIT);
        observation.setObservationComment(labResultData.LABRESULTCOMMENT);
        //console.log(labResultMap)
        var uniqueKey = labResultData.SERIALNO + "_" + labResultData.LABORATORYTESTCODE + "_" + labResultData.PROVIDERCLAIMNUMBER;
        if (labResultMap.get(claimKey)) {
            if (labResultCheck.get(uniqueKey) != undefined) {
                //console.log(labResultMap.get(claimKey), "%%%%" , labResultCheck.get(labResultData.SERIALNO + "_" + labResultData.LABORATORYTESTCODE));

                let labResultFromMap = labResultMap.get(claimKey)[labResultCheck.get(uniqueKey)];
                // console.log(labResultFromMap);
                if (labResultFromMap.observation) {
                    labResultFromMap.observation.push(observation.getObservationInfo());
                    labResultMap.get(claimKey)[labResultCheck.get(uniqueKey)] = labResultFromMap;
                } else {
                    var observationArray = new Array();
                    observationArray.push(observation.getObservationInfo());
                    labResultFromMap.observation = observationArray;
                }

            } else {
                //add only observation as investigation has presented

                var observationArray = new Array();
                observationArray.push(observation.getObservationInfo());
                investigation.setObservation(observationArray);
                labResultMap.get(claimKey).push(investigation.getInvestigationInfo());
                labResultCheck.set(uniqueKey, (labResultMap.get(claimKey).length - 1));
            }

        } else {
            var investigationArray = new Array();
            var observationArray = new Array();
            observationArray.push(observation.getObservationInfo());
            investigation.setObservation(observationArray);
            investigationArray.push(investigation.getInvestigationInfo());
            labResultMap.set(claimKey, investigationArray);
            labResultCheck.set(uniqueKey, 0);
        }
    });
    Array.from(claimMap.keys()).map(key => {
        if (labResultMap.get(key)) {
            claimMap.get(key).caseInformation.caseDescription.investigation = labResultMap.get(key);
        } else {
            claimMap.get(key).caseInformation.caseDescription.investigation = new Array();
        }

    });
    // Array.from(labResultMap.keys()).map(key => {
    //     var labResultData = labResultMap.get(key);
    //     var investigationList = [];
    //     for (var j = 0; j < labResultData.length; j++) {
    //         //labResultList check current element else fetch
    //         var tempInvestigation = [];
    //         if (investigationList.length > 0) {
    //             tempInvestigation = investigationList.filter(investigation =>
    //                 investigation.investigationCode == labResultData[j].LABORATORYTESTCODE &&
    //                 investigation.investigationType == labResultData[j].SERIALNO
    //             );
    //         }
    //         const investigation = require('../models/Investigation.js');
    //         const observation = require('../models/Observation.js');

    //         if (tempInvestigation.length == 0) {
    //             investigation.setInvestigationCode(labResultData[j].LABORATORYTESTCODE);
    //             investigation.setInvestigationDate(labResultData[j].LABTESTDATE);
    //             investigation.setInvestigationDescription(labResultData[j].LABDESC);
    //             investigation.setInvestigationType(labResultData[j].SERIALNO);
    //             investigation.setInvestigationComments(null);
    //             var observationList = [];
    //             observation.setObservationCode(labResultData[j].LABCOMPCODE);
    //             observation.setObservationDescription(labResultData[j].LABCOMPDESC);
    //             observation.setObservationValue(labResultData[j].LABRESULT);
    //             observation.setObservationUnit(labResultData[j].LABRESULTUNIT);
    //             observation.setObservationComment(labResultData[j].LABRESULTCOMMENT);
    //             observationList.push(observation.getObservationInfo());
    //             investigation.setObservation(observationList);
    //             investigationList.push(investigation.getInvestigationInfo());
    //         }
    //         else {
    //             var tempObservationList = tempInvestigation[0].observation;
    //             observation.setObservationCode(labResultData[j].LABCOMPCODE);
    //             observation.setObservationDescription(labResultData[j].LABCOMPDESC);
    //             observation.setObservationValue(labResultData[j].LABRESULT);
    //             observation.setObservationUnit(labResultData[j].LABRESULTUNIT);
    //             observation.setObservationComment(labResultData[j].LABRESULTCOMMENT);
    //             tempObservationList.push(observation.getObservationInfo());
    //             tempInvestigation[0].observation = tempObservationList;
    //         }
    //     }
    //     claimMap.get(key).caseInformation.caseDescription.investigation = investigationList;
    // });
    callback(claimMap);
}