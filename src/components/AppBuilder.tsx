
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Presentation } from "@/lib/types";
import { ChatInterface } from "./ChatInterface";
import { PresentationPreview } from "./PresentationPreview";
import { geminiService } from "@/lib/gemini-service";
import { useToast } from "@/hooks/use-toast";

export function AppBuilder() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fallback presentation generator when API isn't available
  const generateFallbackPresentation = (topic: string, slideCount: number): Presentation => {
    const slides = [];
    const topics = ["Introduction", "Key Points", "Analysis", "Benefits", "Challenges", "Case Study", "Statistics", "Future Trends", "Conclusion", "Q&A"];
    
    for (let i = 0; i < slideCount; i++) {
      slides.push({
        title: i < topics.length ? `${topics[i]}` : `Slide ${i + 1}`,
        content: [
          `${topic} point 1`,
          `${topic} point 2`,
          `${topic} point 3`,
        ],
        imagePrompt: `Image related to ${topic}`,
        imageUrl: `https://placehold.co/600x400/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${encodeURIComponent(topic)}+${i+1}`
      });
    }
    
    return {
      title: `Presentation on ${topic}`,
      slides,
      theme: 'light'
    };
  };

  const handleGeneratePresentation = async (prompt: string, slideCount: number) => {
    try {
      setLoading(true);
      
      let newPresentation;
      
      try {
        // Try to generate presentation content from Gemini
        newPresentation = await geminiService.generatePresentation(prompt, slideCount);
        
        // For each slide, generate an image based on the image prompt
        const updatedSlides = await Promise.all(
          newPresentation.slides.map(async (slide) => {
            if (slide.imagePrompt) {
              try {
                const imageUrl = await geminiService.generateImage(slide.imagePrompt);
                return { ...slide, imageUrl };
              } catch (error) {
                console.error("Failed to generate image:", error);
                return slide;
              }
            }
            return slide;
          })
        );
        
        // Update the presentation with generated images
        newPresentation = {
          ...newPresentation,
          slides: updatedSlides
        };
        
      } catch (apiError) {
        console.log("API Generation failed, using fallback:", apiError);
        // Use fallback presentation generator when API fails
        newPresentation = generateFallbackPresentation(prompt, slideCount);
      }
      
      setPresentation(newPresentation);
      toast({
        title: "Presentation Generated",
        description: "Your presentation is ready to be viewed and downloaded."
      });
    } catch (error) {
      console.error("Failed to generate presentation:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate your presentation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-64px)] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          className="h-full border-r overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
        >
          <ChatInterface 
            onSubmit={handleGeneratePresentation}
            loading={loading}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div 
          className="h-full overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
        >
          <PresentationPreview 
            presentation={presentation}
            loading={loading}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
