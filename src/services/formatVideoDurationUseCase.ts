/**
 * Helper to format duration in MM:SS or HH:MM:SS
 */
export function formatVideoDurationUseCase(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    const rounded = Math.round(seconds);
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;

    const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    if (hrs > 0) {
        const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
        return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${mins}:${paddedSecs}`;
}
