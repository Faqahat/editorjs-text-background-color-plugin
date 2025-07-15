# Editor.js Text Color & Background Plugin

A versatile inline tool for [Editor.js](https://editorjs.io/) that allows you to apply custom text and background colors to your content.

<img src="https://shottr-uploads.s3.amazonaws.com/548/FCJU-SCR-20250715-qf0.png?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASHY5OHU5UIVLCXXR%2F20250715%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250715T131824Z&X-Amz-SignedHeaders=host&X-Amz-Expires=600&X-Amz-Signature=66cc08fff17d1651b143ed258748af520c91774f512289d4512aaca109c0ea24" alt="Plugin Demo" width="600"/>

## Features

- **Text Coloring**: Apply any color from a configurable palette to your selected text.
- **Background Coloring**: Highlight text by applying a background color.
- **Custom Palettes**: Easily define your own color palettes for both text and background.
- **Recently Used Colors**: Automatically saves your last 5 used colors for quick access.
- **Reset Functionality**: A simple button to remove all applied colors from a selection.
- **Keyboard Shortcut**: Access the tool quickly with `CMD+SHIFT+C`.
- **Clean UI**: A modern and intuitive color picker interface.

## Installation

### Install via npm

Get the package from npm and import it into your project.

```bash
npm install editorjs-text-background-color-plugin
```

### Load from CDN

You can also load the bundled script from the jsDelivr CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/editorjs-text-background-color-plugin@latest/dist/bundle.js"></script>
```

## Usage

If you installed via npm, import the tool class into your project:

```javascript
import TextColorTool from "editorjs-text-background-color-plugin";
```

Then, add the tool to your Editor.js instance's configuration:

```javascript
const editor = new EditorJS({
  holder: "editorjs",
  tools: {
    textColor: {
      class: TextColorTool,
      inlineToolbar: true, // Set to true to display in the inline toolbar
    },
    // ... other tools
  },
});
```

If you are loading the script from the CDN, the `TextColorTool` class will be available on the `window` object.

## Configuration

You can customize the color palettes by passing a `config` object.

```javascript
const editor = new EditorJS({
  // ... other configurations
  tools: {
    textColor: {
      class: TextColorTool,
      config: {
        textColors: [
          { color: "#D6D6D6", name: "light gray" },
          { color: "#9B9B9B", name: "gray" },
          { color: "#BA8570", name: "brown" },
          { color: "#C87D49", name: "orange" },
          { color: "#C4944B", name: "yellow" },
          { color: "#344C3E", name: "green" },
          { color: "#379AD3", name: "blue" },
          { color: "#9D68D3", name: "purple" },
          { color: "#D15896", name: "pink" },
          { color: "#E35958", name: "red" },
        ],
        backgroundColors: [
          { color: "#252525", name: "dark gray" },
          { color: "#2F2F2F", name: "black" },
          { color: "#4A3229", name: "brown" },
          { color: "#5C3A23", name: "orange" },
          { color: "#564328", name: "olive" },
          { color: "#253D30", name: "green" },
          { color: "#133A4E", name: "blue" },
          { color: "#3C2D49", name: "purple" },
          { color: "#4E2C3B", name: "pink" },
          { color: "#522E2A", name: "red" },
        ],
      },
    },
  },
});
```

- `textColors`: An array of objects, where each object has a `color` (hex, rgb, etc.) and a `name`.
- `backgroundColors`: Same format as `textColors`, but for background highlighting.

If no config is provided, the plugin will use its default color palettes.

## Output Data

The plugin saves the colored text within a `<span>` tag with the `text-color-tool` class and inline styles.

Example output for a paragraph block:

```json
{
  "type": "paragraph",
  "data": {
    "text": "This is some <span class=\"text-color-tool\" style=\"color: #379AD3;\">blue text</span> with a <span class=\"text-color-tool\" style=\"background-color: #564328;\">highlighted background</span>."
  }
}
```
