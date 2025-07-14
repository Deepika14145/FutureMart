
import React from 'react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import ProductCard from './ProductCard';
import { SendIcon, BotMessageSquareIcon, MicrophoneIcon } from './icons/Icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const AiAssistant: React.FC = () => {
  const [userInput, setUserInput] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const { isListening, startListening, hasRecognitionSupport } = useVoiceRecognition({
    onResult: (transcript) => {
      setUserInput(transcript);
    },
  });

  React.useEffect(() => {
    setMessages([
        {
            id: 'initial-message',
            role: 'model',
            content: "Hello! I'm Jem. How can I help you find the perfect product today?"
        }
    ]);
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const query = (messageText || userInput).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await getChatResponse(query);
      const responseMessages: ChatMessage[] = [];

      if (response.textResponse) {
        responseMessages.push({ id: `model-${Date.now()}`, role: 'model', content: response.textResponse });
      }
      if (response.products && response.products.length > 0) {
        responseMessages.push({ id: `products-${Date.now()}`, role: 'products', products: response.products });
      }

      if (responseMessages.length > 0) {
        setMessages(prev => [...prev, ...responseMessages]);
      } else {
        setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'model', content: "I'm sorry, I couldn't find a response for that. Please try asking in a different way." }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'model', content: error.message || "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };
  
  return (
    <>
      <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-base-100">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'user' && (
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-lg rounded-br-none py-2 px-4 max-w-sm">
                    {msg.content}
                  </div>
                </div>
              )}
              {msg.role === 'model' && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex-shrink-0 bg-neutral rounded-full flex items-center justify-center">
                        <BotMessageSquareIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="bg-neutral text-text-primary rounded-lg rounded-bl-none py-2 px-4 max-w-lg">
                      {msg.content}
                    </div>
                  </div>
                </div>
              )}
              {msg.role === 'products' && (
                <div>
                  <div className="grid grid-cols-1 gap-4 py-2">
                    {msg.products?.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex-shrink-0 bg-neutral rounded-full flex items-center justify-center">
                        <BotMessageSquareIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="bg-neutral text-text-primary rounded-lg rounded-bl-none py-2 px-4">
                        <div className="flex items-center justify-center space-x-1">
                            <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
	                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
	                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t bg-base-100 rounded-b-xl flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
           <div className="relative flex-grow">
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask for products or use mic..."
                className="flex-grow p-3 bg-neutral border-gray-300 rounded-full focus:ring-2 focus:ring-accent focus:outline-none transition-shadow w-full text-text-primary placeholder-text-secondary pr-12"
                disabled={isLoading}
                aria-label="Chat input"
            />
            {hasRecognitionSupport && (
                <button
                    type="button"
                    onClick={startListening}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'bg-error text-white animate-pulse' : 'text-text-secondary hover:bg-neutral'}`}
                    disabled={isLoading}
                    aria-label="Use voice search"
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
            )}
           </div>
          <button
            type="submit"
            className="bg-primary text-white p-3 rounded-full hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            disabled={isLoading || !userInput.trim()}
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </>
  );
};

export default AiAssistant;