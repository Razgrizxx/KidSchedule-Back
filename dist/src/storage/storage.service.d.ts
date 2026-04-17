export declare class LocalStorageService {
    upload(file: Express.Multer.File, folder: string, _resourceType?: string): Promise<{
        secure_url: string;
        public_id: string;
    }>;
    delete(publicId: string): Promise<void>;
}
