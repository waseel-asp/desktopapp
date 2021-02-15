exports.updateInvoiceData = function (claimMap, invoiceList, callback) {
    let invoiceMap = new Map();
    let invoiceNumberCheck = new Map();

    invoiceList.forEach(invoice => {

        var claimKey = invoice.PROVCLAIMNO;

        const amount = require('../models/Amount.js');
        const invoiceObj = require('../models/Invoice.js');
        const invoiceGDPN = require('../models/GDPN.js');

        invoiceObj.setInvoiceNumber(invoice.INVOICEID);
        invoiceObj.setInvoiceDate(invoice.INVOICEDATE);
        invoiceObj.setInvoiceDepartment(invoice.INVOICEDEPT);
        invoiceGDPN.setGDPNData(
            amount.getAmountValue(invoice.TOTINVNETAMT, "SAR"),
            amount.getAmountValue(0.0, "SAR"),
            amount.getAmountValue(invoice.TOTINVNETVATAMOUNT, "SAR"),
            amount.getAmountValue(invoice.TOTINVPATSHARE, "SAR"),
            amount.getAmountValue(0.0, "SAR"),
            amount.getAmountValue(invoice.TOTINVPATSHAREVATAMOUNT, "SAR"),
            amount.getAmountValue(invoice.TOTINVDISC, "SAR"),
            amount.getAmountValue(invoice.TOTINVGRSAMT, "SAR"),
            amount.getAmountValue(0.0, "SAR"),
            amount.getAmountValue(0.0, "SAR"));
        invoiceObj.setInvoiceGDPN(invoiceGDPN.getGDPNInfo());

        const serviceGDPN = require('../models/GDPN.js');
        const service = require('../models/Service.js');

        service.setDrugUse(null);
        service.setRequestedQuantity(invoice.QTY);
        service.setServiceCode(invoice.SERVICECODE);
        service.setServiceComment(null);
        service.setServiceDate(invoice.SERVICEDATE);
        service.setServiceDescription(invoice.SERVICEDESC);
        service.setServiceNumber(null);
        service.setServiceType(invoice.UNITSERVICETYPE);
        service.setToothNumber(invoice.TOOTHNO);
        service.setUnitPrice(amount.getAmountValue(invoice.UNITSERVICEPRICE, "SAR"));
        serviceGDPN.setGDPNData(
            amount.getAmountValue(invoice.TOTSERVICENETAMT, "SAR"),
            amount.getAmountValue(invoice.TOTSERVICENETVATRATE, "SAR"),
            amount.getAmountValue(invoice.TOTSERVICENETVATAMOUNT, "SAR"),
            amount.getAmountValue(invoice.TOTSERVICEPATSHARE, "SAR"),
            amount.getAmountValue(invoice.TOTSERVICEPATSHAREVATRATE, "SAR"),
            amount.getAmountValue(invoice.TOTSERVICEPATSHAREVATAMOUNT, "SAR"),
            amount.getAmountValue(invoice.TOTSERVICEDISC, "SAR"),
            amount.getAmountValue(invoice.TOTSERVICEGRSAMT, "SAR"),
            amount.getAmountValue(0.0, "SAR"),
            amount.getAmountValue(0.0, "SAR"));
        service.setServiceGDPN(serviceGDPN.getGDPNInfo());


        // console.log(invoiceMap.get(claimKey));

        if (invoiceMap.get(claimKey)) {

            if (invoiceNumberCheck.get(invoice.INVOICEID) != undefined) {
                invoiceFromMap = invoiceMap.get(claimKey)[invoiceNumberCheck.get(invoice.INVOICEID)];
                // console.log(invoiceFromMap);

                if (invoiceFromMap.service) {
                    invoiceFromMap.service.push(service.getServiceInfo());
                    invoiceMap.get(claimKey)[invoiceNumberCheck.get(invoice.INVOICEID)] = invoiceFromMap;
                } else {
                    var serviceArray = new Array();
                    serviceArray.push(service.getServiceInfo());
                    invoiceFromMap.service = serviceArray;
                }

            } else {

                var serviceArray = new Array();

                serviceArray.push(service.getServiceInfo());
                invoiceObj.setService(serviceArray);
                invoiceMap.get(claimKey).push(invoiceObj.getInvoiceInfo());
                invoiceNumberCheck.set(invoice.INVOICEID, (invoiceMap.get(claimKey).length - 1));

            }

        } else {
            var invoiceArray = new Array();
            var serviceArray = new Array();

            serviceArray.push(service.getServiceInfo());
            invoiceObj.setService(serviceArray);

            invoiceArray.push(invoiceObj.getInvoiceInfo());
            invoiceMap.set(claimKey, invoiceArray);
            invoiceNumberCheck.set(invoice.INVOICEID, 0);

        }
    });

    Array.from(claimMap.keys()).map(key => {
        if (invoiceMap.get(key)) {
            claimMap.get(key).invoice = invoiceMap.get(key);
        } else {
            claimMap.get(key).invoice = new Array();
        }

    });

    callback(claimMap);
}