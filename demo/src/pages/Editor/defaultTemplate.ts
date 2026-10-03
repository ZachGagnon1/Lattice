import {
  BasicType,
  blockDefinitions,
  type IBlockData,
  type IEmailTemplate,
} from "lattice";

const {
  [BasicType.BUTTON]: Button,
  [BasicType.COLUMN]: Column,
  [BasicType.CONDITION]: Condition,
  [BasicType.CONDITION_BRANCH]: ConditionBranch,
  [BasicType.DIVIDER]: Divider,
  [BasicType.FOR_LOOP]: ForLoop,
  [BasicType.IMAGE]: Image,
  [BasicType.PAGE]: Page,
  [BasicType.SECTION]: Section,
  [BasicType.SOCIAL]: Social,
  [BasicType.SPACER]: Spacer,
  [BasicType.TABLE]: Table,
  [BasicType.TEXT]: Text,
} = blockDefinitions;

const INK = "#1F2937";
const ACCENT = "#C2410C";
const PAPER = "#F4F1EC";
const FONT = "Helvetica, Arial, sans-serif";
const SIDES = "24px";

// create() merges arrays by index, so every helper sets `children` after it.
const column = (children: IBlockData[], width?: string) => ({
  ...Column.create({ attributes: { width } }),
  children,
});

const section = (
  children: IBlockData[],
  background = "#FFFFFF",
  padding = `16px ${SIDES} 16px ${SIDES}`,
) => ({
  ...Section.create({
    attributes: { "background-color": background, padding },
  }),
  children,
});

const text = (
  content: string,
  attributes: Record<string, string> = {},
): IBlockData =>
  Text.create({
    data: { value: { content } },
    attributes: { padding: "8px 0px 8px 0px", ...attributes },
  });

const button = (
  content: string,
  attributes: Record<string, string> = {},
): IBlockData =>
  Button.create({
    data: { value: { content } },
    attributes: {
      "background-color": ACCENT,
      color: "#FFFFFF",
      "border-radius": "4px",
      "font-weight": "bold",
      padding: "8px 0px 8px 0px",
      ...attributes,
    },
  });

const image = (src: string, alt: string, attributes = {}): IBlockData =>
  Image.create({
    attributes: { src, alt, padding: "8px 0px 8px 0px", ...attributes },
  });

const branch = (kind: "if" | "else", children: IBlockData[]) => ({
  ...ConditionBranch.create({ data: { value: { branch: kind } } }),
  title: kind === "if" ? "If" : "Else",
  children,
});

const coupon: IBlockData = {
  type: "coupon",
  data: {
    value: {
      title: "Your October gift",
      code: "LATTICE15",
      note: "15% off any synth until 31 October.",
    },
  },
  attributes: {
    "background-color": "#FFF7ED",
    "border-color": ACCENT,
    color: INK,
    align: "center",
    padding: "10px 25px 10px 25px",
  },
  children: [],
};

const heading = (content: string, attributes: Record<string, string> = {}) =>
  text(content, { "font-size": "20px", "font-weight": "bold", ...attributes });

const NAV_LINKS = ["Shop", "Deals", "Support"]
  .map(
    (label) =>
      `<a href="#" style="color:${INK};text-decoration:none;">${label.toUpperCase()}</a>`,
  )
  .join("&nbsp;&nbsp;&nbsp;");

const content = {
  ...Page.create({
    attributes: { "background-color": PAPER, width: "600px" },
    data: {
      value: { "font-family": FONT, "text-color": INK },
    },
  }),
  children: [
    section([
      column(
        [
          image(
            "https://placehold.co/160x48/1F2937/F4F1EC/png?text=Lattice+Audio",
            "Lattice Audio",
            { width: "160px", align: "left" },
          ),
        ],
        "40%",
      ),
      column(
        [
          text(NAV_LINKS, {
            align: "right",
            "font-size": "13px",
            padding: "20px 0px 20px 0px",
          }),
        ],
        "60%",
      ),
    ]),

    section(
      [
        column([
          text("Hi {{firstName}}, the October drop is here", {
            align: "center",
            color: "#FFFFFF",
            "font-size": "32px",
            "font-weight": "bold",
            "line-height": "40px",
          }),
          text("New synths, fresh pedals and a gift for you.", {
            align: "center",
            color: PAPER,
            "font-size": "16px",
            padding: "8px 0px 16px 0px",
          }),
          button("Shop the drop", { "font-size": "15px" }),
        ]),
      ],
      INK,
      `64px ${SIDES} 64px ${SIDES}`,
    ),

    section([
      column([
        text(
          "This month we add three new instruments to the shop. Each one comes from a small maker we trust. Scroll down to see them, check your orders and claim your gift.",
          { "font-size": "15px", "line-height": "24px" },
        ),
      ]),
    ]),

    {
      ...ForLoop.create({
        data: { value: { dataSource: "products", itemAs: "product" } },
      }),
      children: [
        section([
          column(
            [
              text("<b>{{product.name}}</b><br />${{product.price}}", {
                "font-size": "15px",
              }),
            ],
            "70%",
          ),
          column(
            [
              button("View", {
                "font-size": "13px",
                "inner-padding": "8px 20px 8px 20px",
              }),
            ],
            "30%",
          ),
        ]),
      ],
    },

    section([
      column([
        Divider.create({
          attributes: {
            "border-color": "#E5E7EB",
            padding: "8px 0px 8px 0px",
          },
        }),
      ]),
    ]),

    {
      ...Condition.create({
        data: {
          value: {
            rulesTree: {
              logicalOperator: "AND",
              rules: [
                {
                  fieldId: "orders",
                  comparisonOperator: "IS_NOT_EMPTY",
                  value: "",
                },
              ],
            },
          },
        },
      }),
      children: [
        branch("if", [
          section([
            column([
              heading("Your recent orders"),
              Table.create({
                data: {
                  value: {
                    rowLoop: {
                      source: "orders",
                      itemAs: "order",
                      headerRows: 1,
                    },
                    tableSource: [
                      [
                        { content: "Order" },
                        { content: "Date" },
                        { content: "Total" },
                      ],
                      [
                        { content: "{{order.id}}" },
                        { content: "{{order.date}}" },
                        { content: "${{order.total}}" },
                      ],
                    ],
                  },
                },
                attributes: { "text-align": "left" },
              }),
            ]),
          ]),
        ]),
        branch("else", [
          section([
            column([
              heading("Welcome to Lattice Audio"),
              text(
                "You have no orders yet, so start with our most loved gear.",
              ),
              button("Start shopping"),
            ]),
          ]),
        ]),
      ],
    },

    section([column([coupon])]),

    section([
      column([
        heading("From the studio"),
        image(
          "https://placehold.co/552x276/C2410C/FFFFFF/png?text=Studio+session",
          "Our team tests the new synths in the studio",
        ),
        text(
          "Our team spends a week with each new instrument before it reaches the shop.",
        ),
      ]),
    ]),

    section([column([Spacer.create({ attributes: { height: "16px" } })])]),

    section(
      [
        column([
          {
            ...Social.create({ attributes: { color: PAPER } }),
            data: {
              value: {
                // An empty `src` makes MJML use its own icon for the name.
                elements: ["facebook", "instagram", "youtube"].map((name) => ({
                  name,
                  src: "",
                  content: "",
                  href: "#",
                  target: "_blank",
                })),
              },
            },
          },
          text(
            'Lattice Audio, 12 Analog Street, Portland, OR 97201<br />You receive this email because you subscribed as {{email}}.<br /><a href="#" style="color:#F4F1EC">Unsubscribe</a>',
            {
              align: "center",
              color: "#D1D5DB",
              "font-size": "12px",
              "line-height": "18px",
            },
          ),
        ]),
      ],
      INK,
    ),
  ],
};

export const DEFAULT_TEMPLATE: IEmailTemplate = {
  subject: "The October drop is here",
  subTitle: "New gear, your orders, and a gift inside",
  content: content as IEmailTemplate["content"],
};
