"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
// Import socket.io-client dynamically to avoid SSR issues
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date | string;
}

export function RealTimeChatPanel({ 
  conversationId, 
  currentUserId,
  receiverId,
  initialMessages 
}: { 
  conversationId: string;
  currentUserId: string;
  receiverId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(); // Connects to same origin
    
    newSocket.on("connect", () => {
      newSocket.emit("join_chat", conversationId);
      newSocket.emit("join_user_room", currentUserId);
    });

    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("user_typing", (data: { userId: string, typing: boolean }) => {
      if (data.userId !== currentUserId) {
        setIsTyping(data.typing);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const newMessage = {
      id: Math.random().toString(36).substring(7),
      senderId: currentUserId,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      conversationId,
      receiverId
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage as any]);
    setInput("");
    
    // Stop typing indicator
    socket.emit("typing", { conversationId, userId: currentUserId, typing: false });
    
    // Emit to server
    socket.emit("send_message", newMessage);

    // TODO: In a real app, also POST to an API route to persist in database
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit("typing", { conversationId, userId: currentUserId, typing: e.target.value.length > 0 });
    }
  };

  return (
    <Card glass className="flex flex-col flex-1 border-slate-500/20 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-accent text-ink-950 rounded-br-none' : 'bg-ink-800 text-surface border border-slate-500/30 rounded-bl-none'}`}>
                <p className="text-sm">{msg.content}</p>
                <span className={`text-[10px] block mt-1 ${isMe ? 'text-ink-950/60' : 'text-slate-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-ink-800 border border-slate-500/30 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-slate-500/20 bg-ink-950/50">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-ink-900 border border-slate-500/30 rounded-full px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-accent text-ink-950 rounded-full w-10 h-10 flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity hover:bg-accent/90"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </Card>
  );
}
