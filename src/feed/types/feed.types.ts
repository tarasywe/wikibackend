export interface WikiThumbnail {
  /** URL of the thumbnail image */
  source: string;
  /** Width of the thumbnail in pixels */
  width: number;
  /** Height of the thumbnail in pixels */
  height: number;
}

export interface WikiPage {
  /** Title of the Wikipedia page */
  title: string;
  /** Short extract/summary of the page content */
  extract: string;
  /** Optional thumbnail image for the page */
  thumbnail?: WikiThumbnail;
}

export interface DateSeparator {
  /** Type identifier for date separator */
  type: "date_separator";
  /** Date in MM/DD format */
  date: string;
}

export interface HistoricalEvent {
  /** Type identifier for historical event */
  type: "event";
  /** Description of the historical event */
  text: string;
  /** Year when the event occurred */
  year: number;
  /** Related Wikipedia pages with additional information */
  pages?: WikiPage[];
}

/** Union type for feed items - can be either a date separator or an event */
export type FeedItem = DateSeparator | HistoricalEvent;

export interface FeedContent {
  /** Current page number (starts from 1) */
  page: number;
  /** Number of items per page (default: 20) */
  itemsPerPage: number;
  /** Array of feed items (date separators and events) */
  events: FeedItem[];
  /** Target language code for translated content (optional) */
  language?: string;
}

// Example response:
/*
{
  "page": 1,
  "itemsPerPage": 20,
  "events": [
    {
      "type": "date_separator",
      "date": "03/15"
    },
    {
      "type": "event",
      "text": "44 BC - Julius Caesar is assassinated by Brutus, Cassius and several other Roman senators on the Ides of March",
      "year": -44,
      "pages": [
        {
          "title": "Assassination of Julius Caesar",
          "extract": "Julius Caesar, the Roman dictator, was assassinated by a group of senators on the Ides of March (15 March) of 44 BC during a meeting of the Senate at the Theatre of Pompey.",
          "thumbnail": {
            "source": "https://example.com/image.jpg",
            "width": 800,
            "height": 600
          }
        }
      ]
    }
  ]
}
*/

// For translation endpoint (/feed/translate/:language)
export type SupportedLanguage =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ru"
  | "zh"
  | "ja"
  | "ar"
  | "uk";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "zh",
  "ja",
  "ar",
  "uk",
];

// Internal types for Wikipedia API responses
export interface WikipediaEventResponse {
  events: {
    text: string;
    year: number;
    pages: Array<{
      title: string;
      extract: string;
      thumbnail?: {
        source: string;
        width: number;
        height: number;
      };
    }>;
  }[];
}
