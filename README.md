# Editor.js Text Color & Background Plugin

A versatile inline tool for [Editor.js](https://editorjs.io/) that allows you to apply custom text and background colors to your content.

![Plugin Demo](https://camo.githubusercontent.com/fe81d9607ea90d2af320a62ce98b35c5cf28da6ada682e65d9fb1b06611007cb/68747470733a2f2f73686f7474722d75706c6f6164732e73332e616d617a6f6e6177732e636f6d2f3534382f46434a552d5343522d32303235303731352d7166302e706e673f582d416d7a2d436f6e74656e742d5368613235363d554e5349474e45442d5041594c4f414426582d416d7a2d416c676f726974686d3d415753342d484d41432d53484132353626582d416d7a2d43726564656e7469616c3d414b4941534859354f4855355549564c43585852253246323032353037313525324675732d656173742d312532467333253246617773345f7265717565737426582d416d7a2d446174653d3230323530373135543133313832345a26582d416d7a2d5369676e6564486561646572733d686f737426582d416d7a2d457870697265733d36303026582d416d7a2d5369676e61747572653d36366363303866666631376431363531623134336564323538373438616635323063393137373466353132323839643435313261616361313039633065613234)

**[Live Demo](https://faqahat.github.io/editorjs-text-background-color-plugin/)**

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
