import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assets = path.join(__dirname, '../src/assets')
const out = path.join(assets, 'products')

async function splitCardIntoThree(src, outputs) {
  const meta = await sharp(src).metadata()
  const width = meta.width ?? 170
  const height = meta.height ?? 205
  const colW = Math.floor(width / 3)

  for (let i = 0; i < 3; i++) {
    const left = i * colW
    const extractW = i === 2 ? width - left : colW
    await sharp(src)
      .extract({ left, top: 0, width: extractW, height })
      .png()
      .toFile(path.join(out, outputs[i]))
  }
}

await splitCardIntoThree(path.join(assets, 'collections/disposable-alternatives.png'), [
  'nasty-fix.png',
  'lost-mary-bm600.png',
  'elf-bar-600.png',
])

await splitCardIntoThree(path.join(assets, 'collections/e-liquids.png'), [
  'vampire-vape.png',
  'dinner-lady-alt.png',
  'dinner-lady.png',
])

await splitCardIntoThree(path.join(assets, 'collections/vape-kits.png'), [
  'oxva-xlim-alt.png',
  'oxva-xlim-pro.png',
  'oxva-xlim-alt2.png',
])

console.log('Product images cropped from collection cards')
