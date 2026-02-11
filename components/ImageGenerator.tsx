
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ImageGeneratorProps {
  imageCount: number;
  setImageCount: (val: number | ((prev: number) => number)) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ imageCount, setImageCount, isLoggedIn, onLogin }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);

  const isLocked = imageCount >= 3 && !isLoggedIn;

  const generateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    if (isLocked) {
      return;
    }

    setIsGenerating(true);
    setMinted(false);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      let found = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          setImageCount(prev => prev + 1);
          found = true;
          break;
        }
      }

      if (!found) setError('No image was returned. Try a different prompt.');
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = () => {
    if (!isLoggedIn) {
      alert("Sign in with Gmail to list this creation in the Marketplace!");
      onLogin();
      return;
    }
    setIsMinting(true);
    setTimeout(() => {
      setIsMinting(false);
      setMinted(true);
      alert("Successfully listed on the ChatAi Marketplace! You'll earn royalties for every viewing.");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-8 max-w-5xl mx-auto overflow-y-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Image Forge</h2>
          <p className="text-slate-500 font-medium">Create and monetize your high-fidelity generations.</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Quota Usage</div>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`} />
            <span className={`text-sm font-bold ${isLocked ? 'text-red-400' : 'text-slate-300'}`}>
              {imageCount} / {isLoggedIn ? '∞' : '3'} Used
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative">
        {isLocked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 text-center">
            <div className="glass p-10 rounded-3xl border-2 border-blue-500/50 shadow-2xl backdrop-blur-xl animate-in zoom-in duration-300 max-w-md">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Verification Required</h3>
              <p className="text-slate-400 mb-8 text-sm">
                Unlock unlimited high-speed generation and start earning royalties by linking your Gmail account.
              </p>
              <button 
                onClick={onLogin}
                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
              >
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
                <span>Continue with Gmail</span>
              </button>
            </div>
          </div>
        )}

        <div className={`lg:col-span-5 space-y-6 transition-all duration-500 ${isLocked ? 'blur-md pointer-events-none' : ''}`}>
          <div className="glass p-6 rounded-2xl border border-slate-800/50">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Input Vision</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a masterpiece..."
              className="w-full h-48 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-lg leading-relaxed placeholder:text-slate-700"
            />
          </div>

          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all ${
              isGenerating || !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/20 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Forge & Create</span>
            )}
          </button>

          {error && <p className="text-red-400 text-sm text-center font-bold bg-red-500/10 py-4 rounded-xl border border-red-500/20">{error}</p>}
        </div>

        <div className={`lg:col-span-7 flex flex-col items-center justify-center aspect-square glass rounded-3xl relative overflow-hidden group transition-all duration-500 border border-slate-800/50 shadow-inner ${isLocked ? 'blur-md' : ''}`}>
          {resultImage ? (
            <div className="relative w-full h-full animate-in fade-in zoom-in duration-500">
              <img src={resultImage} alt="Generated" className="w-full h-full object-cover" />
              
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-3">
                  <a href={resultImage} download="chatai-forge.png" className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl text-white transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                  <button 
                    onClick={handleMint}
                    disabled={minted || isMinting}
                    className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center space-x-2 transition-all ${
                      minted 
                        ? 'bg-green-500 text-white' 
                        : isMinting 
                          ? 'bg-slate-700 text-slate-400' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isMinting ? (
                      <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12V3m0 18v-2" /></svg>
                    )}
                    <span>{minted ? 'Marketplace Listed' : 'List to Earn'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 max-w-xs">
              <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-slate-600 font-bold">Canvas Ready</p>
              <p className="text-slate-700 text-sm mt-2">Enter a prompt to forge a unique visual asset.</p>
            </div>
          )}
          
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center">
               <div className="text-center">
                 <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                 <p className="text-blue-400 font-black text-xl tracking-tight">Synthesizing Pixels...</p>
                 <p className="text-slate-500 text-sm mt-2">Powered by Gemini Forge Engine</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
