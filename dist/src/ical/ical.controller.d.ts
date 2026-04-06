import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import type { AuthUser } from '../common/types/auth-user';
import { IcalService } from './ical.service';
export declare class IcalController {
    private readonly ical;
    private readonly config;
    constructor(ical: IcalService, config: ConfigService);
    getFeedUrl(user: AuthUser): Promise<{
        feedUrl: string;
        token: string;
    }>;
    rotateFeedToken(user: AuthUser): Promise<{
        feedUrl: string;
        token: string;
    }>;
    getFeed(token: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
