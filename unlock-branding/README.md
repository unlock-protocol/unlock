# Unlock Branding Assets

A set of SVG branding assets for Unlock

## Usage

1. `yarn install`
2. `yarn run build`

## Notes

To update the build parameters, edit `output.js`. The exported array accepts an input file and an array of "outputs".

```
module.exports = [
  {
    "input": "input-file-name.svg",
    "output": [
      {
        "name": "output-file-name.png",
        "size": "800:",
        "css": "svg{/*CustomCSSWithoutSpaces */}",
      },
      {
        "name": "additional-output-file-name.jpg",
        "size": "600:400",
        "quality": "60%",
        "css": "svg{/*CustomCSSWithoutSpaces */}",
    ]
  }
]
```

Within each output object, only `name` is required. Note that the conversion tool will automatically convert to the format you specify as the file extension (`png` or `jpg`). `quality` is a JPG-only option.

For information on the various options, see the [svgexport documentation](https://github.com/shakiba/svgexport).
