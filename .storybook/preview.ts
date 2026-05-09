import type { Preview } from '@storybook/angular'
import { initialize, mswLoader } from 'msw-storybook-addon';


import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";
setCompodocJson(docJson);

initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  // 加载器，确保 MSW 在故事渲染前准备就绪
  loaders: [mswLoader],
};

export default preview;