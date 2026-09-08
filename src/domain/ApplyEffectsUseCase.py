from PIL import ImageEnhance, ImageFilter, ImageOps
from PIL.Image import Image
from domain.EffectSettings import EffectSettings

def ApplyEffectsUseCase(image: Image, settings: EffectSettings) -> Image:
    result = image.copy()

    if settings.brightness != 1.0:
        result = ImageEnhance.Brightness(result).enhance(settings.brightness)

    if settings.contrast != 1.0:
        result = ImageEnhance.Contrast(result).enhance(settings.contrast)

    if settings.saturation != 1.0:
        result = ImageEnhance.Color(result).enhance(settings.saturation)

    if settings.blur > 0:
        result = result.filter(ImageFilter.GaussianBlur(settings.blur))

    if settings.grayscale:
        gray = ImageOps.grayscale(result)
        result = gray.convert("RGBA")

    return result
