var fileName, fileType, fileData, userComment;

exports.setFileName = function (data) {
    fileName = data;
}
exports.setFileType = function (data) {
    fileType = data;
}
exports.setFileData = function (data) {
    fileData = data;
}
exports.setUserComment = function (data) {
    userComment = data;
}

exports.getAttachmentInfo = function () {
    return {
        fileName: fileName, fileType: fileType,
        fileData: fileData, userComment: userComment
    };
}