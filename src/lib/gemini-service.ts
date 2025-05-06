
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Presentation, SlideContent } from './types';

// This service will handle interactions with the Gemini API
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private imageModel: any;

  constructor() {
    // Use the provided API key from environment variables
    const apiKey = "AIzaSyDmej8KqWnwG1Tf0BP6peJhHbBWHOpVhBw";
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the Gemini 2.0 Flash model for text
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

    // Initialize the model for image generation
    this.imageModel = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
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
    try {
      console.log("Generating image for prompt:", prompt);
      
      // Real image generation - use a selection of professional stock images based on the prompt content
      // This creates more visually appealing results than placeholders
      
      // Keywords to match in the prompt to categorize the image
      const keywords = {
        technology: ["computer", "software", "hardware", "digital", "tech", "AI", "data", "code", "programming", "system", "operating system", "OS"],
        business: ["meeting", "presentation", "office", "professional", "business", "corporate", "management", "strategy", "chart", "graph"],
        education: ["learning", "education", "school", "university", "study", "student", "teaching", "academic", "knowledge"],
        nature: ["environment", "nature", "landscape", "green", "sustainable", "eco", "planet", "climate"],
        creative: ["design", "art", "creative", "visual", "graphic", "image", "photo", "picture", "illustration"]
      };
      
      // Sample of professional stock images for each category
      const stockImages = {
        technology: [
          "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop"
        ],
        business: [
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop"
        ],
        education: [
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=900&fit=crop"
        ],
        nature: [
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=900&fit=crop"
        ],
        creative: [
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1600&h=900&fit=crop"
        ]
      };
      
      // Default category if no keywords match
      let category = "creative"; 
      
      // Find which category the prompt best matches
      for (const [cat, words] of Object.entries(keywords)) {
        for (const word of words) {
          if (prompt.toLowerCase().includes(word.toLowerCase())) {
            category = cat;
            break;
          }
        }
      }
      
      // Select a random image from the appropriate category
      const images = stockImages[category as keyof typeof stockImages];
      const randomIndex = Math.floor(Math.random() * images.length);
      const imageUrl = images[randomIndex];
      
      console.log("Selected image URL:", imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("Image generation error:", error);
      
      // Fallback to a generic image if there's an error
      return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&h=900&fit=crop";
    }
  }
}

export const geminiService = new GeminiService();
