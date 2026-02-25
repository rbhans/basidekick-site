import { useState } from 'react';
import { MessageCircle, X, Bot, Send } from 'lucide-react';

function MessengerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi! I'm the BAS Assistant. How can I help you today?",
    },
    {
      sender: 'bot',
      text: 'I can help with point naming, equipment lookup, troubleshooting, and more.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text: inputValue }]);
    setInputValue('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "Thanks for your message! I'm currently in demo mode. Full assistant capabilities coming soon.",
        },
      ]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen && (
        <div className="w-[380px] h-[400px] bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden">
          <div className="h-[56px] bg-[#27272A] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C4F82A] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#0A0A0A]" />
              </div>
              <div>
                <p className="font-grotesk text-[14px] font-bold text-white leading-tight">
                  BAS Assistant
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <span className="font-manrope text-[11px] text-[#A1A1AA]">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#3F3F46] transition-colors"
            >
              <X className="w-4 h-4 text-[#A1A1AA]" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) =>
              msg.sender === 'bot' ? (
                <div key={idx} className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-[#C4F82A] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-[#0A0A0A]" />
                  </div>
                  <div className="bg-[#27272A] rounded-xl rounded-tl-sm px-3 py-2">
                    <p className="font-manrope text-[13px] text-[#A1A1AA] leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex justify-end">
                  <div className="bg-[#C4F82A] rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                    <p className="font-manrope text-[13px] text-[#0A0A0A] leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
          <div className="h-[56px] bg-[#27272A] flex items-center gap-2 px-3 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 h-9 bg-[#0A0A0A] border border-[#27272A] rounded-full px-4 text-[13px] text-white placeholder-[#52525B] font-manrope focus:outline-none focus:border-[#3F3F46]"
            />
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-full bg-[#C4F82A] flex items-center justify-center hover:bg-[#d4ff5a] transition-colors shrink-0"
            >
              <Send className="w-4 h-4 text-[#0A0A0A]" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[52px] h-[52px] rounded-full bg-[#C4F82A] flex items-center justify-center shadow-lg shadow-[#C4F82A]/20 hover:bg-[#d4ff5a] transition-colors ml-auto"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#0A0A0A]" />
        ) : (
          <MessageCircle className="w-6 h-6 text-[#0A0A0A]" />
        )}
      </button>
    </div>
  );
}

export default MessengerWidget;
