from PIL import Image
from PySide6.QtGui import QImage

def PillowImageToQImageUseCase(image: Image.Image):
    rgba = image.convert("RGBA")
    data = rgba.tobytes("raw", "RGBA")
    return QImage(
        data,
        rgba.width,
        rgba.height,
        rgba.width * 4,
        QImage.Format.Format_RGBA8888,
    ).copy()
