const { _electron: electron } = require('playwright')
const { test, expect } = require('@playwright/test')
const electronPath = require('electron')
const { join } = require('path')

// From https://github.com/spaceagetv/electron-playwright-example/blob/master/e2e-tests/electron-playwright-helpers.ts
function clickMenuItemById(electronApp, id) {
  return electronApp.evaluate(({ Menu }, menuId) => {
    const menu = Menu.getApplicationMenu()
    const menuItem = menu.getMenuItemById(menuId)
    if (menuItem) {
      return menuItem.click()
    } else {
      throw new Error(`Menu item with id ${menuId} not found`)
    }
  }, id)
}

let electronApp;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [join(__dirname, '..')],
    executablePath: electronPath,
  })
})

test.afterAll(async () => {
  await electronApp.close()
})

test('menu open file', async () => {
  const page = await electronApp.firstWindow()
  // console.log(await page.title())
  // FIXME: https://github.com/microsoft/playwright/issues/5013
  page.on('filechooser', async (fileChooser) => {
    await fileChooser.setFiles(join(__dirname, 'data.txt'))
  })
  await clickMenuItemById(electronApp, 'file-open')
  const textarea = await page.$('#content')
  expect(textarea).toBeTruthy()
  expect(await textarea.innerHTML()).toBe('data')
})
