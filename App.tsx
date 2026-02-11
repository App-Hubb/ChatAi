
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import LiveVoice from './components/LiveVoice';
import ProfitHub from './components/ProfitHub';
import { ToolType } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.CHAT);
  
  // Persistent Global State
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [imageCount, setImageCount] = useState(() => parseInt(localStorage.getItem('imageCount') || '0'));
  
  // Set initial balance to 134.00 if not already set
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('balance');
    return saved ? parseFloat(saved) : 134.00;
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [isLoggedIn, userProfile]);

  useEffect(() => {
    localStorage.setItem('imageCount', imageCount.toString());
  }, [imageCount]);

  useEffect(() => {
    localStorage.setItem('balance', balance.toFixed(2));
  }, [balance]);

  const handleLogin = () => {
    // The code is now fixed to 134 as requested
    const simulatedCode = "134";
    
    const win = window.open('about:blank', 'Sign up - ChatAi', 'width=500,height=800');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sign up</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { 
              background: #ffffff; 
              font-family: 'Inter', sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              color: #111111;
              padding: 20px;
            }
            .container {
              width: 100%;
              max-width: 440px;
              text-align: center;
              transition: opacity 0.3s ease;
            }
            .hidden { display: none !important; }
            h1 { font-size: 36px; font-weight: 700; margin-bottom: 40px; color: #1a1a1a; letter-spacing: -0.02em; }
            .card {
              background: white; border: 1px solid #e5e7eb; border-radius: 20px;
              padding: 36px; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            }
            .label { font-size: 15px; font-weight: 600; margin-bottom: 12px; display: block; color: #111111; }
            input[type="email"], input[type="text"] {
              width: 100%; padding: 14px 18px; border: 1px solid #d1d5db; border-radius: 10px;
              font-size: 16px; box-sizing: border-box; margin-bottom: 30px; outline: none;
            }
            input:focus { border-color: #000; }
            .btn-black {
              width: 100%; background: #000; color: white; padding: 16px; border-radius: 10px;
              font-weight: 600; font-size: 16px; border: none; cursor: pointer; margin-bottom: 12px;
            }
            .divider { display: flex; align-items: center; margin: 32px 0; color: #6b7280; font-size: 13px; font-weight: 500; }
            .divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #e5e7eb; }
            .divider span { margin: 0 18px; }
            .social-btn {
              width: 100%; padding: 14px; border: 1px solid #d1d5db; background: white; border-radius: 10px;
              font-weight: 500; font-size: 15px; display: flex; align-items: center; justify-content: center;
              margin-bottom: 14px; cursor: pointer; gap: 12px; color: #1f2937;
            }
            .social-btn img { width: 20px; height: 20px; }
            .tos-footer { margin-top: 80px; font-size: 13px; color: #6b7280; line-height: 1.6; max-width: 320px; }
            .otp-inputs { display: flex; gap: 15px; justify-content: center; margin: 30px 0; }
            .otp-input {
              width: 60px; height: 75px; border: 1px solid #d1d5db; border-radius: 12px;
              text-align: center; font-size: 32px; font-weight: 700; outline: none;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
            }
            .otp-input:focus { border-color: #000; border-width: 2px; }
            #loading-overlay {
              position: fixed; inset: 0; background: white; display: none;
              flex-direction: column; align-items: center; justify-content: center; z-index: 100;
            }
            .spinner {
              width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #000;
              border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .error-msg { color: #ef4444; font-size: 13px; text-align: center; margin-top: -20px; margin-bottom: 20px; display: none; font-weight: 500; }
          </style>
        </head>
        <body>
          <div id="loading-overlay">
            <div class="spinner"></div>
            <p style="font-weight: 500; font-size: 14px; color: #4b5563;">Processing...</p>
          </div>

          <div class="container" id="step-1">
            <h1>Sign up</h1>
            <div class="card">
              <label class="label">Email</label>
              <input type="email" placeholder="Your email address" id="email-input">
              <button class="btn-black" onclick="sendCode()">Continue</button>
              <div class="divider"><span>OR</span></div>
              <button class="social-btn" onclick="sendCode()">
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google">
                Continue with Google
              </button>
            </div>
            <p class="tos-footer">By creating an account, you agree to the <br> Terms of Service and Privacy Policy</p>
          </div>

          <div class="container hidden" id="step-2">
            <h1>Verify Code</h1>
            <div class="card">
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px; text-align: center;">
                Enter the 3-digit code sent to your Gmail.
              </p>
              <div class="otp-inputs">
                <input type="text" maxlength="1" class="otp-input" id="o1" oninput="digitInput(this, 'o2')">
                <input type="text" maxlength="1" class="otp-input" id="o2" oninput="digitInput(this, 'o3')">
                <input type="text" maxlength="1" class="otp-input" id="o3">
              </div>
              <div id="error-msg" class="error-msg">Incorrect code. Use "134" to verify.</div>
              <button class="btn-black" onclick="verifyOTP()">Verify & Sign Up</button>
            </div>
          </div>

          <script>
            const CORRECT_CODE = "${simulatedCode}";
            
            function sendCode() {
              document.getElementById('loading-overlay').style.display = 'flex';
              setTimeout(() => {
                alert("Gmail Notification:\\nYour ChatAi verification code is: " + CORRECT_CODE);
                document.getElementById('loading-overlay').style.display = 'none';
                document.getElementById('step-1').classList.add('hidden');
                document.getElementById('step-2').classList.remove('hidden');
                document.getElementById('o1').focus();
              }, 1200);
            }

            function digitInput(current, nextID) {
              if (current.value.length >= 1) document.getElementById(nextID).focus();
            }

            function verifyOTP() {
              const enteredCode = 
                document.getElementById('o1').value + 
                document.getElementById('o2').value + 
                document.getElementById('o3').value;

              if (enteredCode === CORRECT_CODE) {
                document.getElementById('loading-overlay').style.display = 'flex';
                setTimeout(() => {
                   window.opener.postMessage('auth_success', '*');
                   window.close();
                }, 1000);
              } else {
                document.getElementById('error-msg').style.display = 'block';
                const card = document.querySelector('#step-2 .card');
                card.style.transform = 'translateX(10px)';
                setTimeout(() => card.style.transform = 'translateX(-10px)', 50);
                setTimeout(() => card.style.transform = 'translateX(0)', 100);
              }
            }
          <\/script>
        </body>
        </html>
      `);
      win.document.close();
    }

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data === 'auth_success') {
        setIsLoggedIn(true);
        setUserProfile({
          name: "Russel John",
          email: "ramos.russel@gmail.com",
          initials: "RR"
        });
        window.removeEventListener('message', handleAuthMessage);
      }
    };
    window.addEventListener('message', handleAuthMessage);
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
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar 
        activeTool={activeTool} setActiveTool={setActiveTool} 
        isLoggedIn={isLoggedIn} balance={balance} 
        onLogin={handleLogin} userProfile={userProfile}
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
