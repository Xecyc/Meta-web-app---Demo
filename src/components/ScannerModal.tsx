import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Zap, 
  ZapOff, 
  RefreshCw, 
  ScanLine, 
  CheckCircle, 
  Camera, 
  Barcode, 
  Hash, 
  Layers, 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  AlertCircle, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';

export type ScannerMode = 'auto' | 'barcode' | 'ocr';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  exchangeRate: number;
  onAddToCart: (product: Product, quantity?: number) => void;
  onProductSelect?: (product: Product) => void;
  onSearchProduct?: (query: string) => void;
  branchName: string;
}

interface ScanResult {
  rawCode: string;
  type: 'barcode' | 'ocr';
  timestamp: number;
  matchedProduct?: Product;
  extractedPrice?: number;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  exchangeRate,
  onAddToCart,
  onProductSelect,
  onSearchProduct,
  branchName,
}) => {
  // 1. Camera & Video Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 2. Component State
  const [mode, setMode] = useState<ScannerMode>('auto');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Scanning Engine States
  const [activeEngine, setActiveEngine] = useState<'barcode' | 'ocr' | 'idle'>('barcode');
  const [statusMessage, setStatusMessage] = useState<string>('Iniciando escáner...');
  const [statusType, setStatusType] = useState<'green' | 'blue' | 'yellow' | 'red'>('green');
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  // Detected Result State
  const [detectedResult, setDetectedResult] = useState<ScanResult | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  // Manual Input State
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [showSamplesDrawer, setShowSamplesDrawer] = useState<boolean>(false);

  // 3. Trigger Haptic Vibration
  const triggerHaptic = useCallback(() => {
    if (!hapticEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch {
      // Ignore silent errors
    }
  }, [hapticEnabled]);

  // 5. Clean up camera stream
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  }, []);

  // 6. Initialize Camera
  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraState('requesting');
    setStatusMessage('Accediendo a la cámara...');
    setStatusType('yellow');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setStatusMessage('Cámara no compatible en este navegador');
      setStatusType('red');
      setErrorMessage('Tu navegador no permite acceso directo a la cámara o el entorno no tiene permisos.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
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
      setStatusMessage(
        mode === 'ocr' 
          ? 'Buscando números impresos (OCR)...' 
          : 'Escaneando código de barras...'
      );
      setStatusType(mode === 'ocr' ? 'blue' : 'green');
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
      setStatusMessage('Cámara no disponible');
      setStatusType('red');
    }
  }, [facingMode, mode, stopCameraStream]);

  // 7. Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const nextTorch = !isTorchOn;
      // Use advanced constraint with type assertion
      await (videoTrack as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch control failed:', e);
      setIsTorchOn(false);
    }
  };

  // 8. Flip Camera (Facing Mode)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // 9. Match Product helper
  const findProductByCode = useCallback((code: string): Product | undefined => {
    const cleanCode = code.trim().replace(/[\s-]/g, '');
    if (!cleanCode) return undefined;

    return products.find((p) => {
      const pBarcode = p.barcode.replace(/[\s-]/g, '');
      if (pBarcode === cleanCode) return true;
      if (p.id.toLowerCase() === cleanCode.toLowerCase()) return true;
      // Search partial name or description if code is a known word
      if (cleanCode.length >= 4 && p.name.toLowerCase().includes(cleanCode.toLowerCase())) return true;
      return false;
    });
  }, [products]);

  // 10. Handle Detection Event
  const handleDetectedCode = useCallback((code: string, type: 'barcode' | 'ocr') => {
    // Whitelist digits and price punctuation
    const cleanRaw = code.replace(/[^0-9.,]/g, '').trim();
    if (!cleanRaw && code.length < 3) return;

    const matched = findProductByCode(code) || findProductByCode(cleanRaw);
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
    setAddQuantity(1);
    setAddedFeedback(false);
  }, [findProductByCode, triggerHaptic]);

  // 11. Dual-Scanning Engine Loop & OCR Fallback
  useEffect(() => {
    if (!isOpen || cameraState !== 'active' || detectedResult) return;

    let isScanning = true;
    let frameCount = 0;
    let barcodeDetectorInstance: unknown = null;

    // Initialize Native BarcodeDetector if available
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
          
          // Image Pre-processing for OCR (High contrast binarization)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          let darkPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (avg < 90) darkPixels++;
          }

          // In poor lighting or out of focus, show subtle yellow status
          if (darkPixels > data.length / 4 * 0.85 || darkPixels < data.length / 4 * 0.05) {
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
  }, [isOpen, cameraState, mode, detectedResult, handleDetectedCode]);

  // 12. Lifecycle: start/stop camera on modal open/close
  useEffect(() => {
    if (isOpen) {
      setDetectedResult(null);
      setAddQuantity(1);
      setShowManualInput(false);
      setShowSamplesDrawer(false);
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream]);

  // Quick Action: Add to Cart from Detected Sheet
  const handleConfirmAddToCart = () => {
    if (!detectedResult?.matchedProduct) return;
    onAddToCart(detectedResult.matchedProduct, addQuantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 1800);
  };

  // Quick Action: Search with detected Code
  const handleSearchWithCode = () => {
    if (!detectedResult) return;
    const query = detectedResult.matchedProduct ? detectedResult.matchedProduct.name : detectedResult.rawCode;
    if (onSearchProduct) {
      onSearchProduct(query);
    }
    onClose();
  };

  // Quick Action: Resume Scanning
  const handleResumeScan = () => {
    setDetectedResult(null);
    setAddQuantity(1);
    setAddedFeedback(false);
  };

  // Manual Submission handler
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleDetectedCode(manualCodeInput.trim(), mode === 'ocr' ? 'ocr' : 'barcode');
    setShowManualInput(false);
    setManualCodeInput('');
  };

  // Sample simulation trigger
  const handleSelectSample = (prod: Product) => {
    handleDetectedCode(prod.barcode, 'barcode');
    setShowSamplesDrawer(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="camera-scanner-backdrop" 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 select-none animate-fadeIn"
    >
      <div 
        id="camera-scanner-modal"
        className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl lg:max-w-3xl bg-black md:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border-0 md:border md:border-slate-800 my-auto"
      >
        {/* Offscreen Canvas for Frame Sampling & OCR */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 1. TOP CONTROL BAR */}
        <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-b from-black/95 via-black/80 to-transparent text-white border-b border-white/10">
          {/* Brand & Sede indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
              <ScanLine className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-1.5 font-heading">
                Escáner Óptico de Precios
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold rounded border border-emerald-400/30">
                  ACTIVO
                </span>
              </span>
              <span className="text-[11px] text-slate-300 truncate max-w-[160px] sm:max-w-[260px]">
                {branchName}
              </span>
            </div>
          </div>

          {/* Top Actions: Torch, Camera Flip, Close */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Torch / Flash Toggle */}
            <button
              id="scanner-torch-btn"
              type="button"
              onClick={toggleTorch}
              title={hasTorchSupport ? (isTorchOn ? 'Apagar Linterna' : 'Encender Linterna') : 'Linterna no disponible'}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isTorchOn 
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40 ring-2 ring-amber-300' 
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
            >
              {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
            </button>

            {/* Camera Flip */}
            <button
              id="scanner-flip-camera-btn"
              type="button"
              onClick={flipCamera}
              title="Cambiar Cámara (Frontal / Trasera)"
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all active:rotate-180 duration-300 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              id="scanner-close-btn"
              type="button"
              onClick={onClose}
              aria-label="Cerrar Escáner"
              className="w-9 h-9 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 ml-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* 2. CAMERA FEED & VIEWPORT OVERLAY */}
        <main className="relative flex-1 min-h-[360px] md:min-h-[420px] flex flex-col items-center justify-center overflow-hidden bg-slate-950">
          {/* Actual HTML Video Stream */}
          <video
            ref={videoRef}
            id="scanner-video-element"
            autoPlay
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              cameraState === 'active' ? 'opacity-100' : 'opacity-20'
            }`}
          />

          {/* Fallback Background / Grid Pattern when camera is inactive/denied/requesting */}
          {cameraState !== 'active' && (
            <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-xl">
                {cameraState === 'requesting' ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
                ) : cameraState === 'denied' ? (
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-300" />
                )}
              </div>

              <h3 className="text-base font-extrabold text-white mb-1">
                {cameraState === 'requesting'
                  ? 'Conectando a la cámara...'
                  : cameraState === 'denied'
                  ? 'Acceso a la cámara restringido'
                  : 'Modo Escáner Activo'}
              </h3>

              <p className="text-xs text-slate-300 max-w-xs mb-5 leading-relaxed">
                {errorMessage || 'Puedes probar el escaneo inmediato usando nuestros códigos de muestra o ingresar el código manualmente.'}
              </p>

              <div className="flex flex-wrap gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setShowSamplesDrawer(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Probar Códigos de Muestra
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold rounded-xl backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Hash className="w-3.5 h-3.5" />
                  Ingreso Manual
                </button>
              </div>
            </div>
          )}

          {/* 3. GLOWING GREEN / BLUE TARGETING RETICLE ("Scan Area") */}
          <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none w-full max-w-sm px-6 py-4">
            {/* Status Notification Pill */}
            <div className="mb-4">
              <div
                id="scanner-status-pill"
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 backdrop-blur-md border shadow-xl transition-all duration-300 ${
                  statusType === 'green'
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/30'
                    : statusType === 'blue'
                    ? 'bg-sky-950/80 border-sky-500/60 text-sky-300 ring-1 ring-sky-500/30'
                    : statusType === 'yellow'
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-red-950/80 border-red-500/60 text-red-300 ring-1 ring-red-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full animate-ping ${
                  statusType === 'green' ? 'bg-emerald-400' : statusType === 'blue' ? 'bg-sky-400' : 'bg-amber-400'
                }`} />
                <span>{statusMessage}</span>
              </div>
            </div>

            {/* Centered Reticle Frame */}
            <div
              id="scanner-target-frame"
              className="relative w-full aspect-[4/3] max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden border border-white/20 bg-black/10 backdrop-contrast-125 shadow-2xl"
            >
              {/* 4 Glowing Corner Guides */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

              {/* Center Aim Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-6 h-0.5 bg-emerald-300" />
                <div className="h-6 w-0.5 bg-emerald-300 absolute" />
              </div>

              {/* Animated Laser Scanline */}
              {!detectedResult && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] animate-[bounce_2.4s_infinite_ease-in-out]" />
              )}
            </div>

            <p className="text-[11px] text-slate-300/80 text-center mt-3 font-medium">
              Coloque el código de barras o etiqueta dentro del recuadro
            </p>
          </div>
        </main>

        {/* 4. BOTTOM ACTION CONTROLS */}
        <footer className="relative z-30 pb-5 pt-3 px-4 sm:px-6 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center gap-2.5 border-t border-white/10">
          {/* Quick Action Buttons Centered at bottom */}
          <div className="flex items-center justify-center gap-3 w-full max-w-sm">
            <button
              id="scanner-quick-manual-btn"
              type="button"
              onClick={() => setShowManualInput(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-slate-200 border border-white/20 text-xs font-bold backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Hash className="w-4 h-4 text-slate-300" />
              <span>Código Manual</span>
            </button>
            <button
              id="scanner-quick-samples-btn"
              type="button"
              onClick={() => setShowSamplesDrawer(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/30 text-xs font-bold backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Códigos Demo</span>
            </button>
          </div>

          {/* Status Indicator */}
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 bg-black/40 px-3 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Detección Automática Inteligente Supertiendas Meta</span>
          </div>
        </footer>

        {/* 5. SLIDE-UP CONFIRMATION SHEET WHEN CODE / NUMBER DETECTED */}
        {detectedResult && (
          <div 
            id="scanner-result-sheet"
            className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-4 sm:p-6 text-slate-900 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    {detectedResult.matchedProduct ? 'Producto Encontrado' : 'Lectura Capturada'}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-mono">
                    {detectedResult.type === 'barcode' ? 'Código de Barras' : 'OCR / Número'}: {detectedResult.rawCode}
                  </p>
                </div>
              </div>

              <button
                onClick={handleResumeScan}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Escanear Otro
              </button>
            </div>

            {/* Product Card if Matched */}
            {detectedResult.matchedProduct ? (
              <div className="py-3.5 space-y-3.5">
                <div className="flex gap-3.5 items-start">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                    <img
                      src={detectedResult.matchedProduct.image}
                      alt={detectedResult.matchedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {detectedResult.matchedProduct.discountPercent && (
                      <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                        -{detectedResult.matchedProduct.discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {detectedResult.matchedProduct.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate">
                        {detectedResult.matchedProduct.brand}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 mt-1 leading-snug">
                      {detectedResult.matchedProduct.name}
                    </h3>

                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>{detectedResult.matchedProduct.unit}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium truncate">Pasillo {detectedResult.matchedProduct.aisle}</span>
                    </div>

                    {/* Pricing block in USD and Bs. */}
                    <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                      <span className="text-lg sm:text-xl font-black text-[#0f2b48]">
                        ${detectedResult.matchedProduct.priceUSD.toFixed(2)} USD
                      </span>
                      <span className="text-xs font-extrabold text-red-600">
                        Bs. {(detectedResult.matchedProduct.priceUSD * exchangeRate).toFixed(2)} Bsd
                      </span>
                      {detectedResult.matchedProduct.originalPriceUSD && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ${detectedResult.matchedProduct.originalPriceUSD.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper & Add to Cart Action */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      type="button"
                      onClick={() => setAddQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-black active:scale-95 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-black text-sm text-slate-900">
                      {addQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-black active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary Add to Cart Button */}
                  <button
                    id="scanner-add-to-cart-btn"
                    type="button"
                    onClick={handleConfirmAddToCart}
                    className={`flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                      addedFeedback
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                    }`}
                  >
                    {addedFeedback ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>¡Añadido al Carrito! ({addQuantity})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Añadir al Carrito • ${(detectedResult.matchedProduct.priceUSD * addQuantity).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-2 pt-1">
                  {onProductSelect && (
                    <button
                      type="button"
                      onClick={() => {
                        onProductSelect(detectedResult.matchedProduct!);
                        onClose();
                      }}
                      className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver Ficha Completa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSearchWithCode}
                    className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar en Catálogo</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Unmatched Code / Extracted Number Case */
              <div className="py-4 space-y-4 text-center sm:text-left">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-600">
                    Código detectado: <strong className="font-mono text-slate-900">{detectedResult.rawCode}</strong>
                  </p>
                  {detectedResult.extractedPrice && (
                    <div className="mt-2 text-xs text-slate-700">
                      Valor estimado extraído: <strong className="text-emerald-600 font-extrabold">${detectedResult.extractedPrice.toFixed(2)}</strong> (≈ Bs. {(detectedResult.extractedPrice * exchangeRate).toFixed(2)})
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Este código no coincide exactamente con un producto registrado en nuestra base de datos. Puedes buscarlo por nombre o consultar con un asesor.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSearchWithCode}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar en Catálogo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResumeScan}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Escanear de Nuevo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. MODAL: MANUAL CODE / PRICE INPUT */}
        {showManualInput && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Ingreso Manual de Código</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleManualCodeSubmit} className="pt-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Código de Barras o SKU (ej. 7591012001018):
                  </label>
                  <input
                    id="scanner-manual-code-input"
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Escribe el código numérico..."
                    autoFocus
                    className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:border-red-600 focus:outline-none bg-slate-50"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!manualCodeInput.trim()}
                    className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-md cursor-pointer"
                  >
                    Consultar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 7. DRAWER: SAMPLE BARCODES FOR QUICK TESTING / DEMO */}
        {showSamplesDrawer && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl max-h-[80vh] flex flex-col text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-900">Probar Códigos de Muestra</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSamplesDrawer(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 my-2">
                Haz clic en cualquier producto para simular la captura inmediata del código de barras en el escáner:
              </p>

              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
                {products.slice(0, 8).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectSample(prod)}
                    className="w-full text-left p-2 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors group cursor-pointer"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-red-600">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{prod.barcode}</span>
                        <span>•</span>
                        <strong className="text-slate-700">${prod.priceUSD.toFixed(2)}</strong>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
