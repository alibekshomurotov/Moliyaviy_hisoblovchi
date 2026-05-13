import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaTrash, 
  FaCheckCircle, FaExclamationTriangle, FaWifi, FaPlug,
  FaBrain, FaClock
} from 'react-icons/fa';
import { aiService } from '../services/aiService';

function AIAssistant({ transactions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "🤖 **AI Yordamchi faol!**\n\nMen bilan gaplashishingiz mumkin. Savollaringizga real vaqtda javob beraman.\n\n💡 **Misol savollar:**\n• Balans qancha?\n• Qayerga ko'p pul ketgan?\n• Maslahat ber\n• Holatim qanday?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState({
    isOnline: true,
    isThinking: false,
    responseTime: null,
    lastResponse: null
  });
  const messagesEndRef = useRef(null);
  const startTimeRef = useRef(null);

  // AI ulanish holatini tekshirish
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (apiKey && apiKey !== '') {
      setAiStatus(prev => ({ ...prev, isOnline: true }));
    } else {
      setAiStatus(prev => ({ ...prev, isOnline: false }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const userMsgObj = { 
      role: 'user', 
      text: userMessage, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsgObj]);
    setInput('');
    setLoading(true);
    setAiStatus(prev => ({ ...prev, isThinking: true }));
    
    startTimeRef.current = Date.now();

    try {
      const response = await aiService.getResponse(userMessage, transactions);
      const responseTime = Date.now() - startTimeRef.current;
      
      const aiMsgObj = { 
        role: 'ai', 
        text: response, 
        timestamp: new Date(),
        responseTime: responseTime
      };
      setMessages(prev => [...prev, aiMsgObj]);
      
      setAiStatus(prev => ({ 
        ...prev, 
        isThinking: false, 
        responseTime: responseTime,
        lastResponse: new Date()
      }));
      
      // 2 sekunddan keyin response time ni tozalash
      setTimeout(() => {
        setAiStatus(prev => ({ ...prev, responseTime: null }));
      }, 3000);
      
    } catch (error) {
      const aiMsgObj = { 
        role: 'ai', 
        text: "❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.", 
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, aiMsgObj]);
      setAiStatus(prev => ({ ...prev, isThinking: false }));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'ai', text: "🧹 **Suhbat tozalandi!**\n\nYana qanday yordam bera olaman?", timestamp: new Date() }
    ]);
  };

  const quickQuestions = [
    { text: "Balans qancha?", icon: "💰" },
    { text: "Qayerga ko'p pul ketgan?", icon: "📊" },
    { text: "Tejamkorlik bo'yicha maslahat ber", icon: "💡" },
    { text: "Holat", icon: "📈" }
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* AI Button with Status */}
      <motion.button
        className="ai-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <FaBrain />
        <span>AI Yordamchi</span>
        {aiStatus.isOnline ? (
          <span className="status-badge online">
            <FaWifi /> Online
          </span>
        ) : (
          <span className="status-badge offline">
            <FaPlug /> Offline
          </span>
        )}
        {transactions.length > 0 && <span className="badge">{transactions.length}</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-window"
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="ai-header">
              <div className="ai-header-info">
                <FaRobot className="ai-icon" />
                <div>
                  <h3>AI Moliyaviy Yordamchi</h3>
                  <div className="ai-status">
                    {aiStatus.isOnline ? (
                      <span className="status-online">
                        <FaWifi /> Real AI • Faol
                      </span>
                    ) : (
                      <span className="status-offline">
                        <FaPlug /> Offline rejim • Demo
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ai-header-actions">
                <button onClick={clearChat} className="clear-btn" title="Suhbatni tozalash">
                  <FaTrash />
                </button>
                <button onClick={() => setIsOpen(false)} className="close-btn">
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* AI Thinking Animation */}
            {aiStatus.isThinking && (
              <div className="ai-thinking">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>AI fikrlamoqda...</span>
              </div>
            )}

            <div className="ai-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-bubble">
                    {msg.role === 'ai' && <span className="message-avatar">🤖</span>}
                    <div className="message-text">{msg.text}</div>
                    <div className="message-meta">
                      <span className="message-time">
                        <FaClock /> {formatTime(msg.timestamp)}
                      </span>
                      {msg.responseTime && (
                        <span className="response-time">
                          ⚡ {msg.responseTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message ai">
                  <div className="message-bubble typing">
                    <FaSpinner className="spinning" />
                    <span>AI javob yozmoqda...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="quick-questions">
              {quickQuestions.map((q, idx) => (
                <button key={idx} onClick={() => setInput(q.text)}>
                  {q.icon} {q.text}
                </button>
              ))}
            </div>

            <div className="ai-input">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Savolingizni yozing..."
                rows={1}
              />
              <button onClick={sendMessage} disabled={loading}>
                <FaPaperPlane />
              </button>
            </div>

            {/* Status Bar */}
            <div className="ai-footer">
              <div className="connection-status">
                {aiStatus.isOnline ? (
                  <span className="online">
                    <FaCheckCircle /> Real AI ulangan
                  </span>
                ) : (
                  <span className="offline">
                    <FaExclamationTriangle /> API kalit yo'q • Offline rejim
                  </span>
                )}
              </div>
              {aiStatus.lastResponse && (
                <div className="last-response">
                  Oxirgi javob: {formatTime(aiStatus.lastResponse)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIAssistant;