import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: false,
        lowercase: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'New Conversation'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    summary: {
        type: String,
        default: ''
    },
    contextState: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Index for listing user chats sorted by activity
ChatSessionSchema.index({ userEmail: 1, lastMessageAt: -1 });

// In development, clear the model cache to allow schema changes to take effect
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.ChatSession;
}

const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);

export default ChatSession;
