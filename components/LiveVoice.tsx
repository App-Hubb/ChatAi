
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData, blobToBase64 } from '../services/audioUtils';

const LiveVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [userSpeech, setUserSpeech] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const stopSession = () => {
    setIsActive(false);
    if (sessionRef.current) sessionRef.current.close();
    if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(err => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('PERMISSION_DENIED');
        }
        throw err;
      });

      setIsActive(true);
      if (videoRef.current) videoRef.current.srcObject = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputAudioContext;
      outputContextRef.current = outputAudioContext;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (canvasRef.current && videoRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                canvasRef.current.width = 320;
                canvasRef.current.height = 240;
                ctx?.drawImage(videoRef.current, 0, 0, 320, 240);
                canvasRef.current.toBlob(async (blob) => {
                  if (blob) {
                    const base64 = await blobToBase64(blob);
                    sessionPromise.then(session => session.sendRealtimeInput({
                      media: { data: base64, mimeType: 'image/jpeg' }
                    }));
                  }
                }, 'image/jpeg', 0.6);
              }
            }, 1000);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => prev + msg.serverContent!.outputTranscription!.text);
            }
            if (msg.serverContent?.inputTranscription) {
              setUserSpeech(prev => prev + msg.serverContent!.inputTranscription!.text);
            }
            if (msg.serverContent?.turnComplete) {
              setTranscription('');
              setUserSpeech('');
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              for (const s of sourcesRef.current) { try { s.stop(); } catch(e) {} }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live Error', e),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are ChatAi Live. You were created by Russel John Engbino Ramos. You are helpful and naturally expressive. You can see through the camera. Be concise. If asked about your creator, always mention Russel John Engbino Ramos.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      if (err.message === 'PERMISSION_DENIED') {
        setPermissionError('Camera or Microphone access was denied. Please check your browser settings and try again.');
      } else {
        setPermissionError('Failed to start Live Link. Ensure your devices are connected.');
      }
      setIsActive(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 overflow-y-auto bg-slate-950/20">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black mb-2 tracking-tight">Live Link</h2>
        <p className="text-slate-500 font-medium">Real-time multimodal interaction with vision and speech.</p>
      </div>

      <div className="relative w-full max-w-3xl aspect-video rounded-[2.5rem] glass overflow-hidden shadow-2xl border border-slate-700/50 group">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-10'}`} />
        <canvas ref={canvasRef} className="hidden" />
        
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xl p-8">
            {permissionError ? (
              <div className="max-w-md text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white">Permission Denied</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{permissionError}</p>
                <button
                  onClick={startSession}
                  className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <button
                onClick={startSession}
                className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-2xl flex items-center space-x-4 transition-all hover:scale-105 active:scale-95 group"
              >
                <svg className="w-10 h-10 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <span>Connect Live Link</span>
              </button>
            )}
          </div>
        )}

        {isActive && (
          <>
            <div className="absolute top-6 left-6 flex items-center space-x-3 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg animate-pulse">
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              <span className="tracking-widest">LIVE VISION</span>
            </div>
            
            <button
              onClick={stopSession}
              className="absolute top-6 right-6 bg-black/40 hover:bg-red-500/80 backdrop-blur-md text-white p-4 rounded-2xl transition-all shadow-xl border border-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="absolute bottom-8 left-8 right-8 space-y-4">
              {userSpeech && (
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl text-slate-300 text-sm max-w-sm ml-auto text-right shadow-2xl animate-in slide-in-from-right-4">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Detecting Voice...</p>
                  {userSpeech}
                </div>
              )}
              {transcription && (
                <div className="bg-blue-600/90 backdrop-blur-xl border border-blue-400/40 p-6 rounded-[2rem] text-white text-xl font-bold max-w-lg shadow-2xl animate-in slide-in-from-bottom-4">
                  {transcription}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={`mt-12 flex space-x-12 transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800 text-slate-600'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Neural Sight</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-600'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Voice Capture</span>
        </div>
      </div>
    </div>
  );
};

export default LiveVoice;
