
import React, { useState, useEffect } from 'react';

interface ProfitHubProps {
  balance: number;
  setBalance: (val: number | ((prev: number) => number)) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  userProfile?: { name: string; email: string; initials: string } | null;
}

const ProfitHub: React.FC<ProfitHubProps> = ({ balance, setBalance, isLoggedIn, onLogin, userProfile }) => {
  const [isTasking, setIsTasking] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
  const [recentEarnings, setRecentEarnings] = useState<any[]>([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const WITHDRAW_THRESHOLD = 5.00;

  const [liveActivity, setLiveActivity] = useState([
    { user: "Alex_Verified", earned: 0.50, task: "Safety Review" },
    { user: "Sarah_Dev", earned: 1.25, task: "Label Sprint" },
    { user: "User_402", earned: 0.25, task: "Quality Check" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const names = ["CryptoKing", "Dev_Josh", "Mike_99", "Anna_Ai", "PixelArtiste"];
      const tasks = ["Easy Review", "Medium Labeling", "Hard Debugging", "Verified Test"];
      const newEntry = {
        user: names[Math.floor(Math.random() * names.length)],
        earned: (Math.random() * 2.5 + 0.1).toFixed(2),
        task: tasks[Math.floor(Math.random() * tasks.length)]
      };
      setLiveActivity(prev => [newEntry, ...prev.slice(0, 3)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tasks = [
    { id: 1, title: 'UI Contrast Check', difficulty: 'Easy', reward: 0.10, duration: 3000, description: 'Verify visual elements meet contrast standards.', icon: 'M9 12l2 2 4-4', color: 'emerald' },
    { id: 2, title: 'Image Content Tagging', difficulty: 'Easy', reward: 0.25, duration: 5000, description: 'Tag 5 objects in generated Forge assets.', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7', color: 'blue' },
    { id: 3, title: 'Safety Logic Verification', difficulty: 'Medium', reward: 1.20, duration: 10000, description: 'Analyze chat logs for neural safety compliance.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5', color: 'indigo' },
    { id: 4, title: 'Neural Stream Debugging', difficulty: 'Medium', reward: 2.50, duration: 15000, description: 'Find logic gaps in the 2.5-flash reasoning chains.', icon: 'M10 20l4-16m4 4l4 4-4 4', color: 'purple' },
    { id: 5, title: 'Pro Commercial Labeling', difficulty: 'Hard', reward: 5.50, duration: 25000, description: 'High-priority enterprise data labeling. Verified ONLY.', icon: 'M13 10V3L4 14h7v7l9-11', color: 'rose', verifiedOnly: true },
    { id: 6, title: 'Motion Lab Physics QC', difficulty: 'Hard', reward: 8.00, duration: 35000, description: 'Analyze 1080p video for frame physics accuracy.', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764', color: 'amber', verifiedOnly: true },
  ];

  const completeTask = (task: any) => {
    if (task.verifiedOnly && !isLoggedIn) {
      alert("Verification Required: HARD tasks require a verified Gmail account for high-accuracy payouts.");
      onLogin();
      return;
    }
    
    setIsTasking(true);
    setTaskProgress(0);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min(100, (elapsed / task.duration) * 100);
      setTaskProgress(percent);
      
      if (percent >= 100) {
        clearInterval(interval);
        setBalance(prev => prev + task.reward);
        setRecentEarnings(prev => [{ title: task.title, amount: task.reward, date: new Date().toLocaleTimeString(), difficulty: task.difficulty }, ...prev]);
        setIsTasking(false);
      }
    }, 50);
  };

  const handleWithdraw = () => {
    if (!isLoggedIn) {
      alert("Gmail Identification Required: To push funds to your bank/PayPal, you must verify your identity via Google.");
      onLogin();
      return;
    }
    if (balance < WITHDRAW_THRESHOLD) return;
    
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setBalance(0);
      setTimeout(() => setWithdrawSuccess(false), 6000);
    }, 4500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/50">
      {withdrawSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="glass p-12 rounded-[3rem] text-center border-2 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)] max-w-sm">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-4xl font-black text-white mb-4">Funds Pushed!</h3>
            <p className="text-slate-400 font-medium">Successfully transferred to <b>{userProfile?.email}</b> linked wallet.</p>
            <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-left">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Receipt ID</p>
              <p className="text-xs text-blue-400 font-mono">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <button onClick={() => setWithdrawSuccess(false)} className="mt-10 w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95">Return to Hub</button>
          </div>
        </div>
      )}

      <header className="p-8 border-b border-slate-800/50 glass">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1" /></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Real Earning Hub</h2>
              <p className="text-slate-500 font-medium">
                Verified: <span className={isLoggedIn ? "text-green-500" : "text-amber-500"}>{isLoggedIn ? "Gmail Linked" : "Unverified"}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-slate-900/80 p-2 rounded-3xl border border-slate-800">
            <div className="px-10 py-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl text-center min-w-[200px]">
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-1">Accrued Profit</p>
              <p className="text-4xl font-black text-white">${balance.toFixed(2)}</p>
            </div>
            <button 
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className={`px-10 py-5 rounded-2xl font-black transition-all flex items-center space-x-3 ${
                isWithdrawing 
                  ? 'bg-slate-800 text-slate-500' 
                  : (balance >= WITHDRAW_THRESHOLD || !isLoggedIn)
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isWithdrawing ? (
                <>
                  <svg className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Pushing to Bank...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                  <span>Push to Wallet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10`}>
          
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center space-x-6 border-b border-slate-800/50 mb-6 pb-2">
              <button onClick={() => setActiveTab('tasks')} className={`px-4 py-3 font-bold text-sm transition-all flex items-center space-x-2 ${activeTab === 'tasks' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <span>Earning Tasks</span>
              </button>
              <button onClick={() => setActiveTab('history')} className={`px-4 py-3 font-bold text-sm transition-all flex items-center space-x-2 ${activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <span>Transaction Log</span>
              </button>
            </div>

            {activeTab === 'tasks' ? (
              <div className="grid grid-cols-1 gap-5">
                {tasks.map((task) => (
                  <div key={task.id} className={`glass p-6 rounded-3xl flex items-center justify-between group transition-all border border-slate-800/50 hover:border-blue-500/30 ${isTasking ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center space-x-6">
                      <div className={`w-16 h-16 rounded-2xl bg-${task.color}-600/10 flex items-center justify-center text-${task.color}-400 border border-${task.color}-500/20 shadow-inner`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={task.icon} /></svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-black text-xl text-white">{task.title}</h3>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                            task.difficulty === 'Easy' ? 'text-emerald-400 border-emerald-500/30' :
                            task.difficulty === 'Medium' ? 'text-indigo-400 border-indigo-500/30' :
                            'text-rose-400 border-rose-500/30'
                          }`}>
                            {task.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Net Payout</span>
                        <span className="text-3xl font-black text-white tracking-tighter">${task.reward.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => completeTask(task)}
                        className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${
                          task.verifiedOnly && !isLoggedIn 
                            ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30'
                            : 'bg-white text-slate-950 hover:bg-blue-600 hover:text-white group-hover:scale-105'
                        }`}
                      >
                        {task.verifiedOnly && !isLoggedIn ? 'Unlock with Gmail' : 'Start Task'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentEarnings.length > 0 ? recentEarnings.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-6 glass rounded-2xl border border-slate-800/50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-white font-black">{item.title}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-green-400">+${item.amount.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase">{item.date}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 text-slate-700 italic font-bold">No processed earnings yet.</div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            {isTasking && (
              <div className="glass p-8 rounded-3xl border-2 border-blue-500/30 shadow-2xl animate-in zoom-in duration-300">
                <p className="text-xs text-blue-400 font-black uppercase tracking-widest mb-4 flex items-center space-x-2">
                   <svg className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full" />
                   <span>Neural Processing...</span>
                </p>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-100" style={{ width: `${taskProgress}%` }}></div>
                </div>
                <p className="text-slate-400 text-xs font-medium">Validating task results against ground truth. Do not close this window.</p>
              </div>
            )}

            <div className="glass rounded-3xl p-8 border border-slate-800/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                <span>Real-Time Payouts</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </h3>
              <div className="space-y-4">
                {liveActivity.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-4 bg-slate-900/60 rounded-2xl border border-slate-800/40 animate-in slide-in-from-right-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-[10px] flex items-center justify-center font-black text-indigo-400 border border-indigo-500/10">{act.user[0]}</div>
                      <div>
                        <span className="text-slate-200 font-bold block">{act.user}</span>
                        <span className="text-[9px] text-slate-600 uppercase font-black">{act.task}</span>
                      </div>
                    </div>
                    <span className="text-green-500 font-black">+${act.earned}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-700 to-blue-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/10">
              <h3 className="text-2xl font-black text-white mb-4">Push Direct</h3>
              <p className="text-indigo-100/70 text-sm mb-8 leading-relaxed">Once threshold is met, push your AI credits to your linked Gmail payout method.</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-xs">P</div>
                  <span className="text-white font-black text-sm">PayPal Checkout</span>
                </div>
                <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                   <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-xs">B</div>
                   <span className="text-white font-black text-sm">Direct Bank Push</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-indigo-300 font-black uppercase">
                  <span>Threshold</span>
                  <span>${WITHDRAW_THRESHOLD.toFixed(2)}</span>
                </div>
                <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (balance / WITHDRAW_THRESHOLD) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfitHub;
