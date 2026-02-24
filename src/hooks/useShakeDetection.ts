import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';

interface ShakeDetectionOptions {
  enabled: boolean;
  threshold?: number;       // acceleration magnitude threshold (default: 2.5)
  timeWindow?: number;      // ms window for shake count (default: 1000)
  shakeCount?: number;      // required shakes in window (default: 3)
  cooldown?: number;        // ms cooldown after detection (default: 5000)
  onShake: () => void;
}

export function useShakeDetection(options: ShakeDetectionOptions) {
  const {
    enabled,
    threshold = 2.5,
    timeWindow = 1000,
    shakeCount = 3,
    cooldown = 5000,
    onShake,
  } = options;

  const shakeTimes = useRef<number[]>([]);
  const lastShakeTime = useRef<number>(0);
  const onShakeRef = useRef(onShake);

  // Keep onShake ref current
  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(100); // 10 Hz

    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > threshold) {
        const now = Date.now();

        // Cooldown check
        if (now - lastShakeTime.current < cooldown) return;

        // Add shake event
        shakeTimes.current.push(now);

        // Filter to only shakes within time window
        shakeTimes.current = shakeTimes.current.filter(
          (t) => now - t < timeWindow
        );

        if (shakeTimes.current.length >= shakeCount) {
          lastShakeTime.current = now;
          shakeTimes.current = [];
          onShakeRef.current();
        }
      }
    });

    return () => subscription.remove();
  }, [enabled, threshold, timeWindow, shakeCount, cooldown]);
}
