import React, { useState } from 'react';
import { Product } from '../../types';
import { ScannerModalProps } from './types';
import { useCameraStream } from './useCameraStream';
import { useScannerEngine } from './useScannerEngine';
import { ScannerHeader } from './ScannerHeader';
import { ScannerViewport } from './ScannerViewport';
import { ScannerFooter } from './ScannerFooter';
import { ScannerResultSheet } from './ScannerResultSheet';
import { ScannerManualInputModal } from './ScannerManualInputModal';
import { ScannerSamplesDrawer } from './ScannerSamplesDrawer';

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
  // Modal auxiliary overlays
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [showSamplesDrawer, setShowSamplesDrawer] = useState<boolean>(false);

  // 1. Camera hardware & stream management hook (camera only, zero audio)
  const {
    videoRef,
    cameraState,
    errorMessage,
    isTorchOn,
    hasTorchSupport,
    toggleTorch,
    flipCamera,
  } = useCameraStream(isOpen);

  // 2. Optical scanning & OCR processing hook (strictly no audio/sound)
  const {
    canvasRef,
    statusMessage,
    statusType,
    detectedResult,
    handleDetectedCode,
    resetScanResult,
  } = useScannerEngine({
    isOpen,
    cameraState,
    videoRef,
    products,
  });

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

        {/* 1. Header Bar */}
        <ScannerHeader
          branchName={branchName}
          isTorchOn={isTorchOn}
          hasTorchSupport={hasTorchSupport}
          onToggleTorch={toggleTorch}
          onFlipCamera={flipCamera}
          onClose={onClose}
        />

        {/* 2. Viewport & Video Feed */}
        <ScannerViewport
          videoRef={videoRef}
          cameraState={cameraState}
          errorMessage={errorMessage}
          statusMessage={statusMessage}
          statusType={statusType}
          detectedResult={detectedResult}
          onOpenSamples={() => setShowSamplesDrawer(true)}
          onOpenManualInput={() => setShowManualInput(true)}
        />

        {/* 3. Bottom Action Controls */}
        <ScannerFooter
          onOpenManualInput={() => setShowManualInput(true)}
          onOpenSamples={() => setShowSamplesDrawer(true)}
        />

        {/* 4. Result Drawer (when barcode / number detected) */}
        {detectedResult && (
          <ScannerResultSheet
            detectedResult={detectedResult}
            exchangeRate={exchangeRate}
            onAddToCart={onAddToCart}
            onProductSelect={onProductSelect}
            onSearchProduct={onSearchProduct}
            onResumeScan={resetScanResult}
            onClose={onClose}
          />
        )}

        {/* 5. Manual Input Modal Dialog */}
        <ScannerManualInputModal
          isOpen={showManualInput}
          onClose={() => setShowManualInput(false)}
          onSubmit={(code) => handleDetectedCode(code, 'barcode')}
        />

        {/* 6. Sample Barcodes Testing Drawer */}
        <ScannerSamplesDrawer
          isOpen={showSamplesDrawer}
          onClose={() => setShowSamplesDrawer(false)}
          products={products}
          onSelectSample={(prod: Product) => handleDetectedCode(prod.barcode, 'barcode')}
        />
      </div>
    </div>
  );
};
