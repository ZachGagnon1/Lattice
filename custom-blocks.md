# Custom blocks

A custom block adds a new item to the block palette. It is a plain object that describes the block and knows how to create and render it.

## The `IBlock` shape

Every block matches the `IBlock` interface.

```ts
interface IBlock<T extends IBlockData> {
  name: string;
  type: string;
  create: (payload?: RecursivePartial<T>) => T;
  validParentType: string[];
  render: (params: {
    data: T;
    idx?: string | null;
    mode: "testing" | "production";
    context?: IPage;
    dataSource?: { [key: string]: any };
  }) => React.ReactNode;
}
```

- `name` is the label the editor shows for the block.
- `type` is the block's own ID. Use a string outside the `BasicType` enum.
- `create()` builds a new instance of the block's data.
- `validParentType` lists the block types that can hold this block.
- `render()` returns the React node for the block.

## Define the block

Call `createBlock<T>()` with a block definition.

```tsx
import { createBlock, IBlockData, BasicType, components } from "lattice-editor";
import { merge } from "lodash-es";

const { Section, Column, Text } = components;

export type IBanner = IBlockData<
  { "background-color"?: string },
  { title: string }
>;

export const Banner = createBlock<IBanner>({
  name: "Banner",
  type: "banner",
  validParentType: [BasicType.PAGE],
  create: (payload) => {
    const defaultData: IBanner = {
      type: "banner",
      data: { value: { title: "Hello" } },
      attributes: { "background-color": "#ffffff" },
      children: [],
    };
    return merge(defaultData, payload);
  },
  render: ({ data }) => (
    <Section background-color={data.attributes["background-color"]}>
      <Column>
        <Text>{data.data.value.title}</Text>
      </Column>
    </Section>
  ),
});
```

`create()` merges the optional partial payload over the default data. `render()` gets one params object, and `mode` is `"testing"` in the editor and `"production"` on export.

## Register the block

Add the block to `BlockManager` before the editor mounts.

```ts
import { BlockManager } from "lattice-editor";

BlockManager.registerBlocks({ banner: Banner });
```

## Notes

- `components` exports the render primitives: `Page`, `Section`, `Column`, `Text`, `Image`, `Button`, `Group`, `Wrapper`, and more. Build a custom block from these, not from raw MJML tags.
- A custom block can also render from an MJML string. Parse the string with `MjmlToJson()`, then pass the result to `components.BlockRenderer`.
- `createCustomBlock` still works. It is an alias for `createBlock`, kept for older code.
- For full working examples, see `packages/lattice/src/domain/blocks/definitions/`. It holds every real block, such as `Table/`, `Button/`, and `Condition/`.
