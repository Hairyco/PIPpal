import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = path.join(__dirname, '../src/assets/collections/featured-collections-source.png')
const outDir = path.join(__dirname, '../src/assets/collections')

const collections = [
  { id: 'disposable-alternatives', label: 'Disposable Alternatives' },
  { id: 'e-liquids', label: 'E-Liquids' },
  { id: 'vape-kits', label: 'Vape Kits' },
  { id: 'nicotine-pouches', label: 'Nicotine Pouches' },
  { id: 'pods', label: 'Pods' },
  { id: 'coils', label: 'Coils' },
]

const meta = await sharp(src).metadata()
const width = meta.width ?? 1024
const height = meta.height ?? 233
const titleHeight = 28
const cardTop = titleHeight
const cardHeight = height - titleHeight
const cardWidth = Math.floor(width / collections.length)

for (let i = 0; i < collections.length; i++) {
  const left = i * cardWidth
  const extractWidth = i === collections.length - 1 ? width - left : cardWidth

  await sharp(src)
    .extract({ left, top: cardTop, width: extractWidth, height: cardHeight })
    .png()
    .toFile(path.join(outDir, `${collections[i].id}.png`))
}

console.log(`Cropped ${width}x${height} into ${collections.length} cards`)
