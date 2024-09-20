import antfu from '@antfu/eslint-config';
import mochaPlugin from 'eslint-plugin-mocha';

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },

    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
  },
  {
    files: ['tests/**'],
    rules: {
      'prefer-arrow-callback': 0,
      'no-unused-expressions': 'off',
    },
  },
  {
    ...mochaPlugin.configs.flat.recommended,
  },
);
