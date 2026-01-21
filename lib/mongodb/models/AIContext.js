import mongoose from 'mongoose';

const AIContextSchema = new mongoose.Schema({
    userEmail: { type: String, index: true },
    userId: { type: String, index: true },
    conversationHistory: [{
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
        timestamp: { type: Date, default: Date.now }
    }],
    intentHistory: [mongoose.Schema.Types.Mixed],
    currentTopic: String,
    entities: {
        mentionedProducts: [String],
        mentionedCategories: [String],
        mentionedPreferences: [String]
    },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure we can expire contexts if needed, or keep for long term
AIContextSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); // 1 week survival

export default mongoose.models.AIContext || mongoose.model('AIContext', AIContextSchema);
