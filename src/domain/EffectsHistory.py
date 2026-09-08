from copy import deepcopy

class EffectsHistory:
    def __init__(self, project):
        self.project = project
        self.undoStack = []
        self.redoStack = []

    def snapshot(self):
        return deepcopy(self.project.effectSettings)

    def push(self):
        self.undoStack.append(self.snapshot())
        self.redoStack.clear()

    def undo(self):
        if not self.undoStack:
            return False
        self.redoStack.append(self.snapshot())
        self.project.effectSettings = self.undoStack.pop()
        return True

    def redo(self):
        if not self.redoStack:
            return False
        self.undoStack.append(self.snapshot())
        self.project.effectSettings = self.redoStack.pop()
        return True

    def clear(self):
        self.undoStack.clear()
        self.redoStack.clear()
