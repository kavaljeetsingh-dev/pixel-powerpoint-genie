
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

  const handleGeneratePresentation = async (prompt: string, slideCount: number) => {
    try {
      setLoading(true);
      
      // Generate presentation content from Gemini
      const newPresentation = await geminiService.generatePresentation(prompt, slideCount);
      
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
      const completedPresentation = {
        ...newPresentation,
        slides: updatedSlides
      };
      
      setPresentation(completedPresentation);
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
