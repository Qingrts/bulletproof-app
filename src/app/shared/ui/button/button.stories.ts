import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <app-button
        [variant]="variant"
        [size]="size"
        [type]="type"
        [disabled]="disabled"
        [loading]="loading"
        (clicked)="clicked()">
        {{ label }}
      </app-button>
    `,
  }),
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'success'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text', defaultValue: 'Button' },
    buttonClick: { action: 'onClick' },
    clicked: { action: 'clicked' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    label: 'Button',
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    label: 'Danger Button',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Success Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled Button',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    label: 'Loading...',
  },
};
