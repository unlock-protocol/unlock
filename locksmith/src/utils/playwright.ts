import playwright from 'playwright'

interface Options {
  width: number
  height: number
  content?: string
  url?: string
}

export const screenshot = async ({ width, height, content, url }: Options) => {
  const browser = await playwright.chromium.launch({
    headless: true,
  })
  const page = await browser.newPage()
  await page.setViewportSize({
    width,
    height,
  })
  if (url) {
    await page.goto(url, {
      waitUntil: 'networkidle',
    })
  } else if (content) {
    await page.setContent(content, {
      waitUntil: 'networkidle',
    })
  }
  const screenshot = await page.screenshot({
    type: 'png',
    timeout: 5000,
  })

  await browser.close()

  return screenshot
}
