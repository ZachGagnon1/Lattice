# Lattice

[![npm version](https://img.shields.io/npm/v/lattice-editor.svg)](https://www.npmjs.com/package/lattice-editor) [![license](https://img.shields.io/npm/l/lattice-editor.svg)](https://github.com/ZachGagnon1/Lattice/blob/master/License)

> **Lattice** _noun_
> A structure of strips of wood or metal, crossed and fastened together.

Lattice is an open-source drag-and-drop email editor for React 19. It builds responsive HTML emails with MJML. It is a free, self-hosted alternative to Unlayer. Lattice is a fork of **easy-email-editor**.

[**_Demo_**](https://zachgagnon1.github.io/Lattice/)

## Features

- Drag-and-drop blocks: text, image, button, social, divider, spacer, table, and more.
- Export to MJML, HTML, or JSON.
- Condition and For Loop blocks. They output Handlebars `{{#if}}` and `{{#each}}`.
- Merge tags from your own sample data.
- Undo and redo.
- MUI themes for the editor.
- Unlayer template import through `unlayerToLattice`.
- Keyboard and screen reader support. We aim to make the editor fully accessible.

## Why Lattice?

- **Open source.** Lattice uses the MIT license. No feature needs a paid plan, and the editor shows no branding.
- **Self-hosted.** The editor runs inside your React app. It loads no external script and no iframe, so your templates stay in your app.
- **Standard output.** Lattice exports MJML, the standard markup language for responsive email. You can render the MJML on your own backend.
- **Easy move from Unlayer.** Unlayer's `react-email-editor` loads the editor from Unlayer's servers in an iframe, and some features need a paid plan. `unlayerToLattice` imports your existing Unlayer templates.

## Install

```sh
npm install lattice-editor
```

The editor needs these peer dependencies:

```sh
npm install react react-dom @mui/material @mui/icons-material @mui/x-tree-view @emotion/react @emotion/styled @base-ui/react
```

## Usage

Add the `LatticeEditor` component to your app.

```tsx
import React, { useState } from "react";
import { LatticeEditor, IEmailTemplate } from "lattice-editor";

const initialTemplate: IEmailTemplate = {
  // Add your default template JSON structure here.
};

export default function App() {
  const [emailData, setEmailData] = useState<IEmailTemplate>(initialTemplate);

  const handleUploadImage = async (file: Blob) => {
    // Upload the file to your own server.
    // Return the hosted URL.
    return "https://example.com/uploaded-image.png";
  };

  return (
    <div style={{ height: "100vh" }}>
      <LatticeEditor
        data={emailData}
        onChange={(values) => setEmailData(values)}
        onUploadImage={handleUploadImage}
        height="calc(100vh - 108px)"
        allowCondition
        allowForLoop
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

## The `config` prop

`config` controls the layout and the panels of the editor.

- **showSourceCode** (boolean): Shows the source code panel. Default is `false`.
- **showBlockLayer** (boolean): Shows the block layer panel. Default is `true`.
- **mjmlReadOnly** (boolean): Makes the MJML output panel read-only. Default is `false`.
- **dashed** (boolean): Draws a dashed outline around each block. This shows the layout structure. Default is `false`.

## Other notable props

- **allowCondition** / **allowForLoop**: Add the If Condition and For Loop blocks to the Logic category. Both default to `false`. Pass them to enable the If Condition or the For Loop block.
- **onChange**: The editor debounces this call by 200ms. This limits the number of re-renders while the user enters text.
- **onUploadImage**: Pass this to let users upload images. Without it, the editor removes every Image block from the block palette.
- **variableData** / **previewOverride**: Pass sample data for the merge tag picker and the live preview. See `CLAUDE.md` for the full set of rules.

## Notes

- Lattice has no separate core, editor, and extensions packages. Import everything from `lattice-editor`.
- The editor uses MUI components. Theme it with the MUI theme API.
- `unlayerToLattice` converts an Unlayer template into a Lattice template. It covers the common cases, not every case.

## Development

```sh
git clone git@github.com:ZachGagnon1/Lattice.git
pnpm install
pnpm run install-all
pnpm run dev
```

New features are welcome. Submit a PR.

## License

The MIT License
