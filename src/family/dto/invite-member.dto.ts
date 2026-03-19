import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
