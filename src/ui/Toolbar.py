from PySide6.QtGui import QAction
from PySide6.QtWidgets import QToolBar

class Toolbar(QToolBar):
    def __init__(self, parent=None):
        super().__init__("Main Toolbar", parent)
        self.setMovable(False)

        self.openAction = QAction("Open", self)
        self.saveAction = QAction("Save", self)
        self.saveAsAction = QAction("Save As", self)
        self.undoAction = QAction("Undo", self)
        self.redoAction = QAction("Redo", self)
        self.fitAction = QAction("Fit", self)
        self.zoomInAction = QAction("Zoom +", self)
        self.zoomOutAction = QAction("Zoom -", self)

        for action in (
            self.openAction,
            self.saveAction,
            self.saveAsAction,
            self.undoAction,
            self.redoAction,
            self.fitAction,
            self.zoomInAction,
            self.zoomOutAction,
        ):
            self.addAction(action)
