"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Loader2, Download, Sparkles, Wand2, X } from "lucide-react";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [modelType, setModelType] = useState<string>("base");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Slider state
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null);
            setError(null);
            setSliderPos(50);
            return;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
      setSliderPos(50);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e);
  };

  const handleColorize = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("model_type", modelType);

    try {
      const response = await fetch("https://maahadkhaan-chroma-ai-backend.hf.space/colorize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to colorize image.");
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current || !resultUrl) return;

    // For touch devices, it's e.touches[0].clientX. For mouse, it's e.clientX.
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  };

  return (
    <div className="relative w-full min-h-screen py-12 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Chroma Studio
          </h1>
          <p className="text-lg text-muted-foreground">Upload, configure, and restore your images with AI.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel (Glassmorphism Sidebar) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 xl:col-span-3 space-y-6"
          >
            <div className="p-6 rounded-3xl border border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-6">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Configuration</h2>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-4 text-foreground/80">AI Model Selection</label>
                  <div className="space-y-3">
                    {[
                      { id: "base", name: "Chroma Base", desc: "General purpose colorization" },
                      { id: "landscape", name: "Landscape", desc: "Optimized for nature & cities" },
                      { id: "portrait", name: "Portrait", desc: "Fine-tuned for skin tones" }
                    ].map((model) => (
                      <label
                        key={model.id}
                        className={`relative flex flex-col p-4 border rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${modelType === model.id
                          ? 'border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]'
                          : 'border-white/10 hover:border-white/20 bg-black/10'
                          }`}
                      >
                        {modelType === model.id && (
                          <motion.div
                            layoutId="modelSelection"
                            className="absolute inset-0 bg-primary/10 -z-10"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <input
                          type="radio"
                          name="modelType"
                          value={model.id}
                          checked={modelType === model.id}
                          onChange={(e) => setModelType(e.target.value)}
                          className="sr-only"
                        />
                        <span className={`font-bold ${modelType === model.id ? 'text-primary' : 'text-foreground'}`}>
                          {model.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">{model.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: selectedFile && !isProcessing ? 1.02 : 1 }}
                  whileTap={{ scale: selectedFile && !isProcessing ? 0.98 : 1 }}
                  onClick={handleColorize}
                  disabled={!selectedFile || isProcessing}
                  className="w-full flex items-center justify-center px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all relative overflow-hidden"
                >
                  {isProcessing ? (
                    <>
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Colorize Magic
                    </>
                  )}
                </motion.button>
                {error && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm mt-4 text-center font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                    {error}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Preview Panel (Main Area) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 xl:col-span-9"
          >
            <div
              className={`relative w-full rounded-3xl overflow-hidden border transition-all duration-300 min-h-[500px] md:min-h-[600px] flex items-center justify-center bg-black/40 backdrop-blur-md shadow-2xl ${isDragging ? 'border-primary border-dashed scale-[1.01] bg-primary/5' : 'border-white/10'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!previewUrl ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center p-8 max-w-sm">
                    <motion.div
                      animate={{ y: isDragging ? -10 : 0 }}
                      className="mx-auto w-24 h-24 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner"
                    >
                      <UploadCloud className={`h-10 w-10 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Upload Image</h3>
                    <p className="text-muted-foreground mb-6">Drag and drop your B&W photo here, or click to browse files.</p>
                    <div className="pointer-events-auto">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center justify-center px-6 py-3 font-medium text-foreground bg-white/10 hover:bg-white/20 border border-white/20 rounded-full cursor-pointer transition-colors backdrop-blur-md"
                      >
                        Browse Files
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  ref={sliderRef}
                  className="relative w-full h-full min-h-[500px] md:min-h-[600px] select-none cursor-crosshair overflow-hidden group"
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleMouseMove}
                >
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                      >
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                          <p className="font-semibold text-lg animate-pulse text-primary">Adding color...</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Base Image (Colorized OR Original if not colorized yet) */}
                  <img
                    src={resultUrl || previewUrl}
                    alt="Result"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />

                  {/* Before/After Slider active only if result exists */}
                  {resultUrl && (
                    <>
                      {/* Overlay Image (Original B&W) */}
                      <div
                        className="absolute top-0 left-0 h-full overflow-hidden"
                        style={{ width: `${sliderPos}%` }}
                      >
                        <img
                          src={previewUrl}
                          alt="Original"
                          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                          style={{ width: sliderRef.current?.getBoundingClientRect().width || '100vw', maxWidth: 'none' }}
                        />
                      </div>

                      {/* Slider Line & Thumb */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white/80 pointer-events-none z-10 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                        style={{ left: `calc(${sliderPos}% - 2px)` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-white/20 backdrop-blur-md">
                          <div className="flex gap-1">
                            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
                            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Before</div>
                      <div className="absolute bottom-6 right-6 px-4 py-2 bg-primary/80 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(var(--primary),0.5)]">After</div>
                    </>
                  )}

                  {/* Actions Toolbar */}
                  <div className="absolute top-6 right-6 z-40 flex gap-3">
                    {resultUrl && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={resultUrl}
                        download="chroma_colorized.jpg"
                        className="flex items-center justify-center p-3 bg-white text-black hover:bg-gray-200 rounded-full shadow-xl transition-colors"
                        title="Download Colorized Image"
                      >
                        <Download className="h-5 w-5" />
                      </motion.a>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setResultUrl(null);
                      }}
                      className="flex items-center justify-center p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/10 shadow-xl transition-colors"
                      title="Close Image"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
