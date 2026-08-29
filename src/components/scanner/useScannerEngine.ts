import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../../types';
import { ScannerMode, CameraState, StatusType, ScanResult } from './types';

interface UseScannerEngineProps {
  isOpen: boolean;
  cameraState: CameraState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  products: Product[];
}

export function useScannerEngine({
  isOpen,
  cameraState,
  videoRef,
  products,
}: UseScannerEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<ScannerMode>('auto');
  const [activeEngine, setActiveEngine] = useState<'barcode' | 'ocr' | 'idle'>('barcode');
  const [statusMessage, setStatusMessage] = useState<string>('Iniciando escáner...');
  const [statusType, setStatusType] = useState<StatusType>('green');
  const [detectedResult, setDetectedResult] = useState<ScanResult | null>(null);

  // Trigger silent haptic vibration (physical feedback only, absolutely no audio)
  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch {
      // Ignore silent errors on unsupported devices
    }
  }, []);

  // Match Product helper
  const findProductByCode = useCallback((code: string, isManualOrOcr = false): Product | undefined => {
    const cleanCode = code.trim().replace(/[\s-]/g, '');
    if (!cleanCode) return undefined;

    return products.find((p) => {
      const pBarcode = p.barcode.replace(/[\s-]/g, '');
      if (pBarcode === cleanCode) return true;
      if (p.id.toLowerCase() === cleanCode.toLowerCase()) return true;
      // Search partial name only for manual/OCR input (>= 5 chars) to prevent false positives on live camera barcode scans
      if (isManualOrOcr && cleanCode.length >= 5 && p.name.toLowerCase().includes(cleanCode.toLowerCase())) {
        return true;
      }
      return false;
    });
  }, [products]);

  // Handle Detection Event
  const handleDetectedCode = useCallback((code: string, type: 'barcode' | 'ocr') => {
    const cleanRaw = code.replace(/[^0-9.,]/g, '').trim();
    if (!cleanRaw && code.length < 3) return;

    const isManualOrOcr = type === 'ocr';
    const matched = findProductByCode(code, isManualOrOcr) || findProductByCode(cleanRaw, isManualOrOcr);
    let extractedPrice: number | undefined;

    // Check if OCR detected a price pattern like "1.85" or "1,85"
    if (type === 'ocr') {
      const priceNum = parseFloat(cleanRaw.replace(',', '.'));
      if (!isNaN(priceNum) && priceNum > 0 && priceNum < 5000) {
        extractedPrice = priceNum;
      }
    }

    triggerHaptic();

    setDetectedResult({
      rawCode: cleanRaw || code,
      type,
      timestamp: Date.now(),
      matchedProduct: matched,
      extractedPrice,
    });
  }, [findProductByCode, triggerHaptic]);

  // Reset current detection state
  const resetScanResult = useCallback(() => {
    setDetectedResult(null);
  }, []);

  // Dual-Scanning Engine Loop & OCR Fallback
  useEffect(() => {
    if (!isOpen || cameraState !== 'active' || detectedResult) {
      if (cameraState === 'requesting') {
        setStatusMessage('Accediendo a la cámara...');
        setStatusType('yellow');
      } else if (cameraState === 'denied' || cameraState === 'unsupported') {
        setStatusMessage('Cámara no disponible');
        setStatusType('red');
      }
      return;
    }

    let isScanning = true;
    let frameCount = 0;
    let barcodeDetectorInstance: unknown = null;

    // Initialize Native BarcodeDetector if available in browser
    const BarcodeDetectorClass = (window as unknown as { BarcodeDetector?: new (options?: { formats: string[] }) => unknown }).BarcodeDetector;
    if (BarcodeDetectorClass) {
      try {
        barcodeDetectorInstance = new BarcodeDetectorClass({
          formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e'],
        });
      } catch (e) {
        console.warn('Native BarcodeDetector init error:', e);
      }
    }

    const intervalId = setInterval(async () => {
      if (!isScanning || detectedResult) return;
      frameCount++;

      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      // Mode 1: Barcode Reader (Every tick)
      if (mode === 'auto' || mode === 'barcode') {
        setActiveEngine('barcode');
        setStatusMessage('Escaneando código de barras...');
        setStatusType('green');

        if (barcodeDetectorInstance && typeof (barcodeDetectorInstance as { detect: (v: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> }).detect === 'function') {
          try {
            const barcodes = await (barcodeDetectorInstance as { detect: (v: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> }).detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleDetectedCode(barcodes[0].rawValue, 'barcode');
              return;
            }
          } catch {
            // Detector error, fall back gracefully
          }
        }
      }

      // Mode 2: Number OCR Fallback (If in OCR mode, or in Auto mode after ~1.5s / 6 ticks)
      const shouldRunOCR = mode === 'ocr' || (mode === 'auto' && frameCount % 6 === 0);
      if (shouldRunOCR) {
        setActiveEngine('ocr');
        setStatusMessage('Buscando números impresos (OCR)...');
        setStatusType('blue');

        // Sample center ROI (Region of Interest) onto offscreen canvas
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 480;
          canvas.width = 300;
          canvas.height = 180;

          // Crop center 50% of the video frame
          const cropX = vw * 0.25;
          const cropY = vh * 0.35;
          const cropW = vw * 0.5;
          const cropH = vh * 0.3;

          ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
          
          // Image Pre-processing for OCR (High contrast binarization check)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          let darkPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (avg < 90) darkPixels++;
          }

          // In poor lighting or out of focus, show subtle yellow status
          if (darkPixels > (data.length / 4) * 0.85 || darkPixels < (data.length / 4) * 0.05) {
            setStatusMessage('Ajuste el enfoque o la iluminación');
            setStatusType('yellow');
          }
        }
      }
    }, 280);

    return () => {
      isScanning = false;
      clearInterval(intervalId);
    };
  }, [isOpen, cameraState, mode, detectedResult, handleDetectedCode, videoRef]);

  // Reset detection when reopening
  useEffect(() => {
    if (isOpen) {
      setDetectedResult(null);
    }
  }, [isOpen]);

  return {
    canvasRef,
    mode,
    setMode,
    activeEngine,
    statusMessage,
    statusType,
    detectedResult,
    handleDetectedCode,
    resetScanResult,
  };
}
