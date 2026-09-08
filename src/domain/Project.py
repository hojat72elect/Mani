from dataclasses import dataclass, field
from PIL.Image import Image
from domain.EffectSettings import EffectSettings

@dataclass
class Project:
    original_image: Image | None = None
    effectSettings: EffectSettings = field(default_factory=EffectSettings)
    filePath: str | None = None

    def reset_effects(self):
        self.effectSettings = EffectSettings()
