from dataclasses import dataclass, field
from PIL import Image
from domain.EffectSettings import EffectSettings

@dataclass
class Project:
    originalImage: Image.Image | None = None
    effectSettings: EffectSettings = field(default_factory=EffectSettings)
    filePath: str | None = None

    def resetEffects(self):
        self.effectSettings = EffectSettings()
