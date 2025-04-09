
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Presentation, SlideContent } from "@/lib/types";
import { generatePPT } from "@/lib/ppt-generator";

interface PresentationPreviewProps {
  presentation: Presentation | null;
  loading: boolean;
}

export function PresentationPreview({ presentation, loading }: PresentationPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleNextSlide = () => {
    if (!presentation) return;
    setCurrentSlide((prev) => (prev === presentation.slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    if (!presentation) return;
    setCurrentSlide((prev) => (prev === 0 ? presentation.slides.length - 1 : prev - 1));
  };

  const handleDownload = () => {
    if (!presentation) return;
    generatePPT(presentation);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <ZapIcon size={40} className="text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">Generating Your Presentation</h3>
        <p className="text-center text-muted-foreground">
          Our AI is crafting your slides with engaging content and images...
        </p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold mb-2">No Presentation Yet</h3>
          <p className="text-muted-foreground">
            Describe your presentation topic in the chat to generate your slides.
          </p>
        </div>
      </div>
    );
  }

  const currentSlideContent = presentation.slides[currentSlide];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">{presentation.title}</h2>
        <Button variant="outline" onClick={handleDownload} className="gap-2">
          <DownloadIcon className="h-4 w-4" />
          Download PPT
        </Button>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-hidden" ref={previewRef}>
        <div className="w-full max-w-2xl slide-container">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`slide bg-${presentation.theme === 'light' ? 'white' : 'gray-800'} p-6 rounded-lg shadow-lg`}
          >
            <h3 className={`text-2xl font-bold mb-4 text-${presentation.theme === 'light' ? 'indigo-600' : 'indigo-400'}`}>
              {currentSlideContent.title}
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow space-y-2">
                {currentSlideContent.content.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`rounded-full w-2 h-2 mt-2 bg-${presentation.theme === 'light' ? 'indigo-500' : 'indigo-400'}`} />
                    <p className={`text-${presentation.theme === 'light' ? 'gray-700' : 'gray-200'}`}>{point}</p>
                  </div>
                ))}
              </div>
              
              {currentSlideContent.imageUrl && (
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <img 
                        src={currentSlideContent.imageUrl} 
                        alt={currentSlideContent.title} 
                        className="w-full h-auto object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-4 border-t flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Slide {currentSlide + 1} of {presentation.slides.length}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevSlide}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextSlide}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
