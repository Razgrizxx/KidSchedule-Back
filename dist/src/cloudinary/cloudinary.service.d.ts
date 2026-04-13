import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    constructor(config: ConfigService);
    upload(file: Express.Multer.File, folder: string, resourceType?: 'image' | 'raw' | 'auto'): Promise<UploadApiResponse>;
    delete(publicId: string): Promise<void>;
}
