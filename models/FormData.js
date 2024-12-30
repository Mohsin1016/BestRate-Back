const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    businessInfo: {
        businessDBA: String,
        legalName: String,
        taxID: String,
        entityType: String,
        businessAddress: String,
        city: String,
        state: String,
        zipcode: String,
        phone: String,
        email: String,
    },
    salesInfo: {
        operationLength: String,
        monthlyVolume: String,
        averageTicket: String,
        highTicket: String,
    },
    riskInfo: {
        bbb: String,
        international: String,
        chargebacks: String,
        legalSuits: String,
        visaFine: String,
    },
    ownerInfo: {
        firstName: String,
        lastName: String,
        cellPhone: String,
        homeAddress: String,
        city: String,
        state: String,
        zipcode: String,
        ssn: String,
        dob: Date,
    },
    files: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('FormData', formDataSchema);
