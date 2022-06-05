export const MAX_DEVICE_WIDTHS = {
  PHONE: 736,
  TABLET: 1000,
}
export const MIN_DEVICE_WIDTHS = {
  // this needs to be 257 because the paywall width in the iframe is 256px
  // on desktop, so we need to make sure that we don't match that window width
  // if you change this, please change the value in src/components/Paywall.css
  PHONE: 257,
}
