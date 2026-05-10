import { useState } from 'react';
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
          <form className="ai-chat-input" onSubmit={sendMessage}>
            <input 
              type="text" 
              placeholder="Portföyümün durumu nedir?..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>Gönder</button>
          </form>
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
