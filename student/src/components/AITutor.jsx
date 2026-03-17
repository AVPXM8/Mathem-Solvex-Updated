import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Link as LinkIcon } from 'lucide-react';
import MathPreview from './MathPreview';
import api from '../api';
import { Link } from 'react-router-dom';
import styles from './AITutor.module.css';

const AITutor = ({ questionId, question }) => {  // ✅ accept full question object
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi! I am Vivek 👋, your AI Tutor for MCA entrance exams. I can help with Maths, Computer Science, Logical Reasoning, and English. Ask me any doubt about this question!' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null); // ✅ ref to track if input is focused

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Prepare clean history for Gemini API
            const history = messages
                .filter(m => m.role === 'user' || m.role === 'model')
                .slice(1) // skip initial greeting
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            // ✅ Build question context from full question object
            const questionContext = question ? {
                questionText: question.questionText,
                options: question.options,          // includes isCorrect flag
                explanationText: question.explanationText,
                subject: question.subject,
                topic: question.topic,
                exam: question.exam,
                year: question.year,
                difficulty: question.difficulty,
            } : null;

            const res = await api.post('/ai/chat', {
                message: userMsg.text,
                questionId: questionId,
                history: history,
                questionContext: questionContext,    // ✅ send question context
            });

            setMessages(prev => [...prev, { role: 'model', text: res.data.text }]);

            if (res.data.relatedIds && res.data.relatedIds.length > 0) {
                setMessages(prev => [...prev, {
                    role: 'system',
                    isLinks: true,
                    ids: res.data.relatedIds
                }]);
            }

        } catch (err) {
            console.error("AI Chat Error:", err.response?.data || err.message);
            setMessages(prev => [...prev, {
                role: 'model',
                text: "Hey there! I'm just doing a bit of self-improvement so I can help you even better. Please try again after sometime."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation(); // ✅ stop event from reaching page-level keyboard shortcuts
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Launcher Button */}
            {!isOpen && (
                <button className={styles.launcher} onClick={() => setIsOpen(true)}>
                    <Sparkles size={20} />
                    <span>Ask AI Tutor</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.title}>
                            <Bot size={20} /> Vivek — AI Tutor
                        </div>
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.messages} ref={scrollRef}>
                        {messages.map((m, i) => {
                            if (m.isLinks) {
                                return (
                                    <div key={i} className={styles.relatedBox}>
                                        <span className={styles.relatedLabel}>Found similar PYQs:</span>
                                        {m.ids.map(id => (
                                            <Link to={`/question/${id}`} key={id} className={styles.relatedLink}>
                                                <LinkIcon size={12} /> View Related Question
                                            </Link>
                                        ))}
                                    </div>
                                );
                            }
                            return (
                                <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                                    <MathPreview latexString={m.text} />
                                </div>
                            );
                        })}

                        {loading && (
                            <div className={`${styles.message} ${styles.model}`}>
                                <span className={styles.typingDot}></span>
                                <span className={styles.typingDot}></span>
                                <span className={styles.typingDot}></span>
                            </div>
                        )}
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            ref={inputRef}          // ✅ attach ref
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a doubt about this question..."
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AITutor;