from dataclasses import dataclass

@dataclass
class EffectSettings:
    """
    The changes that the user can do to the picture at any given time, is defined in this form.
    """
    brightness: float = 1.0
    contrast: float = 1.0
    saturation: float = 1.0
    blur: float = 0.0
    grayscale: bool = False
