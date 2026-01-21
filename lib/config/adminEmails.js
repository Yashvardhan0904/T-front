/**
 * Admin Email Configuration
 * 
 * This file defines which email addresses should have admin access.
 * Add your admin email(s) to the ADMIN_EMAILS array below.
 */

const ADMIN_EMAILS = [
    "admin@trendora.com",
    "yvardhan@gmail.com", // Just in case
    ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : []),
];

/**
 * Check if an email is in the admin list
 * @param {string} email - The email address to check
 * @returns {boolean} - True if the email is an admin email
 */
export function isAdminEmail(email) {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Get the list of admin emails
 * @returns {string[]} - Array of admin email addresses
 */
export function getAdminEmails() {
    return [...ADMIN_EMAILS];
}
