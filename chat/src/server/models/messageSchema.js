const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: { 
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const MessageModel = mongoose.model('Message', messageSchema);
module.exports = MessageModel;
