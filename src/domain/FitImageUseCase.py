from PIL import ImageOps
from PIL.Image import Image


def FitImageUseCase(image:Image, size):
    width, height = size
    if width <= 0 or height <=0:
        return image
    return ImageOps.contain(image, (width, height), method=Image.Resampling.LANCZOS)