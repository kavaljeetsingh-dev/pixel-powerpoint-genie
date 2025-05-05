
import pptxgen from 'pptxgenjs';
import { Presentation, SlideContent } from './types';

// Define themed color schemes with expanded options
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
    case 'sunset':
      return { background: '#FFFBF5', text: '#7D3C98', accent: '#FF7F50' };
    case 'ocean':
      return { background: '#EBF8FB', text: '#1A5276', accent: '#3498DB' };
    case 'forest':
      return { background: '#E8F8F5', text: '#145A32', accent: '#27AE60' };
    case 'royal':
      return { background: '#F5EEF8', text: '#4A235A', accent: '#8E44AD' };
    case 'light':
    default:
      return { background: '#FFFFFF', text: '#333333', accent: '#4F46E5' };
  }
};

// Helper function to create chart slide
const createChartSlide = (pptx: any, slideData: SlideContent, colorScheme: any, totalSlides: number, index: number) => {
  const slide = pptx.addSlide();
  
  // Set background color
  slide.background = { color: colorScheme.background };
  
  // Add title
  slide.addText(slideData.title, {
    x: 0.5, 
    y: 0.5, 
    w: '90%', 
    h: 1, 
    fontSize: 36, 
    color: colorScheme.accent,
    bold: true,
    fontFace: 'Arial',
  });
  
  // Title underline
  slide.addShape(pptx.ShapeType.LINE, {
    x: 0.5,
    y: 1.4,
    w: '90%',
    h: 0,
    line: { color: colorScheme.accent, width: 2 },
  });
  
  // Add chart based on content data
  // This is a simple bar chart example
  slide.addChart(pptx.ChartType.BAR, 
    [
      { name: 'Point 1', labels: ['Category'], values: [75] },
      { name: 'Point 2', labels: ['Category'], values: [42] },
      { name: 'Point 3', labels: ['Category'], values: [88] },
    ], 
    {
      x: 1, 
      y: 1.6, 
      w: 8, 
      h: 4,
      chartColors: [colorScheme.accent, colorScheme.accent + '99', colorScheme.accent + '66'],
      dataLabelColor: colorScheme.text,
      legendColor: colorScheme.text,
      legendPos: 'b'
    }
  );
  
  // Add slide number
  slide.addText(`${index + 1}/${totalSlides}`, {
    x: '90%', 
    y: '90%', 
    w: 0.5, 
    h: 0.3, 
    fontSize: 12, 
    color: colorScheme.text,
    fontFace: 'Arial',
    align: 'right',
  });
  
  // Add branding element
  slide.addText('WebMind AI', {
    x: 0.3,
    y: 0.1,
    fontSize: 14,
    color: colorScheme.text,
    transparency: 30,
    bold: true,
  });
  
  return slide;
};

export const generatePPT = (presentation: Presentation): void => {
  const pptx = new pptxgen();
  
  // Set presentation properties with explicit 16:9 ratio
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentation.title;
  
  // Get color scheme based on theme
  const colorScheme = getThemeColors(presentation.theme || 'light');
  
  // Add each slide with varied layouts
  presentation.slides.forEach((slide: SlideContent, index: number) => {
    // Determine if this should be a chart slide (every 4th slide for example)
    if (index > 0 && index % 4 === 0 && slide.content && slide.content.length >= 3) {
      createChartSlide(pptx, slide, colorScheme, presentation.slides.length, index);
      return;
    }
    
    const pptSlide = pptx.addSlide();
    
    // Set background color (no transparency in exported PPT)
    pptSlide.background = { color: colorScheme.background };
    
    // Alternate between different layouts
    const layoutType = index % 3;
    
    // Add title
    pptSlide.addText(slide.title, {
      x: 0.5, 
      y: layoutType === 2 ? 0.3 : 0.5, 
      w: '90%', 
      h: 1, 
      fontSize: 36, 
      color: colorScheme.accent,
      bold: true,
      fontFace: 'Arial',
      align: layoutType === 1 ? 'center' : 'left',
    });
    
    // Title underline with varied style
    pptSlide.addShape(pptx.ShapeType.LINE, {
      x: layoutType === 1 ? '5%' : 0.5,
      y: layoutType === 2 ? 1.2 : 1.4,
      w: '90%',
      h: 0,
      line: { color: colorScheme.accent, width: layoutType === 0 ? 2 : 3 },
    });
    
    // Add content based on layout type
    if (slide.content && slide.content.length > 0) {
      if (layoutType === 0) {
        // Standard layout
        pptSlide.addShape(pptx.ShapeType.RECTANGLE, {
          x: 0.4,
          y: 1.6,
          w: slide.imageUrl ? '55%' : '90%',
          h: 3.2,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { type: 'none' },
        });
        
        // Add content as bullet points
        const contentText = slide.content.map(point => `• ${point}`).join('\n');
        pptSlide.addText(contentText, {
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
      else if (layoutType === 1) {
        // Two-column layout
        const pointsPerColumn = Math.ceil(slide.content.length / 2);
        const column1 = slide.content.slice(0, pointsPerColumn);
        const column2 = slide.content.slice(pointsPerColumn);
        
        // Column 1 background
        pptSlide.addShape(pptx.ShapeType.RECTANGLE, {
          x: 0.4,
          y: 1.6,
          w: '42%',
          h: 3.2,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { type: 'none' },
        });
        
        // Column 1 content
        const col1Text = column1.map(point => `• ${point}`).join('\n');
        pptSlide.addText(col1Text, {
          x: 0.5, 
          y: 1.7, 
          w: '40%', 
          h: 3, 
          fontSize: 20, 
          color: colorScheme.text,
          fontFace: 'Arial',
          lineSpacing: 28,
        });
        
        // Column 2 background
        pptSlide.addShape(pptx.ShapeType.RECTANGLE, {
          x: '50%',
          y: 1.6,
          w: '42%',
          h: 3.2,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { type: 'none' },
        });
        
        // Column 2 content
        const col2Text = column2.map(point => `• ${point}`).join('\n');
        pptSlide.addText(col2Text, {
          x: '50.1%', 
          y: 1.7, 
          w: '40%', 
          h: 3, 
          fontSize: 20, 
          color: colorScheme.text,
          fontFace: 'Arial',
          lineSpacing: 28,
        });
      }
      else if (layoutType === 2) {
        // Centered content layout with accent blocks
        pptSlide.addShape(pptx.ShapeType.RECTANGLE, {
          x: '10%',
          y: 1.4,
          w: '80%',
          h: 3.5,
          fill: { color: colorScheme.background === '#FFFFFF' ? '#F8F8F8' : colorScheme.background + '90' },
          line: { color: colorScheme.accent, width: 1, dashType: 'dash' },
        });
        
        // Add content with special formatting
        slide.content.forEach((point, i) => {
          pptSlide.addText(`${i+1}. ${point}`, {
            x: '15%', 
            y: 1.6 + (i * 0.6), 
            w: '70%', 
            h: 0.5, 
            fontSize: 18, 
            color: colorScheme.text,
            fontFace: 'Arial',
            bullet: false,
            bold: i === 0, // Bold the first point
          });
          
          // Add small accent indicator
          pptSlide.addShape(pptx.ShapeType.RECTANGLE, {
            x: '12%',
            y: 1.72 + (i * 0.6),
            w: 0.2,
            h: 0.2,
            fill: { color: colorScheme.accent },
            line: { type: 'none' },
            rectRadius: 2,
          });
        });
      }
    }
    
    // Add image if available with different styling based on layout
    if (slide.imageUrl) {
      if (layoutType === 0) {
        pptSlide.addImage({
          path: slide.imageUrl,
          x: '60%', 
          y: 1.7,
          w: 3.5, 
          h: 3,
        });
      } else if (layoutType === 1) {
        // Centered larger image for layout 1
        pptSlide.addImage({
          path: slide.imageUrl,
          x: '27.5%', 
          y: 5,
          w: 5, 
          h: 3,
        });
      } else {
        // Right-aligned image with border for layout 2
        pptSlide.addImage({
          path: slide.imageUrl,
          x: '66%', 
          y: 1.7,
          w: 3, 
          h: 3.2,
        });
        
        // Decorative frame around image
        pptSlide.addShape(pptx.ShapeType.RECTANGLE, {
          x: '65.8%',
          y: 1.6,
          w: 3.2,
          h: 3.4,
          line: { color: colorScheme.accent, width: 2 },
          fill: { type: 'none' }
        });
      }
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
    
    // Add branding element
    pptSlide.addText('WebMind AI', {
      x: 0.3,
      y: 0.1,
      fontSize: 14,
      color: colorScheme.text,
      transparency: 30,
      bold: true,
    });
  });
  
  // Add a final "Thank You" slide with a dynamic design
  const finalSlide = pptx.addSlide();
  finalSlide.background = { color: colorScheme.background };
  
  // Add a decorative shape
  finalSlide.addShape(pptx.ShapeType.RECTANGLE, {
    x: '20%',
    y: 2,
    w: '60%',
    h: 2.5,
    fill: { color: colorScheme.accent + '22' },
    line: { color: colorScheme.accent, width: 3 },
    rectRadius: 10,
  });
  
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
