from PySide6.QtCore import QThread, Signal
from domain.ApplyEffectsUseCase import ApplyEffectsUseCase

class EffectsWorker(QThread):
    finished = Signal(object)

    def __init__(self, image, settings):
        super().__init__()
        self.image = image
        self.settings = settings

    def run(self):
        result = ApplyEffectsUseCase(self.image, self.settings)
        self.finished.emit(result)
