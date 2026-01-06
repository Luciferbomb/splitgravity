'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Loader2, RotateCcw, Check, AlertCircle } from 'lucide-react'

interface ExtractedItem {
    name: string
    quantity: number
    price: number
}

interface ExtractedBill {
    restaurantName?: string
    items: ExtractedItem[]
    subtotal: number
    tax: number
    serviceCharge: number
    discount: number
    total: number
}

interface ReceiptScannerProps {
    onScanComplete: (data: ExtractedBill) => void
    onCancel: () => void
}

export function ReceiptScanner({ onScanComplete, onCancel }: ReceiptScannerProps) {
    const [mode, setMode] = useState<'select' | 'camera' | 'processing' | 'review'>('select')
    const [image, setImage] = useState<string | null>(null)
    const [extractedData, setExtractedData] = useState<ExtractedBill | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const startCamera = async () => {
        try {
            setMode('camera')
            setError(null)

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            })

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }
        } catch (err) {
            console.error('Camera error:', err)
            setError('Could not access camera. Please try uploading an image instead.')
            setMode('select')
        }
    }

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }, [])

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL('image/jpeg', 0.9)
            setImage(imageData)
            stopCamera()
            processImage(imageData)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)

        const reader = new FileReader()
        reader.onload = (event) => {
            const imageData = event.target?.result as string
            setImage(imageData)
            processImage(imageData)
        }
        reader.readAsDataURL(file)
    }

    const processImage = async (imageData: string) => {
        setMode('processing')
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch('/api/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to process receipt')
            }

            const data = await response.json()
            setExtractedData(data)
            setMode('review')
        } catch (err) {
            console.error('Processing error:', err)
            setError(err instanceof Error ? err.message : 'Failed to process receipt')
            setMode('select')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleRetry = () => {
        setImage(null)
        setExtractedData(null)
        setError(null)
        setMode('select')
    }

    const handleConfirm = () => {
        if (extractedData) {
            onScanComplete(extractedData)
        }
    }

    const handleCancel = () => {
        stopCamera()
        onCancel()
    }

    // Cleanup on unmount
    const handleModeChange = (newMode: 'select' | 'camera' | 'processing' | 'review') => {
        if (mode === 'camera' && newMode !== 'camera') {
            stopCamera()
        }
        setMode(newMode)
    }

    return (
        <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold">
                    {mode === 'select' && 'Scan Receipt'}
                    {mode === 'camera' && 'Take Photo'}
                    {mode === 'processing' && 'Processing...'}
                    {mode === 'review' && 'Review Items'}
                </h2>
                <button onClick={handleCancel} className="p-2 hover:bg-[var(--surface)] rounded-full">
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {/* Mode: Select */}
                {mode === 'select' && (
                    <div className="p-6 space-y-6 max-w-md mx-auto">
                        {error && (
                            <div className="glass-card p-4 border-l-4 border-[var(--danger)] flex items-start gap-3">
                                <AlertCircle size={20} className="text-[var(--danger)] shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold">Scan your bill</h3>
                            <p className="text-[var(--text-secondary)]">
                                Take a photo or upload an image of your receipt
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={startCamera}
                                className="btn btn-primary w-full h-16 text-lg"
                            >
                                <Camera size={24} />
                                Take Photo
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-secondary w-full h-16 text-lg"
                            >
                                <Upload size={24} />
                                Upload Image
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        <p className="text-sm text-center text-[var(--text-muted)]">
                            Works best with clear, well-lit photos of Indian restaurant bills
                        </p>
                    </div>
                )}

                {/* Mode: Camera */}
                {mode === 'camera' && (
                    <div className="relative h-full">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Camera overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-8 border-2 border-white/50 rounded-lg" />
                        </div>

                        {/* Capture button */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                            <button
                                onClick={() => handleModeChange('select')}
                                className="p-4 bg-white/20 backdrop-blur rounded-full"
                            >
                                <X size={24} className="text-white" />
                            </button>
                            <button
                                onClick={capturePhoto}
                                className="w-20 h-20 bg-white rounded-full flex-center shadow-lg"
                            >
                                <div className="w-16 h-16 bg-white border-4 border-[var(--primary)] rounded-full" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Mode: Processing */}
                {mode === 'processing' && (
                    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6">
                        {image && (
                            <img
                                src={image}
                                alt="Receipt"
                                className="max-h-48 rounded-lg shadow-lg opacity-50"
                            />
                        )}
                        <div className="text-center space-y-3">
                            <Loader2 size={48} className="mx-auto text-[var(--primary)] animate-spin" />
                            <h3 className="text-xl font-semibold">Reading your receipt...</h3>
                            <p className="text-[var(--text-secondary)]">
                                Our AI is extracting items from your bill
                            </p>
                        </div>
                    </div>
                )}

                {/* Mode: Review */}
                {mode === 'review' && extractedData && (
                    <div className="p-4 space-y-4 pb-24">
                        {extractedData.restaurantName && (
                            <div className="text-center">
                                <p className="text-sm text-[var(--text-muted)]">Restaurant</p>
                                <h3 className="text-xl font-semibold">{extractedData.restaurantName}</h3>
                            </div>
                        )}

                        <div className="glass-card p-4">
                            <h4 className="font-semibold mb-3 text-[var(--text-secondary)]">
                                Found {extractedData.items.length} items
                            </h4>
                            <div className="space-y-2">
                                {extractedData.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                                        <div>
                                            <span className="font-medium">{item.name}</span>
                                            {item.quantity > 1 && (
                                                <span className="text-sm text-[var(--text-muted)] ml-2">×{item.quantity}</span>
                                            )}
                                        </div>
                                        <span className="money">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Subtotal</span>
                                <span className="money">₹{extractedData.subtotal.toFixed(2)}</span>
                            </div>
                            {extractedData.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--accent)]">Discount</span>
                                    <span className="money text-[var(--accent)]">-₹{extractedData.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Tax (GST/VAT)</span>
                                <span className="money">₹{extractedData.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Service Charge</span>
                                <span className="money">₹{extractedData.serviceCharge.toFixed(2)}</span>
                            </div>
                            <div className="divider" />
                            <div className="flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="money-large">₹{extractedData.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-sm text-center text-[var(--text-muted)]">
                            You can edit items after confirming
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {mode === 'review' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--background)] border-t border-[var(--border)]">
                    <div className="flex gap-3 max-w-md mx-auto">
                        <button onClick={handleRetry} className="btn btn-secondary flex-1">
                            <RotateCcw size={18} />
                            Retry
                        </button>
                        <button onClick={handleConfirm} className="btn btn-primary flex-1">
                            <Check size={18} />
                            Use These Items
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
