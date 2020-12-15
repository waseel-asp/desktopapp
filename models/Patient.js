var fullName, firstName, middleName, lastName, age, dob, gender, nationality;
var patientFileNumber, contactNumber;

exports.setFullName = function(data) {
    fullName = data;
}

exports.setFirstName = function(data) {
    firstName = data;
}

exports.setMiddleName = function(data) {
    middleName = data;
}

exports.setLastName = function(data) {
    lastName = data;
}

exports.setAge = function(data) {
    age = data;
}

exports.setDob = function(data) {
    dob = data;
}

exports.setGender = function(data) {
    gender = data;
}

exports.setNationality = function(data) {
    nationality = data;
}

exports.setPatientFileNumber = function(data) {
    patientFileNumber = data;
}

exports.setContactNumber = function(data) {
    contactNumber = data;
}

exports.getPatientInfo = function () {
    return {
        fullName: fullName,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        age: age,
        dob: dob,
        gender: gender,
        nationality: nationality,
        patientFileNumber: patientFileNumber,
        contactNumber: contactNumber
    };
}