
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Presentation, SlideContent } from './types';

// This service will handle interactions with the Gemini API
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Use the provided API key from environment variables
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
    // Create a default India-focused presentation if no specific topic is provided
    const presentationTopic = topic && topic.trim() !== "" ? topic : "India: A Cultural and Historical Journey";
    
    const systemPrompt = `
      Create a professional presentation about "${presentationTopic}" with exactly ${slideCount} slides.
      The presentation should focus on India, covering aspects such as its rich cultural heritage, 
      historical importance, geographical diversity, economic development, and global significance.
      
      Structure each slide with:
      1. A clear, concise title related to India
      2. 3-5 bullet points of relevant content about India
      3. For each slide, suggest a prompt for generating an image related to India that would work well with the slide content
      
      Include data points about India that could be visualized in charts (every 4th slide should have numerical data 
      about India that could be shown in a chart, such as population statistics, economic figures, or cultural demographics).
      
      Format your response as a JSON object with this structure:
      {
        "title": "Main Presentation Title About India",
        "slides": [
          {
            "title": "Slide 1 Title",
            "content": ["Bullet point 1 about India", "Bullet point 2 about India", "Bullet point 3 about India"],
            "imagePrompt": "Description for generating an image of India"
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
    // Enhance the image prompt to generate India-related imagery
    const enhancedPrompt = prompt.includes("India") ? 
      prompt : 
      `Image of India showing ${prompt}`;
      
    // For now, we'll use placeholder images since Gemini doesn't generate images directly
    // In a real implementation, you might want to use another API like Dall-E or Stability
    const placeholders = [
      'https://placehold.co/600x400/4f46e5/ffffff?text=India+Image',
      'https://placehold.co/600x400/6366f1/ffffff?text=Indian+Culture', 
      'https://placehold.co/600x400/8b5cf6/ffffff?text=Incredible+India',
      'https://placehold.co/600x400/7c3aed/ffffff?text=Indian+Heritage'
    ];
    
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }
}

export const geminiService = new GeminiService();
