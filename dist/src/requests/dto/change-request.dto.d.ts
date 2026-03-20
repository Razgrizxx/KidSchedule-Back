import { ChangeRequestType } from '@prisma/client';
export declare class CreateChangeRequestDto {
    type: ChangeRequestType;
    originalDate?: string;
    requestedDate: string;
    requestedDateTo?: string;
    childId?: string;
    reason?: string;
}
export declare class RespondChangeRequestDto {
    action: 'ACCEPTED' | 'DECLINED' | 'COUNTER_PROPOSED';
    counterDate?: string;
    counterReason?: string;
}
