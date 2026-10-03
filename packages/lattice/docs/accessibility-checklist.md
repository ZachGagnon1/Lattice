# Manual accessibility checklist

The automated tests in `src/a11y/editor.a11y.test.tsx` run axe-core in jsdom and test the keyboard paths. jsdom has no layout, so they cannot check color contrast, target size, focus visibility, zoom, or what a screen reader says. Do this checklist before each release, and record the results.

## Test setup

| Item                         | Value |
| ---------------------------- | ----- |
| Date                         |       |
| Tester                       |       |
| Lattice version              |       |
| Operating system and version |       |
| Browser and version          |       |
| Screen reader and version    |       |
| Zoom level                   |       |

## Checks

| #   | Check                                                                                       | WCAG                | Result | Notes |
| --- | ------------------------------------------------------------------------------------------- | ------------------- | ------ | ----- |
| 1   | Text and controls have at least 4.5:1 contrast (3:1 for large text and for icons).          | 1.4.3, 1.4.11       |        |       |
| 2   | Each focused control shows a visible focus indicator.                                       | 2.4.7               |        |       |
| 3   | The editor works at 200% zoom and at a 320 px width with no loss of content.                | 1.4.4, 1.4.10       |        |       |
| 4   | The skip links move the focus to the Blocks, Canvas, and Configuration regions.             | 2.4.1               |        |       |
| 5   | Tab moves through the canvas blocks in order, and Enter opens the block actions.            | 2.1.1, 2.4.3        |        |       |
| 6   | Alt+Enter moves the focus to the block settings, and Escape moves it back to the block.     | 2.1.1               |        |       |
| 7   | The Add button of a palette item adds the block, and the screen reader announces it.        | 2.1.1, 2.5.1, 4.1.3 |        |       |
| 8   | Move mode moves a block before, after, or inside another block, and Escape cancels it.      | 2.1.1, 2.5.1        |        |       |
| 9   | Alt+F10 moves the focus to the text toolbar, and the arrow keys move between the tools.     | 2.1.1               |        |       |
| 10  | The table cell mode works with the arrow keys, Enter, Shift+F10, and Escape.                | 2.1.1               |        |       |
| 11  | The screen reader announces the name, the role, and the state of each control.              | 4.1.2               |        |       |
| 12  | The screen reader announces each status message: add, move, delete, and cancel.             | 4.1.3               |        |       |
| 13  | Each dialog and menu keeps the focus inside it, and Escape closes it and returns the focus. | 2.4.3               |        |       |
| 14  | The text toolbar stays inside a narrow canvas, and all its tools are reachable.             | 1.4.10              |        |       |

## Known gaps

- The drag handles have no automated test.
- The color contrast of a user's template is the author's responsibility, not the editor's.
