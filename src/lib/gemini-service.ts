
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
         - A clear and concise Slide Title (under 8 words)
         - 4 to 6 bullet points that are concise (max 20 words each) and informative
      3. Format each slide for readability: use concise bullets (under 20 words), limit to 5-6 points per slide, and structure it so it fits well on a standard 16:9 PowerPoint slide.
      4. Avoid slide numbers and fluff.
      5. Maintain a professional tone suitable for students, professionals, or public speaking.
      6. Format your output as structured JSON, with each slide as an object containing "title" and "content" (array of bullet points).
      7. Ensure the content is specific to the topic and well-organized for presentation use.
      8. For each slide, provide a detailed and specific imagePrompt that clearly describes what should be in the image, including specific visual elements, style, and composition directly related to that slide's content.
      
      Output Format Expected:
      
      {
        "title": "Main Presentation Title",
        "slides": [
          {
            "title": "Concise Slide Title",
            "content": [
              "First concise bullet point (under 20 words)",
              "Second concise bullet point (under 20 words)",
              "Third concise bullet point (under 20 words)",
              "Fourth concise bullet point (under 20 words)",
              "Fifth concise bullet point (under 20 words)"
            ],
            "imagePrompt": "Detailed description for generating a relevant, professional image that shows [specific visual elements] in [specific style] related to this slide"
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
            content: Array.isArray(slide.content) ? slide.content.slice(0, 6) : [], // Limit to max 6 bullet points
            imagePrompt: slide.imagePrompt || `High quality professional presentation image about ${slide.title} related to ${topic} with clear visual elements, suitable for 16:9 slide format`,
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
    // Create a more specific and detailed image prompt for 16:9 ratio
    const enhancedPrompt = `Professional, high-quality presentation visual with 16:9 ratio about: ${prompt}. The image should be clean, well-composed, and suitable for business presentations.`;
    
    // In a production environment, you would integrate with actual image generation APIs
    // Generate a deterministic but varied color based on the prompt content
    const getColorFromPrompt = (text: string): string => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
      return "00000".substring(0, 6 - c.length) + c;
    };
    
    // Use a more relevant visual reference based on the prompt
    const bgColor = getColorFromPrompt(prompt);
    const contrastColor = parseInt(bgColor.substring(0, 2), 16) > 128 ? '000000' : 'FFFFFF';
    
    // Create a placeholder that matches 16:9 ratio exactly
    const encodedTopic = encodeURIComponent(prompt.substring(0, 30));
    
    // Return a placeholder with 16:9 ratio (1600x900)
    return `https://placehold.co/1600x900/${bgColor}/${contrastColor}?text=${encodedTopic}`;
  }
}

export const geminiService = new GeminiService();
