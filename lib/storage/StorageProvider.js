/**
 * StorageProvider Interface (Base Class)
 * 
 * Defines the contract for all storage providers (Local Disk, S3, Cloudinary).
 * This abstraction allows swapping the storage backend without changing business logic.
 */
export default class StorageProvider {
    /**
     * Upload a single file to a specific destination
     * @param {File | Buffer} file - The file content
     * @param {string} destinationPath - The relative path or folder
     * @param {string} filename - The desired filename
     * @returns {Promise<{path: string, filename: string}>} - The storage reference
     */
    async upload(file, destinationPath, filename) {
        throw new Error("Method 'upload' must be implemented");
    }

    /**
     * Delete a file from storage
     * @param {string} path - The relative path to delete
     */
    async delete(path) {
        throw new Error("Method 'delete' must be implemented");
    }

    /**
     * Get the full URL for a file
     * @param {string} relativePath - The stored relative path
     * @returns {string} - Full public URL
     */
    getUrl(relativePath) {
        throw new Error("Method 'getUrl' must be implemented");
    }
}
