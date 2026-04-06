import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiChevronLeft, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../UserCss/LiveChat.css';
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const LiveChat = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const username = user ? user.username : '';

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [hasSentInitialResponse, setHasSentInitialResponse] = useState(false);
    const [isBotActive, setIsBotActive] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    // Multiple Agent Logic
    const agents = [
        { id: 'sarah', name: t('agent_sarah'), theme: 'sarah-theme' },
        { id: 'alex', name: t('agent_alex'), theme: 'alex-theme' }
    ];
    const [activeAgent, setActiveAgent] = useState(agents[0]);

    useEffect(() => {
        // Pick a random agent on mount
        const randomIdx = Math.floor(Math.random() * agents.length);
        setActiveAgent(agents[randomIdx]);
    }, []); // eslint-disable-line

    const messagesEndRef = useRef(null);
    const botFallbackTimeout = useRef(null);
    const typingTimeout = useRef(null);
    const replyTimeout = useRef(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { 
                    id: 1, 
                    text: t('chat_welcome', { name: username || 'there' }), 
                    sender: 'agent', 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                }
            ]);
        }
    }, [messages.length, t, username]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        return () => {
            if (botFallbackTimeout.current) clearTimeout(botFallbackTimeout.current);
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            if (replyTimeout.current) clearTimeout(replyTimeout.current);
        };
    }, []);

    const simulateResponse = (text, delay = 2000) => {
        setIsTyping(true);
        
        replyTimeout.current = setTimeout(() => {
            const agentMsg = {
                id: Date.now() + Math.random(),
                text: text,
                sender: 'agent',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, agentMsg]);
            setIsTyping(false);
        }, delay);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: input,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input.toLowerCase();
        setInput('');

        // Clear existing reply sequences
        if (replyTimeout.current) clearTimeout(replyTimeout.current);
        setIsTyping(false);

        if (isBotActive) {
            simulateResponse(t("chat_agent_reply_1"), 1500);
            return;
        }

        // Logic for realistic interaction
        if (currentInput.includes("order")) {
            simulateResponse(t("chat_agent_order_help"), 2000);
        } else if (currentInput.includes("delivery") || currentInput.includes("where")) {
            simulateResponse(t("chat_agent_delivery_help"), 2500);
        } else if (currentInput.includes("refund") || currentInput.includes("money") || currentInput.includes("cancel")) {
            simulateResponse(t("chat_agent_refund_help"), 3000);
        } else if (currentInput.includes("thanks") || currentInput.includes("thank you")) {
            simulateResponse(t("chat_agent_thanks"), 1500);
        } else {
            // General or initial response sequence
            if (!hasSentInitialResponse) {
                setHasSentInitialResponse(true);
                simulateResponse(t("chat_agent_reply_2"), 2000);
                
                // Trigger secondary message after first
                setTimeout(() => {
                    simulateResponse(t("chat_agent_ok"), 2500);
                }, 4500);

                // Bot fallback timer
                botFallbackTimeout.current = setTimeout(() => {
                    setIsBotActive(true);
                    simulateResponse(t("chat_bot_reply_1"), 2000);
                }, 120000);
            } else {
                simulateResponse(t("chat_agent_ok"), 1500);
            }
        }
    };

    return (
        <div className="live-chat-page">
            <div className="live-chat-container">
                <div className="chat-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FiChevronLeft />
                    </button>
                    <div className="agent-info">
                        <div className={`agent-avatar ${activeAgent.theme}`}>
                            <FiUser />
                            <span className="online-status"></span>
                        </div>
                        <div className="agent-details">
                            <h4>{activeAgent.name}</h4>
                            <span>{t("online")}</span>
                        </div>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                            <div className="message-bubble">
                                <p>{msg.text}</p>
                                <span className="message-time">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-wrapper agent typing">
                            <div className="message-bubble">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="typing-text">{t("chat_agent_typing", { name: activeAgent.name })}</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder={t("type_message_placeholder")}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="send-btn" disabled={!input.trim()}>
                        <FiSend />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LiveChat;
