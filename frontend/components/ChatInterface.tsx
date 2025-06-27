'use client';
import {
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import axios from 'axios';

type Message = {
    sender: 'bot' | 'user';
    content: string;
};

export default function ChatBot() {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', content: "👋 Hi! Let's tailor your resume.\nPlease paste your resume below." }
    ]);
    const [step, setStep] = useState<'resume' | 'jd' | 'done'>('resume');
    const [input, setInput] = useState('');
    const [resume, setResume] = useState('');
    const [jd, setJd] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const createMessage = (sender: 'bot' | 'user', content: string): Message => ({ sender, content });
        const updatedMessages = [...messages, createMessage('user', input)];
        setMessages(updatedMessages);

        if (step === 'resume') {
            setResume(input);
            setStep('jd');
            setMessages([
                ...updatedMessages,
                { sender: 'bot', content: '✅ Got it. Now paste the job description.' }
            ]);
        } else if (step === 'jd') {
            setJd(input);
            setStep('done');
            setLoading(true);
            setMessages([
                ...updatedMessages,
                { sender: 'bot', content: '⏳ Analyzing your resume against the job description...' }
            ]);

            try {
                const res = await axios.post('http://localhost:8000/analyze', {
                    resume,
                    job_description: input,
                });
                const { fit_score, missing_keywords, suggestions } = res.data;

                setMessages(prev => [
                    ...prev,
                    { sender: 'bot', content: `⭐ Fit Score: ${fit_score}%` },
                    { sender: 'bot', content: `🔍 Missing Keywords: ${missing_keywords.join(', ') || 'None 🎉'}` },
                    { sender: 'bot', content: `🛠️ Suggestions:\n${suggestions}` }
                ]);
            } catch (err) {
                console.error(err);
                setMessages(prev => [
                    ...prev,
                    { sender: 'bot', content: `❌ Something went wrong. Please try again.` }
                ]);
            } finally {
                setLoading(false);
            }
        }

        setInput('');
    };

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 700,
                mx: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '90vh',
                background: '#f9f9f9',
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            <Typography variant="h5" fontWeight={600} mb={2}>
                💬 Resume Tailor ChatBot
            </Typography>

            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    pr: 1
                }}
            >
                {messages.map((msg, idx) => (
                    <ChatBubble key={idx} sender={msg.sender} content={msg.content} />
                ))}
                {loading && <ChatBubble sender="bot" content={<CircularProgress size={20} />} />}
            </Box>

            <TextField
                multiline
                minRows={2}
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleSend} disabled={loading}>
                                <SendIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mt: 2, background: '#fff', borderRadius: 2 }}
            />
        </Box>
    );
}

function ChatBubble({ sender, content }: { sender: 'bot' | 'user'; content: any }) {
    const isBot = sender === 'bot';

    return (
        <Box display="flex" alignItems="flex-start" gap={1} flexDirection={isBot ? 'row' : 'row-reverse'}>
            <Avatar sx={{ bgcolor: isBot ? 'primary.main' : 'grey.600' }}>
                {isBot ? <SmartToyIcon /> : <PersonIcon />}
            </Avatar>
            <Paper
                elevation={1}
                sx={{
                    p: 1.5,
                    background: isBot ? '#e3f2fd' : '#cfd8dc',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '80%',
                }}
            >
                <Typography variant="body2">{content}</Typography>
            </Paper>
        </Box>
    );
}
