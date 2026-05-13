import { useState, useEffect, useRef } from 'react';
import './AIChatWidget.css';
import { aiApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIChatWidget: React.FC = () => {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'ai'|'user'|'error', text: string}[]>([
    { sender: 'ai', text: 'Merhaba! Ben InWallet Asistanı. Cüzdanınızı analiz edebilir veya yatırım hedefleriniz hakkında tavsiye verebilirim.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await aiApi.chat(userId ?? 1, userText);
      setMessages(prev => [...prev, { sender: 'ai', text: data }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        sender: 'error', 
        text: err.message.includes('Failed to fetch') 
          ? 'Bağlantı hatası: AI Asistan servisine ulaşılamıyor. Lütfen backend\'in çalıştığından emin olun.' 
          : `Hata: ${err.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioSend(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mikrofon erişim hatası:", err);
      alert("Mikrofon erişimine izin vermeniz gerekiyor.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioSend = async (audioBlob: Blob) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: 'user', text: '🎤 (Sesli mesaj gönderildi)' }]);
    try {
      const responseBlob = await aiApi.chatWithAudio(userId ?? 1, audioBlob);
      
      const audioUrl = URL.createObjectURL(responseBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error("Audio play failed:", e));

      setMessages(prev => [...prev, { sender: 'ai', text: '🔊 (Sesli yanıt oynatılıyor)' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'error', text: 'Yapay zeka asistanı sesinizi işlerken bir hata oluştu.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-wrapper">
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-neon-blue), var(--accent-blue))', color: 'white', borderRadius: '12px', width: '38px', height: '38px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                  <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                  <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
                  <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
                  <path d="M6.002 6.5A3 3 0 0 1 5.602 5.125"/>
                  <path d="M11.58 12.55a3 3 0 0 1 .42-2.05"/>
                  <path d="M12.42 12.55a3 3 0 0 0-.42-2.05"/>
                </svg>
              </div>
              <div>
                <h4>InWallet AI</h4>
                <div className="ai-status">
                  <span className="status-dot"></span> Online
                </div>
              </div>
            </div>
            <button onClick={toggleChat} className="close-btn" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message-container ${msg.sender}`}>
                <div className={`chat-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                </div>
                <span className="chat-time">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message-container ai">
                <div className="chat-bubble ai typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{ padding: '0 16px 12px 16px', display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="hide-scrollbar">
            <button 
              onClick={() => { setInput('Portföyümü analiz et'); sendMessage(new Event('submit') as any); }}
              style={{ whiteSpace: 'nowrap', padding: '6px 12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', fontSize: '12px', color: 'var(--accent-blue)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              📊 Portföy Analizi
            </button>
            <button 
              onClick={() => { setInput('Hedeflerim için enflasyon riskimi hesapla'); sendMessage(new Event('submit') as any); }}
              style={{ whiteSpace: 'nowrap', padding: '6px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', fontSize: '12px', color: '#f59e0b', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              🔥 Enflasyon Riski
            </button>
          </div>

          <div className="ai-chat-input-wrapper">
            <form className="ai-chat-input" onSubmit={sendMessage}>
              <input 
                type="text" 
                placeholder="Asistana bir soru sorun..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isRecording}
              />
              <button type="submit" disabled={!input.trim() || isLoading || isRecording} className="send-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <button 
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isLoading}
              title="Konuşmak için basılı tutun"
            >
              {isRecording ? '🎙️' : '🎤'}
            </button>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button className="ai-chat-fab pulse-animation" onClick={toggleChat} aria-label="Open AI Assistant" style={{ fontSize: '24px' }}>
          ✨
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
