
import React, { createContext, useContext, useState, useEffect } from "react";
import { Message, ChatView } from "@/types";

interface ChatContextProps {
  messages: Message[];
  addMessage: (role: "assistant" | "user", content: string) => void;
  currentView: ChatView;
  setCurrentView: (view: ChatView) => void;
  isFirstVisit: boolean;
  setIsFirstVisit: (value: boolean) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentView, setCurrentView] = useState<ChatView>("general");
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error("Error parsing chat history:", error);
      }
    } else {
      // First time greeting
      addMessage(
        "assistant", 
        "Hello! I'm your Heart Health Assistant. I'm here to help you manage your cardiovascular health. How can I assist you today?\n\n• Check your risk profile\n• Get health recommendations\n• Talk to your health coach"
      );
    }

    const visitStatus = localStorage.getItem("isFirstVisit");
    if (visitStatus) {
      setIsFirstVisit(JSON.parse(visitStatus));
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Save first visit status
  useEffect(() => {
    localStorage.setItem("isFirstVisit", JSON.stringify(isFirstVisit));
  }, [isFirstVisit]);

  const addMessage = (role: "assistant" | "user", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      view: currentView,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const clearMessages = () => {
    localStorage.removeItem("chatHistory");
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hello! I'm your Heart Health Assistant. I'm here to help you manage your cardiovascular health. How can I assist you today?\n\n• Check your risk profile\n• Get health recommendations\n• Talk to your health coach",
        timestamp: new Date(),
        view: "general",
      }
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        currentView,
        setCurrentView,
        isFirstVisit,
        setIsFirstVisit,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
