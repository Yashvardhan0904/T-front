// app/lib/mongodb/models/AuditLog.js
import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
    action: string; // e.g. "UNAUTHORIZED_ACCESS", "ROLE_SWITCH"
    performedBy: mongoose.Types.ObjectId; // user who performed the action
    targetId?: mongoose.Types.ObjectId; // optional target entity (user, order, etc.)
    details: any; // free‑form JSON with extra context
    ip: string;
    userAgent: string;
    createdAt: Date;
}

const AuditLogSchema = new Schema({
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Index for fast look‑ups by performedBy and action
AuditLogSchema.index({ performedBy: 1, action: 1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
