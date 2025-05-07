// typewriterHint.js - Fixed text wrapping with manual line breaking

class TypewriterHint {
  constructor() {
    this.panel = document.getElementById('typewriterPanel');
    this.textElement = document.getElementById('typewriterText');
    this.continueArrow = document.getElementById('continueArrow');
    this.fullText = '';
    this.isTyping = false;
    this.charIndex = 0;
    this.typingSpeed = 30; // ms between characters
    this.maxLineWidth = 0; // Will be calculated based on container width
    
    // Apply improved styles
    this.applyStyles();
    
    // Bind event listeners
    this.panel.addEventListener('click', this.handleClick.bind(this));
    
    // Hide panel initially
    this.panel.style.display = 'none';
  }
  
  applyStyles() {
    if (this.textElement) {
      // Fixed container with no automatic wrapping
      this.textElement.style.whiteSpace = 'pre'; // No auto-wrapping
      this.textElement.style.fontFamily = 'Consolas, monospace';
      this.textElement.style.fontSize = '18px';
      this.textElement.style.lineHeight = '1.5';
      this.textElement.style.color = 'white';
      this.textElement.style.padding = '15px 40px 15px 15px'; // Extra padding on right for continue arrow
      this.textElement.style.boxSizing = 'border-box';
      this.textElement.style.height = '100%';
      this.textElement.style.overflow = 'hidden';
      this.textElement.style.userSelect = 'none'; // Prevent text selection which can cause zoom
      this.textElement.style.webkitUserSelect = 'none';
    }
    
    if (this.panel) {
      this.panel.style.overflow = 'hidden';
      this.panel.style.height = '80px'; // Fixed height to prevent resizing
      this.panel.style.maxHeight = '150px';
      this.panel.style.width = '100%';
      this.panel.style.background = 'rgba(0, 0, 0, 0.8)';
      this.panel.style.border = '3px solid #5590d2';
      this.panel.style.borderRadius = '5px';
      this.panel.style.position = 'relative';
      this.panel.style.cursor = 'pointer';
      this.panel.style.touchAction = 'manipulation'; // Prevent pinch zoom
    }
    
    if (this.continueArrow) {
      this.continueArrow.style.position = 'absolute';
      this.continueArrow.style.bottom = '10px';
      this.continueArrow.style.right = '15px';
      this.continueArrow.style.fontSize = '20px';
      this.continueArrow.style.color = '#5590d2';
      this.continueArrow.style.pointerEvents = 'none'; // Don't capture clicks
      this.continueArrow.style.display = 'none';
    }
  }
  
  // Calculate the maximum line width based on container size
  calculateMaxLineWidth() {
    // Get the container width and subtract padding
    const containerWidth = this.textElement.clientWidth;
    const paddingLeft = parseInt(getComputedStyle(this.textElement).paddingLeft) || 15;
    const paddingRight = parseInt(getComputedStyle(this.textElement).paddingRight) || 40;
    
    // Calculate available width for text
    this.maxLineWidth = containerWidth - paddingLeft - paddingRight - 20; // Extra 20px buffer
  }
  
  // Manual text wrapping function that inserts line breaks
  wrapText(text) {
    if (!this.maxLineWidth) {
      this.calculateMaxLineWidth();
    }
    
    // Create a temporary span to measure text width
    const measurer = document.createElement('span');
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.style.fontFamily = this.textElement.style.fontFamily;
    measurer.style.fontSize = this.textElement.style.fontSize;
    measurer.style.whiteSpace = 'nowrap';
    document.body.appendChild(measurer);
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    // Process each word
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Test if adding this word exceeds max width
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      measurer.textContent = testLine;
      
      if (measurer.offsetWidth > this.maxLineWidth && currentLine) {
        // Line would be too long, push current line and start a new one
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Add word to current line
        currentLine = testLine;
      }
    }
    
    // Add the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Clean up
    document.body.removeChild(measurer);
    
    // Join lines with explicit line breaks
    return lines.join('\\n');
  }
  
  showHint(text) {
    if (!text) {
      this.clearHint();
      return;
    }
    
    // Reset state
    this.fullText = text;
    this.isTyping = true;
    this.charIndex = 0;
    
    // Show panel and prepare for typing
    this.panel.style.display = 'block';
    this.textElement.textContent = '';
    this.continueArrow.style.display = 'none';
    
    // Process text with manual wrapping
    const wrappedText = this.wrapText(text);
    this.processedText = wrappedText;
    
    // Fix panel height - use a static height to prevent resizing
    const lineCount = (this.processedText.match(/\\n/g) || []).length + 1;
    const estimatedHeight = Math.min(lineCount * 27 + 20, 150); // 27px per line + padding
    this.panel.style.height = `${estimatedHeight}px`;
    
    // Create virtual buffer to ensure smooth rendering
    this.virtualBuffer = '';
    
    // Start the typewriter effect
    this.typeNextChar();
  }
  
  typeNextChar() {
    if (this.charIndex >= this.processedText.length) {
      // Typing complete
      this.isTyping = false;
      this.continueArrow.style.display = 'block';
      return;
    }
    
    // Get next character
    const nextChar = this.processedText[this.charIndex];
    
    // Special handling for line breaks
    if (nextChar === '\\' && this.charIndex + 1 < this.processedText.length && 
        this.processedText[this.charIndex + 1] === 'n') {
      this.virtualBuffer += '\n';
      this.charIndex += 2; // Skip over both '\' and 'n'
    } else {
      // Normal character
      this.virtualBuffer += nextChar;
      this.charIndex++;
    }
    
    // Update displayed text
    this.textElement.textContent = this.virtualBuffer;
    
    // Schedule next character
    if (this.isTyping) {
      setTimeout(() => this.typeNextChar(), this.typingSpeed);
    }
  }
  
  handleClick() {
    if (this.isTyping) {
      // Complete typing immediately
      this.isTyping = false;
      
      // Replace all \n sequences with actual line breaks
      this.virtualBuffer = this.processedText.replace(/\\n/g, '\n');
      this.textElement.textContent = this.virtualBuffer;
      
      this.charIndex = this.processedText.length;
      this.continueArrow.style.display = 'block';
    }
  }
  
  clearHint() {
    this.panel.style.display = 'none';
    this.textElement.textContent = '';
    this.fullText = '';
    this.processedText = '';
    this.virtualBuffer = '';
    this.isTyping = false;
    this.charIndex = 0;
    this.continueArrow.style.display = 'none';
  }
}

// Add anti-zoom CSS to the document
function addAntiZoomCSS() {
  if (!document.getElementById('typewriter-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'typewriter-styles';
    styleEl.textContent = `
      @keyframes bounce {
        from { transform: translateY(0px); }
        to { transform: translateY(-5px); }
      }
      
      #continueArrow {
        animation: bounce 0.6s infinite alternate;
      }
      
      /* Comprehensive anti-zoom measures */
      html {
        touch-action: manipulation;
      }
      
      body {
        text-size-adjust: none !important;
        -webkit-text-size-adjust: none !important;
        -moz-text-size-adjust: none !important;
        -ms-text-size-adjust: none !important;
      }
      
      #typewriterPanel {
        transform: translateZ(0);
        -webkit-font-smoothing: antialiased;
        touch-action: manipulation;
      }
      
      #typewriterText {
        transform: translateZ(0);
        max-width: 100%;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

// Prevent zoom events on the panel
function preventZoom() {
  const panel = document.getElementById('typewriterPanel');
  if (panel) {
    // Prevent pinch zoom
    panel.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTap = 0;
    panel.addEventListener('touchend', function(e) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
      }
      lastTap = currentTime;
    }, { passive: false });
  }
}

// Initialize the typewriter hint system
let typewriterHint;
document.addEventListener('DOMContentLoaded', () => {
  // Add anti-zoom CSS
  addAntiZoomCSS();
  
  // Initialize the typewriter
  typewriterHint = new TypewriterHint();
  
  // Add zoom prevention
  preventZoom();
});

// Export functions to be used in game.js
export function showHint(text) {
  // Ensure typewriterHint is initialized
  if (!typewriterHint) {
    addAntiZoomCSS();
    typewriterHint = new TypewriterHint();
    preventZoom();
  }
  
  // For backward compatibility, update old hint box too
  const hintBox = document.getElementById('hintBox');
  if (hintBox) hintBox.textContent = text;
  
  // Show hint using typewriter system
  typewriterHint.showHint(text);
  
  return hintBox; // For backward compatibility
}

export function clearHint() {
  // Clear old hint box
  const hintBox = document.getElementById('hintBox');
  if (hintBox) hintBox.textContent = '';
  
  // Clear typewriter
  if (typewriterHint) {
    typewriterHint.clearHint();
  }
}