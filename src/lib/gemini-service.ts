
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

  // Helper function to extract JSON from potential markdown code blocks
  private extractJsonFromResponse(text: string): string {
    // Check if the response is wrapped in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1].trim();
    }
    
    // If no markdown code blocks are found, return the original text
    return text;
  }

  async generatePresentation(topic: string, slideCount: number): Promise<Presentation> {
    const systemPrompt = `
      You are an expert presentation generator AI.
      
      Your task is to create a detailed PowerPoint presentation on the topic: "${topic}".
      
      Requirements:
      1. Generate exactly ${slideCount} slides.
      2. For each slide, provide:
         - A clear and relevant Slide Title
         - 4 to 6 informative Bullet Points with in-depth, factual, and concise content (each bullet must add unique value).
      3. Avoid slide numbers and fluff.
      4. Maintain a consistent, professional tone suitable for students, professionals, or public speaking.
      5. Format your output as structured JSON, with each slide as an object containing "title" and "content" (array of bullet points).
      6. Ensure the content is specific to the topic and well-organized for presentation use.
      7. For each slide, suggest a prompt for generating an image related to the slide content.
      
      Output Format Expected:
      
      {
        "title": "Main Presentation Title",
        "slides": [
          {
            "title": "Slide Title",
            "content": [
              "First bullet point with detailed information",
              "Second bullet point with detailed information",
              "Third bullet point with detailed information",
              "Fourth bullet point with detailed information",
              "Fifth bullet point with detailed information"
            ],
            "imagePrompt": "Description for generating an image that would work well with this slide"
          },
          ... more slides
        ]
      }
      
      Don't include any explanations or markdown formatting, just return the raw JSON object.
    `;

    try {
      console.log(`Generating presentation on "${topic}" with ${slideCount} slides...`);
      const result = await this.model.generateContent([systemPrompt]);
      const rawText = await result.response.text();
      console.log("Raw Gemini response:", rawText.substring(0, 200) + "..."); // Log part of the response for debugging
      
      // Clean the response to extract JSON
      const cleanedText = this.extractJsonFromResponse(rawText);
      console.log("Cleaned JSON:", cleanedText.substring(0, 200) + "..."); // Log part of the cleaned response
      
      // Try to parse the cleaned response as JSON
      try {
        const data = JSON.parse(cleanedText);
        
        // Basic validation that we got what we expected
        if (!data.title || !Array.isArray(data.slides)) {
          console.error("Invalid response format - missing title or slides array:", data);
          throw new Error('Invalid response format from Gemini');
        }
        
        // Map the response to our Presentation format
        return {
          title: data.title,
          slides: data.slides.map((slide: any) => ({
            title: slide.title,
            content: Array.isArray(slide.content) ? slide.content : [],
            imagePrompt: slide.imagePrompt || `Image related to ${slide.title}`,
          })),
          theme: 'light', // Default theme
        };
      } catch (e) {
        console.error('Failed to parse Gemini response:', e);
        console.error('Problematic JSON text:', cleanedText);
        throw new Error('Failed to parse presentation data from AI');
      }
    } catch (e) {
      console.error('Gemini API error:', e);
      throw new Error('Failed to generate presentation content');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    // Enhance the image prompt to generate more relevant imagery
    const enhancedPrompt = `${prompt}. High quality, professional presentation visual.`;
      
    // For now, we'll use placeholder images since Gemini doesn't generate images directly
    // In a real implementation, you might want to use another API like Dall-E or Stability
    const placeholders = [
      'https://placehold.co/600x400/4f46e5/ffffff?text=' + encodeURIComponent(prompt.substring(0, 20)),
      'https://placehold.co/600x400/6366f1/ffffff?text=' + encodeURIComponent(prompt.substring(0, 20)), 
      'https://placehold.co/600x400/8b5cf6/ffffff?text=' + encodeURIComponent(prompt.substring(0, 20)),
      'https://placehold.co/600x400/7c3aed/ffffff?text=' + encodeURIComponent(prompt.substring(0, 20))
    ];
    
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }
}

export const geminiService = new GeminiService();
