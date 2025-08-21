'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, PhotoIcon, XMarkIcon, ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CameraIcon as CameraIconSolid } from '@heroicons/react/24/solid';

interface CameraIntegrationProps {
  onPhotoCapture?: (photoData: PhotoData) => void;
  onPhotoError?: (error: string) => void;
  enableCamera?: boolean;
  enableGallery?: boolean;
  maxPhotos?: number;
  photoQuality?: number;
  className?: string;
}

interface PhotoData {
  id: string;
  dataUrl: string;
  blob?: Blob;
  timestamp: number;
  metadata: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
}

export default function CameraIntegration({
  onPhotoCapture,
  onPhotoError,
  enableCamera = true,
  enableGallery = true,
  maxPhotos = 5,
  photoQuality = 0.8,
  className = ""
}: CameraIntegrationProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoData[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<PhotoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Enhanced haptic feedback for camera events
  const triggerHaptic = useCallback((type: 'capture' | 'error' | 'success' = 'capture') => {
    if (!('vibrate' in navigator)) return;
    
    switch (type) {
      case 'capture':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'error':
        navigator.vibrate([100, 200, 100]);
        break;
      case 'success':
        navigator.vibrate([20, 50, 20]);
        break;
    }
  }, []);

  // Check camera permission status
  const checkCameraPermission = useCallback(async () => {
    if (!('permissions' in navigator)) {
      setCameraPermission('granted');
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permission.state);
      
      permission.onchange = () => {
        setCameraPermission(permission.state);
      };
    } catch (error) {
      console.warn('Permission API not supported:', error);
      setCameraPermission('granted');
    }
  }, []);

  // Get available camera devices
  const getCameraDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setCameraDevices(cameras);
      
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
    } catch (error) {
      console.warn('Failed to get camera devices:', error);
    }
  }, [selectedCamera]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!enableCamera || cameraPermission !== 'granted') {
      setCameraError('Camera permission not granted');
      return;
    }

    try {
      setIsLoading(true);
      setCameraError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment' // Prefer back camera on mobile
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraActive(true);
      triggerHaptic('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start camera';
      setCameraError(errorMessage);
      onPhotoError?.(errorMessage);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  }, [enableCamera, cameraPermission, selectedCamera, onPhotoError, triggerHaptic]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      setCameraError('Camera not ready');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob with specified quality
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', photoQuality);
      });

      // Create data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', photoQuality);

      // Create photo data
      const photoData: PhotoData = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dataUrl,
        blob,
        timestamp: Date.now(),
        metadata: {
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          type: blob.type
        }
      };

      // Add to captured photos
      setCapturedPhotos(prev => {
        const newPhotos = [...prev, photoData];
        if (newPhotos.length > maxPhotos) {
          newPhotos.shift(); // Remove oldest photo
        }
        return newPhotos;
      });

      setCurrentPhoto(photoData);
      onPhotoCapture?.(photoData);
      triggerHaptic('capture');

      // Auto-close camera after capture
      setTimeout(() => {
        setIsCameraOpen(false);
        stopCamera();
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture photo';
      setCameraError(errorMessage);
      onPhotoError?.(errorMessage);
      triggerHaptic('error');
    }
  }, [isCameraActive, photoQuality, maxPhotos, onPhotoCapture, onPhotoError, triggerHaptic, stopCamera]);

  // Open gallery picker
  const openGallery = useCallback(async () => {
    if (!enableGallery) return;

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.capture = 'environment';

      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (!files) return;

        for (let i = 0; i < Math.min(files.length, maxPhotos - capturedPhotos.length); i++) {
          const file = files[i];
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });

          const photoData: PhotoData = {
            id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataUrl,
            blob: file,
            timestamp: Date.now(),
            metadata: {
              width: 0, // Will be set when image loads
              height: 0,
              size: file.size,
              type: file.type
            }
          };

          // Get image dimensions
          const img = new Image();
          img.onload = () => {
            photoData.metadata.width = img.width;
            photoData.metadata.height = img.height;
          };
          img.src = dataUrl;

          setCapturedPhotos(prev => [...prev, photoData]);
          onPhotoCapture?.(photoData);
        }
      };

      input.click();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open gallery';
      setCameraError(errorMessage);
      onPhotoError?.(errorMessage);
      triggerHaptic('error');
    }
  }, [enableGallery, maxPhotos, capturedPhotos.length, onPhotoCapture, onPhotoError, triggerHaptic]);

  // Delete photo
  const deletePhoto = useCallback((photoId: string) => {
    setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
    
    if (currentPhoto?.id === photoId) {
      setCurrentPhoto(null);
    }
    
    triggerHaptic('success');
  }, [currentPhoto, triggerHaptic]);

  // Initialize component
  useEffect(() => {
    checkCameraPermission();
    getCameraDevices();
    
    return () => {
      stopCamera();
    };
  }, [checkCameraPermission, getCameraDevices, stopCamera]);

  // Handle camera open/close
  useEffect(() => {
    if (isCameraOpen && enableCamera) {
      startCamera();
    } else if (!isCameraOpen) {
      stopCamera();
    }
  }, [isCameraOpen, enableCamera, startCamera, stopCamera]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`bg-[rgb(var(--panel))] rounded-lg border border-[rgb(var(--border-color))]/20 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--text))] flex items-center gap-2">
          <CameraIcon className="w-5 h-5 text-[rgb(var(--brand))]" />
          Camera Integration
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Permission Status */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${cameraPermission === 'granted' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : cameraPermission === 'denied'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }
          `}>
            {cameraPermission === 'granted' ? 'Granted' : 
             cameraPermission === 'denied' ? 'Denied' : 'Prompt'}
          </div>
          
          {/* Photo Count */}
          <div className="px-2 py-1 bg-[rgb(var(--bg))] rounded-full text-xs text-[rgb(var(--muted))]">
            {capturedPhotos.length}/{maxPhotos}
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="flex items-center gap-2 mb-4">
        {enableCamera && (
          <button
            onClick={() => setIsCameraOpen(!isCameraOpen)}
            disabled={cameraPermission !== 'granted' || isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${isCameraOpen
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[rgb(var(--brand))] text-white hover:bg-[rgb(var(--brand))]/90'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isCameraOpen ? (
              <>
                <XMarkIcon className="w-4 h-4" />
                Close Camera
              </>
            ) : (
              <>
                <CameraIcon className="w-4 h-4" />
                Open Camera
              </>
            )}
          </button>
        )}

        {enableGallery && (
          <button
            onClick={openGallery}
            disabled={capturedPhotos.length >= maxPhotos}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg font-medium hover:bg-[rgb(var(--bg))]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PhotoIcon className="w-4 h-4" />
            Gallery
          </button>
        )}

        {/* Camera Device Selector */}
        {cameraDevices.length > 1 && (
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="px-3 py-2 bg-[rgb(var(--bg))] text-[rgb(var(--text))] rounded-lg border border-[rgb(var(--border-color))]/20 text-sm"
          >
            {cameraDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Camera View */}
      {isCameraOpen && (
        <div className="relative mb-4">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover rounded-lg bg-black"
            autoPlay
            playsInline
            muted
          />
          
          {/* Camera Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white/50 rounded-lg w-48 h-48 flex items-center justify-center">
              <div className="text-white/70 text-sm">Frame your photo</div>
            </div>
          </div>
          
                     {/* Capture Button */}
           {isCameraActive && (
             <button
               onClick={capturePhoto}
               className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
             >
               <div className="w-12 h-12 bg-[rgb(var(--brand))] rounded-full flex items-center justify-center">
                 <CameraIconSolid className="w-6 h-6 text-white" />
               </div>
             </button>
           )}
        </div>
      )}

      {/* Captured Photos Grid */}
      {capturedPhotos.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[rgb(var(--text))]">Captured Photos</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {capturedPhotos.map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${photo.id}`}
                  className="w-full h-32 object-cover rounded-lg"
                  onClick={() => setCurrentPhoto(photo)}
                />
                
                {/* Delete Button */}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                
                {/* Photo Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <span>{formatTimestamp(photo.timestamp)}</span>
                    <span>{formatFileSize(photo.metadata.size)}</span>
                  </div>
                  <div className="text-center">
                    {photo.metadata.width} × {photo.metadata.height}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {currentPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--panel))] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[rgb(var(--border-color))]/20 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Photo Preview</h3>
              <button
                onClick={() => setCurrentPhoto(null)}
                className="p-2 hover:bg-[rgb(var(--bg))] rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-[rgb(var(--muted))]" />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={currentPhoto.dataUrl}
                alt="Photo preview"
                className="w-full h-auto rounded-lg mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[rgb(var(--muted))]">Dimensions:</span>
                  <span className="ml-2 text-[rgb(var(--text))]">
                    {currentPhoto.metadata.width} × {currentPhoto.metadata.height}
                  </span>
                </div>
                <div>
                  <span className="text-[rgb(var(--muted))]">File Size:</span>
                  <span className="ml-2 text-[rgb(var(--text))]">
                    {formatFileSize(currentPhoto.metadata.size)}
                  </span>
                </div>
                <div>
                  <span className="text-[rgb(var(--muted))]">Type:</span>
                  <span className="ml-2 text-[rgb(var(--text))]">
                    {currentPhoto.metadata.type}
                  </span>
                </div>
                <div>
                  <span className="text-[rgb(var(--muted))]">Captured:</span>
                  <span className="ml-2 text-[rgb(var(--text))]">
                    {formatTimestamp(currentPhoto.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Request */}
      {cameraPermission === 'prompt' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Camera permission needed</span>
          </div>
          <p className="text-blue-700 text-xs mt-1">
            Allow camera access to take photos for events.
          </p>
        </div>
      )}

      {/* Error Display */}
      {cameraError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Camera Error</span>
          </div>
          <p className="text-red-700 text-xs mt-1">{cameraError}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block w-4 h-4 border-2 border-[rgb(var(--brand))] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-[rgb(var(--muted))]">Starting camera...</span>
        </div>
      )}
    </div>
  );
}
