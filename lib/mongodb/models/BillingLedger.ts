import mongoose from "mongoose";

const BillingLedgerSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    reason: {
        type: String,
        enum: ['EMBEDDING_CHARGE', 'WALLET_TOPUP', 'REFUND'],
        required: true
    },
    referenceId: {
        type: String,
        required: true
    }, // e.g., product_id or payment_gateway_transaction_id
    balanceAfter: {
        type: Number,
        required: true
    }, // Snapshot of balance after transaction
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Index for getting seller history
BillingLedgerSchema.index({ sellerId: 1, createdAt: -1 });

const BillingLedger = mongoose.models.BillingLedger || mongoose.model("BillingLedger", BillingLedgerSchema);

export default BillingLedger;
