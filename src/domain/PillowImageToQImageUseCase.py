from PIL import Image
from PySide6.QtGui import QImage

def PillowImageToQImageUseCase(image: Image.Image):
    """
    You give this function a pillow's "Image" and it will return a QT's "QImage" which you can show on a canvas.
    """
    rgba = image.convert("RGBA")
    data = rgba.tobytes("raw", "RGBA")
    return QImage(
        data,
        rgba.width,
        rgba.height,
        rgba.width * 4,
        QImage.Format.Format_RGBA8888,
    ).copy()
