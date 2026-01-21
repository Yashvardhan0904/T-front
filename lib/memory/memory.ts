import { connectDB } from '@/lib/mongodb/mongodb';
import UserMemory from '@/lib/mongodb/models/UserMemory';

export interface MemoryProfile {
    style: { fit: string | null; colors: string[]; materials: string[]; vibe: string | null };
    budget: { avg: number; max: number };
    behavior: { avoids: string[] };
}

export async function getMemory(userId: string, userEmail?: string): Promise<MemoryProfile | null> {
    try {
        await connectDB();

        let mem = null;
        if (userEmail) {
            mem = await UserMemory.findOne({ userEmail }).lean();
        }

        if (!mem) {
            mem = await UserMemory.findOne({ userId }).lean();
        }

        if (!mem) return null;

        return {
            style: mem.style,
            budget: mem.budget,
            behavior: mem.behavior
        };
    } catch (error) {
        console.error('[Memory] Get Error:', error);
        return null;
    }
}

export async function updateMemory(userId: string, update: Partial<MemoryProfile>, userEmail?: string) {
    try {
        await connectDB();
        const query = userEmail ? { userEmail } : { userId };

        await UserMemory.findOneAndUpdate(
            query,
            {
                $set: {
                    ...update,
                    userId, // Keep userId for fallback
                    userEmail
                },
                $currentDate: { lastUpdated: true }
            },
            { upsert: true, new: true }
        );
        console.log(`[Memory] Updated for ${userEmail || userId}`);
    } catch (error) {
        console.error('[Memory] Update Error:', error);
    }
}

export async function learnFromIntent(userId: string, intent: any, userEmail?: string) {
    try {
        const updates: any = {};

        if (intent.fit) {
            updates['style.fit'] = intent.fit;
        }

        if (intent.userName) {
            updates['userName'] = intent.userName;
        }

        if (intent.budget && intent.budget.max) {
            const current = await getMemory(userId, userEmail);
            if (!current || intent.budget.max > current.budget.max) {
                updates['budget.max'] = intent.budget.max;
            }
        }

        if (Object.keys(updates).length > 0) {
            await updateMemory(userId, updates, userEmail);
            console.log('[Memory] Learned from intent:', updates);
        }
    } catch (e) {
        console.error('[Memory] Learn Error:', e);
    }
}
