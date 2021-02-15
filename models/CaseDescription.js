var bloodPressure, temperature, pulse, respRate, weight, height, lmp, illnessCategory;
var illnessDuration,diagnosis, optics,investigation;
var chiefComplaintSymptoms, signicantSigns;

exports.setBloodPressure = function(data) {
    bloodPressure = data;
}
exports.setTemperature = function(data) {
    temperature = data;
}
exports.setPulse = function(data) {
    pulse = data;
}
exports.setRespRate = function(data) {
    respRate = data;
}
exports.setWeight = function(data) {
    weight = data;
}
exports.setHeight = function(data) {
    height = data;
}
exports.setLmp = function(data) {
    lmp = data;
}
exports.setIllnessCategory = function(data) {
    illnessCategory = data;
}
exports.setIllnessDuration = function(data) {
    illnessDuration = data;
}
exports.setDiagnosis = function(data) {
    diagnosis = data;
}
exports.setOptics = function(data) {
    optics = data;
}
exports.setInvestigation = function(data) {
    investigation = data;
}
exports.setChiefComplaintSymptoms = function(data) {
    if(data!=null && data!= undefined){
        data = data.trim();
    }
    chiefComplaintSymptoms = data;
}
exports.setSignicantSigns = function(data) {
    if(data!=null && data!= undefined){
        data = data.trim();
    }
    signicantSigns = data;
}
exports.getCaseDescriptionInfo = function () {
    return {
        bloodPressure: bloodPressure, temperature: temperature, pulse: pulse,
        respRate: respRate, weight: weight, height: height, lmp: lmp,
        illnessCategory: illnessCategory, illnessDuration: illnessDuration,
        diagnosis: diagnosis, optics: optics, investigation: investigation,
        chiefComplaintSymptoms: chiefComplaintSymptoms, signicantSigns: signicantSigns
    }
}