const shareFunction = require('./SharedFunction.js');
exports.updateInvoiceData = async function (claimMap, invoiceList, callback) {
    let invoiceMap = new Map();

    Array.from(claimMap.keys()).map(key => {
        var temp = invoiceList.filter(invoice => invoice.PROVCLAIMNO == key);
        invoiceMap.set(key, temp);
    });
    Array.from(invoiceMap.keys()).map(async key => {
        var invoiceData = invoiceMap.get(key);
        var invoiceList = [];
        for (var j = 0; j < invoiceData.length; j++) {
            //invoicelist check current element else fetch
            var tempInvoice = [];
            if (invoiceList.length > 0) {
                tempInvoice = invoiceList.filter(invoice =>
                    invoice.invoiceNumber == invoiceData[j].INVOICEID);
            }

            var invoice, service, invoiceGDPN, serviceGDPN;
            if (tempInvoice.length == 0) {
                await shareFunction.setGDPNData(invoiceData[j].TOTINVNETAMT, 0.0, invoiceData[j].TOTINVNETVATAMOUNT,
                    invoiceData[j].TOTINVPATSHARE, 0.0, invoiceData[j].TOTINVPATSHAREVATAMOUNT,
                    invoiceData[j].TOTINVDISC, invoiceData[j].TOTINVGRSAMT, 0.0, 0.0,
                    function (callback) { invoiceGDPN = callback });
                var serviceList = [];
                await shareFunction.setGDPNData(invoiceData[j].TOTSERVICENETAMT, invoiceData[j].TOTSERVICENETVATRATE,
                    invoiceData[j].TOTSERVICENETVATAMOUNT, invoiceData[j].TOTSERVICEPATSHARE,
                    invoiceData[j].TOTSERVICEPATSHAREVATRATE, invoiceData[j].TOTSERVICEPATSHAREVATAMOUNT,
                    invoiceData[j].TOTSERVICEDISC, invoiceData[j].TOTSERVICEGRSAMT, 0.0, 0.0,
                    function (callback) { serviceGDPN = callback });
                await setService(invoiceData[j], serviceGDPN, function (callback) { service = callback });
                serviceList.push(service);
                await setInvoice(invoiceData[j], invoiceGDPN, serviceList, function (callback) { invoice = callback });
                invoiceList.push(invoice);
            }
            else {
                var tempServiceList = tempInvoice[0].service;
                await shareFunction.setGDPNData(invoiceData[j].TOTSERVICENETAMT, invoiceData[j].TOTSERVICENETVATRATE,
                    invoiceData[j].TOTSERVICENETVATAMOUNT, invoiceData[j].TOTSERVICEPATSHARE,
                    invoiceData[j].TOTSERVICEPATSHAREVATRATE, invoiceData[j].TOTSERVICEPATSHAREVATAMOUNT,
                    invoiceData[j].TOTSERVICEDISC, invoiceData[j].TOTSERVICEGRSAMT, 0.0, 0.0,
                    function (callback) { serviceGDPN = callback });
                await setService(invoiceData[j], serviceGDPN, function (callback) { service = callback });
                tempServiceList.push(service);
                tempInvoice[0].service = tempServiceList;
            }
        }
        claimMap.get(key).invoice = invoiceList;
    });
    callback(claimMap);
}
async function setService(invoiceData, serviceGDPN, callback) {
    const amount = require('../models/Amount.js');
    const service = require('../models/Service.js');
    service.setDrugUse(null);
    service.setRequestedQuantity(invoiceData.QTY);
    service.setServiceCode(invoiceData.SERVICECODE);
    service.setServiceComment(null);
    service.setServiceDate(invoiceData.SERVICEDATE);
    service.setServiceDescription(invoiceData.SERVICEDESC);
    service.setServiceNumber(null);
    service.setServiceType(invoiceData.UNITSERVICETYPE);
    service.setToothNumber(invoiceData.TOOTHNO);
    service.setUnitPrice(amount.getAmountValue(invoiceData.UNITSERVICEPRICE, "SAR"));
    service.setServiceGDPN(serviceGDPN);
    callback(service.getServiceInfo());
}
async function setInvoice(invoiceData, invoiceGDPN, serviceList, callback) {
    const invoice = require('../models/Invoice.js');
    invoice.setInvoiceNumber(invoiceData.INVOICEID);
    invoice.setInvoiceDate(invoiceData.INVOICEDATE);
    invoice.setInvoiceDepartment(invoiceData.INVOICEDEPT);
    invoice.setInvoiceGDPN(invoiceGDPN);
    invoice.setService(serviceList);
    callback(invoice.getInvoiceInfo());
}