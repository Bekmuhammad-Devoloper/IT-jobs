import { IsOptional, IsString, IsArray, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceLevel } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) photoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) contactPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) profession?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) experience?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(14) @Max(100) age?: number;
  @ApiPropertyOptional({ enum: ExperienceLevel }) @IsOptional() @IsEnum(ExperienceLevel) level?: ExperienceLevel;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) @MaxLength(60, { each: true }) technologies?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) bio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) portfolio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) github?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) salaryExpectation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) resumeUrl?: string;
}
