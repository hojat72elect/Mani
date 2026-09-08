from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import (
    QMainWindow,
    QWidget,
    QHBoxLayout,
    QVBoxLayout,
    QLabel,
    QGroupBox,
    QFormLayout,
    QSlider,
    QCheckBox,
    QPushButton,
    QFileDialog,
    QMessageBox,
)

from domain.ApplyEffectsUseCase import ApplyEffectsUseCase
from domain.EffectsHistory import EffectsHistory
from domain.LoadImageUseCase import LoadImageUseCase
from domain.PillowImageToQImageUseCase import PillowImageToQImageUseCase
from domain.Project import Project
from ui.Canvas import Canvas
from ui.Toolbar import Toolbar


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Mani Image Editor - 0.0.1")
        self.resize(1280, 800)

        self.project = Project()
        self.history = EffectsHistory(self.project)
        self._updatingControls = False

        self._buildUi()
        self._buildMenus()
        self._connectSignals()
        self._updateUiState()

    def _buildUi(self):
        self.toolbar = Toolbar(self)
        self.addToolBar(self.toolbar)

        central = QWidget()
        root = QHBoxLayout(central)
        root.setContentsMargins(8, 8, 8, 8)
        root.setSpacing(8)

        self.canvas = Canvas()
        root.addWidget(self.canvas, 1)

        self.panel = self._createEffectsPanel()
        root.addWidget(self.panel)

        self.setCentralWidget(central)
        self.statusBar().showMessage("Open an image to begin.")

    def _createEffectsPanel(self):
        panel = QWidget()
        panel.setMinimumWidth(280)
        layout = QVBoxLayout(panel)

        title = QLabel("Image Controls")
        title.setStyleSheet("font-size: 18px; font-weight: bold;")
        layout.addWidget(title)

        effects = QGroupBox("Effects")
        form = QFormLayout(effects)

        self.brightness = QSlider(Qt.Orientation.Horizontal)
        self.brightness.setRange(0, 200)
        self.brightness.setValue(100)

        self.contrast = QSlider(Qt.Orientation.Horizontal)
        self.contrast.setRange(0, 200)
        self.contrast.setValue(100)

        self.saturation = QSlider(Qt.Orientation.Horizontal)
        self.saturation.setRange(0, 200)
        self.saturation.setValue(100)

        self.blur = QSlider(Qt.Orientation.Horizontal)
        self.blur.setRange(0, 20)
        self.blur.setValue(0)

        self.grayscale = QCheckBox("Grayscale")

        form.addRow("Brightness", self.brightness)
        form.addRow("Contrast", self.contrast)
        form.addRow("Saturation", self.saturation)
        form.addRow("Blur", self.blur)
        form.addRow("", self.grayscale)

        layout.addWidget(effects)
        self.resetButton = QPushButton("Reset Effects")
        layout.addWidget(self.resetButton)

        zoomGroup = QGroupBox("View")
        zoomLayout = QVBoxLayout(zoomGroup)
        zoomButtons = QHBoxLayout()
        self.zoomOutButton = QPushButton("−")
        self.zoomHundredButton = QPushButton("100%")
        self.zoomInButton = QPushButton("+")
        self.fitButton = QPushButton("Fit")

        for button in (
            self.zoomOutButton,
            self.zoomHundredButton,
            self.zoomInButton,
            self.fitButton,
        ):
            zoomButtons.addWidget(button)

        zoomLayout.addLayout(zoomButtons)
        layout.addWidget(zoomGroup)

        info = QLabel(
            "Alpha 1\n\n"
            "Implemented:\n"
            "• Open / Save / Export\n"
            "• Brightness\n"
            "• Contrast\n"
            "• Saturation\n"
            "• Blur\n"
            "• Grayscale\n"
            "• Zoom / Fit\n"
            "• Undo / Redo\n\n"
            "Text, emoji and collage are planned for the next Alpha iterations."
        )
        info.setWordWrap(True)
        info.setStyleSheet("color: #666;")
        layout.addWidget(info)

        layout.addStretch()
        return panel

    def _buildMenus(self):
        fileMenu = self.menuBar().addMenu("&File")
        editMenu = self.menuBar().addMenu("&Edit")
        viewMenu = self.menuBar().addMenu("&View")

        openAction = QAction("&Open...", self)
        openAction.setShortcut(QKeySequence.StandardKey.Open)
        saveAction = QAction("&Save", self)
        saveAction.setShortcut(QKeySequence.StandardKey.Save)
        saveAsAction = QAction("Save &As...", self)
        exportAction = QAction("&Export...", self)
        exportAction.setShortcut("Ctrl+Shift+E")
        exitAction = QAction("E&xit", self)
        exitAction.setShortcut(QKeySequence.StandardKey.Quit)
        undoAction = QAction("&Undo", self)
        undoAction.setShortcut(QKeySequence.StandardKey.Undo)
        redoAction = QAction("&Redo", self)
        redoAction.setShortcut(QKeySequence.StandardKey.Redo)
        fitAction = QAction("&Fit to View", self)
        fitAction.setShortcut("F")
        zoomInAction = QAction("Zoom &In", self)
        zoomInAction.setShortcut(QKeySequence.StandardKey.ZoomIn)
        zoomOutAction = QAction("Zoom &Out", self)
        zoomOutAction.setShortcut(QKeySequence.StandardKey.ZoomOut)

        for action in (openAction, saveAction, saveAsAction, exportAction):
            fileMenu.addAction(action)

        fileMenu.addSeparator()
        fileMenu.addAction(exitAction)

        editMenu.addAction(undoAction)
        editMenu.addAction(redoAction)

        viewMenu.addAction(fitAction)
        viewMenu.addAction(zoomInAction)
        viewMenu.addAction(zoomOutAction)

        self._menuActions = {
            "open": openAction,
            "save": saveAction,
            "save_as": saveAsAction,
            "export": exportAction,
            "exit": exitAction,
            "undo": undoAction,
            "redo": redoAction,
            "fit": fitAction,
            "zoom_in": zoomInAction,
            "zoom_out": zoomOutAction,
        }

    def _connectSignals(self):
        self.toolbar.openAction.triggered.connect(self.openImage)
        self.toolbar.saveAction.triggered.connect(self.saveImage)
        self.toolbar.saveAsAction.triggered.connect(self.saveAs)
        self.toolbar.undoAction.triggered.connect(self.undo)
        self.toolbar.redoAction.triggered.connect(self.redo)
        self.toolbar.fitAction.triggered.connect(self.canvas.fitToView)
        self.toolbar.zoomInAction.triggered.connect(self.canvas.zoomIn)
        self.toolbar.zoomOutAction.triggered.connect(self.canvas.zoomOut)

        self._menuActions["open"].triggered.connect(self.openImage)
        self._menuActions["save"].triggered.connect(self.saveImage)
        self._menuActions["save_as"].triggered.connect(self.saveAs)
        self._menuActions["export"].triggered.connect(self.saveAs)
        self._menuActions["exit"].triggered.connect(self.close)
        self._menuActions["undo"].triggered.connect(self.undo)
        self._menuActions["redo"].triggered.connect(self.redo)
        self._menuActions["fit"].triggered.connect(self.canvas.fitToView)
        self._menuActions["zoom_in"].triggered.connect(self.canvas.zoomIn)
        self._menuActions["zoom_out"].triggered.connect(self.canvas.zoomOut)

        self.brightness.valueChanged.connect(self._effectControlChanged)
        self.contrast.valueChanged.connect(self._effectControlChanged)
        self.saturation.valueChanged.connect(self._effectControlChanged)
        self.blur.valueChanged.connect(self._effectControlChanged)
        self.grayscale.stateChanged.connect(self._effectControlChanged)

        self.resetButton.clicked.connect(self.resetEffects)
        self.zoomOutButton.clicked.connect(self.canvas.zoomOut)
        self.zoomInButton.clicked.connect(self.canvas.zoomIn)
        self.zoomHundredButton.clicked.connect(lambda: self.canvas.setZoom(1.0))
        self.fitButton.clicked.connect(self.canvas.fitToView)

    def _updateUiState(self):
        enabled = self.project.originalImage is not None
        self.panel.setEnabled(enabled)
        self.toolbar.saveAction.setEnabled(enabled)
        self.toolbar.saveAsAction.setEnabled(enabled)
        self.toolbar.undoAction.setEnabled(bool(self.history.undoStack))
        self.toolbar.redoAction.setEnabled(bool(self.history.redoStack))
        self._menuActions["save"].setEnabled(enabled)
        self._menuActions["save_as"].setEnabled(enabled)
        self._menuActions["export"].setEnabled(enabled)
        self._menuActions["undo"].setEnabled(bool(self.history.undoStack))
        self._menuActions["redo"].setEnabled(bool(self.history.redoStack))

    def openImage(self):
        path, _ = QFileDialog.getOpenFileName(
            self,
            "Open Image",
            "",
            "Images (*.png *.jpg *.jpeg *.webp *.bmp *.tif *.tiff);;All Files (*)",
        )
        if not path:
            return

        try:
            image = LoadImageUseCase(path)
        except Exception as e:
            QMessageBox.critical(self, "Open Error", f"Could not open image:\n{e}")
            return

        self.project.originalImage = image
        self.project.filePath = path
        self.project.resetEffects()
        self.history.clear()
        self._syncControlsFromProject()
        self._render()
        self.canvas.fitToView()
        self.statusBar().showMessage(f"Opened: {Path(path).name}")
        self._updateUiState()

    def _effectControlChanged(self, *_):
        if self._updatingControls or self.project.originalImage is None:
            return

        self.history.push()
        settings = self.project.effectSettings
        settings.brightness = self.brightness.value() / 100.0
        settings.contrast = self.contrast.value() / 100.0
        settings.saturation = self.saturation.value() / 100.0
        settings.blur = float(self.blur.value())
        settings.grayscale = self.grayscale.isChecked()

        self._render()
        self._updateUiState()

    def _syncControlsFromProject(self):
        self._updatingControls = True
        try:
            s = self.project.effectSettings
            self.brightness.setValue(round(s.brightness * 100))
            self.contrast.setValue(round(s.contrast * 100))
            self.saturation.setValue(round(s.saturation * 100))
            self.blur.setValue(round(s.blur))
            self.grayscale.setChecked(s.grayscale)
        finally:
            self._updatingControls = False

    def _render(self):
        if self.project.originalImage is None:
            self.canvas.clearImage()
            return

        rendered = ApplyEffectsUseCase(
            self.project.originalImage,
            self.project.effectSettings,
        )
        self.canvas.setPixmap(
            __import__("PySide6.QtGui", fromlist=["QPixmap"]).QPixmap.fromImage(
                PillowImageToQImageUseCase(rendered)
            )
        )

    def resetEffects(self):
        if self.project.originalImage is None:
            return
        self.history.push()
        self.project.resetEffects()
        self._syncControlsFromProject()
        self._render()
        self._updateUiState()

    def undo(self):
        if self.history.undo():
            self._syncControlsFromProject()
            self._render()
            self._updateUiState()

    def redo(self):
        if self.history.redo():
            self._syncControlsFromProject()
            self._render()
            self._updateUiState()

    def _currentRenderedImage(self):
        if self.project.originalImage is None:
            return None
        return ApplyEffectsUseCase(
            self.project.originalImage,
            self.project.effectSettings,
        )

    def saveImage(self):
        if self.project.originalImage is None:
            return
        if not self.project.filePath:
            self.saveAs()
            return

        try:
            image = self._currentRenderedImage()
            image.save(self.project.filePath)
            self.statusBar().showMessage(f"Saved: {Path(self.project.filePath).name}")
        except Exception as e:
            QMessageBox.critical(self, "Save Error", f"Could not save image:\n{e}")

    def saveAs(self):
        if self.project.originalImage is None:
            return

        path, selectedFilter = QFileDialog.getSaveFileName(
            self,
            "Save Image As",
            "",
            "PNG (*.png);;JPEG (*.jpg *.jpeg);;WebP (*.webp)",
        )
        if not path:
            return

        if selectedFilter.startswith("JPEG") and not path.lower().endswith(
            (".jpg", ".jpeg")
        ):
            path += ".jpg"
        elif selectedFilter.startswith("WebP") and not path.lower().endswith(".webp"):
            path += ".webp"
        elif selectedFilter.startswith("PNG") and not path.lower().endswith(".png"):
            path += ".png"

        try:
            image = self._currentRenderedImage()
            if path.lower().endswith((".jpg", ".jpeg")):
                image = image.convert("RGB")
            image.save(path)
            self.project.filePath = path
            self.statusBar().showMessage(f"Saved: {Path(path).name}")
        except Exception as e:
            QMessageBox.critical(self, "Save Error", f"Could not save image:\n{e}")
