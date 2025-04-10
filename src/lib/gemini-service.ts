
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Presentation, SlideContent } from './types';

// This service will handle interactions with the Gemini API
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Use the provided API key directly
    const apiKey = "AIzaSyDmej8KqWnwG1Tf0BP6peJhHbBWHOpVhBw";
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the Gemini 2.0 Flash model
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  async generatePresentation(topic: string, slideCount: number): Promise<Presentation> {
    const systemPrompt = `
      Create a professional presentation about "${topic}" with exactly ${slideCount} slides.
      Structure each slide with:
      1. A clear, concise title
      2. 3-5 bullet points of relevant content
      3. For each slide, suggest a prompt for generating an image that would work well with the slide content
      
      Include data points that could be visualized in charts (every 4th slide should have numerical data that could be shown in a chart).
      
      Format your response as a JSON object with this structure:
      {
        "title": "Main Presentation Title",
        "slides": [
          {
            "title": "Slide 1 Title",
            "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
            "imagePrompt": "Description for image generation"
          },
          ... more slides
        ]
      }
      
      Don't include any explanations or markdown formatting, just return the JSON.
    `;

    try {
      const result = await this.model.generateContent([systemPrompt]);
      const rawText = await result.response.text();
      
      // Try to parse the response as JSON
      try {
        const data = JSON.parse(rawText);
        
        // Basic validation that we got what we expected
        if (!data.title || !Array.isArray(data.slides)) {
          throw new Error('Invalid response format from Gemini');
        }
        
        // Map the response to our Presentation format
        return {
          title: data.title,
          slides: data.slides.map((slide: any) => ({
            title: slide.title,
            content: Array.isArray(slide.content) ? slide.content : [],
            imagePrompt: slide.imagePrompt,
          })),
          theme: 'light', // Default theme
        };
      } catch (e) {
        console.error('Failed to parse Gemini response:', e);
        throw new Error('Failed to parse presentation data from AI');
      }
    } catch (e) {
      console.error('Gemini API error:', e);
      throw new Error('Failed to generate presentation content');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    // For now, we'll use placeholder images since Gemini doesn't generate images directly
    // In a real implementation, you might want to use another API like Dall-E or Stability
    const placeholders = [
      'https://placehold.co/600x400/4f46e5/ffffff?text=AI+Generated+Image',
      'https://placehold.co/600x400/6366f1/ffffff?text=Presentation+Visual', 
      'https://placehold.co/600x400/8b5cf6/ffffff?text=Slide+Image',
      'https://placehold.co/600x400/7c3aed/ffffff?text=Generated+Graphic'
    ];
    
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }
}

export const geminiService = new GeminiService();
