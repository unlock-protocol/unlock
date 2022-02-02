# Unlock Protocol UI

This package includes React Components used across our products.

## Using the package

First of all, you will need to run the `yarn build` command in root.

To use the package inside this monorepo, you need to add the following to your dependencies in `package.json`:

```json
    "@unlock-protocol/ui": "workspace:./packages/ui",
```

Then do a `yarn install`. This will link the package.

### Usage

You will need to import the relevant css file in your index component. For nextjs, that is `_app.{tsx,jsx,js,ts}` in pages. See example in `packages/ui/src/main.tsx`.

```ts
import '@unlock-protocol/ui/dist/style.css'
```

Afterwards, you can import any of the components directly from `@unlock-protocol/ui`

```tsx
import type { NextPage } from 'next'
import { Button } from '@unlock-protocol/ui'

const Index: NextPage = () => {
  return <Button> Hello, from Index page </Button>
}
```

## Development

Please run `yarn install` in the root. This will install all the dependencies.

You can then run `yarn storybook` to start the storybook server inside this folder. This will alow you to view components you want to create.

### Creating Components

1. When you want add a new component, create a folder with name of the component in `lib/components`. For example, if you want to create a component called `Button`, create a folder called `Button` in `lib/components`.

2. Add `[Component].tsx` and `[Component].stories.tsx` to the folder. Replace `[Component]` with the name of the component.

3. Export the component in `index.tsx`. For example, if you want to create a component called `Button`, export it in `index.tsx` as `export { Button } from './Button';`,

If the components is not ready for public use yet, do not export it.

### Resources

We use tailwind and postcss for styling. You can find the relevant information on the [tailwind documentation](https://tailwindcss.com/docs) and [postcss documentation](https://postcss.org/).

We use vite for building our components. You can find the relevant information on the [vite documentation](https://vite.dev/docs).

We use storybook for previewing our components. You can find the relevant information on the [storybook documentation](https://storybook.js.org/docs/basics/introduction).
