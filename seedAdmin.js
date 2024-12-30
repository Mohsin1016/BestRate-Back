require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

connectDB();

const seedAdmin = async () => {
    try {
        const admin = new Admin({
            email: 'admin@example.com', // Replace 'admin' with your desired default username
            password: 'password',
        });

        await admin.save();
        console.log('Admin user seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin user:', error.message);
        process.exit(1);
    }
};

seedAdmin();
