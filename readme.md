# Lattice

[![npm version](https://img.shields.io/npm/v/lattice-editor.svg)](https://www.npmjs.com/package/lattice-editor) [![license](https://img.shields.io/npm/l/lattice-editor.svg)](https://github.com/ZachGagnon1/Lattice/blob/master/License)

> **Lattice** _noun_  
> A structure consisting of strips of wood or metal crossed and fastened together

Lattice is a drag-and-drop email editor and email template builder for React 19. It builds responsive HTML emails with MJML. It started as a fork of **easy-email-editor**.

[**_Demo_**](https://zachgagnon1.github.io/Lattice/)

## Features

- Drag-and-drop blocks: text, image, button, social, divider, spacer, table, and more.
- Export to MJML, HTML, or JSON.
- Condition and For Loop blocks that output Handlebars `{{#if}}` and `{{#each}}`.
- Merge tags from your own sample data.
- Undo and redo.
- Theming through MUI.
- Import of Unlayer templates with `unlayerToLattice`.

## Install

```sh
npm install lattice-editor
```

The editor needs these peer dependencies: `react`, `react-dom`, `@mui/material`, `@mui/icons-material`, `@mui/x-tree-view`, `@emotion/react`, `@emotion/styled`, and `@base-ui/react`.

```sh
npm install react react-dom @mui/material @mui/icons-material @mui/x-tree-view @emotion/react @emotion/styled @base-ui/react
```

## Usage: LatticeEditor

The core component of this library is the LatticeEditor. Below is a basic example of how to integrate it into your React 19 application.

```tsx
import React, { useState } from "react";
import { LatticeEditor, IEmailTemplate } from "lattice-editor";

const initialTemplate: IEmailTemplate = {
  // Add your default template JSON structure here
};

export default function App() {
  const [emailData, setEmailData] = useState<IEmailTemplate>(initialTemplate);

  // Handle image uploads inside the editor
  const handleUploadImage = async (file: Blob) => {
    // Implement your server upload logic here
    // return the hosted image URL
    return "https://example.com/uploaded-image.png";
  };

  return (
    <div style={{ height: "100vh" }}>
      <LatticeEditor
        data={emailData}
        onChange={(values) => setEmailData(values)}
        onUploadImage={handleUploadImage}
        height="calc(100vh - 108px)"
        config={{
          showSourceCode: true,
          showBlockLayer: true,
          dashed: true,
        }}
      />
    </div>
  );
}
```

## Interesting Configurations (LatticeEditorConfig)

The LatticeEditor component accepts a config object that gives you fine-grained control over the editor's layout and tools.

- **showSourceCode** (boolean): Toggles the visibility of the source code panel. Defaults to false.

- **showBlockLayer** (boolean): Determines whether the block layer panel is shown. Defaults to true.

- **mjmlReadOnly** (boolean): If set to true, the MJML code output panel will be read-only. Defaults to false.

- **dashed** (boolean): Toggles a dashed border outline on the canvas, making it easier to visualize structural layout constraints. Defaults to false.

### Additional Noteworthy Props

- **onChange**: Features a built-in 200ms debounce to prevent excessive re-renders while the user is actively making changes.

- **onUploadImage**: If you do _not_ provide an onUploadImage prop, Lattice will automatically strip out all "Image" blocks (Basic and Advanced) from the available components list so users don't try to use blocks they can't upload files to.

### Additional Notes

- If you want the same customizability as **easy-email-editor** most of the features should be available but since there is no more multi package layout you will need to change your imports to `lattice-editor`
- The Editor uses MUI components under the hood. This means that the style is fully customizable with MUI's theming capabilities. (Some things still use legacy css and also have built in styles)
- It is possible to convert Unlayer templates using the `unlayerToLattice` function, it is quite basic but should cover a lot of the common cases.

## Development

```sh
$ git clone git@github.com:ZachGagnon1/Lattice.git

$ pnpm install
$ pnpm run install-all
$ pnpm run dev

```

`If you need some new features, we always welcome you to submit a PR.`

## License

The MIT License
