from dataclasses import dataclass, field
from PIL.Image import Image
from domain.EffectSettings import EffectSettings

@dataclass
class Project:
    originalImage: Image | None = None
    effectSettings: EffectSettings = field(default_factory=EffectSettings)
    filePath: str | None = None

    def resetEffects(self):
        self.effectSettings = EffectSettings()
