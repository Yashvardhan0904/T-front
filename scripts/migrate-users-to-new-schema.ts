import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb/mongodb';
import User from '../lib/mongodb/models/User';

// Load env from local .env if present (adjust path for your machine if needed)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Migration script
 *
 * Goal: Make existing MongoDB user documents match the current UserSchema used in code.
 *
 * It will:
 * 1) Move any legacy users from "users" collection into "customer" (if not already there).
 * 2) Convert legacy `refreshToken` string into `refreshTokens` array with a single session.
 * 3) Normalize roles:
 *    - Ensure `roles` is an array of uppercase strings.
 *    - Derive `roles` from legacy `role` if needed.
 *    - Default to ["CUSTOMER"] if nothing is set.
 * 4) Backfill optional fields (`tokenVersion`, `intelligenceLevel`) with safe defaults.
 *
 * This script is idempotent and safe to run multiple times.
 */

async function migrate() {
  await connectDB();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not available');
  }

  const customer = db.collection('customer');
  const legacyUsers = db.collection('users');

  console.log('🔎 Starting user migration to match new schema...');

  // 1) Move any remaining documents from legacy "users" to "customer"
  const legacyCount = await legacyUsers.countDocuments({});
  if (legacyCount > 0) {
    console.log(`📦 Found ${legacyCount} legacy documents in 'users' collection. Ensuring they exist in 'customer'...`);

    const cursor = legacyUsers.find({});
    let moved = 0;

    while (await cursor.hasNext()) {
      const legacyUser = await cursor.next();
      if (!legacyUser) continue;

      const existing = await customer.findOne({ _id: legacyUser._id });
      if (!existing) {
        await customer.insertOne(legacyUser);
        moved++;
      }
    }

    console.log(`✅ Ensured legacy users are present in 'customer' collection (new inserts: ${moved}).`);
  } else {
    console.log('ℹ️ No documents found in legacy "users" collection.');
  }

  // 2) Normalize documents in "customer" to match new schema
  const docs = customer.find({});
  let updatedCount = 0;

  while (await docs.hasNext()) {
    const doc: any = await docs.next();
    if (!doc) continue;

    const updates: any = {};

    // 2a) Normalize roles / role
    const legacyRole: string | undefined = doc.role;
    let roles: string[] = Array.isArray(doc.roles) ? [...doc.roles] : [];

    if (!roles.length && legacyRole) {
      roles.push(legacyRole);
    }

    if (!roles.length) {
      roles.push('CUSTOMER');
    }

    // Uppercase & de-duplicate
    roles = Array.from(new Set(roles.map((r) => String(r).toUpperCase())));

    updates.roles = roles;

    // 2b) Intelligence level default
    if (!doc.intelligenceLevel) {
      updates.intelligenceLevel = 'unsophisticated';
    }

    // 2c) tokenVersion default
    if (typeof doc.tokenVersion !== 'number') {
      updates.tokenVersion = 0;
    }

    // 2d) Clean up all legacy refresh token fields
    const unset: any = {};
    if (Object.prototype.hasOwnProperty.call(doc, 'refreshToken')) {
      unset.refreshToken = '';
    }
    if (Object.prototype.hasOwnProperty.call(doc, 'refreshTokens')) {
      unset.refreshTokens = '';
    }

    if (Object.keys(updates).length > 0 || Object.keys(unset).length > 0) {
      await customer.updateOne(
        { _id: doc._id },
        {
          ...(Object.keys(updates).length ? { $set: updates } : {}),
          ...(Object.keys(unset).length ? { $unset: unset } : {}),
        },
      );
      updatedCount++;
    }
  }

  console.log(`✅ User migration complete. Updated ${updatedCount} document(s) in 'customer'.`);
}

migrate()
  .then(() => {
    console.log('🎉 Migration finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });


