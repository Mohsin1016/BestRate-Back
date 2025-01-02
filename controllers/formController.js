const FormData = require('../models/FormData');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your-cloud-name",
    api_key: process.env.CLOUDINARY_API_KEY || "your-api-key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "your-api-secret",
});

const calculateScore = (data) => {
    let score = 650; // Initial score
    console.log('Initial Score:', score);

    // Entity Type
    if (data.businessInfo.entityType === 'LLC') score += 15;
    else if (data.businessInfo.entityType === 'Corp') score += 10;
    else if (data.businessInfo.entityType === 'Sole Prop') score -= 10;
    console.log('After Entity Type:', score);

    // Operation Length
    const operationLength = parseInt(data.salesInfo.operationLength);
    if (operationLength === 1) score -= 30;
    else if (operationLength === 2) score -= 10;
    else if (operationLength === 3) score += 20;
    else if (operationLength === 4) score += 30;
    else if (operationLength === 5) score += 35;
    else if (operationLength >= 6 && operationLength <= 10) score += 40;
    else if (operationLength >= 11 && operationLength <= 20) score += 45;
    else if (operationLength > 20) score += 50;
    console.log('After Operation Length:', score);

    // Monthly Volume
    const monthlyVolume = data.salesInfo.monthlyVolume;
    if (monthlyVolume === '0-2500') score -= 20;
    else if (monthlyVolume === '2500-5K') score += 0;
    else if (monthlyVolume === '5K-10K') score += 10;
    else if (monthlyVolume === '10K-20K') score += 15;
    else if (monthlyVolume === '20K-50K') score += 25;
    else if (monthlyVolume === '50K-100K') score += 30;
    else if (monthlyVolume === '100K+') score += 40;
    console.log('After Monthly Volume:', score);

    // Average Ticket
    const averageTicket = parseInt(data.salesInfo.averageTicket);
    if (averageTicket >= 1 && averageTicket <= 5) score += 19;
    else if (averageTicket >= 6 && averageTicket <= 10) score += 18;
    else if (averageTicket >= 11 && averageTicket <= 20) score += 17;
    else if (averageTicket >= 21 && averageTicket <= 50) score += 16;
    else if (averageTicket >= 51 && averageTicket <= 100) score += 15;
    else if (averageTicket >= 101 && averageTicket <= 500) score += 14;
    else if (averageTicket >= 501 && averageTicket <= 1000) score += 13;
    else if (averageTicket >= 1001 && averageTicket <= 5000) score += 12;
    else if (averageTicket >= 5001 && averageTicket <= 10000) score += 11;
    else if (averageTicket > 10000) score += 10;
    console.log('After Average Ticket:', score);

    // High Ticket
    const highTicket = parseInt(data.salesInfo.highTicket);
    if (highTicket >= 51 && highTicket <= 100) score += 1;
    else if (highTicket >= 101 && highTicket <= 500) score += 2;
    else if (highTicket >= 501 && highTicket <= 1000) score += 3;
    else if (highTicket >= 1001 && highTicket <= 5000) score += 4;
    else if (highTicket >= 5001 && highTicket <= 10000) score += 5;
    else if (highTicket > 10000) score += 6;
    console.log('After High Ticket:', score);

    // Risk Factors
    score += data.riskInfo.bbb === 'Yes' ? -50 : 10;
    console.log('After BBB Complaints:', score);

    score += data.riskInfo.legalSuits === 'Yes' ? -50 : 10;
    console.log('After Legal Suits:', score);

    // Chargebacks
    const chargebacks = parseInt(data.riskInfo.chargebacks);
    if (chargebacks === 0) score += 50;
    else if (chargebacks >= 1 && chargebacks <= 5) score += 10;
    else if (chargebacks >= 6 && chargebacks <= 10) score -= 20;
    else if (chargebacks >= 11 && chargebacks <= 20) score -= 40;
    else if (chargebacks >= 21 && chargebacks <= 50) score -= 80;
    else if (chargebacks > 50) score -= 150;
    console.log('After Chargebacks:', score);

    return score;
};


const submitForm = async (req, res) => {
    try {
        const { body, files } = req;
        const { userId } = body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const uploadedFiles = [];
        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: `form-submissions/${userId}`,
            });
            uploadedFiles.push(result.secure_url);
        }
        console.log("body:  🥅🥅🥅🥅", body);

        const formData = new FormData({
            userId: userId,
            businessInfo: {
                businessDBA: body.businessDBA,
                legalName: body.legalName,
                taxID: body.taxID,
                entityType: body.entityType,
                businessAddress: body.businessAddress,
                city: body.city,
                state: body.state,
                zipcode: body.zipcode,
                phone: body.phone,
                email: body.email,
            },
            salesInfo: {
                operationLength: body.operationLength,
                monthlyVolume: body.monthlyVolume,
                averageTicket: body.averageTicket,
                highTicket: body.highTicket,
            },
            riskInfo: {
                bbb: body.bbb,
                international: body.international,
                chargebacks: body.chargebacks,
                legalSuits: body.legalSuits,
                visaFine: body.visaFine,
            },
            ownerInfo: {
                firstName: body.firstName,
                lastName: body.lastName,
                cellPhone: body.cellPhone,
                homeAddress: body.homeAddress,
                city: body.ownerCity,
                state: body.ownerState,
                zipcode: body.ownerZipcode,
                ssn: body.ssn,
                dob: body.dob,
            },
            files: uploadedFiles,
        });

        const score = calculateScore(formData);
        await formData.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER || "muhammadmohsin1016@gmail.com",
                pass: process.env.SMTP_PASS || "puci zizd cskz gpwm",
            },
        });

        const htmlFilePath = path.join(__dirname, '..', 'data', 'form-template.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        // Replace placeholders in the HTML file with actual data
        htmlContent = htmlContent.replace(/\{\{userId\}\}/g, formData.userId);
        htmlContent = htmlContent.replace(/\{\{businessDBA\}\}/g, formData.businessInfo.businessDBA);
        htmlContent = htmlContent.replace(/\{\{legalName\}\}/g, formData.businessInfo.legalName);
        htmlContent = htmlContent.replace(/\{\{taxID\}\}/g, formData.businessInfo.taxID);
        htmlContent = htmlContent.replace(/\{\{entityType\}\}/g, formData.businessInfo.entityType);
        htmlContent = htmlContent.replace(/\{\{businessAddress\}\}/g, formData.businessInfo.businessAddress);
        htmlContent = htmlContent.replace(/\{\{city\}\}/g, formData.businessInfo.city);
        htmlContent = htmlContent.replace(/\{\{state\}\}/g, formData.businessInfo.state);
        htmlContent = htmlContent.replace(/\{\{zipcode\}\}/g, formData.businessInfo.zipcode);
        htmlContent = htmlContent.replace(/\{\{phone\}\}/g, formData.businessInfo.phone);
        htmlContent = htmlContent.replace(/\{\{email\}\}/g, formData.businessInfo.email);
        htmlContent = htmlContent.replace(/\{\{operationLength\}\}/g, formData.salesInfo.operationLength);
        htmlContent = htmlContent.replace(/\{\{monthlyVolume\}\}/g, formData.salesInfo.monthlyVolume);
        htmlContent = htmlContent.replace(/\{\{averageTicket\}\}/g, formData.salesInfo.averageTicket);
        htmlContent = htmlContent.replace(/\{\{highTicket\}\}/g, formData.salesInfo.highTicket);
        htmlContent = htmlContent.replace(/\{\{bbb\}\}/g, formData.riskInfo.bbb);
        htmlContent = htmlContent.replace(/\{\{international\}\}/g, formData.riskInfo.international);
        htmlContent = htmlContent.replace(/\{\{chargebacks\}\}/g, formData.riskInfo.chargebacks);
        htmlContent = htmlContent.replace(/\{\{legalSuits\}\}/g, formData.riskInfo.legalSuits);
        htmlContent = htmlContent.replace(/\{\{visaFine\}\}/g, formData.riskInfo.visaFine);
        htmlContent = htmlContent.replace(/\{\{firstName\}\}/g, formData.ownerInfo.firstName);
        htmlContent = htmlContent.replace(/\{\{lastName\}\}/g, formData.ownerInfo.lastName);
        htmlContent = htmlContent.replace(/\{\{cellPhone\}\}/g, formData.ownerInfo.cellPhone);
        htmlContent = htmlContent.replace(/\{\{homeAddress\}\}/g, formData.ownerInfo.homeAddress);
        htmlContent = htmlContent.replace(/\{\{ownerCity\}\}/g, formData.ownerInfo.city);
        htmlContent = htmlContent.replace(/\{\{ownerState\}\}/g, formData.ownerInfo.state);
        htmlContent = htmlContent.replace(/\{\{ownerZipcode\}\}/g, formData.ownerInfo.zipcode);
        htmlContent = htmlContent.replace(/\{\{ssn\}\}/g, formData.ownerInfo.ssn);
        htmlContent = htmlContent.replace(/\{\{dob\}\}/g, formData.ownerInfo.dob);

        htmlContent = htmlContent.replace(
            /\{\{#files\}\}[\s\S]*?\{\{\/files\}\}/g,
            uploadedFiles.map((url) => `<p><a href="${url}" target="_blank">${url}</a></p>`).join('')
        );

        const mailOptions = {
            from: "muhammadmohsin1016@gmail.com",
            to: "everefficientio@gmail.com",
            subject: 'Form Submission Details',
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Form submitted successfully!',
            score: score,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit form' });
    }
};

module.exports = { submitForm };
