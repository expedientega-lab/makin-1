from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def main() -> None:
    src = Path(
        r"C:\Users\gerte\.cursor\projects\c-Users-gerte-Desktop-makin\assets\c__Users_gerte_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-eaa1704f-0fe2-40a2-8a9c-34ba2c62b4ac.png"
    )
    dst = Path(r"C:\Users\gerte\Desktop\makin\imagen_sin_estrellas_sin_logo.png")

    img = np.array(Image.open(src).convert("RGB"))
    h, w = img.shape[:2]

    # Mascara para estrellas pequenas/brillantes
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    bright = (gray > 120).astype(np.uint8) * 255
    num, labels, stats, _ = cv2.connectedComponentsWithStats(bright, 8)
    mask = np.zeros((h, w), dtype=np.uint8)
    for i in range(1, num):
        x, y, ww, hh, area = stats[i]
        if area <= 20 and ww <= 8 and hh <= 8:
            mask[y : y + hh, x : x + ww] = 255

    # Mascara para logo central
    cx, cy = w // 2, h // 2 + 8
    cv2.ellipse(mask, (cx, cy), (65, 78), 0, 0, 360, 255, -1)
    cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)), iterations=2, dst=mask)

    # Relleno inteligente
    result_bgr = cv2.inpaint(cv2.cvtColor(img, cv2.COLOR_RGB2BGR), mask, 7, cv2.INPAINT_TELEA)
    result_rgb = cv2.cvtColor(result_bgr, cv2.COLOR_BGR2RGB)
    Image.fromarray(result_rgb).save(dst)

    print(f"Imagen guardada en: {dst}")


if __name__ == "__main__":
    main()
