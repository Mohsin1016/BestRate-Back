const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const formRoutes = require('./routes/formRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
// http://localhost:5000/
// https://best-rate-fron.vercel.app
app.use(cors({
  origin: ['https://best-rate-fron.vercel.app', 'https://best-rate-fron.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, 
}));

app.use(express.json());

app.use('/api/user', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/form', formRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
