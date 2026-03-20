import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  topic: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ProposeResolutionDto {
  @IsString()
  @IsNotEmpty()
  summary: string;
}

export class RespondProposalDto {
  @IsString()
  @IsNotEmpty()
  action: 'ACCEPTED' | 'REJECTED';
}
