import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
      description: 'Card visual style variant',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Card size preset',
    },
    width: {
      control: 'text',
      description: 'Custom width (e.g., "300px", "50%")',
    },
    clickable: {
      control: 'boolean',
      description: 'Make card clickable',
    },
    header: {
      control: 'boolean',
      description: 'Show header section',
    },
    footer: {
      control: 'boolean',
      description: 'Show footer section',
    },
    title: {
      control: 'text',
      description: 'Card title',
    },
    subtitle: {
      control: 'text',
      description: 'Card subtitle',
    },
    cardClick: {
      action: 'cardClicked',
      description: 'Emitted when clickable card is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

// Basic card
export const Default: Story = {
  args: {
    title: 'Default Card',
    subtitle: 'This is a subtitle',
    variant: 'default',
    size: 'medium',
    header: true,
    footer: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [subtitle]="subtitle"
        [variant]="variant"
        [size]="size"
        [header]="header"
        [footer]="footer"
        [clickable]="clickable"
        (cardClick)="cardClick.emit()"
      >
        <p>This is the card content. You can put any content here!</p>
      </app-card>
    `,
  }),
};

// Outlined card
export const Outlined: Story = {
  args: {
    title: 'Outlined Card',
    subtitle: 'Clean and minimal',
    variant: 'outlined',
    size: 'medium',
    header: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [subtitle]="subtitle"
        [variant]="variant"
        [size]="size"
      >
        <p>This card has an outlined style with no shadow.</p>
      </app-card>
    `,
  }),
};

// Elevated card with hover effect
export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    subtitle: 'With hover animation',
    variant: 'elevated',
    size: 'medium',
    header: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [subtitle]="subtitle"
        [variant]="variant"
        [size]="size"
      >
        <p>This card has elevation and a subtle hover animation.</p>
      </app-card>
    `,
  }),
};

// Clickable card
export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    subtitle: 'Click me!',
    variant: 'elevated',
    size: 'medium',
    clickable: true,
    header: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [subtitle]="subtitle"
        [variant]="variant"
        [size]="size"
        [clickable]="clickable"
        (cardClick)="cardClick.emit()"
      >
        <p>Click anywhere on this card to trigger the event.</p>
      </app-card>
    `,
  }),
};

// Card with footer
export const WithFooter: Story = {
  args: {
    title: 'Card with Actions',
    subtitle: 'With footer section',
    variant: 'default',
    size: 'medium',
    header: true,
    footer: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [subtitle]="subtitle"
        [variant]="variant"
        [size]="size"
        [header]="header"
        [footer]="footer"
      >
        <p>Main content goes here.</p>
        <div card-footer>
          <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Action Button
          </button>
        </div>
      </app-card>
    `,
  }),
};

// Small card
export const Small: Story = {
  args: {
    title: 'Small Card',
    size: 'small',
    variant: 'default',
    header: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [size]="size"
        [variant]="variant"
      >
        <p>This is a small card perfect for compact layouts.</p>
      </app-card>
    `,
  }),
};

// Large card
export const Large: Story = {
  args: {
    title: 'Large Card',
    size: 'large',
    variant: 'default',
    header: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [size]="size"
        [variant]="variant"
      >
        <p>This is a large card with more width for content.</p>
        <p>Great for detailed information or media content.</p>
      </app-card>
    `,
  }),
};

// No header card
export const NoHeader: Story = {
  args: {
    variant: 'outlined',
    size: 'medium',
    header: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [variant]="variant"
        [size]="size"
        [header]="header"
      >
        <h3>Custom Layout</h3>
        <p>Without the built-in header, you have full control over the card layout.</p>
      </app-card>
    `,
  }),
};

// Custom width
export const CustomWidth: Story = {
  args: {
    title: 'Custom Width',
    variant: 'elevated',
    width: '500px',
    header: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card
        [title]="title"
        [variant]="variant"
        [width]="width"
      >
        <p>This card has a custom width of 500px.</p>
      </app-card>
    `,
  }),
};
