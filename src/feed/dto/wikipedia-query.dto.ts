import { IsOptional, IsNumber, Min, IsString, Matches } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class WikipediaQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: "Page number (20 items per page)",
    default: 1,
    minimum: 1,
  })
  page?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/, {
    message: "Date must be in MM/DD format (e.g., 03/15)",
  })
  @ApiPropertyOptional({
    description:
      "Starting date in MM/DD format (e.g., 03/15). Defaults to current date",
    example: "03/15",
  })
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}$/, {
    message: "Language must be a 2-letter code (e.g., en, es, fr)",
  })
  @ApiPropertyOptional({
    description:
      "Language code for Wikipedia content (e.g., en, es, fr). Defaults to en",
    example: "en",
    enum: ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "zh", "uk"],
  })
  language?: string;
}
