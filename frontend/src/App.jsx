import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MessageSquare, LayoutDashboard, TrendingUp } from 'lucide-react';
import PatientList from './components/PatientList';
import ChatPanel from './components/ChatPanel';
import DashboardPanel from './components/DashboardPanel';
import TrendsPanel from './components/TrendsPanel';
import DemoControls from './components/DemoControls';
import { patients, getDemoSteps } from './data/patients';

function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const tabs = [
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
];

export default function App() {
  const [selectedId, setSelectedId] = useState('p1');
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const patient = patients[selectedId];
  const demoSteps = getDemoSteps(patient);

  const handleSelectPatient = (id) => {
    handleRestart();
    setSelectedId(id);
    setActiveTab('chat');
  };

  const addDemoStep = useCallback((index) => {
    const steps = getDemoSteps(patients[selectedId]);
    if (index >= steps.length) {
      setIsPlaying(false);
      return;
    }
    const step = steps[index];

    if (step.role === 'assistant') {
      setIsTyping(true);
      const delay = Math.max(600, 1200 / speed);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: step.role, content: step.content }]);
        if (step.action?.type === 'timeline') {
          setTimeline(prev => [...prev, { text: step.action.event, time: formatTime() }]);
        }
        setDemoIndex(index + 1);
      }, delay);
    } else {
      const delay = Math.max(400, 700 / speed);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: step.role, content: step.content }]);
        setDemoIndex(index + 1);
      }, delay);
    }
  }, [speed, selectedId]);

  useEffect(() => {
    if (isPlaying && demoIndex < demoSteps.length) {
      const delay = demoSteps[demoIndex]?.role === 'assistant'
        ? Math.max(1200, 2000 / speed)
        : Math.max(800, 1000 / speed);
      timerRef.current = setTimeout(() => addDemoStep(demoIndex), delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, demoIndex, addDemoStep, speed, demoSteps.length]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (demoIndex === 0) addDemoStep(0);
  };
  const handlePause = () => { setIsPlaying(false); clearTimeout(timerRef.current); };
  const handleRestart = () => {
    setIsPlaying(false);
    clearTimeout(timerRef.current);
    setMessages([]);
    setTimeline([]);
    setIsTyping(false);
    setDemoIndex(0);
  };
  const handleStep = () => {
    setIsPlaying(false);
    clearTimeout(timerRef.current);
    if (demoIndex < demoSteps.length) addDemoStep(demoIndex);
  };

  const handleSendMessage = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, patient_id: selectedId }),
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      if (data.timeline_event) {
        setTimeline(prev => [...prev, { text: data.timeline_event, time: formatTime() }]);
      }
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. The backend server may not be running."
      }]);
    }
  };

  const isDemo = isPlaying || demoIndex > 0;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-velora-500 to-teal-500 flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-none">Velora</h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">AI Chronic Care Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-velora-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-400">Powered by IBM watsonx</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left: Patient List */}
        <PatientList
          selectedId={selectedId}
          onSelect={handleSelectPatient}
        />

        {/* Right: Content area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col min-h-0 p-3 gap-2"
              >
                <div className="flex-1 min-h-0">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isTyping={isTyping}
                    isDemo={isDemo}
                    patient={patient}
                  />
                </div>
                <DemoControls
                  isPlaying={isPlaying}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onRestart={handleRestart}
                  onStep={handleStep}
                  currentStep={demoIndex}
                  totalSteps={demoSteps.length}
                  speed={speed}
                  onSpeedChange={setSpeed}
                />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto p-3"
              >
                <DashboardPanel patient={patient} timeline={timeline} />
              </motion.div>
            )}
            {activeTab === 'trends' && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto p-3"
              >
                <TrendsPanel patient={patient} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
