import React from "react";
import { merge } from "lodash";
import {
  BasicType,
  createBlock,
  getAdapterAttributesString,
  t,
  type IBlockData,
} from "lattice";

export const COUPON_TYPE = "coupon";

export type ICoupon = IBlockData<
  {
    "background-color"?: string;
    "border-color"?: string;
    color?: string;
    align?: string;
    padding?: string;
  },
  { title: string; code: string; note: string }
>;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string | undefined): string {
  return (value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export const Coupon = createBlock<ICoupon>({
  get name() {
    return t("Coupon");
  },
  type: COUPON_TYPE,
  create: (payload) => {
    const defaultData: ICoupon = {
      type: COUPON_TYPE,
      data: {
        value: {
          title: "Your gift",
          code: "WELCOME10",
          note: "10% off your next order.",
        },
      },
      attributes: {
        "background-color": "#fff7ed",
        "border-color": "#f59e0b",
        color: "#292524",
        align: "center",
        padding: "20px 25px 20px 25px",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    const { data } = params;
    const { title, code, note } = data.data.value;
    const {
      "background-color": fill = "#fff7ed",
      "border-color": border = "#f59e0b",
      color = "#292524",
      align,
      padding,
    } = data.attributes;

    // Only MJML-valid attributes reach mj-text. The box colors stay inline.
    const mjmlAttributes = getAdapterAttributesString({
      ...params,
      data: { ...data, attributes: { align, padding, color } },
    });
    const box = `border:2px dashed ${escapeHtml(border)};background-color:${escapeHtml(fill)};padding:16px;text-align:center;`;

    const html =
      `<div style="${box}">` +
      `<div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;">${escapeHtml(title)}</div>` +
      `<div style="font-size:30px;font-weight:bold;letter-spacing:4px;padding:8px 0;">${escapeHtml(code)}</div>` +
      `<div style="font-size:13px;">${escapeHtml(note)}</div>` +
      `</div>`;

    return (
      <>
        {`<mj-text ${mjmlAttributes}>`}
        {html}
        {`</mj-text>`}
      </>
    );
  },
});
