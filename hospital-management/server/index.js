require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/receptionist', require('./routes/receptionist'));

// Error handling middleware (must be after routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Successfully connected to local MongoDB at ' + MONGO_URI);
        
        // Seed Admin User
        try {
            await User.deleteOne({ email: 'admin@gmail.com' });
            await User.create({
                name: 'Hospital Admin',
                email: 'admin@gmail.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('Admin user re-seeded: admin@gmail.com / password123');
        } catch (seedErr) {
            console.error('Seeding error:', seedErr.message);
        }
        
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('FATAL Error connecting to local MongoDB:', err.message);
        console.log('Please ensure MongoDB is installed and running on localhost:27017');
    });
