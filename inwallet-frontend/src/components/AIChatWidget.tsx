import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIChatWidget.css';
import { aiApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Tarayıcı Speech API tip tanımları
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// ─── Voice Waveform Component ─────────────────────────────────────────────
const VoiceWaveform: React.FC<{ active: boolean; color?: string }> = ({ active, color = 'var(--accent-blue)' }) => {
  return (
    <div className={`voice-waveform ${active ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
      {[0.4, 0.7, 1.0, 0.8, 0.5].map((scale, i) => (
        <motion.div
          key={i}
          animate={active ? {
            height: [ '4px', `${scale * 16}px`, '4px' ],
            opacity: [0.5, 1, 0.5]
          } : { height: '3px', opacity: 0.3 }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{
            width: '3px',
            backgroundColor: color,
            borderRadius: '2px'
          }}
        />
      ))}
    </div>
  );
};

const AIChatWidget: React.FC = () => {
  const { userId } = useAuth();
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<{sender: 'ai'|'user'|'error', text: string}[]>([
    { sender: 'ai', text: 'Merhaba! Ben InWallet Asistanı. Cüzdanınızı analiz edebilir, işlem kaydedebilir veya yatırım hedefleriniz hakkında tavsiye verebilirim. 🎤 Mikrofona basarak sesli de sorabilirsiniz!\n\nNOT: Bu bilgiler yatırım tavsiyesi değildir.' }
  ]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem('ai_voice_enabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [speechSupported]             = useState(() =>
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const toggleVoice = () => {
    const newVal = !isVoiceEnabled;
    setIsVoiceEnabled(newVal);
    localStorage.setItem('ai_voice_enabled', JSON.stringify(newVal));
    if (!newVal) {
      stopSpeaking();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ─── Metin Gönder ──────────────────────────────────────────────────────────
  const sendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const userText = overrideText || input.trim();
    if (!userText) return;

    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    if (!overrideText) setInput('');
    setIsLoading(true);

    try {
      const data = await aiApi.chat(userId ?? 1, userText);
      setMessages(prev => [...prev, { sender: 'ai', text: data }]);
      if (isVoiceEnabled) {
        speakText(data);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: 'error',
        text: err.message.includes('Failed to fetch')
          ? 'Bağlantı hatası: AI Asistan servisine ulaşılamıyor.'
          : `Hata: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Web Speech API (STT) ─────────────────────────────────────────────────
  const startVoiceRecognition = () => {
    if (!speechSupported) {
      alert('Tarayıcınız sesli komut özelliğini desteklemiyor. Chrome veya Edge kullanın.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang          = 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous    = false;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      sendMessage(undefined, transcript);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error !== 'no-speech') {
        setMessages(prev => [...prev, {
          sender: 'error',
          text: `🎤 Ses tanıma hatası: ${event.error}. Lütfen tekrar deneyin.`
        }]);
      }
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // ─── TTS (Text-to-Speech) ─────────────────────────────────────────────────
  const speakText = (text: string) => {
    if (!window.speechSynthesis || !isVoiceEnabled) return;
    const cleanText = text.replace(/⚠️.*?$/s, '').replace(/NOT:.*?$/s, '').trim().slice(0, 400);
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    const utterance   = new SpeechSynthesisUtterance(cleanText);
    utterance.lang    = 'tr-TR';
    utterance.rate    = 1.05;
    utterance.pitch   = 1.0;
    utterance.volume  = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="ai-chat-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-window glassmorphism"
            initial={{ opacity: 0, scale: 0.8, y: 40, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: 40, x: 20, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="ai-chat-header">
              <div className="ai-header-info">
                <div className="ai-avatar-wrapper">
                  <div className="ai-avatar premium-glow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
                    </svg>
                  </div>
                  {(isSpeaking || isRecording) && <span className="avatar-pulse"></span>}
                </div>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    InWallet AI
                    {(isSpeaking || isRecording) && <VoiceWaveform active={true} color={isRecording ? '#ef4444' : 'var(--accent-blue)'} />}
                  </h4>
                  <div className="ai-status">
                    <span className={`status-dot ${isRecording ? 'recording' : isSpeaking ? 'speaking' : ''}`}></span>
                    {isSpeaking ? 'Konuşuyor...' : isRecording ? 'Dinliyor...' : 'Online'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={toggleVoice}
                  title={isVoiceEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                  className={`voice-toggle-btn ${isVoiceEnabled ? 'active' : ''}`}
                >
                  {isVoiceEnabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                      <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                  )}
                </button>

                <button onClick={toggleChat} className="close-btn" aria-label="Close chat">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="ai-chat-messages">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`chat-message-container ${msg.sender}`}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className={`chat-bubble ${msg.sender} ${msg.sender === 'ai' ? 'glassmorphism-light' : ''}`}>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    </div>
                    <span className="chat-time">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  className="chat-message-container ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="chat-bubble ai typing-indicator glassmorphism-light">
                    <span></span><span></span><span></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="quick-commands-wrapper hide-scrollbar">
              {[
                { label: '📊 Portföy Analizi',     msg: 'Portföyümü analiz et',                 color: '#3b82f6' },
                { label: '🔥 Enflasyon Riski',     msg: 'Nakit paramın enflasyon riskini hesapla', color: '#f59e0b' },
                { label: '🏥 Sağlık Skorum',       msg: 'Finansal sağlık skorumu açıkla',        color: '#10b981' },
                { label: '📈 DCA Tavsiyesi',        msg: 'Aylık 3000 TL ile hangi varlığa DCA yapmalıyım?', color: '#a78bfa' },
              ].map(q => (
                <motion.button
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={q.label}
                  onClick={() => sendMessage(undefined, q.msg)}
                  style={{ background: `${q.color}18`, border: `1px solid ${q.color}30`, color: q.color }}
                  className="quick-cmd-btn"
                >
                  {q.label}
                </motion.button>
              ))}
            </div>

            <div className="ai-chat-input-wrapper">
              <form className="ai-chat-input" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder={isRecording ? '🎤 Dinliyor...' : 'Asistana bir soru sorun...'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isLoading || isRecording}
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit" 
                  disabled={!input.trim() || isLoading || isRecording} 
                  className="send-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </motion.button>
              </form>

              {speechSupported ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`mic-button ${isRecording ? 'recording' : ''}`}
                  onMouseDown={startVoiceRecognition}
                  onMouseUp={stopVoiceRecognition}
                  onTouchStart={startVoiceRecognition}
                  onTouchEnd={stopVoiceRecognition}
                  disabled={isLoading}
                  title={isRecording ? 'Bırakın — tanıma başlıyor' : 'Konuşmak için basılı tutun'}
                >
                  {isRecording ? (
                    <div className="mic-active-icon"></div>
                  ) : '🎤'}
                </motion.button>
              ) : (
                <button className="mic-button" disabled title="Desteklenmiyor">🎤</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button 
          className="ai-chat-fab pulse-animation premium-glow" 
          onClick={toggleChat} 
          aria-label="Open AI Assistant"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
        >
          ✨
        </motion.button>
      )}
    </div>
  );
};

export default AIChatWidget;

