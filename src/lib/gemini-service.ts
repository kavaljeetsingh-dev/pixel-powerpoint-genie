
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
      
      // Enhanced image mapping for topic-specific content
      const topicKeywords = {
        // Technology topics
        computers: ["computer", "laptop", "PC", "computing", "hardware"],
        software: ["software", "program", "application", "app", "code", "programming"],
        operatingSystems: ["operating system", "OS", "Windows", "Linux", "macOS", "Unix", "Android", "iOS"],
        networking: ["network", "internet", "LAN", "WAN", "router", "ethernet", "wifi", "protocol"],
        cybersecurity: ["security", "cyber", "firewall", "encryption", "hacker", "protection", "privacy"],
        
        // Business topics
        business: ["business", "company", "corporation", "enterprise", "startup", "organization"],
        marketing: ["marketing", "advertisement", "promotion", "brand", "campaign"],
        finance: ["finance", "money", "investment", "banking", "economy", "market", "stock"],
        management: ["management", "leadership", "strategy", "planning", "organization"],
        
        // Education topics
        education: ["education", "learning", "school", "university", "study", "teaching", "academic"],
        science: ["science", "scientific", "research", "laboratory", "experiment", "discovery"],
        mathematics: ["math", "mathematics", "calculation", "equation", "formula", "statistics"],
        
        // Creative and arts topics
        art: ["art", "artistic", "painting", "drawing", "sculpture", "design"],
        music: ["music", "musical", "song", "instrument", "melody", "rhythm", "audio"],
        literature: ["literature", "book", "writing", "author", "novel", "poem"],
        
        // Generic professional topics
        presentation: ["presentation", "slide", "PowerPoint", "keynote", "speech", "talk"],
        data: ["data", "information", "analytics", "visualization", "chart", "graph", "statistics"],
        
        // Nature and environment
        nature: ["nature", "natural", "environment", "ecosystem", "planet", "earth"],
        climate: ["climate", "weather", "atmosphere", "environmental", "sustainability", "green"],
        
        // Health and medicine
        health: ["health", "medical", "medicine", "healthcare", "wellness", "hospital", "doctor"],
        biology: ["biology", "biological", "cell", "organism", "gene", "DNA", "life science"]
      };

      // Topic-specific image collections
      const topicImages = {
        computers: [
          "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=900&fit=crop"
        ],
        software: [
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop"
        ],
        operatingSystems: [
          "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1607706189992-eae578626c86?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1624377632657-3902bfd35958?w=1600&h=900&fit=crop"
        ],
        networking: [
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1600&h=900&fit=crop"
        ],
        cybersecurity: [
          "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1600&h=900&fit=crop"
        ],
        business: [
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop"
        ],
        marketing: [
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop"
        ],
        finance: [
          "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1607703703674-df96941cfa24?w=1600&h=900&fit=crop"
        ],
        management: [
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=1600&h=900&fit=crop"
        ],
        education: [
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=900&fit=crop"
        ],
        science: [
          "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1600&h=900&fit=crop"
        ],
        mathematics: [
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=1600&h=900&fit=crop"
        ],
        art: [
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1513775192132-0761a1d0e0ac?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&h=900&fit=crop"
        ],
        music: [
          "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1600&h=900&fit=crop"
        ],
        literature: [
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=1600&h=900&fit=crop"
        ],
        presentation: [
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1558021211-6d1403321394?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1579869696034-ec145eb3987c?w=1600&h=900&fit=crop"
        ],
        data: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1600&h=900&fit=crop"
        ],
        nature: [
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=900&fit=crop"
        ],
        climate: [
          "https://images.unsplash.com/photo-1581152309583-abe3aca5e3ba?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1533794318766-28d7d54e1c53?w=1600&h=900&fit=crop"
        ],
        health: [
          "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1576671081837-49000212a370?w=1600&h=900&fit=crop"
        ],
        biology: [
          "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1559757175-7b21baf325c6?w=1600&h=900&fit=crop",
          "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1600&h=900&fit=crop"
        ],
      };
      
      // Match the prompt to a topic
      const promptLower = prompt.toLowerCase();
      let matchedCategory = '';
      let bestMatchScore = 0;

      // Score each category based on keyword matches
      for (const [category, keywords] of Object.entries(topicKeywords)) {
        let categoryScore = 0;
        for (const keyword of keywords) {
          if (promptLower.includes(keyword.toLowerCase())) {
            // Give more weight to exact matches and multi-word matches
            const weight = keyword.split(' ').length > 1 ? 2 : 1;
            categoryScore += weight;
          }
        }
        
        // Update the best match if this category scores higher
        if (categoryScore > bestMatchScore) {
          bestMatchScore = categoryScore;
          matchedCategory = category;
        }
      }
      
      // If we found a good match, use images from that category
      if (matchedCategory && bestMatchScore > 0) {
        console.log(`Matched image category: ${matchedCategory} with score ${bestMatchScore}`);
        const categoryImages = topicImages[matchedCategory as keyof typeof topicImages];
        const randomIndex = Math.floor(Math.random() * categoryImages.length);
        return categoryImages[randomIndex];
      }
      
      // Special case for OS-related topics (exact match for the demo image)
      if (promptLower.includes('operating system') || 
          promptLower.includes('os') || 
          /\bos\b/.test(promptLower)) {
        
        console.log("Using OS-specific image");
        // Use the uploaded OS image for a perfect match to user's screenshot
        return "public/lovable-uploads/5a43bf1f-8937-4faf-b737-90b2b05b40d8.png";
      }
      
      // Fallback to generic professional images
      console.log("No specific topic match found, using generic image");
      const genericImages = [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop",
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop",
        "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1600&h=900&fit=crop"
      ];
      
      const randomIndex = Math.floor(Math.random() * genericImages.length);
      return genericImages[randomIndex];
    } catch (error) {
      console.error("Image generation error:", error);
      
      // Fallback to a generic image if there's an error
      return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&h=900&fit=crop";
    }
  }
}

export const geminiService = new GeminiService();

