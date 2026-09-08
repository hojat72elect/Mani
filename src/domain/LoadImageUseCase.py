from PIL.Image import Image

def LoadImageUseCase(path: str) -> Image:
    return Image.open(path).convert("RGBA")
