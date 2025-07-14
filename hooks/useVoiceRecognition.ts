
import React from 'react';

// Extend the global Window interface for browsers that use webkit prefix
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Check for SpeechRecognition API support, including vendor prefixes
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

interface VoiceRecognitionHook {
    isListening: boolean;
    startListening: () => void;
    hasRecognitionSupport: boolean;
}

export const useVoiceRecognition = ({ onResult }: { onResult: (result: string) => void }): VoiceRecognitionHook => {
    const [isListening, setIsListening] = React.useState(false);
    const hasRecognitionSupport = !!SpeechRecognitionAPI;

    const startListening = React.useCallback(() => {
        if (!hasRecognitionSupport || isListening) {
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.start();
    }, [hasRecognitionSupport, isListening, onResult]);

    return {
        isListening,
        startListening,
        hasRecognitionSupport,
    };
};