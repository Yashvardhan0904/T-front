import mongoose from 'mongoose';

const UserMemorySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, default: null },

    // Personalization (existing)
    personalization: {
        tone: { type: String, default: 'Default' },
        warmth: { type: String, default: 'Default' },
        enthusiasm: { type: String, default: 'Default' },
        formatting: { type: String, default: 'Default' },
        emoji: { type: String, default: 'Default' },
        customInstructions: { type: String, default: '' }
    },

    // Style preferences (existing + enhanced)
    style: {
        fit: { type: String, default: null },
        colors: { type: [String], default: [] },
        materials: { type: [String], default: [] },
        vibe: { type: String, default: null },
        identity: { type: String, default: null } // masculine, feminine, androgynous
    },

    // Physical attributes (NEW - for advanced fashion AI)
    physical: {
        skinTone: { type: Number, min: 0, max: 1, default: null }, // Fitzpatrick normalized
        undertone: { type: String, enum: ['warm', 'cool', 'neutral', null], default: null },
        heightCm: { type: Number, default: null },
        bodyShape: { type: [Number], default: [0.33, 0.33, 0.34] }, // ecto/meso/endo mix
        shoulderWaistRatio: { type: Number, default: null },
        legTorsoRatio: { type: Number, default: null }
    },

    // Psychology (NEW - for confidence-aware suggestions)
    psychology: {
        confidence: { type: Number, min: 0, max: 1, default: 0.5 },
        riskTolerance: { type: Number, min: 0, max: 1, default: 0.5 },
        comfortPriority: { type: Number, min: 0, max: 1, default: 0.5 },
        trendFollowing: { type: Number, min: 0, max: 1, default: 0.5 }
    },

    // Budget (existing)
    budget: {
        avg: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },

    // Behavior (enhanced)
    behavior: {
        gender: { type: String, default: null }, // male, female, non-binary
        avoids: { type: [String], default: [] },
        purchase_history_count: { type: Number, default: 0 },
        interactionCount: { type: Number, default: 0 },
        lastInteraction: { type: Date, default: null }
    },

    // Preference probabilities (NEW - for adaptive learning)
    preferences: {
        colorProbs: { type: Map, of: Number, default: new Map() }, // {red: 0.6, black: 0.8}
        styleProbs: { type: Map, of: Number, default: new Map() },
        lastDecayAt: { type: Date, default: Date.now }
    },

    // Revealed behavior (NEW - for learning from actions)
    revealed: {
        likedColors: { type: [String], default: [] },
        rejectedColors: { type: [String], default: [] },
        contradictionCount: { type: Number, default: 0 }
    },

    lastUpdated: { type: Date, default: Date.now }
});

// Indexes
UserMemorySchema.index({ userId: 1, userEmail: 1 });

export default mongoose.models.UserMemory || mongoose.model('UserMemory', UserMemorySchema);
