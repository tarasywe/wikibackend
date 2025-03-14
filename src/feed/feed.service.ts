import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { WikipediaQueryDto } from './dto/wikipedia-query.dto';
import { AxiosError } from 'axios';
import { 
  FeedContent, 
  WikiEvent, 
  WikiPage, 
  WikipediaEventResponse 
} from './types/feed.types';

interface WikipediaErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
}

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);
  private readonly ITEMS_PER_PAGE = 20;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

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
      const axiosError = error as AxiosError<WikipediaErrorResponse>;
      this.logger.error('Wikipedia API error', {
        message: axiosError.message,
        response: axiosError.response?.data,
      });

      throw new HttpException(
        `Failed to fetch Wikipedia content: ${axiosError.response?.data?.message || axiosError.message}`,
        axiosError.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private async fetchEventsWithPagination(page: number): Promise<WikiEvent[]> {
    const events: WikiEvent[] = [];
    const currentDate = new Date();
    let hasEnoughEvents = false;

    while (!hasEnoughEvents) {
      const formattedDate = this.formatDate(currentDate);
      const dayEvents = await this.fetchEventsForDate(formattedDate);
      
      if (dayEvents.length > 0) {
        events.push({
          type: 'date_separator',
          date: formattedDate,
        });
        
        events.push(...dayEvents);
      }

      const totalNeeded = page * this.ITEMS_PER_PAGE;
      if (events.length >= totalNeeded) {
        hasEnoughEvents = true;
      } else {
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    const start = (page - 1) * this.ITEMS_PER_PAGE;
    const end = start + this.ITEMS_PER_PAGE;
    
    return events.slice(start, end);
  }

  private async fetchEventsForDate(date: string): Promise<WikiEvent[]> {
    const wikiApiUrl = this.configService.get<string>('WIKIPEDIA_API_URL');
    if (!wikiApiUrl) {
      throw new Error('Wikipedia API URL is not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<WikipediaEventResponse>(
          `${wikiApiUrl}/en/onthisday/events/${date}`,
          {
            headers: {
              'User-Agent': 'WikiApp/1.0 (https://github.com/yourusername/wikiapp; your@email.com)',
              'Accept': 'application/json',
            },
          },
        ),
      );

      if (!response.data?.events) {
        return [];
      }

      return response.data.events.map((event) => this.mapEvent(event));
    } catch (error) {
      const axiosError = error as AxiosError<WikipediaErrorResponse>;
      this.logger.error('Failed to fetch events for date', {
        date,
        error: axiosError.message,
        response: axiosError.response?.data,
      });
      return [];
    }
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }

  private mapEvent(event: WikipediaEventResponse['events'][0]): WikiEvent {
    return {
      type: 'event',
      text: event.text,
      year: event.year,
      pages: event.pages?.map((page): WikiPage => ({
        title: page.title,
        extract: page.extract,
        thumbnail: page.thumbnail ? {
          source: page.thumbnail.source,
          width: page.thumbnail.width,
          height: page.thumbnail.height,
        } : undefined,
      })),
    };
  }
}