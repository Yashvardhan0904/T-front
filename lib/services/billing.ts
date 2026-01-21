import mongoose from "mongoose";
import Seller from "@/lib/mongodb/models/Seller";
import BillingLedger from "@/lib/mongodb/models/BillingLedger";
import EmbeddingTransaction from "@/lib/mongodb/models/EmbeddingTransaction";

// Constants
const EMBEDDING_COST_INR = 5.00; // ₹5.00 per embedding
const ADMIN_STORE_NAME = "Trendora";

export const billingService = {
    /**
     * Check if seller has sufficient funds.
     * Throws error if insufficient.
     * Returns true if admin or sufficient funds.
     */
    async checkFunds(sellerId: string): Promise<boolean> {
        const seller = await Seller.findById(sellerId);
        if (!seller) throw new Error("Seller not found");

        // Admin / Platform Exemption
        if (seller.storeName === ADMIN_STORE_NAME) {
            return true;
        }

        if (seller.walletBalance < EMBEDDING_COST_INR) {
            throw new Error(`Insufficient funds. Cost: ₹${EMBEDDING_COST_INR}, Balance: ₹${seller.walletBalance.toFixed(2)}`);
        }

        return true;
    },

    /**
     * Charge seller for embedding generation.
     * Uses MongoDB transaction for atomicity.
     */
    async chargeForEmbedding(
        sellerId: string,
        productId: string,
        productName: string,
        model: string = 'text-embedding-3-small'
    ): Promise<boolean> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const seller = await Seller.findById(sellerId).session(session);
            if (!seller) throw new Error("Seller not found");

            // 1. Check Exemption again inside transaction
            const isAdmin = seller.storeName === ADMIN_STORE_NAME;
            const cost = isAdmin ? 0 : EMBEDDING_COST_INR;

            // 2. Deduct Balance (if not admin)
            if (!isAdmin) {
                if (seller.walletBalance < cost) {
                    throw new Error("Insufficient funds during transaction");
                }
                seller.walletBalance -= cost;
                await seller.save({ session });

                // 3. Create Ledger Entry
                await BillingLedger.create([{
                    sellerId: seller._id,
                    type: 'DEBIT',
                    amount: cost,
                    currency: 'INR',
                    reason: 'EMBEDDING_CHARGE',
                    referenceId: productId,
                    balanceAfter: seller.walletBalance,
                    metadata: { productName }
                }], { session });
            }

            // 4. Record Transaction Log (Audit Trail)
            // Note: We record this even for admins (with 0 cost) to track usage
            await EmbeddingTransaction.create([{
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sellerId: seller._id,
                productId: productId,
                productName: productName,
                modelUsed: model,
                status: 'SUCCESS',
                costPerEmbedding: cost,
                totalCost: cost,
                performedBy: isAdmin ? 'ADMIN' : 'SELLER'
            }], { session });

            await session.commitTransaction();
            return true;
        } catch (error) {
            await session.abortTransaction();
            // Log the failed attempt? Ideally yes, but outside the transaction
            console.error("Billing Transaction Failed:", error);

            // Try to log failed transaction (outside session safely)
            try {
                await EmbeddingTransaction.create({
                    transactionId: `FAIL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    sellerId: sellerId,
                    productId: productId,
                    productName: productName,
                    modelUsed: model,
                    status: 'FAILED',
                    costPerEmbedding: EMBEDDING_COST_INR,
                    totalCost: 0, // No charge
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            } catch (loggingError) {
                console.error("Failed to log failed transaction:", loggingError);
            }

            throw error;
        } finally {
            session.endSession();
        }
    }
};
