# Email templates

This sub-repository contains the Unlock email templates

### Add template

To add a new template add the new template key inside the `index.ts` file on `Template` type.
Following to this you need to create a new file with the template and include it in `EmailTemplates`.

Let's say we need to add a new `demo` template, there is the following steps:

1. Inside `index.ts` we add the new `demo` key

```
type Template =
  | 'keyMinde'
  | 'demo'
```

2. Create the new template file with `EmailTemplateProps` definition

demo.ts

```
export default {
  subject: 'Demo template header',
  html: 'demo template content'
}
```

3. Add this file on `EmailTemplates` inside `index.ts`

```
export const EmailTemplates: Record<Partial<Template>, EmailTemplateProps> = {
  // [...] other templates
  demo,
}
```
