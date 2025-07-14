
import React from 'react';
import { Product } from '../types';
import { findProductsFromImage } from '../services/geminiService';
import ProductCard from './ProductCard';
import { CameraIcon, UploadIcon, XIcon, LightbulbIcon, MicrophoneIcon } from './icons/Icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const VisualSearch: React.FC = () => {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState<string>("Find products similar to what's in the image.");
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { isListening, startListening, hasRecognitionSupport } = useVoiceRecognition({
    onResult: (transcript) => {
        setPrompt(transcript);
    }
  });

  const stopCamera = React.useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOpen(false);
    }
  }, []);

  const handleImageSearch = React.useCallback(async () => {
    if (!imageSrc || !imageMimeType) {
      setError("No image provided to search.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProducts([]);
    stopCamera();

    try {
      const base64Image = imageSrc.split(',')[1];
      const results = await findProductsFromImage(base64Image, imageMimeType, prompt);
      setProducts(results);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during visual search.");
    } finally {
      setIsLoading(false);
    }
  }, [imageSrc, imageMimeType, prompt, stopCamera]);


  const startCamera = async () => {
    resetState();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Camera permission denied:", err);
      setError("Camera permission is required. Please enable it in your browser settings.");
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        setImageMimeType('image/jpeg');
        stopCamera();
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resetState = () => {
    setImageSrc(null);
    setImageMimeType(null);
    setProducts([]);
    setError(null);
    setIsLoading(false);
    stopCamera();
  };
  
  const renderResults = () => {
     if (isLoading) {
      return (
        <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Analyzing your image and finding products...</p>
        </div>
      );
    }

    if (error) {
      return <div className="text-center p-8 text-error bg-red-50 rounded-lg">{error}</div>;
    }
    
    if (products.length > 0) {
      return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
                Products based on your image
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
                <ProductCard key={index} product={product} />
            ))}
            </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
      {!imageSrc && !isCameraOpen && (
        <div className="w-full bg-base-100 p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-bold text-text-primary">Search with your Camera or an Image</h2>
          <p className="text-text-secondary mt-2 mb-6">Found something you love? Show it to us, and we'll find similar items.</p>
          <div className="flex justify-center gap-4">
            <button onClick={startCamera} className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors">
              <CameraIcon className="w-6 h-6" />
              <span>Use Camera</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-neutral text-text-primary font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors">
              <UploadIcon className="w-6 h-6" />
              <span>Upload Image</span>
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="w-full flex flex-col items-center gap-4">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-lg shadow-lg" />
          <div className="flex gap-4">
            <button onClick={takePicture} className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-opacity">Take Picture</button>
            <button onClick={stopCamera} className="bg-error text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors">Cancel</button>
          </div>
        </div>
      )}
      
      {imageSrc && !isLoading && products.length === 0 && (
         <div className="w-full bg-base-100 p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
                <img src={imageSrc} alt="Preview" className="w-48 h-48 object-cover rounded-lg shadow-md" />
                <button onClick={resetState} className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors">
                    <XIcon className="w-4 h-4"/>
                </button>
            </div>
            <div className="flex-grow w-full">
                <div className="flex items-start gap-2 text-blue-800 bg-blue-50 p-3 rounded-md">
                    <LightbulbIcon className="w-5 h-5 mt-1 flex-shrink-0"/>
                    <p className="text-sm">
                        You can refine your search. Tell our AI what you're interested in!
                    </p>
                </div>
                <div className="relative w-full mt-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Refine search or use the mic..."
                        className="w-full p-3 bg-neutral border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow text-text-primary placeholder-text-secondary/70 pr-12"
                    />
                    {hasRecognitionSupport && (
                        <button
                            type="button"
                            onClick={startListening}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'bg-error text-white animate-pulse' : 'text-text-secondary hover:bg-neutral'}`}
                            aria-label="Use voice search for refinement"
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <button onClick={handleImageSearch} className="w-full mt-3 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors">
                    Find Similar Products
                </button>
            </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full">
        {renderResults()}
      </div>
    </div>
  );
};

export default VisualSearch;