
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [hasSelectedKey, setHasSelectedKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkInitialKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasSelectedKey(selected);
    };
    checkInitialKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    // Proceed assuming selection was successful per guidelines to mitigate race conditions
    setHasSelectedKey(true);
  };

  const generateVideo = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setVideoUrl(null);
    setStatus('Initializing Veo Engine...');

    try {
      // Use new instance to ensure latest key is picked up
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Processing visual sequences (this may take a few minutes)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        setStatus(`Synchronizing frames... ${operation.done ? 'Finalizing' : 'Processing'}`);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const fetchResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await fetchResponse.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        setStatus('Failed to retrieve video link.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setStatus('API Key session expired or invalid. Please re-select a paid key.');
        setHasSelectedKey(false);
      } else {
        setStatus('Generation interrupted. Please ensure you have a paid project selected.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasSelectedKey === false) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 max-w-2xl mx-auto text-center">
        <div className="glass p-10 rounded-3xl border-2 border-indigo-500/30 shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto text-indigo-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white">Veo Setup Required</h2>
          <p className="text-slate-400">
            To use high-quality video generation (Veo 3.1), you must select an API key from a 
            <span className="text-indigo-400 font-semibold"> paid Google Cloud project</span>.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm">
            <p className="text-slate-500 mb-2">Check the official billing guide:</p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              ai.google.dev/gemini-api/docs/billing
            </a>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            Select Paid API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8 max-w-4xl mx-auto overflow-y-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Motion Lab</h2>
        <p className="text-slate-400">Transform text into dynamic high-definition video sequences.</p>
        <div className="mt-4 flex items-center justify-center space-x-3 text-xs text-indigo-400 bg-indigo-500/10 py-2 px-4 rounded-full inline-block border border-indigo-500/20">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span>Paid API Key Active</span>
          <button onClick={handleSelectKey} className="ml-2 underline hover:text-indigo-300">Switch Key</button>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl space-y-8">
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic drone shot of a hidden tropical waterfall surrounded by ancient ruins, golden hour lighting..."
            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-6 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-lg"
          />
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-slate-500">Fast Preview (720p / 16:9)</span>
            <button
              onClick={generateVideo}
              disabled={isGenerating || !prompt.trim()}
              className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-3 transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Animate Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="min-h-[300px] rounded-2xl bg-slate-900/80 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
          {videoUrl ? (
            <video src={videoUrl} controls autoPlay loop className="w-full max-h-[500px] object-contain rounded-xl" />
          ) : (
            <div className="text-center p-12 space-y-4">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
              </div>
              <p className="text-slate-500 font-medium">Your cinematic creation will appear here</p>
              {isGenerating && (
                <div className="space-y-4 animate-pulse">
                  <p className="text-indigo-400 font-semibold">{status}</p>
                  <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-indigo-500" style={{ animation: 'loading 20s ease-in-out infinite' }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
