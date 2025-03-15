import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import {
  FeedContent,
  FeedItem,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from "./types/feed.types";

interface TranslationPayload {
  q: string;
  source: string;
  target: string;
  format: string;
  api_key?: string;
}

interface TranslationResponse {
  translatedText: string;
}

@Injectable()
export class TranslationService implements OnModuleInit {
  private readonly logger = new Logger(TranslationService.name);
  private translateUrl: string;
  private apiKey?: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.translateUrl =
      this.configService.get<string>("LIBRETRANSLATE_API_URL") ||
      "https://libretranslate.com/translate";
    this.apiKey = this.configService.get<string>("LIBRETRANSLATE_API_KEY");

    this.logger.log({
      message: "Translation service initialized",
      url: this.translateUrl,
      hasApiKey: !!this.apiKey,
    });
  }

  async translateContent(
    content: FeedContent,
    targetLanguage: SupportedLanguage,
  ): Promise<FeedContent> {
    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      throw new HttpException(
        `Unsupported language. Supported languages: ${SUPPORTED_LANGUAGES.join(", ")}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (targetLanguage === "en") {
      return content;
    }

    const translatedEvents = await Promise.all(
      content.events.map((item) => this.translateEvent(item, targetLanguage)),
    );

    return {
      ...content,
      events: translatedEvents,
      language: targetLanguage,
    };
  }

  private async translateEvent(
    event: FeedItem,
    targetLang: SupportedLanguage,
  ): Promise<FeedItem> {
    if (event.type === "date_separator") {
      return event;
    }

    const translatedText = event.text
      ? await this.translateText(event.text, targetLang)
      : undefined;
    const translatedPages = event.pages
      ? await Promise.all(
          event.pages.map(async (page) => ({
            ...page,
            title: await this.translateText(page.title, targetLang),
            extract: await this.translateText(page.extract, targetLang),
          })),
        )
      : undefined;

    return {
      ...event,
      text: translatedText,
      pages: translatedPages,
    };
  }

  private async translateText(
    text: string,
    targetLang: SupportedLanguage,
  ): Promise<string> {
    if (!text?.trim()) {
      return text;
    }

    try {
      const payload: TranslationPayload = {
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
      };

      if (this.apiKey) {
        payload.api_key = this.apiKey;
      }

      const response = await firstValueFrom(
        this.httpService.post<TranslationResponse>(this.translateUrl, payload, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }),
      );

      if (!response.data?.translatedText) {
        this.logger.warn(
          "Translation response missing translatedText",
          response.data,
        );
        return text;
      }

      return response.data.translatedText;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error("Translation error", {
        message: axiosError.message,
        response: axiosError.response?.data,
      });

      if (axiosError.response?.status === 403) {
        if (this.apiKey) {
          throw new HttpException(
            "Translation service authentication failed. Please check API key.",
            HttpStatus.UNAUTHORIZED,
          );
        }
        this.logger.warn(
          "Consider adding LIBRETRANSLATE_API_KEY for better service",
        );
        return text;
      }

      if (axiosError.response?.status === 429) {
        throw new HttpException(
          "Translation service rate limit exceeded. Please try again later.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return text;
    }
  }

  getSupportedLanguages(): readonly SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }
}
