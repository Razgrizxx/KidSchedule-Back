export declare class CreateSessionDto {
    topic: string;
}
export declare class SendMessageDto {
    content: string;
}
export declare class ProposeResolutionDto {
    summary: string;
}
export declare class RespondProposalDto {
    action: 'ACCEPTED' | 'REJECTED';
}
