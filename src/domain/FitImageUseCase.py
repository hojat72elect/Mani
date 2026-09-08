from PIL import ImageOps, Image

def FitImageUseCase(image: Image.Image, size):
    width, height = size
    if width <= 0 or height <= 0:
        return image
    return ImageOps.contain(image, (width, height), method=Image.Resampling.LANCZOS)
