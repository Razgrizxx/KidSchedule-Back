import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePostDto {
  @IsString()
  slug!: string;

  @IsString()
  title!: string;

  @IsString()
  excerpt!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
