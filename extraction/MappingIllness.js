exports.updateIllnessResultData = function (claimMap, illnessList, callback) {
    let illnessMap = new Map();
    
    Array.from(claimMap.keys()).map(key => {
        var tempData = illnessList.filter(illness => illness.PROVCLAIMNO == key);
        illnessMap.set(key, tempData);
    });
    Array.from(illnessMap.keys()).map(key => {
        var illnessData = illnessMap.get(key);
        var illnessList = [];
        const illnessCategory = require('../models/IllnessCategory.js');
        for (var x = 0; x < illnessData.length; x++) {
            illnessList.push(illnessData[x].ILLNESSTYPE);
        }
        illnessCategory.setInllnessCode(illnessList);
        claimMap.get(key).caseInformation.caseDescription.illnessCategory = illnessCategory.getInllnessCode();
    });
    callback(claimMap);
}