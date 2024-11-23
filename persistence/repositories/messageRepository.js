const mongoose = require('mongoose');

// Check if the model is already compiled
const modelName = 'Message';

if (!mongoose.models[modelName]) {
    const messageSchema = new mongoose.Schema({
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
    });

    mongoose.model(modelName, messageSchema);
}

module.exports = mongoose.models[modelName];
