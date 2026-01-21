import fs from 'fs';
import path from 'path';
import StorageProvider from './StorageProvider';

/**
 * LocalDiskStorageProvider
 * 
 * Implements storage using the local filesystem.
 * This is ideal for development and small-scale deployments.
 */
export default class LocalDiskStorageProvider extends StorageProvider {
    constructor(baseUploadDir = 'public/uploads') {
        super();
        this.baseUploadDir = baseUploadDir;
    }

    /**
     * Upload a file to the local disk
     * @param {Buffer} fileBuffer - File content as buffer
     * @param {string} destinationSubPath - e.g. 'products/123'
     * @param {string} filename - e.g. 'front.jpg'
     */
    async upload(fileBuffer, destinationSubPath, filename) {
        const fullDirPath = path.join(process.cwd(), this.baseUploadDir, destinationSubPath);
        const fullFilePath = path.join(fullDirPath, filename);

        // Ensure directory exists (Scalability: Product-specific folder)
        if (!fs.existsSync(fullDirPath)) {
            fs.mkdirSync(fullDirPath, { recursive: true });
        }

        // Write file
        fs.writeFileSync(fullFilePath, fileBuffer);

        // Return relative path for DB storage (Scalability: Cloud-agnostic)
        // Storing as '/uploads/...' allows the frontend to serve files easily
        // Note: we remove the 'public/' prefix because Next.js serves public folder at root
        const urlPath = `/${this.baseUploadDir.replace(/^public\//, '')}/${destinationSubPath}/${filename}`;

        return {
            path: urlPath,
            filename: filename
        };
    }

    /**
     * Delete a file from local disk
     */
    async delete(relativePath) {
        const fullPath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }

    /**
     * Scalability Note: 
     * To migrate to S3, you would create an S3StorageProvider.js that extends StorageProvider
     * and implements upload/delete using the AWS SDK. The database logic remains UNTOUCHED
     * because it only expects a 'path' string back.
     */
    getUrl(relativePath) {
        // For local disk, the path is already the public URL (if served via static middleware)
        return relativePath;
    }
}
