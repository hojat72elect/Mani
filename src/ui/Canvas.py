from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
from PySide6.QtWidgets import QGraphicsView, QGraphicsScene, QGraphicsPixmapItem

class Canvas(QGraphicsView):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)
        self.imageItem = QGraphicsPixmapItem()
        self.scene.addItem(self.imageItem)

        self.setBackgroundBrush(Qt.GlobalColor.darkGray)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.setDragMode(QGraphicsView.DragMode.NoDrag)
        self.setTransformationAnchor(QGraphicsView.ViewportAnchor.AnchorUnderMouse)
        self.setResizeAnchor(QGraphicsView.ViewportAnchor.AnchorViewCenter)

        self._zoom = 1.0

    def setPixmap(self, pixmap: QPixmap):
        self.imageItem.setPixmap(pixmap)
        self.scene.setSceneRect(self.imageItem.boundingRect())

    def clearImage(self):
        self.imageItem.setPixmap(QPixmap())
        self.scene.setSceneRect(0, 0, 1, 1)

    def fitToView(self):
        if self.imageItem.pixmap().isNull():
            return
        self.resetTransform()
        self.fitInView(self.imageItem, Qt.AspectRatioMode.KeepAspectRatio)
        self._zoom=1.0

    def setZoom(self, factor:float):
        if factor <= 0:
            return
        self.resetTransform()
        self.scale(factor,factor)
        self._zoom = factor

    def zoomIn(self):
        self.setZoom(min(self._zoom * 1.2, 8.0))

    def zoomOut(self):
        self.setZoom(max(self._zoom / 1.2, 0.1))

    def wheelEvent(self, event):
        """
        for changing the zoom level with mouse wheel and ctrl key.
        """
        if event.modifiers() & Qt.KeyboardModifier.ControlModifier:
            if event.angleDelta().y()>0:
                self.zoomIn()
            else:
                self.zoomOut()
            event.accept()
            return
        super().wheelEvent(event)
