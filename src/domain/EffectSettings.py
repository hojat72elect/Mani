from dataclasses import dataclass

@dataclass
class EffectSettings:
    brightness: float = 1.0
    contrast: float = 1.0
    saturation: float = 1.0
    blur: float = 0.0
    grayscale: bool = False
