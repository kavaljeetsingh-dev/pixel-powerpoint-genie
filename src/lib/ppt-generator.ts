
import pptxgen from 'pptxgenjs';
import { Presentation, SlideContent } from './types';

// Define themed color schemes
const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'midnight':
      return { background: '#1A1A2E', text: '#EEEEEE', accent: '#E94560' };
    case 'skywave':
      return { background: '#ECF3FF', text: '#334155', accent: '#3B82F6' };
    case 'mint':
      return { background: '#F0FFF4', text: '#065F46', accent: '#34D399' };
    case 'dark':
      return { background: '#1F2937', text: '#F9FAFB', accent: '#6366F1' };
    case 'light':
    default:
      return { background: '#FFFFFF', text: '#333333', accent: '#4F46E5' };
  }
};

export const generatePPT = (presentation: Presentation): void => {
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentation.title;
  
  // Get color scheme based on theme
  const colorScheme = getThemeColors(presentation.theme);
  
  // Add each slide
  presentation.slides.forEach((slide: SlideContent, index: number) => {
    const pptSlide = pptx.addSlide();
    
    // Set background color with subtle transparency
    pptSlide.background = { color: colorScheme.background, transparency: 10 };
    
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
    
    // Add title underline
    pptSlide.addShape(pptx.ShapeType.line, {
      x: 0.5,
      y: 1.4,
      w: '90%',
      line: { color: colorScheme.accent, width: 2 },
    });
    
    // Add semi-transparent box behind text for better readability
    if (slide.content && slide.content.length > 0) {
      pptSlide.addShape(pptx.ShapeType.rect, {
        x: 0.4,
        y: 1.6,
        w: slide.imageUrl ? '55%' : '90%',
        h: 3.2,
        fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : '#FFFFFF', transparency: 85 },
        line: 'none',
      });
      
      // Add content as bullet points
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
    
    // Add branding element
    pptSlide.addText('WebMind AI', {
      x: 0.3,
      y: 0.1,
      fontSize: 14,
      color: colorScheme.text,
      opacity: 0.7,
      bold: true,
    });
    
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
  finalSlide.background = { color: colorScheme.background, transparency: 10 };
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
