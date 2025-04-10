import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  Version,
  UseGuards,
  Param,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { ThrottlerGuard } from "@nestjs/throttler";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { FeedService } from "./feed.service";
import { TranslationService } from "./translation.service";
import { WikipediaQueryDto } from "./dto/wikipedia-query.dto";
import { FeedContent } from "./types/feed.types";

@Controller("feed")
@ApiTags("feed")
@UseGuards(ThrottlerGuard)
@UseInterceptors(CacheInterceptor)
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly translationService: TranslationService,
  ) {}

  @Version("1")
  @Get()
  @ApiOperation({
    summary: "Get historical events",
    description:
      "Retrieve historical events with optional pagination and start date.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number for pagination (default: 1)",
  })
  @ApiQuery({
    name: "date",
    required: false,
    type: String,
    description: "Starting date in MM/DD format (default: current date)",
    example: "02/14",
  })
  @ApiResponse({
    status: 200,
    description: "Returns a paginated list of historical events",
    schema: {
      allOf: [{ $ref: "#/components/schemas/FeedContent" }],
    },
  })
  async getFeed(@Query() query: WikipediaQueryDto): Promise<FeedContent> {
    return this.feedService.getFeaturedContent(query);
  }

  @Version("1")
  @Get("translate/:language")
  @ApiOperation({
    summary: "Get translated Wikipedia historical events",
    description:
      "Returns translated historical events in the specified language. Inherits all functionalities of the /feed endpoint.",
  })
  @ApiParam({
    name: "language",
    description: "Target language code for translation",
    example: "es",
    schema: { type: "string" },
  })
  @ApiResponse({
    status: 200,
    description: "Historical events retrieved and translated successfully",
    schema: {
      type: "object",
      properties: {
        page: { type: "number", example: 1 },
        itemsPerPage: { type: "number", example: 20 },
        language: { type: "string", example: "es" },
        events: {
          type: "array",
          items: {
            oneOf: [
              {
                type: "object",
                properties: {
                  type: { type: "string", example: "date_separator" },
                  date: { type: "string", example: "03/15" },
                },
              },
              {
                type: "object",
                properties: {
                  type: { type: "string", example: "event" },
                  text: { type: "string" },
                  year: { type: "number" },
                  pages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        extract: { type: "string" },
                        thumbnail: {
                          type: "object",
                          properties: {
                            source: { type: "string" },
                            width: { type: "number" },
                            height: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid language code",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: {
          type: "string",
          example: "Unsupported language. Supported languages: en, es, fr, ...",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Translation service authentication failed",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        message: {
          type: "string",
          example:
            "Translation service authentication failed. Please check API key.",
        },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: "Translation service rate limit exceeded",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 429 },
        message: {
          type: "string",
          example:
            "Translation service rate limit exceeded. Please try again later.",
        },
      },
    },
  })
  async getTranslatedFeed(
    @Query() query: WikipediaQueryDto,
    @Param("targetLanguage") targetLanguage: string,
  ): Promise<FeedContent> {
    const content = await this.feedService.getFeaturedContent(query);
    return this.translationService.translateContent(
      content,
      targetLanguage as any,
    );
  }
}
