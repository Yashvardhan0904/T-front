import Pusher from "pusher";

/**
 * Pusher Server instance for triggering events from the backend.
 * Requires PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER in .env
 */
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

export default pusher;

/**
 * Trigger a real-time update event.
 * 
 * @param channel - The channel to broadcast on (e.g. 'products', 'orders')
 * @param event - The event name (e.g. 'created', 'updated')
 * @param data - The data to send
 */
export async function triggerUpdate(channel: string, event: string, data: any) {
    try {
        if (!process.env.PUSHER_APP_ID) {
            console.warn(`[Realtime] Pusher not configured. Skipping event: ${channel}:${event}`);
            return;
        }
        await pusher.trigger(channel, event, data);
        console.log(`[Realtime] Triggered ${channel}:${event}`);
    } catch (error: any) {
        console.error(`[Realtime] Failed to trigger ${channel}:${event}:`, error.message);
    }
}
