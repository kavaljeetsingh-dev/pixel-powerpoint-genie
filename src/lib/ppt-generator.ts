
import pptxgen from 'pptxgenjs';
import { Presentation, SlideContent } from './types';

export const generatePPT = (presentation: Presentation): void => {
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentation.title;
  
  // Create a master slide with theme settings
  const colorScheme = presentation.theme === 'light' 
    ? { background: '#FFFFFF', text: '#333333', accent: '#4F46E5' }
    : { background: '#1F2937', text: '#F9FAFB', accent: '#6366F1' };
  
  // Add each slide
  presentation.slides.forEach((slide: SlideContent, index: number) => {
    const pptSlide = pptx.addSlide();
    
    // Set background color based on theme
    pptSlide.background = { color: colorScheme.background };
    
    // Add title
    pptSlide.addText(slide.title, {
      x: 0.5, 
      y: 0.5, 
      w: '90%', 
      h: 1, 
      fontSize: 36, 
      color: colorScheme.accent,
      bold: true,
      fontFace: 'Arial',
    });
    
    // Add content as bullet points
    if (slide.content && slide.content.length > 0) {
      pptSlide.addText(slide.content.map(point => `• ${point}`).join('\n'), {
        x: 0.5, 
        y: 1.7, 
        w: slide.imageUrl ? '55%' : '90%', 
        h: 3, 
        fontSize: 20, 
        color: colorScheme.text,
        fontFace: 'Arial',
        lineSpacing: 28,
      });
    }
    
    // Add image if available
    if (slide.imageUrl) {
      pptSlide.addImage({
        path: slide.imageUrl,
        x: '60%', 
        y: 1.7,
        w: 3.5, 
        h: 3,
      });
    }
    
    // Add slide number
    pptSlide.addText(`${index + 1}/${presentation.slides.length}`, {
      x: '90%', 
      y: '90%', 
      w: 0.5, 
      h: 0.3, 
      fontSize: 12, 
      color: colorScheme.text,
      fontFace: 'Arial',
      align: 'right',
    });
  });
  
  // Add a final "Thank You" slide
  const finalSlide = pptx.addSlide();
  finalSlide.background = { color: colorScheme.background };
  finalSlide.addText('Thank You!', {
    x: 0.5, 
    y: 2.5, 
    w: '90%', 
    h: 1, 
    align: 'center',
    fontSize: 60, 
    color: colorScheme.accent,
    bold: true,
    fontFace: 'Arial',
  });
  
  // Save the presentation
  pptx.writeFile({ fileName: `${presentation.title.replace(/\s+/g, '_')}_Presentation.pptx` });
};
