import { useState, useRef } from 'react';
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await aiApi.chat(userId ?? 1, userText);
      setMessages(prev => [...prev, { sender: 'ai', text: data }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'error', text: 'Bağlantı hatası: AI Asistan servisine ulaşılamıyor. Lütfen backend\'in çalıştığından emin olun.' }]);
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
      const audioBuffer = await aiApi.chatWithAudio(userId ?? 1, audioBlob);
      
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();

      setMessages(prev => [...prev, { sender: 'ai', text: '🔊 (Sesli yanıt dinleniyor...)' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'error', text: 'Sesli yanıt alınırken hata oluştu.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="ai-chat-wrapper">
      {isOpen && (
        <div className="glass-card ai-chat-window">
          <div className="ai-chat-header">
            <h4>🧠 InWallet AI</h4>
            <button onClick={toggleChat} className="close-btn">×</button>
          </div>
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="chat-bubble ai">Yazıyor...</div>}
          </div>
          <div className="ai-chat-input-wrapper">
            <form className="ai-chat-input" onSubmit={sendMessage}>
              <input 
                type="text" 
                placeholder="Portföyümün durumu nedir?..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isRecording}
              />
              <button type="submit" disabled={isLoading || isRecording}>Gönder</button>
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
        <button className="ai-chat-fab" onClick={toggleChat}>
          ✨
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
