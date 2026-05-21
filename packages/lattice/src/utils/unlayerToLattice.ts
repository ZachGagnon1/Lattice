import { BasicType } from "@/core/constants";
import { IPage } from "@/core/blocks";

/**
 * Converts an Unlayer template JSON payload into a Lattice IPage object
 */
export function unlayerToLattice(unlayerData: any): IPage {
  const bodyValues = unlayerData.body.values;

  const page: IPage = {
    type: BasicType.PAGE,
    data: {
      value: {
        breakpoint: "480px",
        headAttributes: "",
        "font-size": bodyValues.fontFamily?.fontSize || "14px",
        "font-weight": "400",
        "line-height": "1.7",
        headStyles: [],
        fonts: [],
        responsive: true,
        "font-family":
          bodyValues.fontFamily?.value || "-apple-system, sans-serif",
        "text-color": bodyValues.textColor || "#000000",
      },
    },
    attributes: {
      "background-color": bodyValues.backgroundColor || "#ffffff",
      width: bodyValues.contentWidth || "600px",
    },
    children: [
      {
        type: BasicType.WRAPPER,
        data: { value: {} },
        attributes: {},
        children: [],
      },
    ],
  };

  const wrapper = page.children[0];

  for (const row of unlayerData.body.rows) {
    const section = {
      type: BasicType.SECTION,
      data: { value: {} },
      attributes: {
        "background-color": row.values.backgroundColor || "transparent",
        padding: row.values.padding || "0px",
        "background-url": row.values.backgroundImage?.url || "",
        "background-repeat": row.values.backgroundImage?.repeat || "no-repeat",
      },
      children: [] as any[],
    };

    for (const col of row.columns) {
      const column = {
        type: BasicType.COLUMN,
        data: { value: {} },
        attributes: {
          "background-color": col.values.backgroundColor || "transparent",
          padding: col.values.padding || "0px",
        },
        children: [] as any[],
      };

      for (const content of col.contents) {
        const block = mapUnlayerContentToLattice(content);
        if (block) {
          column.children.push(block);
        }
      }

      section.children.push(column);
    }

    wrapper.children.push(section);
  }

  return page;
}

/**
 * Maps specific Unlayer blocks to Lattice blocks
 */
function mapUnlayerContentToLattice(content: any) {
  const type = content.type;
  const values = content.values;

  switch (type) {
    case "text":
    case "heading": // Treat Unlayer headings as Text blocks holding HTML
      return {
        type: BasicType.TEXT,
        data: {
          value: {
            content: values.text, // Contains the HTML formatted string from Unlayer
          },
        },
        attributes: {
          padding: values.containerPadding || "10px",
          "font-size": values.fontSize,
          "text-align": values.textAlign,
          "line-height": values.lineHeight,
          color: values.color,
        },
        children: [],
      };

    case "image":
      return {
        type: BasicType.IMAGE,
        data: { value: {} },
        attributes: {
          padding: values.containerPadding || "10px",
          src: values.src?.url,
          width: values.src?.width ? `${values.src.width}px` : "auto",
          align: values.textAlign || "center",
          href: values.action?.values?.href || "",
          target: values.action?.values?.target || "_blank",
          alt: values.altText || "",
        },
        children: [],
      };

    case "divider":
      return {
        type: BasicType.DIVIDER,
        data: { value: {} },
        attributes: {
          padding: values.containerPadding || "10px",
          "border-width": values.border?.borderTopWidth || "1px",
          "border-style": values.border?.borderTopStyle || "solid",
          "border-color": values.border?.borderTopColor || "#CCCCCC",
          width: values.width || "100%",
        },
        children: [],
      };

    case "html":
      return {
        type: BasicType.TEXT,
        data: {
          value: {
            content: values.html,
          },
        },
        attributes: {},
        children: [],
      };

    case "social":
      // Maps Unlayer's social array to Lattice's MJML Social block requirements
      return {
        type: BasicType.SOCIAL,
        data: {
          value: {
            elements:
              values.icons?.icons?.map((icon: any) => ({
                href: icon.url,
                src: icon.customUrl || "", // Add custom logic here for default social icons if needed
                content: icon.name,
              })) || [],
          },
        },
        attributes: {
          padding: values.containerPadding || "10px",
          align: values.align || "center",
          "icon-size": values.iconSize ? `${values.iconSize}px` : "32px",
        },
        children: [],
      };

    case "menu":
      return {
        type: BasicType.NAVBAR,
        data: {
          value: {
            links:
              values.menu?.items?.map((item: any) => ({
                href: item.link?.values?.href,
                target: item.link?.values?.target,
                content: item.text,
                color: values.linkColor || "#000000",
              })) || [],
          },
        },
        attributes: {
          padding: values.containerPadding || "10px",
          align: values.align || "center",
        },
        children: [],
      };

    default:
      console.warn(`Unsupported unlayer block type skipped: ${type}`);
      return null;
  }
}
