exports.updateInvoiceData = function (claimMap, invoiceList, callback) {
    let invoiceMap = new Map();

    Array.from(claimMap.keys()).map(key => {
        var temp = invoiceList.filter(invoice => invoice.PROVCLAIMNO == key);
        invoiceMap.set(key, temp);
    });
    Array.from(invoiceMap.keys()).map(key => {
        var invoiceData = invoiceMap.get(key);
        var invoiceList = [];
        for (var j = 0; j < invoiceData.length; j++) {
            //invoicelist check current element else fetch
            var tempInvoice = [];
            if (invoiceList.length > 0) {
                tempInvoice = invoiceList.filter(invoice =>
                    invoice.invoiceNumber == invoiceData[j].INVOICEID);
            }

            const amount = require('../models/Amount.js');
            const invoice = require('../models/Invoice.js');
            const invoiceGDPN = require('../models/GDPN.js');
            const service = require('../models/Service.js');
            const serviceGDPN = require('../models/GDPN.js');
            if (tempInvoice.length == 0) {
                invoice.setInvoiceNumber(invoiceData[j].INVOICEID);
                invoice.setInvoiceDate(invoiceData[j].INVOICEDATE);
                invoice.setInvoiceDepartment(invoiceData[j].INVOICEDEPT);
                invoiceGDPN.setGDPNData(
                    amount.getAmountValue(invoiceData[j].TOTINVNETAMT, "SAR"),
                    amount.getAmountValue(0.0, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTINVNETVATAMOUNT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTINVPATSHARE, "SAR"),
                    amount.getAmountValue(0.0, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTINVPATSHAREVATAMOUNT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTINVDISC, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTINVGRSAMT, "SAR"),
                    amount.getAmountValue(0.0, "SAR"),
                    amount.getAmountValue(0.0, "SAR"));
                invoice.setInvoiceGDPN(invoiceGDPN.getGDPNInfo());
                var serviceList = [];
                service.setDrugUse(null);
                service.setRequestedQuantity(invoiceData[j].QTY);
                service.setServiceCode(invoiceData[j].SERVICECODE);
                service.setServiceComment(null);
                service.setServiceDate(invoiceData[j].SERVICEDATE);
                service.setServiceDescription(invoiceData[j].SERVICEDESC);
                service.setServiceNumber(null);
                service.setServiceType(invoiceData[j].UNITSERVICETYPE);
                service.setToothNumber(invoiceData[j].TOOTHNO);
                service.setUnitPrice(amount.getAmountValue(invoiceData[j].UNITSERVICEPRICE, "SAR"));
                serviceGDPN.setGDPNData(
                    amount.getAmountValue(invoiceData[j].TOTSERVICENETAMT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICENETVATRATE, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICENETVATAMOUNT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHARE, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATRATE, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATAMOUNT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEDISC, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEGRSAMT, "SAR"),
                    amount.getAmountValue(0.0, "SAR"),
                    amount.getAmountValue(0.0, "SAR"));
                service.setServiceGDPN(serviceGDPN.getGDPNInfo());
                serviceList.push(service.getServiceInfo());
                invoice.setService(serviceList);
                invoiceList.push(invoice.getInvoiceInfo());
            }
            else {
                var tempServiceList = tempInvoice[0].service;
                service.setDrugUse(null);
                service.setRequestedQuantity(invoiceData[j].QTY);
                service.setServiceCode(invoiceData[j].SERVICECODE);
                service.setServiceComment(null);
                service.setServiceDate(invoiceData[j].SERVICEDATE);
                service.setServiceDescription(invoiceData[j].SERVICEDESC);
                service.setServiceNumber(null);
                service.setServiceType(invoiceData[j].UNITSERVICETYPE);
                service.setToothNumber(invoiceData[j].TOOTHNO);
                service.setUnitPrice(amount.getAmountValue(invoiceData[j].UNITSERVICEPRICE, "SAR"));
                serviceGDPN.setGDPNData(
                    amount.getAmountValue(invoiceData[j].TOTSERVICENETAMT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICENETVATRATE, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICENETVATAMOUNT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHARE, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATRATE, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATAMOUNT, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEDISC, "SAR"),
                    amount.getAmountValue(invoiceData[j].TOTSERVICEGRSAMT, "SAR"),
                    amount.getAmountValue(0.0, "SAR"),
                    amount.getAmountValue(0.0, "SAR"));
                service.setServiceGDPN(serviceGDPN.getGDPNInfo());
                tempServiceList.push(service.getServiceInfo());
                tempInvoice[0].service = tempServiceList;
            }

        }
        claimMap.get(key).invoice = invoiceList;
    });
    callback(claimMap);
}