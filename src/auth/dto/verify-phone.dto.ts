import { IsNotEmpty, IsString } from 'class-validator';

export class SendPhoneCodeDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyPhoneDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
