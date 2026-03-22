import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
    const [isActive, setIsActive] = useState(false);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
                setIsActive(true);
            } catch {
                setIsActive(false);
            }
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                await (navigator as Navigator & { wakeLock: { release: () => Promise<void> } }).wakeLock.release();
            } catch {
                // Ignore errors
            }
            setIsActive(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            releaseWakeLock();
        };
    }, [releaseWakeLock]);

    return {
        isActive,
        requestWakeLock,
        releaseWakeLock,
    };
}

export function useVibracion() {
    const vibrate = useCallback((pattern: number | number[] = 200) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }, []);

    const vibratePattern = useCallback((pattern: number[]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }, []);

    return {
        vibrate,
        vibratePattern,
    };
}
