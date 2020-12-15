var invoiceNumber, invoiceDate, invoiceDepartment, invoiceGDPN, service;

exports.setInvoiceNumber = function (data) {
    invoiceNumber = data;
}
exports.setInvoiceDate = function (data) {
    invoiceDate = data;
}
exports.setInvoiceDepartment = function (data) {
    invoiceDepartment = data;
}
exports.setInvoiceGDPN = function (data) {
    invoiceGDPN = data;
}
exports.setService = function (data) {
    service = data;
}
exports.getInvoiceInfo = function () {
    return {
        invoiceNumber: invoiceNumber, invoiceDate: invoiceDate,
        invoiceDepartment: invoiceDepartment,
        invoiceGDPN: invoiceGDPN, service: service
    };
}