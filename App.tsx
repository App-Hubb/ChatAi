
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import ImageGenerator from './components/ImageGenerator.tsx';
import VideoGenerator from './components/VideoGenerator.tsx';
import LiveVoice from './components/LiveVoice.tsx';
import ProfitHub from './components/ProfitHub.tsx';
import { ToolType } from './types.ts';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.CHAT);
  
  // Persistent Global State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch (e) { return false; }
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (e) { return null; }
  });

  const [imageCount, setImageCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('imageCount') || '0', 10);
    } catch (e) { return 0; }
  });

  const [balance, setBalance] = useState(() => {
    try {
      return parseFloat(localStorage.getItem('balance') || '0');
    } catch (e) { return 0; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('isLoggedIn', isLoggedIn.toString());
      if (userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      } else {
        localStorage.removeItem('userProfile');
      }
    } catch (e) {}
  }, [isLoggedIn, userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('imageCount', imageCount.toString());
      localStorage.setItem('balance', balance.toString());
    } catch (e) {}
  }, [imageCount, balance]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  const handleLogin = () => {
    const simulatedCode = "134";
    const randomName = "Nova Pulse";
    const randomEmail = "nova.pulse@gmail.com";
    const initials = "NP";
    const avatar = `https://i.pravatar.cc/150?u=${randomEmail}`;

    const win = window.open('about:blank', 'Sign up - ChatAi', 'width=500,height=800');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sign up</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { background: #ffffff; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; color: #111111; padding: 20px; }
            .container { width: 100%; max-width: 440px; text-align: center; }
            .hidden { display: none !important; }
            h1 { font-size: 32px; font-weight: 700; margin-bottom: 30px; }
            .card { background: white; border: 1px solid #e5e7eb; border-radius: 20px; padding: 36px; text-align: left; }
            input { width: 100%; padding: 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 16px; box-sizing: border-box; margin-bottom: 20px; }
            .btn-black { width: 100%; background: #000; color: white; padding: 16px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; }
            .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
            .otp-input { width: 50px; height: 60px; border: 1px solid #d1d5db; border-radius: 10px; text-align: center; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container" id="step-1">
            <h1>Sign up</h1>
            <div class="card">
              <label style="font-weight:600; display:block; margin-bottom:8px;">Email</label>
              <input type="email" placeholder="email@example.com" id="email-input">
              <button class="btn-black" onclick="sendCode()">Continue</button>
            </div>
          </div>
          <div class="container hidden" id="step-2">
            <h1>Verify Code</h1>
            <div class="card">
              <p style="font-size:14px; color:#6b7280; margin-bottom:15px; text-align:center;">Code: ${simulatedCode}</p>
              <div class="otp-inputs">
                <input type="text" maxlength="1" class="otp-input" id="o1" oninput="if(this.value)document.getElementById('o2').focus()">
                <input type="text" maxlength="1" class="otp-input" id="o2" oninput="if(this.value)document.getElementById('o3').focus()">
                <input type="text" maxlength="1" class="otp-input" id="o3">
              </div>
              <button class="btn-black" onclick="verifyOTP()">Verify Account</button>
            </div>
          </div>
          <script>
            function sendCode() {
              document.getElementById('step-1').classList.add('hidden');
              document.getElementById('step-2').classList.remove('hidden');
            }
            function verifyOTP() {
              const code = document.getElementById('o1').value + document.getElementById('o2').value + document.getElementById('o3').value;
              if (code === "${simulatedCode}") {
                window.opener.postMessage({ type: 'auth_success', profile: ${JSON.stringify({ name: randomName, email: randomEmail, initials, avatar })} }, '*');
                window.close();
              } else { alert("Incorrect code."); }
            }
          <\/script>
        </body>
        </html>
      `);
      win.document.close();
    }

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'auth_success') {
        setIsLoggedIn(true);
        setUserProfile(event.data.profile);
      }
    };
    window.addEventListener('message', handleAuthMessage, { once: true });
  };

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.CHAT: return <ChatInterface />;
      case ToolType.IMAGE: return <ImageGenerator imageCount={imageCount} setImageCount={setImageCount} isLoggedIn={isLoggedIn} onLogin={handleLogin} />;
      case ToolType.VIDEO: return <VideoGenerator />;
      case ToolType.VOICE: return <LiveVoice />;
      case ToolType.PROFIT: return <ProfitHub balance={balance} setBalance={setBalance} isLoggedIn={isLoggedIn} onLogin={handleLogin} userProfile={userProfile} />;
      default: return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden">
      <Sidebar 
        activeTool={activeTool} setActiveTool={setActiveTool} 
        isLoggedIn={isLoggedIn} 
        onLogin={handleLogin} onLogout={handleLogout} userProfile={userProfile}
      />
      <main className="flex-1 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="h-full w-full relative z-10">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
