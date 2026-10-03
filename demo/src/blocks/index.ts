import React from "react";
import {
  BlockAttributeConfigurationManager,
  BlockManager,
  setIconsMap,
} from "lattice";
import { Coupon, COUPON_TYPE } from "./Coupon/Coupon";
import { CouponPanel } from "./Coupon/CouponPanel";

export { Coupon, COUPON_TYPE };
export type { ICoupon } from "./Coupon/Coupon";

// Inline SVG: the demo does not depend on @mui/icons-material.
const couponIcon = React.createElement(
  "svg",
  { viewBox: "0 0 24 24", width: 24, height: 24, fill: "currentColor" },
  React.createElement("path", {
    d: "M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4Zm-9 7h-2v-2h2v2Zm0-4h-2v-2h2v2Zm0-4h-2V7h2v2Z",
  }),
);

export function registerDemoBlocks() {
  BlockManager.registerBlocks({ [COUPON_TYPE]: Coupon });
  BlockAttributeConfigurationManager.add({ [COUPON_TYPE]: CouponPanel });
  setIconsMap({ [COUPON_TYPE]: couponIcon });
}
