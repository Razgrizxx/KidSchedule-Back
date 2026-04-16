export declare class TestController {
    upload(file: Express.Multer.File): {
        ok: boolean;
        url: string;
        originalName: string;
        size: number;
        mimetype: string;
        savedTo: string;
    };
}
