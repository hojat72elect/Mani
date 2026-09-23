import logging
import time

logging.basicConfig(level=logging.INFO)

def Timber(func):
    """
    If you add this decorator to any functions, their run time will be logged.
    """
    def wrapper(*args, **kwargs):
        startTime = time.perf_counter()
        result = func(*args, **kwargs)
        endTime = time.perf_counter()

        elapsedTime = (endTime - startTime) * 1000
        logging.info(f"Function '{func.__name__}' took {elapsedTime:0.1f} milliseconds to complete.")
        return result
    return wrapper
