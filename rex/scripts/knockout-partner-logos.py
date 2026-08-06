from PIL import Image
from pathlib import Path

assets = Path(r"C:\Users\daley\.cursor\projects\c-Users-daley-pippal\assets")
out_dir = Path(r"C:\Users\daley\pippal\rex\public\images\partners")

mapping = [
    ("image-7658938d-81bb-41b4-b07c-8cfd216d6cdf.png", "coingecko.png"),
    ("image-729147da-4aab-4e9c-bf3d-3764fae5c8ea.png", "coinmarketcap.png"),
    ("image-62f0c7ce-2245-4f26-96f7-7e94aaffff34.png", "coinzilla.png"),
]


def remove_white_bg(img: Image.Image, threshold: int = 245, softness: int = 12) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)
            elif (
                r >= threshold - softness
                and g >= threshold - softness
                and b >= threshold - softness
            ):
                whiteness = min(r, g, b)
                alpha = int(max(0, min(255, (threshold - whiteness) * (255 / softness))))
                pixels[x, y] = (r, g, b, min(a, alpha))
    return img


def trim_transparent(img: Image.Image, pad: int = 2) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


for src_name, out_name in mapping:
    src = assets / src_name
    if not src.exists():
        matches = list(assets.glob(f"*{src_name}"))
        if not matches:
            raise SystemExit(f"Missing {src_name}")
        src = matches[0]
    img = Image.open(src)
    cleaned = remove_white_bg(img)
    cleaned = trim_transparent(cleaned)
    side = max(cleaned.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - cleaned.width) // 2
    oy = (side - cleaned.height) // 2
    canvas.paste(cleaned, (ox, oy), cleaned)
    if side < 128:
        canvas = canvas.resize((128, 128), Image.Resampling.LANCZOS)
    out = out_dir / out_name
    canvas.save(out, "PNG")
    print(f"Wrote {out} ({canvas.size[0]}x{canvas.size[1]})")
