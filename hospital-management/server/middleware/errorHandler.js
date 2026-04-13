const fs = require('fs');
const errorHandler = (err, req, res, next) => {
    const logMessage = `\n[${new Date().toISOString()}] ${req.method} ${req.url}\n${err.stack}\n`;
    fs.appendFileSync('server_debug.log', logMessage);
    console.error(err.stack);

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // Mongoose duplicate key error (e.g., unique email)
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Record already exists (Duplicate Key Error)' });
    }

    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Default error
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
