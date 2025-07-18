"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';
import { saveChatMessage, getChatHistory, ChatMessage } from '@/lib/database';

interface PdfChatProps {
  pdfSummary: string;
  chatWithPdfFlow: (input: { prompt: string; pdfContent: string; narrativeStyle?: string }) => Promise<{ success: boolean; response?: string; error?: string }>;
  projectId?: string | undefined;
  narrativeStyle?: string;
}

export function PdfChat({ pdfSummary, chatWithPdfFlow, projectId, narrativeStyle = 'Varsayılan' }: PdfChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!projectId) {
        setLoadingHistory(false);
        return;
      }

      setLoadingHistory(true);
      try {
        const history = await getChatHistory(projectId);
        if (history && history.length > 0) {
          setMessages(history.map(msg => ({
            role: msg.role,
            content: msg.content
          })));
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to state
    const newUserMessage = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Save user message to database (only if projectId exists)
    if (projectId) {
      const saved = await saveChatMessage(projectId, 'user', userMessage);
      if (!saved) {
        console.warn('Failed to save user message to database');
      }
    }
    
    setLoading(true);

    try {
      const result = await chatWithPdfFlow({
        prompt: userMessage,
        pdfContent: pdfSummary,
        narrativeStyle: narrativeStyle
      });
      
      // Add assistant message to state
      const assistantMessage = { role: 'assistant' as const, content: result.response || 'Özür dilerim, bir hata oluştu.' };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant response to database (only if projectId exists)
      if (projectId && result.response) {
        const saved = await saveChatMessage(projectId, 'assistant', result.response);
        if (!saved) {
          console.warn('Failed to save assistant response to database');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Özür dilerim, bir hata oluştu. Lütfen tekrar deneyin.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to database (only if projectId exists)
      if (projectId) {
        const saved = await saveChatMessage(projectId, 'assistant', errorMessage.content);
        if (!saved) {
          console.warn('Failed to save error message to database');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="backdrop-blur-md bg-white/95 border border-white/20 rounded-xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-white/20 p-3">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
            <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            PDF İçeriği ile Sohbet
            <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-emerald-200 ml-2"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 p-3 text-sm" ref={scrollAreaRef}>
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  <span className="text-sm text-gray-600">Sohbet geçmişi yükleniyor...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-4 space-y-2">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-gray-900 text-base">PDF ile Sohbete Başlayın!</h3>
                  <p className="text-xs text-gray-600 max-w-xs">
                    PDF içeriği hakkında sorular sorun, detayları öğrenin veya konuyu daha iyi anlayın.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>"Bu konuyu daha basit açıklar mısın?"</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>"Örnekler verebilir misin?"</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>"Bu konu hangi alanlarda kullanılır?"</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                          : 'bg-gradient-to-br from-green-500 to-emerald-500'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={`p-4 rounded-xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'backdrop-blur-sm bg-white/80 text-gray-800 border border-white/40'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="p-4 rounded-xl backdrop-blur-sm bg-white/80 border border-white/40 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          <span className="text-sm text-gray-600">Düşünüyor...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <div className="p-3 border-t border-white/20 bg-gradient-to-r from-white/50 to-blue-50/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="PDF hakkında soru sorun..."
                disabled={loading}
                className="flex-1 backdrop-blur-sm bg-white/80 border-white/40 focus:border-green-300 focus:ring-green-200 text-sm h-8 px-2"
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none shadow-lg h-8 px-3 text-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}