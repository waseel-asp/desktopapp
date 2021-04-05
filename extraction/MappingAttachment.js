exports.updateAttachmentData = function (claimMap, attachmentList, callback) {
    let attachmentMap = new Map();

    attachmentList.forEach(attachment => {
        var claimKey = attachment.PROVCLAIMNO;

        const attachmentObj = require('../models/Attachment.js');

        attachmentObj.setFileName(attachment.FILENAME);
        attachmentObj.setFileData(attachment.FILECONTENT);
        // const myFile = new File([attachment.FILECONTENT], attachment.FILENAME);

        // console.log(attachmentMap.get(claimKey));

        if (attachmentMap.get(claimKey)) {
            console.log(attachmentMap.get(claimKey));
            attachmentMap.get(claimKey).push(attachmentObj.getAttachmentInfo());
        } else {
            var attachmentArray = new Array();
            attachmentArray.push(attachmentObj.getAttachmentInfo());
            attachmentMap.set(claimKey, attachmentArray);
        }

        Array.from(claimMap.keys()).map(key => {
            if (attachmentMap.get(key)) {
                if (key.attachment.fileNumber == attachmentMap.get(key).length) {
                    claimMap.get(key).attachment = attachmentMap.get(key);
                }
            } else {
                claimMap.get(key).attachment = new Array();
            }
        });

        callback(claimMap);
    });
}