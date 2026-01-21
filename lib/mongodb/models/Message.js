import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    chatSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: false,
        lowercase: true,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    model: {
        type: String,
        default: 'qwen:4b'
    },
    toolUsed: {
        type: String,
        default: null
    },
    toolResult: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { timestamps: true });

// Index for efficient chat history queries by session
MessageSchema.index({ chatSessionId: 1, createdAt: 1 });
MessageSchema.index({ userEmail: 1, createdAt: -1 });

// In development, clear the model cache to allow schema changes to take effect
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Message;
}

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default Message;
