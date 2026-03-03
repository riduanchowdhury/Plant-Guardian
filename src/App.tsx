/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Leaf, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  RefreshCw, 
  ChevronRight,
  Image as ImageIcon,
  X,
  Loader2,
  Shield,
  Zap,
  Heart,
  HelpCircle,
  Mail,
  FileText,
  ArrowRight,
  Search,
  Droplets,
  Sun,
  Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { analyzePlant } from './services/plantService';
import { cn } from './lib/utils';

interface AnalysisResult {
  id: string;
  timestamp: Date;
  image: string;
  markdown: string;
}

type Page = 'home' | 'privacy' | 'terms' | 'contact' | 'how-it-works' | 'plant-care';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      setImage(b64);
      setMimeType(file.type);
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const startAnalysis = async () => {
    if (!image || !mimeType) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const markdown = await analyzePlant(base64Data, mimeType, description);
      
      if (markdown) {
        setResult({
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          image: image,
          markdown: markdown
        });
      } else {
        throw new Error('No analysis returned from our expert.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        setMimeType('image/jpeg');
        closeCamera();
      }
    }
  };

  const reset = () => {
    setImage(null);
    setMimeType(null);
    setResult(null);
    setError(null);
    setDescription('');
    setCurrentPage('home');
  };

  const scrollToDiagnosis = () => {
    setCurrentPage('home');
    setTimeout(() => {
      document.getElementById('diagnosis-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-sage-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-sage-100/40 rounded-full blur-3xl" />
        </div>
        
        <div className="text-center max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} /> Guided by Botanical Experts
            </span>
            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-sage-950 leading-[1.1] mb-8">
              Your Plants Deserve <span className="text-sage-600 italic">Expert</span> Care.
            </h1>
            <p className="text-lg text-sage-600 mb-10 leading-relaxed">
              Instantly identify plant species and diagnose diseases with our expert-guided pathologist. 
              Get professional treatment plans for your green companions in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={scrollToDiagnosis}
                className="w-full sm:w-auto px-8 py-4 bg-sage-600 text-white rounded-2xl font-bold shadow-xl shadow-sage-200 hover:bg-sage-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Start Free Diagnosis <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => setCurrentPage('how-it-works')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-sage-900 border border-sage-200 rounded-2xl font-bold hover:bg-sage-50 transition-all"
              >
                Learn How It Works
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Diagnosis Section */}
      <section id="diagnosis-section" className="py-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Input (Sticky) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                <h2 className="text-2xl font-serif font-bold text-sage-900 mb-4">Identify & Diagnose</h2>
                <p className="text-sage-600 text-sm mb-6">
                  Upload a clear photo of your plant's leaves, stems, or affected areas for a professional-grade analysis.
                </p>

                {!image ? (
                  <div className="space-y-4">
                    <div 
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "group relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center overflow-hidden",
                        isDragging 
                          ? "border-sage-500 bg-sage-100 scale-[1.02]" 
                          : "border-sage-200 hover:border-sage-400 bg-sage-50/50"
                      )}
                    >
                      <AnimatePresence>
                        {isDragging && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-sage-500/5 backdrop-blur-[2px] z-10"
                          />
                        )}
                      </AnimatePresence>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onFileSelect} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-sage-400 group-hover:text-sage-600 group-hover:scale-110 transition-all shadow-sm mb-4 relative z-20">
                        <Upload size={32} />
                      </div>
                      <p className="font-medium text-sage-900 relative z-20">Drop your photo here</p>
                      <p className="text-xs text-sage-500 mt-2 relative z-20">or click to browse files</p>
                      
                      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 opacity-50 z-20">
                        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-tighter">
                          <ImageIcon size={10} /> JPG/PNG
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-tighter">
                          <Camera size={10} /> Camera
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={openCamera}
                      className="w-full py-3 bg-white border border-sage-200 text-sage-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sage-50 transition-all"
                    >
                      <Camera size={20} /> Take Photo with Camera
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-inner bg-sage-100">
                      <img 
                        src={image} 
                        alt="Plant to analyze" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => setImage(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-sage-500 block">Additional Context (Optional)</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., 'Leaves turned yellow last week', 'I water it every 3 days'..."
                        className="w-full bg-sage-50 border border-sage-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all min-h-[100px] resize-none"
                      />
                    </div>

                    <button 
                      onClick={startAnalysis}
                      disabled={isAnalyzing}
                      className={cn(
                        "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                        isAnalyzing 
                          ? "bg-sage-400 cursor-not-allowed" 
                          : "bg-sage-600 hover:bg-sage-700 active:scale-[0.98] shadow-sage-200"
                      )}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Analyzing Symptoms...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={20} />
                          Start Expert Diagnosis
                        </>
                      )}
                    </button>
                  </div>
                )}
              </section>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-700"
                >
                  <AlertCircle className="shrink-0" size={20} />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              <div className="bg-sage-900 rounded-3xl p-6 text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="font-serif text-xl font-bold mb-2">Pro Tip</h3>
                  <p className="text-sage-300 text-sm leading-relaxed">
                    For the most accurate diagnosis, take photos in natural light and include both healthy and affected parts of the plant.
                  </p>
                </div>
                <Leaf className="absolute -bottom-4 -right-4 text-sage-800 rotate-12" size={120} />
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-sage-200 rounded-3xl bg-white/30"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-sage-200 mb-6 shadow-sm">
                    <Info size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Awaiting Analysis</h3>
                  <p className="text-sage-500 max-w-xs">
                    Your detailed plant health report will appear here once our expert finishes scanning your photo.
                  </p>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border border-sage-100 rounded-3xl bg-white shadow-sm"
                >
                  <div className="relative mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-32 h-32 border-4 border-sage-100 border-t-sage-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sage-500">
                      <Leaf size={40} className="animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Consulting PlantGuardian...</h3>
                  <p className="text-sage-500 max-w-xs">
                    Our expert system is cross-referencing thousands of plant diseases and nutrient profiles.
                  </p>
                  
                  <div className="mt-8 space-y-3 w-full max-w-xs">
                    {[
                      "Identifying species...",
                      "Scanning for pests...",
                      "Checking nutrient levels...",
                      "Generating care plan..."
                    ].map((step, i) => (
                      <motion.div 
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.5 }}
                        className="flex items-center gap-3 text-sm text-sage-400"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-sage-200" />
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-sm border border-sage-100 overflow-hidden flex flex-col h-full"
                >
                  <div className="bg-sage-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={24} />
                      <div>
                        <h3 className="font-bold font-serif text-lg">Analysis Complete</h3>
                        <p className="text-xs text-sage-200 font-mono uppercase tracking-wider">
                          Report ID: {result?.id} • {result?.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Print Report"
                    >
                      <Info size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="markdown-body prose prose-sage max-w-none">
                      <Markdown>{result?.markdown}</Markdown>
                    </div>
                  </div>

                  <div className="p-6 bg-sage-50 border-t border-sage-100 flex items-center justify-between">
                    <p className="text-xs text-sage-500 italic">
                      Disclaimer: Expert diagnosis is for informational purposes. Consult a professional for critical crops.
                    </p>
                    <button 
                      onClick={reset}
                      className="text-sm font-bold text-sage-600 hover:text-sage-800 flex items-center gap-2"
                    >
                      New Scan <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white rounded-[40px] shadow-sm border border-sage-100 my-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-sage-950 mb-4">Why Choose PlantGuardian?</h2>
            <p className="text-sage-600 max-w-xl mx-auto">
              We combine advanced botanical vision with expert knowledge to give you the most accurate results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-amber-500" />, title: "Instant Results", desc: "Get a full diagnostic report in under 10 seconds." },
              { icon: <Shield className="text-blue-500" />, title: "Expert Accuracy", desc: "Trained on millions of plant pathology records." },
              { icon: <Heart className="text-rose-500" />, title: "Organic First", desc: "We prioritize natural remedies for a safer home environment." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-sage-50 border border-sage-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-sage-900 mb-3">{feature.title}</h3>
                <p className="text-sage-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-sage-950 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is PlantGuardian free to use?", a: "Yes! Our basic diagnosis tool is completely free for all plant lovers." },
              { q: "How accurate is the expert diagnosis?", a: "Our system has a high confidence rate for common pests and diseases. However, for commercial crops, we recommend consulting a local extension service." },
              { q: "Can it identify any plant?", a: "We support over 10,000 species including houseplants, vegetables, fruits, and ornamental trees." },
              { q: "What if the image is blurry?", a: "Our system might struggle with blurry images. We recommend retaking the photo in bright, indirect sunlight for best results." }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-sage-100 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-sage-50 transition-colors list-none">
                  <span className="font-bold text-sage-900">{faq.q}</span>
                  <ChevronRight className="text-sage-400 group-open:rotate-90 transition-transform" size={20} />
                </summary>
                <div className="p-6 pt-0 text-sage-600 text-sm leading-relaxed border-t border-sage-50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="bg-sage-600 rounded-[40px] p-12 lg:p-20 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">Ready to Save Your Plants?</h2>
            <p className="text-sage-100 mb-10 text-lg">
              Join thousands of happy gardeners who trust PlantGuardian for their daily plant care needs.
            </p>
            <button 
              onClick={scrollToDiagnosis}
              className="px-10 py-5 bg-white text-sage-900 rounded-2xl font-bold shadow-2xl hover:bg-sage-50 transition-all hover:-translate-y-1"
            >
              Start Your First Diagnosis
            </button>
          </div>
          <Leaf className="absolute -top-10 -left-10 text-white/10 rotate-45" size={300} />
          <Leaf className="absolute -bottom-10 -right-10 text-white/10 -rotate-12" size={200} />
        </div>
      </section>
    </>
  );

  const renderPrivacy = () => (
    <div className="py-16 max-w-3xl mx-auto px-4">
      <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-sage-600 hover:text-sage-900 mb-8 font-bold">
        <X size={20} /> Back to Home
      </button>
      <h1 className="text-4xl font-serif font-bold text-sage-950 mb-8">Privacy Policy</h1>
      <div className="prose prose-sage max-w-none text-sage-700">
        <p>Last updated: March 2026</p>
        <h2>1. Information We Collect</h2>
        <p>We collect images you upload for analysis and any text descriptions you provide. These are processed by our expert system to provide you with a diagnosis.</p>
        <h2>2. How We Use Your Data</h2>
        <p>Your data is used solely to provide the plant diagnosis service. We do not sell your personal information or images to third parties.</p>
        <h2>3. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data during transmission and processing.</p>
        <h2>4. Cookies</h2>
        <p>We use essential cookies to ensure the application functions correctly.</p>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="py-16 max-w-3xl mx-auto px-4">
      <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-sage-600 hover:text-sage-900 mb-8 font-bold">
        <X size={20} /> Back to Home
      </button>
      <h1 className="text-4xl font-serif font-bold text-sage-950 mb-8">Terms of Service</h1>
      <div className="prose prose-sage max-w-none text-sage-700">
        <p>By using PlantGuardian, you agree to the following terms:</p>
        <h2>1. Use of Service</h2>
        <p>PlantGuardian is for informational purposes only. It is not a substitute for professional agricultural or botanical advice.</p>
        <h2>2. Accuracy</h2>
        <p>While we strive for high accuracy, we cannot guarantee that every diagnosis is correct. Use the information at your own risk.</p>
        <h2>3. User Content</h2>
        <p>You retain ownership of the images you upload. By uploading, you grant us a license to process them for the purpose of providing the service.</p>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="py-16 max-w-3xl mx-auto px-4">
      <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-sage-600 hover:text-sage-900 mb-8 font-bold">
        <X size={20} /> Back to Home
      </button>
      <h1 className="text-4xl font-serif font-bold text-sage-950 mb-8">Contact Support</h1>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-sage-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center text-sage-600">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sage-900">Email Us</h3>
            <p className="text-sage-500 text-sm">support@bytesvibe.com</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-sage-500">Name</label>
              <input type="text" className="w-full bg-sage-50 border border-sage-200 rounded-xl p-3 text-sm" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-sage-500">Email</label>
              <input type="email" className="w-full bg-sage-50 border border-sage-200 rounded-xl p-3 text-sm" placeholder="your@email.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-sage-500">Message</label>
            <textarea className="w-full bg-sage-50 border border-sage-200 rounded-xl p-3 text-sm min-h-[150px]" placeholder="How can we help you?" />
          </div>
          <button className="w-full py-4 bg-sage-600 text-white rounded-xl font-bold hover:bg-sage-700 transition-all">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );

  const renderHowItWorks = () => (
    <div className="py-16 max-w-4xl mx-auto px-4">
      <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-sage-600 hover:text-sage-900 mb-8 font-bold">
        <X size={20} /> Back to Home
      </button>
      <h1 className="text-4xl font-serif font-bold text-sage-950 mb-12 text-center">How It Works</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { icon: <Camera />, title: "1. Capture", desc: "Take a clear photo of your plant's affected area in natural light." },
          { icon: <Search />, title: "2. Analyze", desc: "Our expert system scans the image for thousands of known diseases and pests." },
          { icon: <CheckCircle2 />, title: "3. Heal", desc: "Receive a detailed treatment plan and long-term care advice." }
        ].map((step, i) => (
          <div key={i} className="text-center">
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 mx-auto mb-6">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-sage-900 mb-3">{step.title}</h3>
            <p className="text-sage-500 text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlantCare = () => (
    <div className="py-16 max-w-4xl mx-auto px-4">
      <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-sage-600 hover:text-sage-900 mb-8 font-bold">
        <X size={20} /> Back to Home
      </button>
      <h1 className="text-4xl font-serif font-bold text-sage-950 mb-12">Essential Plant Care Tips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: <Sun />, title: "Light Requirements", desc: "Most plants prefer bright, indirect light. Avoid harsh midday sun which can scorch leaves." },
          { icon: <Droplets />, title: "Watering Wisdom", desc: "Always check the top inch of soil. If it's dry, it's time to water. Overwatering is the #1 killer of houseplants." },
          { icon: <Thermometer />, title: "Temperature & Humidity", desc: "Keep plants away from cold drafts or heating vents. Tropical plants love humidity—try misting them!" },
          { icon: <Info />, title: "Feeding Schedule", desc: "Fertilize during the growing season (Spring/Summer) and let your plants rest in the Winter." }
        ].map((tip, i) => (
          <div key={i} className="p-8 bg-white rounded-3xl border border-sage-100 shadow-sm">
            <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center text-sage-600 mb-6">
              {tip.icon}
            </div>
            <h3 className="text-xl font-bold text-sage-900 mb-3">{tip.title}</h3>
            <p className="text-sage-500 text-sm leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-sage-200 selection:text-sage-900">
      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full max-w-2xl aspect-[3/4] bg-sage-900 rounded-3xl overflow-hidden shadow-2xl">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none">
                <div className="w-full h-full border-2 border-white/30 rounded-xl" />
              </div>
              
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
                <button 
                  onClick={closeCamera}
                  className="w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={24} />
                </button>
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <div className="w-16 h-16 border-4 border-sage-600 rounded-full" />
                </button>
                <div className="w-14 h-14" /> {/* Spacer */}
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-white/60 text-sm mt-6 font-mono uppercase tracking-widest">Position plant in center frame</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sage-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sage-200">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-sage-900 leading-none">PlantGuardian</h1>
              <p className="text-[10px] uppercase tracking-widest text-sage-500 font-mono mt-1">Expert Pathologist</p>
            </div>
          </div>
          
          <nav className="hidden sm:flex items-center gap-6">
            <button onClick={() => setCurrentPage('how-it-works')} className="text-sm font-medium text-sage-600 hover:text-sage-900 transition-colors">How it works</button>
            <button onClick={() => setCurrentPage('plant-care')} className="text-sm font-medium text-sage-600 hover:text-sage-900 transition-colors">Plant Care</button>
            <button 
              onClick={reset}
              className="text-sm font-medium text-sage-600 hover:text-sage-900 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={14} />
              New Scan
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'privacy' && renderPrivacy()}
        {currentPage === 'terms' && renderTerms()}
        {currentPage === 'contact' && renderContact()}
        {currentPage === 'how-it-works' && renderHowItWorks()}
        {currentPage === 'plant-care' && renderPlantCare()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-sage-100 py-12 mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="text-sage-600" size={24} />
                <span className="font-serif font-bold text-xl">PlantGuardian</span>
              </div>
              <p className="text-sage-500 text-sm leading-relaxed">
                Empowering plant lovers with expert-driven insights to grow healthier, happier gardens.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sage-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-sage-500">
                <li><button onClick={() => setCurrentPage('privacy')} className="hover:text-sage-900">Privacy Policy</button></li>
                <li><button onClick={() => setCurrentPage('terms')} className="hover:text-sage-900">Terms of Service</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-sage-900">Contact Support</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sage-900 mb-4">Community</h4>
              <p className="text-sage-500 text-sm mb-4">Join 10,000+ gardeners sharing tips and photos.</p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 hover:bg-sage-200 cursor-pointer transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-sage-100 text-center">
            <p className="text-xs text-sage-400 font-mono uppercase tracking-widest">
              &copy; {new Date().getFullYear()} PlantGuardian Expert • Build by <a href="https://bytesvibe.com" target="_blank" rel="noopener noreferrer" className="hover:text-sage-600 underline">bytesvibe.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
