
export interface SlideContent {
  title: string;
  content: string[];
  imagePrompt?: string;
  imageUrl?: string;
}

export interface Presentation {
  title: string;
  slides: SlideContent[];
  theme: 'light' | 'dark';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
