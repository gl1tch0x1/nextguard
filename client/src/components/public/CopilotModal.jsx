import React, { useState } from 'react';
import { BrainCircuit, X, Send } from 'lucide-react';
import { postJson } from '../../api/client.js';

export default function CopilotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi — I’m Nexguard Copilot. Ask me about a security concept, secure coding, or how to approach an authorized lab.'
    }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(null);

  if (!isOpen) return null;

  const sendMessage = async (e) => {
    e?.preventDefault();
    const content = input.trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);

    try {
      const data = await postJson('/assistant', {
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content }))
      });

      if (data.remaining !== undefined && data.remaining !== null) {
        setRemainingQuota(data.remaining);
      }

      const botReply = data.reply + (data.mode === 'demo' ? '\n\n_This is a demo response._' : '');
      setMessages([...nextMessages, { role: 'assistant', content: botReply }]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: err.message || 'I couldn’t reach the assistant API. Ensure the Express server is running and try again.'
        }
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="chat-overlay" role="dialog" aria-modal="true" aria-label="Nexguard learning assistant">
      <div className="chat-window">
        <div className="chat-window-head">
          <div className="mini-avatar">
            <BrainCircuit size={19} />
          </div>
          <div>
            <b>Nexguard Copilot</b>
            <span>EDUCATIONAL SECURITY ASSISTANT</span>
          </div>
          <button onClick={onClose} aria-label="Close assistant">
            <X size={20} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role === 'user' ? 'from-user' : 'from-assistant'}`}>
              <span>{m.role === 'user' ? 'YOU' : 'COPILOT'}</span>
              <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>
            </div>
          ))}

          {busy && (
            <div className="chat-message from-assistant">
              <span>COPILOT</span>
              <p className="typing">
                Thinking<span>.</span><span>.</span><span>.</span>
              </p>
            </div>
          )}
        </div>

        <form className="chat-compose" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a security concept, OWASP risk, or remediation…"
            aria-label="Message"
            maxLength={3000}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send message">
            <Send size={17} />
          </button>
        </form>

        <div className="chat-disclaimer">
          {remainingQuota !== null ? `Daily quota remaining: ${remainingQuota} requests · ` : ''}
          Educational use only. Test only assets you own or are authorized to assess.
        </div>
      </div>
    </div>
  );
}
