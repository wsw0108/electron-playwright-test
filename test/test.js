const { _electron: electron } = require('playwright')
const { test, expect } = require('@playwright/test')
const electronPath = require('electron')
const { join } = require('path')
const { launch, mock } = require('playwright-fake-dialog')

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
  process.env.CI = '1'
  const args = [join(__dirname, '..')]
  args.unshift(`--log-file=${join(__dirname, '../electron.log')}`)
  args.unshift('--enable-logging=file')
  electronApp = await launch(electron, {
    args: args,
    executablePath: electronPath,
  })
})

test.afterAll(async () => {
  await electronApp.close()
})

test('html input open file', async () => {
  const page = await electronApp.firstWindow()
  // console.log(await page.title())
  page.on('filechooser', async (fileChooser) => {
    await fileChooser.setFiles(join(__dirname, 'data.txt'))
  })
  await page.click('#file')
  const textarea = await page.$('#content')
  expect(textarea).toBeTruthy()
  expect(await textarea.innerHTML()).toBe('data.txt')
})

test('native menu open file', async () => {
  const page = await electronApp.firstWindow()
  // console.log(await page.title())
  // FIXME: https://github.com/microsoft/playwright/issues/5013
  // page.on('filechooser', async (fileChooser) => {
  //   await fileChooser.setFiles(join(__dirname, 'data.txt'))
  // })
  const mocked = await mock(page, [
    {
      method: 'showOpenDialog',
      value: {
        filePaths: [join(__dirname, 'data.txt')]
      }
    }
  ])
  // console.log('mocked:', mocked)
  await clickMenuItemById(electronApp, 'file-open')
  const textarea = await page.$('#content')
  expect(textarea).toBeTruthy()
  // expect(await textarea.innerHTML()).toBe('data')
  setTimeout(async () => {
    expect(await textarea.innerHTML()).toBe('data')
  }, 500)
})
