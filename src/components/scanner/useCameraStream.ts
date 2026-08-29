import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraState } from './types';

export function useCameraStream(isOpen: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Clean up camera stream
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping camera track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  }, []);

  // Initialize camera
  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraState('requesting');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setErrorMessage('Tu navegador no permite acceso directo a la cámara o el entorno no tiene permisos.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false, // Absolutely no audio recording or streams
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as unknown as { torch?: boolean };
        setHasTorchSupport(Boolean(capabilities?.torch));
      } else {
        setHasTorchSupport(false);
      }

      setCameraState('active');
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Permiso de cámara denegado. Puedes probar con el simulador o ingresar el código manualmente.');
      } else {
        setCameraState('unsupported');
        setErrorMessage('No se pudo inicializar la cámara. Puedes probar el simulador de códigos o el ingreso manual.');
      }
    }
  }, [facingMode, stopCameraStream]);

  // Toggle Torch / Flashlight
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const nextTorch = !isTorchOn;
      await (videoTrack as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch control failed:', e);
      setIsTorchOn(false);
    }
  }, [isTorchOn]);

  // Flip Camera
  const flipCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  // Sync camera lifecycle with isOpen & facingMode
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream]);

  return {
    videoRef,
    cameraState,
    errorMessage,
    isTorchOn,
    hasTorchSupport,
    facingMode,
    startCamera,
    stopCameraStream,
    toggleTorch,
    flipCamera,
  };
}
