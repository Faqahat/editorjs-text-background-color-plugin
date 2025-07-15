/**
 * Custom EditorJS Text Color Plugin
 * An inline tool for changing text and background colors in EditorJS
 */
class TextColorTool {
  constructor({ api, config }) {
    this.api = api;
    this.config = config || {};
    this.tag = "SPAN";
    this.class = "text-color-tool";

    // Color palettes - updated to match reference
    this.theme = this.config.theme || "light";
    this.textColors = this.config.textColors || [
      { name: "light gray", color: { light: "#D6D6D6", dark: "#777777" } },
      { name: "gray", color: { light: "#9B9B9B", dark: "#AAAAAA" } },
      { name: "brown", color: { light: "#BA8570", dark: "#D4A390" } },
      { name: "orange", color: { light: "#C87D49", dark: "#E09561" } },
      { name: "yellow", color: { light: "#C4944B", dark: "#DDB269" } },
      { name: "green", color: { light: "#344C3E", dark: "#5A7E68" } },
      { name: "blue", color: { light: "#379AD3", dark: "#5FB8E7" } },
      { name: "purple", color: { light: "#9D68D3", dark: "#B987E7" } },
      { name: "pink", color: { light: "#D15896", dark: "#E577B0" } },
      { name: "red", color: { light: "#E35958", dark: "#EE7877" } },
    ];

    this.backgroundColors = this.config.backgroundColors || [
      { name: "dark gray", color: { light: "#F0F0F0", dark: "#444444" } },
      { name: "black", color: { light: "#EAEAEA", dark: "#555555" } },
      { name: "brown", color: { light: "#F4EEEE", dark: "#6A4A3D" } },
      { name: "orange", color: { light: "#FAF3DB", dark: "#845A3D" } },
      { name: "olive", color: { light: "#FCF3DB", dark: "#7E6540" } },
      { name: "green", color: { light: "#EDF3EE", dark: "#41614E" } },
      { name: "blue", color: { light: "#E7F3F8", dark: "#2B5C74" } },
      { name: "purple", color: { light: "#F8F3FC", dark: "#5C456D" } },
      { name: "pink", color: { light: "#FCF1F6", dark: "#744459" } },
      { name: "red", color: { light: "#FDEBEC", dark: "#784642" } },
    ];

    // Recently used colors (stored in localStorage)
    this.recentColors = this.getRecentColors();

    this.button = null;
    this.state = false;
    this.currentTextColor = null;
    this.currentBackgroundColor = null;
    this.activeDropdown = null;

    this.injectStyles();
  }

  /**
   * Injects the tool's CSS into the document's head.
   */
  injectStyles() {
    if (TextColorTool.stylesInjected) {
      return;
    }

    const style = document.createElement("style");
    style.id = "editorjs-text-color-tool-styles";
    style.innerHTML = `
      /* Text Color Tool Styles */
      .text-color-dropdown {
        position: fixed;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 10000;
        width: 280px;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: white;
      }

      .text-color-dropdown .color-section {
        margin-bottom: 24px;
      }

      .text-color-dropdown .color-section:last-child {
        margin-bottom: 0;
      }

      .text-color-dropdown .color-section-title {
        color: #888;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
      }

      .text-color-dropdown .color-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }

      .text-color-dropdown .recent-colors {
        display: flex;
        gap: 8px;
      }

      .text-color-dropdown .color-button {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .text-color-dropdown .color-button:hover {
        transform: scale(1.05);
      }

      .text-color-dropdown .color-button.selected {
        border-color: #3b82f6;
      }

      .ce-inline-tool--text-color.ce-inline-tool--active {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      /* Text color styling for applied text */
      .text-color-tool {
        font-family: inherit;
      }
    `;
    document.head.appendChild(style);
    TextColorTool.stylesInjected = true;
  }

  /**
   * Get recently used colors from localStorage
   */
  getRecentColors() {
    try {
      const stored = localStorage.getItem("editorjs-recent-colors");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Save recently used color to localStorage
   */
  saveRecentColor(color) {
    let recent = this.getRecentColors();

    // Remove if already exists
    recent = recent.filter((c) => c !== color);

    // Add to beginning
    recent.unshift(color);

    // Keep only last 5
    recent = recent.slice(0, 5);

    try {
      localStorage.setItem("editorjs-recent-colors", JSON.stringify(recent));
      this.recentColors = recent;
    } catch (e) {
      console.warn("Could not save recent colors");
    }
  }

  /**
   * Create Tool's button
   */
  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML = this.getIcon();
    this.button.classList.add("ce-inline-tool", "ce-inline-tool--text-color");
    this.button.title = "Text Color";

    return this.button;
  }

  /**
   * Check if selection has color applied
   */
  checkState(selection) {
    const text = selection.anchorNode;

    if (!text) {
      this.state = false;
      this.currentTextColor = null;
      this.currentBackgroundColor = null;
      this.updateButtonState();
      return false;
    }

    const parentNode =
      text.nodeType === Node.TEXT_NODE ? text.parentNode : text;
    const colorInfo = this.checkForColors(parentNode);

    this.state = colorInfo.hasColor;
    this.currentTextColor = colorInfo.textColor;
    this.currentBackgroundColor = colorInfo.backgroundColor;

    this.updateButtonState();

    return this.state;
  }

  /**
   * Update button visual state
   */
  updateButtonState() {
    if (this.state) {
      this.button.classList.add("ce-inline-tool--active");
      if (this.currentTextColor) {
        this.button.title = `Text Color: ${this.currentTextColor}`;
      } else if (this.currentBackgroundColor) {
        this.button.title = `Background Color: ${this.currentBackgroundColor}`;
      }
    } else {
      this.button.classList.remove("ce-inline-tool--active");
      this.button.title = "Text Color";
    }

    // Update the icon to reflect current colors
    this.button.innerHTML = this.getIcon();
  }

  /**
   * Check if element has colors applied
   */
  checkForColors(element) {
    if (!element)
      return { hasColor: false, textColor: null, backgroundColor: null };

    // Only check for colors in our own text-color-tool spans
    if (element.classList && element.classList.contains(this.class)) {
      const hasElementTextColor =
        element.style.color && element.style.color !== "";
      const hasElementBackgroundColor =
        element.style.backgroundColor && element.style.backgroundColor !== "";

      return {
        hasColor: hasElementTextColor || hasElementBackgroundColor,
        textColor: hasElementTextColor
          ? this.convertToHex(element.style.color)
          : null,
        backgroundColor: hasElementBackgroundColor
          ? this.convertToHex(element.style.backgroundColor)
          : null,
      };
    }

    // Check parent elements but only for our own text-color-tool spans
    if (element.parentElement) {
      return this.checkForColors(element.parentElement);
    }

    return { hasColor: false, textColor: null, backgroundColor: null };
  }

  /**
   * Handle button click
   */
  surround(range) {
    this.showColorPicker(range);
  }

  /**
   * Show color picker dropdown
   */
  showColorPicker(range) {
    // Close any existing dropdown
    if (this.activeDropdown) {
      this.activeDropdown.remove();
      this.activeDropdown = null;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (!selectedText) {
      return;
    }

    // Create dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "text-color-dropdown";
    dropdown.style.cssText = `
      position: fixed;
      background: #ffffff;
      border-radius: 6px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      z-index: 10000;
      width: 180px;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
    `;

    // Position dropdown
    const buttonRect = this.button.getBoundingClientRect();
    dropdown.style.left = Math.max(10, buttonRect.left - 100) + "px";
    dropdown.style.top = buttonRect.bottom + 8 + "px";

    // Add recently used section
    if (this.recentColors.length > 0) {
      const recentSection = this.createRecentSection(range);
      dropdown.appendChild(recentSection);
    }

    // Add text color section
    const textColorSection = this.createTextColorSection(range);
    dropdown.appendChild(textColorSection);

    // Add background color section
    const backgroundColorSection = this.createBackgroundColorSection(range);
    dropdown.appendChild(backgroundColorSection);

    // Add reset colors button
    const resetSection = this.createResetSection(range);
    dropdown.appendChild(resetSection);

    document.body.appendChild(dropdown);
    this.activeDropdown = dropdown;

    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
      if (!dropdown.contains(e.target) && e.target !== this.button) {
        dropdown.remove();
        this.activeDropdown = null;
        document.removeEventListener("click", closeDropdown);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", closeDropdown);
    }, 100);
  }

  /**
   * Create recently used section
   */
  createRecentSection(range) {
    const section = document.createElement("div");
    section.style.cssText = `
      margin-bottom: 12px;
    `;

    const title = document.createElement("div");
    title.textContent = "Recently used";
    title.style.cssText = `
      color: #888;
      font-size: 11px;
      font-weight: 500;
      margin-bottom: 6px;
    `;

    const colorGrid = document.createElement("div");
    colorGrid.style.cssText = `
      display: flex;
      gap: 4px;
    `;

    let buttonCount = 0;
    for (const colorData of this.recentColors) {
      if (buttonCount >= 5) break;

      const color = typeof colorData === "string" ? colorData : colorData.color;

      // Add text color button
      const textColorButton = this.createColorButton(color, range, "text");
      colorGrid.appendChild(textColorButton);
      buttonCount++;

      // Add background color button if we haven't reached the limit
      if (buttonCount < 5) {
        const backgroundColorButton = this.createColorButton(
          color,
          range,
          "background"
        );
        colorGrid.appendChild(backgroundColorButton);
        buttonCount++;
      }
    }

    section.appendChild(title);
    section.appendChild(colorGrid);

    return section;
  }

  /**
   * Create text color section
   */
  createTextColorSection(range) {
    const section = document.createElement("div");
    section.style.cssText = `
      margin-bottom: 12px;
    `;

    const title = document.createElement("div");
    title.textContent = "Text color";
    title.style.cssText = `
      color: #888;
      font-size: 11px;
      font-weight: 500;
      margin-bottom: 6px;
    `;

    const colorGrid = document.createElement("div");
    colorGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    `;

    this.textColors.forEach((colorData) => {
      const colorObj = colorData.color || colorData;
      const color =
        typeof colorObj === "object" ? colorObj[this.theme] : colorObj;
      const colorButton = this.createColorButton(color, range, "text");
      colorGrid.appendChild(colorButton);
    });

    section.appendChild(title);
    section.appendChild(colorGrid);

    return section;
  }

  /**
   * Create background color section
   */
  createBackgroundColorSection(range) {
    const section = document.createElement("div");
    section.style.cssText = `
      margin-bottom: 0;
    `;

    const title = document.createElement("div");
    title.textContent = "Background color";
    title.style.cssText = `
      color: #888;
      font-size: 11px;
      font-weight: 500;
      margin-bottom: 6px;
    `;

    const colorGrid = document.createElement("div");
    colorGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    `;

    this.backgroundColors.forEach((colorData) => {
      const colorObj = colorData.color || colorData;
      const color =
        typeof colorObj === "object" ? colorObj[this.theme] : colorObj;
      const colorButton = this.createColorButton(color, range, "background");
      colorGrid.appendChild(colorButton);
    });

    section.appendChild(title);
    section.appendChild(colorGrid);

    return section;
  }

  /**
   * Create reset colors section
   */
  createResetSection(range) {
    const section = document.createElement("div");
    section.style.cssText = `
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #F7F6F3;
    `;

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset colors";
    resetButton.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      background: #F7F6F3;
      color: #444;
      border: none;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.1s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Add click handler
    resetButton.addEventListener("click", () => {
      this.resetColors(range);
      this.activeDropdown.remove();
      this.activeDropdown = null;
    });

    section.appendChild(resetButton);
    return section;
  }

  /**
   * Create individual color button
   */
  createColorButton(color, range, type) {
    const button = document.createElement("div");

    // Base styling for all color buttons
    button.style.cssText = `
      width: 26px;
      height: 26px;
      border-radius: 5px;
      cursor: pointer;
      border: 1.5px solid transparent;
      transition: all 0.1s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    // Set background color based on type
    if (type === "text") {
      // Text colors use a 0.5px border of the same color with reduced opacity (35% less = 65% opacity)
      button.style.borderColor = this.addOpacityToColor(color, 0.65);
      button.style.borderWidth = "0.5px";

      // Add "A" letter with the actual color
      const letter = document.createElement("span");
      letter.textContent = "A";
      letter.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        color: ${color};
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      button.appendChild(letter);
    } else {
      // Background colors use the actual color as background
      button.style.backgroundColor = color;
    }

    // Add selection indicator for current color
    const isCurrentColor =
      (type === "text" && this.currentTextColor === color.toLowerCase()) ||
      (type === "background" &&
        this.currentBackgroundColor === color.toLowerCase());

    if (isCurrentColor) {
      button.style.borderColor = "#3b82f6";
      button.style.borderWidth = "2px";
    }

    // Add hover effect
    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.05)";
      if (type === "text") {
        button.style.borderWidth = "1px";
      } else {
        button.style.borderColor = "#666666";
      }
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
      // Restore original border color
      if (isCurrentColor) {
        button.style.borderColor = "#3b82f6";
        button.style.borderWidth = "2px";
      } else {
        if (type === "text") {
          button.style.borderColor = this.addOpacityToColor(color, 0.65);
          button.style.borderWidth = "1px";
        } else {
          button.style.borderColor = "transparent";
          button.style.borderWidth = "1.5px";
        }
      }
    });

    // Add click handler
    button.addEventListener("click", () => {
      this.applyColor(range, color, type);
      this.saveRecentColor(color);
      this.activeDropdown.remove();
      this.activeDropdown = null;
    });

    return button;
  }

  /**
   * Convert RGB color to hex format
   */
  convertToHex(color) {
    if (!color || color === "transparent") return null;

    // If already hex, return as is
    if (color.startsWith("#")) return color.toLowerCase();

    // Convert rgb() or rgba() to hex
    const rgbMatch = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`.toLowerCase();
    }

    return color;
  }

  /**
   * Add opacity to a color (convert to rgba format)
   */
  addOpacityToColor(color, opacity) {
    // If already rgba, extract RGB values
    const rgbaMatch = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // If hex color, convert to rgba
    if (color.startsWith("#")) {
      const r = parseInt(color.substr(1, 2), 16);
      const g = parseInt(color.substr(3, 2), 16);
      const b = parseInt(color.substr(5, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Fallback for named colors - return as is with opacity
    return color;
  }

  /**
   * Get contrast color for text (white or black)
   */
  getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  /**
   * Apply color to selection
   */
  applyColor(range, color, type) {
    const selectedText = range.extractContents();

    if (selectedText.textContent.length === 0) {
      return;
    }

    // Create span with color
    const span = document.createElement(this.tag);
    span.classList.add(this.class);

    if (type === "text") {
      span.style.color = color;
      span.dataset.colorLight = typeof color === "object" ? color.light : color;
      span.dataset.colorDark = typeof color === "object" ? color.dark : color;
      // Update state - normalize to lowercase hex
      this.state = true;
      this.currentTextColor = color.toLowerCase();
    } else if (type === "background") {
      span.style.backgroundColor = color;
      span.dataset.backgroundColorLight =
        typeof color === "object" ? color.light : color;
      span.dataset.backgroundColorDark =
        typeof color === "object" ? color.dark : color;
      // Update state - normalize to lowercase hex
      this.state = true;
      this.currentBackgroundColor = color.toLowerCase();
    }
    // Listen for theme changes if provided
    if (window && window.addEventListener) {
      window.addEventListener("editorjs-theme-change", (e) => {
        if (e.detail && (e.detail === "light" || e.detail === "dark")) {
          this.theme = e.detail;
        }
      });
    }

    span.appendChild(selectedText);
    range.insertNode(span);

    this.updateButtonState();

    // Clear selection and set cursor
    const selection = window.getSelection();
    selection.removeAllRanges();

    const newRange = document.createRange();
    newRange.setStartAfter(span);
    newRange.collapse(true);
    selection.addRange(newRange);
  }

  /**
   * Reset colors for selected text
   */
  resetColors() {
    // Get the current selection right before we operate on it.
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedFragment = range.cloneContents();
    const wrapper = document.createElement("div");
    wrapper.appendChild(selectedFragment);

    // Find all our custom color spans within the selection
    const coloredSpans = wrapper.querySelectorAll(`.${this.class}`);

    // If there are no colored spans, we can try to use removeFormat as a fallback.
    if (coloredSpans.length === 0) {
      document.execCommand("removeFormat");
    } else {
      // This part is more complex as we need to unwrap the spans.
      // The simplest way that works with the editor is to get the text and re-insert it.
      const text = wrapper.textContent;
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }

    // Reset the tool's state since we removed the color.
    this.state = false;
    this.currentTextColor = null;
    this.currentBackgroundColor = null;
    this.updateButtonState();

    // Let Editor.js handle the selection.
    this.api.inlineToolbar.close();
  }

  /**
   * Split a text node into multiple text nodes
   */
  splitTextNodes(fragment) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode);
    }

    return textNodes;
  }

  /**
   * Get tool icon
   */
  getIcon() {
    // Use a default dark color instead of "currentColor" to avoid inheriting active state color
    const textColor = this.currentTextColor || "currentColor";
    const backgroundColor = this.currentBackgroundColor || "transparent";

    return `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <rect id="bg-rect" x="0" y="0" width="20" height="20" rx="3" fill="${backgroundColor}" stroke="none"/>
        </defs>
        ${backgroundColor !== "transparent" ? '<use href="#bg-rect"/>' : ""}
        <text x="10" y="14.5" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="${textColor}">A</text>
      </svg>
    `;
  }

  /**
   * Tool's shortcut
   */
  static get shortcut() {
    return "CMD+SHIFT+C";
  }

  /**
   * Identify this as an inline tool
   */
  static get isInline() {
    return true;
  }

  /**
   * Tool's sanitize config
   */
  static get sanitize() {
    return {
      span: {
        class: "text-color-tool",
        style: true,
      },
    };
  }
}

// Property to track if styles have been injected
TextColorTool.stylesInjected = false;

// Make it available globally
export default TextColorTool;
