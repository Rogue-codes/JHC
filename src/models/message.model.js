import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    senderType: {
        type: String,
        enum: ['Admin', 'Doctor', 'Patient'],
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    receiverType: {
        type: String,
        enum: ['Admin', 'Doctor', 'Patient'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;
