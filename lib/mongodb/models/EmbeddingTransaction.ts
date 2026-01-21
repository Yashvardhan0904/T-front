import mongoose from "mongoose";

const EmbeddingTransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String
    },
    modelUsed: {
        type: String,
        default: 'text-embedding-3-small'
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        required: true
    },
    costPerEmbedding: {
        type: Number,
        required: true
    }, // In INR
    totalCost: {
        type: Number,
        required: true
    },
    performedBy: {
        type: String,
        enum: ['SELLER', 'ADMIN', 'SYSTEM'],
        default: 'SELLER'
    },
    error: {
        type: String
    }
}, { timestamps: true });

// Index for reporting
EmbeddingTransactionSchema.index({ sellerId: 1, createdAt: -1 });

const EmbeddingTransaction = mongoose.models.EmbeddingTransaction || mongoose.model("EmbeddingTransaction", EmbeddingTransactionSchema);

export default EmbeddingTransaction;
