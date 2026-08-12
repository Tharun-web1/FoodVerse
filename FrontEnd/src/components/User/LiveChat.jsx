import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiChevronLeft, FiUser } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import '../UserCss/LiveChat.css';
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const LiveChat = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const username = user ? (user.username || user.name) : 'Tharun';

    // Order Context from location.state
    const orderData = location.state?.order || null;
    const orderId = orderData?.id || orderData?.transaction_id || location.state?.orderId;
    const rawResName = orderData?.restaurantName || location.state?.restaurantName || "Akash Restaurant";
    const restaurantName = rawResName
        ? rawResName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : "Akash Restaurant";

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatEnded, setChatEnded] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [activeOptions, setActiveOptions] = useState(null);

    const agents = [
        { id: 'sarah', name: 'Zomato Support', theme: 'sarah-theme' },
        { id: 'alex', name: 'Bitezy Support', theme: 'alex-theme' }
    ];
    const [activeAgent] = useState(agents[0]);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const replyTimeout = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 50);
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 250);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, activeOptions, showItemSelector]);

    useEffect(() => {
        return () => {
            if (replyTimeout.current) clearTimeout(replyTimeout.current);
        };
    }, []);

    // Initial greeting load
    useEffect(() => {
        if (messages.length === 0) {
            const initialMsgs = [];
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (restaurantName) {
                initialMsgs.push({
                    id: 1,
                    sender: 'agent',
                    text: `Hi ${username}!\nI'm here to help you with your order from ${restaurantName}.`,
                    time: time
                });
                initialMsgs.push({
                    id: 2,
                    sender: 'agent',
                    text: `How can we help you with your order?`,
                    time: time
                });
            } else {
                initialMsgs.push({
                    id: 1,
                    sender: 'agent',
                    text: `Hi ${username}, please select the order for which you seek support.`,
                    time: time
                });
            }

            setMessages(initialMsgs);
            setActiveOptions('MAIN_MENU');
        }
    }, [messages.length, username, restaurantName]);

    const simulateResponse = (text, delay = 1200, callback = null) => {
        setIsTyping(true);
        if (replyTimeout.current) clearTimeout(replyTimeout.current);

        replyTimeout.current = setTimeout(() => {
            const agentMsg = {
                id: Date.now() + Math.random(),
                text: text,
                sender: 'agent',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, agentMsg]);
            setIsTyping(false);
            if (callback) callback();
        }, delay);
    };

    const handleSelectOption = (optionText) => {
        if (chatEnded) return;

        setActiveOptions(null);

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = {
            id: Date.now(),
            text: optionText,
            sender: 'user',
            time: time
        };
        setMessages(prev => [...prev, userMsg]);

        if (optionText.includes("packaging") || optionText.includes("spillage")) {
            simulateResponse(
                `We sincerely apologize for the inconvenience! Food packaging should always reach you in perfect condition.`,
                1000,
                () => {
                    simulateResponse(
                        `Please select the item(s) that were spilled or damaged so we can process a resolution for you:`,
                        1200,
                        () => {
                            setShowItemSelector(true);
                        }
                    );
                }
            );
        } else if (optionText.includes("wrong items")) {
            simulateResponse(
                `We're very sorry about the mix-up in your order from ${restaurantName}!`,
                1000,
                () => {
                    simulateResponse(
                        `Please select the incorrect item(s) you received:`,
                        1200,
                        () => {
                            setShowItemSelector(true);
                        }
                    );
                }
            );
        } else if (optionText.includes("taste, quality") || optionText.includes("quality")) {
            simulateResponse(
                `We regret that the food quality did not meet your expectations today. We take kitchen standards very seriously!`,
                1200,
                () => {
                    simulateResponse(
                        `We have logged your quality feedback directly with ${restaurantName}'s head chef. As a gesture of goodwill, a ₹50 discount voucher has been added to your Bitezy account! 🎁`,
                        1500,
                        () => {
                            setActiveOptions('RE-CHECK');
                        }
                    );
                }
            );
        } else if (optionText.includes("quantity is not satisfactory") || optionText.includes("quantity")) {
            simulateResponse(
                `Thank you for highlighting this. Standard serving sizes are set by ${restaurantName}.`,
                1000,
                () => {
                    simulateResponse(
                        `We have shared your portion feedback with the restaurant partner to ensure consistent serving standards in future orders.`,
                        1200,
                        () => {
                            setActiveOptions('RE-CHECK');
                        }
                    );
                }
            );
        } else if (optionText.includes("not received my order") || optionText.includes("not received")) {
            const isDelivered = orderData?.status === 'DELIVERED';
            if (isDelivered) {
                simulateResponse(
                    `Our records show Order #${orderId || '4'} was marked delivered. If you haven't received it yet, please check at your door, main reception, or with family/neighbors.`,
                    1200,
                    () => {
                        simulateResponse(
                            `If you still cannot locate your order, we will connect you directly with our live support team to investigate with the delivery partner.`,
                            1500,
                            () => {
                                setActiveOptions('CONNECT_AGENT');
                            }
                        );
                    }
                );
            } else {
                simulateResponse(
                    `Your order from ${restaurantName} is actively being processed! Estimated delivery time is approximately ~20 minutes.`,
                    1200,
                    () => {
                        simulateResponse(
                            `Our delivery partner is en route. You can view real-time GPS tracking on the order details page or contact our delivery manager if needed.`,
                            1500,
                            () => {
                                setActiveOptions('RE-CHECK');
                            }
                        );
                    }
                );
            }
        } else if (optionText.toLowerCase().includes("other") || optionText === "More..") {
            simulateResponse(
                `Please type your issue in the message box below (e.g. delivery delay, cold food, cancellation, payment/refund issue). Our AI support manager will analyze and resolve it for you right away!`,
                800,
                () => {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 300);
                }
            );
        } else if (optionText.includes("Talk to live support") || optionText.includes("Connect with Agent")) {
            simulateResponse(
                `Connecting you with a live support executive... Sarah from support team has joined the chat.`,
                1500
            );
        } else {
            simulateResponse(
                `Thank you! Is there anything else we can help you with for your order from ${restaurantName}?`,
                1200,
                () => {
                    setActiveOptions('MAIN_MENU');
                }
            );
        }
    };

    const handleSendItemIssueSubmit = () => {
        if (selectedItems.length === 0) return;
        setShowItemSelector(false);

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = {
            id: Date.now(),
            text: `Reported issue for items: ${selectedItems.join(", ")}`,
            sender: 'user',
            time: time
        };
        setMessages(prev => [...prev, userMsg]);
        setSelectedItems([]);

        simulateResponse(
            `Thank you for providing the item details. We have verified your claim!`,
            1200,
            () => {
                const refundAmount = 179;
                simulateResponse(
                    `🎉 An instant refund of ₹${refundAmount} has been credited to your Bitezy Wallet balance! Reference ID: #RF-${Math.floor(100000 + Math.random() * 900000)}.`,
                    1500,
                    () => {
                        setActiveOptions('RE-CHECK');
                    }
                );
            }
        );
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || chatEnded) return;

        const currentInput = input.trim();
        const lowerInput = currentInput.toLowerCase();
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = {
            id: Date.now(),
            text: currentInput,
            sender: 'user',
            time: time
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Smart dynamic keyword analysis for resolving user custom issue
        if (lowerInput.includes("spill") || lowerInput.includes("damage") || lowerInput.includes("packag") || lowerInput.includes("leak")) {
            simulateResponse(
                `We're very sorry about the packaging or spillage issue!`,
                1000,
                () => {
                    simulateResponse(
                        `Please select the affected item(s) to process an instant wallet refund:`,
                        1200,
                        () => setShowItemSelector(true)
                    );
                }
            );
        } else if (lowerInput.includes("wrong") || lowerInput.includes("miss") || lowerInput.includes("different")) {
            simulateResponse(
                `We apologize for the item mix-up in your order from ${restaurantName}!`,
                1000,
                () => {
                    simulateResponse(
                        `Please select the incorrect item(s) so we can process a full refund:`,
                        1200,
                        () => setShowItemSelector(true)
                    );
                }
            );
        } else if (lowerInput.includes("cold") || lowerInput.includes("taste") || lowerInput.includes("quality") || lowerInput.includes("raw") || lowerInput.includes("stale") || lowerInput.includes("bad")) {
            simulateResponse(
                `We regret that the food quality did not meet your expectations. We take kitchen quality very seriously!`,
                1200,
                () => {
                    simulateResponse(
                        `We have logged your feedback with ${restaurantName}'s head chef and added a ₹50 goodwill voucher to your Bitezy account! 🎁`,
                        1500,
                        () => setActiveOptions('RE-CHECK')
                    );
                }
            );
        } else if (lowerInput.includes("delivery") || lowerInput.includes("where") || lowerInput.includes("delay") || lowerInput.includes("late") || lowerInput.includes("rider")) {
            simulateResponse(
                `We apologize for the delivery delay! We've contacted the delivery partner for Order #${orderId || '4'} and instructed them to expedite your order immediately.`,
                1200,
                () => setActiveOptions('RE-CHECK')
            );
        } else if (lowerInput.includes("cancel")) {
            simulateResponse(
                `We understand you wish to cancel Order #${orderId || '4'}. A 100% refund of ₹179 has been credited to your Bitezy Wallet balance instantly.`,
                1200,
                () => setActiveOptions('RE-CHECK')
            );
        } else if (lowerInput.includes("payment") || lowerInput.includes("money") || lowerInput.includes("charged") || lowerInput.includes("deducted") || lowerInput.includes("refund")) {
            simulateResponse(
                `We've verified your payment query for Order #${orderId || '4'}. Any extra debited amount will be automatically refunded to your Bitezy Wallet within 1-2 business hours.`,
                1200,
                () => setActiveOptions('RE-CHECK')
            );
        } else if (lowerInput.includes("bill") || lowerInput.includes("invoice") || lowerInput.includes("gst") || lowerInput.includes("receipt")) {
            simulateResponse(
                `Your official itemized tax invoice for Order #${orderId || '4'} has been generated and sent to your registered email address!`,
                1200,
                () => setActiveOptions('RE-CHECK')
            );
        } else {
            simulateResponse(
                `Thank you for detailing your issue: "${currentInput}". Priority Support Ticket #TK-${Math.floor(100000 + Math.random() * 900000)} has been created and resolved by our AI support manager!`,
                1500,
                () => setActiveOptions('RE-CHECK')
            );
        }
    };

    const handleEndChat = () => {
        setChatEnded(true);
        setActiveOptions(null);
        setShowItemSelector(false);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: 'system',
                text: 'The conversation has been closed due to inactivity',
                time: time
            }
        ]);
    };

    const sampleOrderItems = orderData?.items || [
        { itemId: 101, itemName: "1 x Mutton Biryani", price: 179 }
    ];

    return (
        <div className="live-chat-page">
            <div className="live-chat-container">
                {/* Zomato Style Header */}
                <div className="chat-header">
                    <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
                        <FiChevronLeft />
                    </button>
                    <div className="agent-info">
                        <div className={`agent-avatar ${activeAgent.theme}`}>
                            <FiUser />
                            <span className="online-status"></span>
                        </div>
                        <div className="agent-details">
                            <h4>{restaurantName ? `${restaurantName} Support` : "FoodVerse Support"}</h4>
                            <span>{orderId ? `Order #${orderId}` : 'Support Online'}</span>
                        </div>
                    </div>
                    <button className="end-chat-header-btn" onClick={handleEndChat} disabled={chatEnded}>
                        End chat
                    </button>
                </div>

                {/* Chat Messages Body */}
                <div className="chat-messages">
                    {messages.map((msg) => {
                        if (msg.sender === 'system') {
                            return (
                                <div key={msg.id} className="system-notice-banner">
                                    <span>{msg.text}</span>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                                <div className="message-bubble">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Interactive Item Selector Card */}
                    {showItemSelector && !chatEnded && (
                        <div className="chat-interactive-card animate__animated animate__fadeIn">
                            <h4 className="card-heading">Select Affected Item(s)</h4>
                            <div className="item-checklist">
                                {sampleOrderItems.map(item => (
                                    <label key={item.itemId || item.id} className="checklist-row">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.itemName)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedItems(prev => [...prev, item.itemName]);
                                                } else {
                                                    setSelectedItems(prev => prev.filter(i => i !== item.itemName));
                                                }
                                            }}
                                        />
                                        <span className="item-label-text">{item.itemName}</span>
                                        <span className="item-price-tag">₹{item.price}</span>
                                    </label>
                                ))}
                            </div>
                            <button
                                className="submit-issue-btn"
                                onClick={handleSendItemIssueSubmit}
                                disabled={selectedItems.length === 0}
                            >
                                Submit Report
                            </button>
                        </div>
                    )}

                    {/* Zomato Support Embedded Interactive Options List */}
                    {activeOptions === 'MAIN_MENU' && !chatEnded && !isTyping && (
                        <div className="zomato-support-card">
                            <div className="zomato-options-list">
                                <button type="button" className="zomato-option-btn" onClick={() => handleSelectOption("I have packaging or spillage issue with my order")}>
                                    I have packaging or spillage issue with my order
                                </button>
                                <button type="button" className="zomato-option-btn" onClick={() => handleSelectOption("I have received wrong items")}>
                                    I have received wrong items
                                </button>
                                <button type="button" className="zomato-option-btn" onClick={() => handleSelectOption("I have food taste, quality or quantity issue with my order")}>
                                    I have food taste, quality or quantity issue with my order
                                </button>
                                <button type="button" className="zomato-option-btn other-btn" onClick={() => handleSelectOption("Other issue (Type your issue)")}>
                                    Other issue (Type your issue)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Secondary Re-check Options */}
                    {(activeOptions === 'RE-CHECK' || activeOptions === 'MORE_OPTIONS' || activeOptions === 'CONNECT_AGENT') && !chatEnded && !isTyping && (
                        <div className="zomato-support-card">
                            <div className="zomato-options-list">
                                <button type="button" className="zomato-option-btn" onClick={() => handleSelectOption("I have another query about this order")}>
                                    I have another query about this order
                                </button>
                                <button type="button" className="zomato-option-btn other-btn" onClick={() => handleSelectOption("Other issue (Type your custom issue)")}>
                                    Other issue (Type your custom issue)
                                </button>
                                <button type="button" className="zomato-option-btn" onClick={() => handleSelectOption("Talk to live support agent")}>
                                    Connect with Live Support Agent
                                </button>
                                <button type="button" className="zomato-option-btn" onClick={handleEndChat}>
                                    No further help needed (End chat)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Agent typing indicator */}
                    {isTyping && (
                        <div className="message-wrapper agent typing">
                            <div className="message-bubble">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="typing-text">Support agent is typing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form className="chat-input-area" onSubmit={handleSend}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={chatEnded ? "Conversation ended" : t("type_message_placeholder")}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={chatEnded}
                    />
                    <button type="submit" className="send-btn" disabled={!input.trim() || chatEnded}>
                        <FiSend />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LiveChat;
