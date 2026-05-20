"""
Run this script once to create the extension icons.
It requires Pillow: pip install Pillow
"""
from PIL import Image, ImageDraw
import os

out_dir = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(out_dir, exist_ok=True)

def draw_map_pin(size):
    """Draw a simple map pin icon on a blue background."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Background circle
    d.ellipse([0, 0, size - 1, size - 1], fill='#4285F4')

    # Draw a white map pin shape
    margin = size * 0.18
    pin_w = size - 2 * margin
    pin_h = size - 2 * margin
    cx = size / 2

    # Pin head (circle)
    head_r = pin_w * 0.28
    head_cx = cx
    head_cy = margin + pin_h * 0.32

    d.ellipse(
        [head_cx - head_r, head_cy - head_r, head_cx + head_r, head_cy + head_r],
        fill='white'
    )

    # Pin body (teardrop / downward triangle)
    tip_y = margin + pin_h * 0.82
    left_x = cx - head_r * 1.05
    right_x = cx + head_r * 1.05
    d.polygon([(left_x, head_cy), (right_x, head_cy), (cx, tip_y)], fill='white')

    # Inner dot (hole in pin head)
    inner_r = head_r * 0.38
    d.ellipse(
        [head_cx - inner_r, head_cy - inner_r, head_cx + inner_r, head_cy + inner_r],
        fill='#4285F4'
    )

    return img

for size in [16, 48, 128]:
    icon = draw_map_pin(size)
    path = os.path.join(out_dir, f'icon{size}.png')
    icon.save(path)
    print(f'Created: {path}')

print('\nAll icons created! You can now load the extension in Chrome.')
