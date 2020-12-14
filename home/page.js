const { app, Menu } = require('electron');
const foo = require('electron').remote;
const admission = require('../models/Admission.js');



function connect(){
  console.log("test connect");
  oracle();
  oracleQuery("select * from WSL_GENINFO where PROVIDERID='DLH'").then(genInfoData =>{
    // console.log(genInfoData);
    
    for(var i=0; i<genInfoData.length;i++){
      admission.setAdmissionDate(genInfoData[i].ADMISSIONDATE);
      const member = require('../models/Member.js');
      member.setMemberID(genInfoData[i].ACCCODE);
      oracleQuery("select * from WSL_INVOICES where PROVCLAIMNO='"+genInfoData[i].PROVCLAIMNO+"'").then(invoiceData =>{
          console.log(genInfoData[i].PROVCLAIMNO , "rrrrr" , invoiceData);
        })
        console.log(member.getMemberInfo());
    }
   
  });

  
}
function logout(){
    localStorage.removeItem('access_token');
    window.location.href = "../login/loginui.html";
}