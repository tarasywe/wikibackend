export interface WikiThumbnail {
  source: string;
  width: number;
  height: number;
}

export interface WikiPage {
  title: string;
  extract: string;
  thumbnail?: WikiThumbnail;
}

export interface WikiEvent {
  type: 'event' | 'date_separator';
  text?: string;
  year?: number;
  date?: string;
  pages?: WikiPage[];
}

export interface FeedContent {
  page: number;
  itemsPerPage: number;
  events: WikiEvent[];
  language?: string;
}

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

export type SupportedLanguage = 
  | 'en' 
  | 'ar' 
  | 'zh' 
  | 'fr' 
  | 'de' 
  | 'hi' 
  | 'id' 
  | 'ga' 
  | 'it' 
  | 'ja' 
  | 'ko' 
  | 'pl' 
  | 'pt' 
  | 'ru' 
  | 'es' 
  | 'tr' 
  | 'vi';

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'ar',
  'zh',
  'fr',
  'de',
  'hi',
  'id',
  'ga',
  'it',
  'ja',
  'ko',
  'pl',
  'pt',
  'ru',
  'es',
  'tr',
  'vi',
]; 