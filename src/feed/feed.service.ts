import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { WikipediaQueryDto } from "./dto/wikipedia-query.dto";
import { AxiosError } from "axios";
import {
  FeedContent,
  HistoricalEvent,
  DateSeparator,
  FeedItem,
  WikiPage,
  WikipediaEventResponse,
} from "./types/feed.types";

interface WikipediaErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
}

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);
  private readonly ITEMS_PER_PAGE = 20;
  private readonly DEFAULT_WIKI_API_URL =
    "https://api.wikimedia.org/feed/v1/wikipedia";
  private readonly wikiApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.wikiApiUrl =
      this.configService.get<string>("WIKIPEDIA_API_URL") ||
      this.DEFAULT_WIKI_API_URL;
    this.logger.log(`Initialized with Wikipedia API URL: ${this.wikiApiUrl}`);
  }

  async getFeaturedContent(query: WikipediaQueryDto): Promise<FeedContent> {
    try {
      const page = query.page || 1;
      const events = await this.fetchEventsWithPagination(page);

      return {
        page,
        itemsPerPage: this.ITEMS_PER_PAGE,
        events,
      };
    } catch (error) {
      this.logger.warn("Error fetching featured content", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        page: query.page || 1,
        itemsPerPage: this.ITEMS_PER_PAGE,
        events: [],
      };
    }
  }

  private async fetchEventsWithPagination(page: number): Promise<FeedItem[]> {
    const events: FeedItem[] = [];
    const currentDate = new Date();
    let hasEnoughEvents = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!hasEnoughEvents && retryCount < maxRetries) {
      try {
        const formattedDate = this.formatDate(currentDate);
        const dayEvents = await this.fetchEventsForDate(formattedDate);

        if (dayEvents.length > 0) {
          const dateSeparator: DateSeparator = {
            type: "date_separator",
            date: formattedDate,
          };
          events.push(dateSeparator);
          events.push(...dayEvents);
        }

        const totalNeeded = page * this.ITEMS_PER_PAGE;
        if (events.length >= totalNeeded) {
          hasEnoughEvents = true;
        } else {
          currentDate.setDate(currentDate.getDate() - 1);
        }
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          this.logger.warn(
            `Max retries (${maxRetries}) reached, returning available events`,
          );
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    const start = (page - 1) * this.ITEMS_PER_PAGE;
    const end = start + this.ITEMS_PER_PAGE;

    return events.slice(start, end);
  }

  private async fetchEventsForDate(date: string): Promise<HistoricalEvent[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<WikipediaEventResponse>(
          `${this.wikiApiUrl}/en/onthisday/events/${date}`,
          {
            headers: {
              "User-Agent": "WikiApp/1.0",
              Accept: "application/json",
            },
            timeout: 5000,
          },
        ),
      );

      if (!response.data?.events) {
        return [];
      }

      return response.data.events.map((event) => this.mapEvent(event));
    } catch (error) {
      const axiosError = error as AxiosError<WikipediaErrorResponse>;
      if (axiosError.code === "ECONNABORTED") {
        this.logger.warn("Request timeout, will retry");
      } else {
        this.logger.warn("Failed to fetch events for date", {
          date,
          error: axiosError.message,
        });
      }
      return [];
    }
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  }

  private mapEvent(
    event: WikipediaEventResponse["events"][0],
  ): HistoricalEvent {
    return {
      type: "event",
      text: event.text,
      year: event.year,
      pages: event.pages?.slice(0, -1).map(
        (page): WikiPage => ({
          title: page.title,
          extract: page.extract,
          thumbnail: page.thumbnail
            ? {
                source: page.thumbnail.source,
                width: page.thumbnail.width,
                height: page.thumbnail.height,
              }
            : undefined,
        }),
      ),
    };
  }
}
