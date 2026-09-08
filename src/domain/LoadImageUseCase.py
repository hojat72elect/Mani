from PIL import Image

def LoadImageUseCase(path: str) -> Image.Image:
    return Image.open(path).convert("RGBA")
