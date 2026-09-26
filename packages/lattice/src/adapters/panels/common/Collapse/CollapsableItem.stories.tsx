import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollapsableItem } from "./CollapsableItem";
import { Box } from "@mui/material";

const meta: Meta<typeof CollapsableItem> = {
  title: "Email/Collapse/CollapsableItem",
  component: CollapsableItem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CollapsableItem>;

export const Default: Story = {
  args: {
    title: "Collapsable Section",
  },
  render: (args) => (
    <CollapsableItem {...args}>
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        This content is collapsible. Click the icon to expand or collapse the
        section.
      </Box>
    </CollapsableItem>
  ),
};

export const Expanded: Story = {
  args: {
    title: "Initially Expanded",
  },
  render: (args) => (
    <CollapsableItem {...args} defaultExpanded={true}>
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        This section is expanded by default.
      </Box>
    </CollapsableItem>
  ),
};

export const Collapsed: Story = {
  args: {
    title: "Initially Collapsed",
  },
  render: (args) => (
    <CollapsableItem {...args} defaultExpanded={false}>
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        This section starts collapsed.
      </Box>
    </CollapsableItem>
  ),
};

export const CustomHeader: Story = {
  args: {
    title: "Custom Styling",
    headerStyle: {
      borderBottom: "2px solid #2196f3",
      mb: 3,
    },
  },
  render: (args) => (
    <CollapsableItem {...args}>
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        This section uses custom header styling with a blue border.
      </Box>
    </CollapsableItem>
  ),
};
