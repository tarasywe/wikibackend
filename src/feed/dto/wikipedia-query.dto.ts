import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WikipediaQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({ 
    description: 'Page number (20 items per page)',
    default: 1,
    minimum: 1
  })
  page?: number;
}