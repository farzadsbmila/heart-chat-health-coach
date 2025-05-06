
import React from "react";
import { useChatContext } from "@/context/ChatContext";
import { Heart, BookOpen, ListChecks, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatView } from "@/types";
import { Button } from "@/components/ui/button";

const ChatHeader: React.FC = () => {
  const { currentView, setCurrentView, clearMessages } = useChatContext();

  const handleViewChange = (value: string) => {
    setCurrentView(value as ChatView);
  };

  return (
    <div className="bg-white border-b px-4 py-2 sticky top-0 z-10 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Heart className="h-5 w-5 mr-2 text-heart" />
          <h1 className="text-lg font-semibold">Heart Health Assistant</h1>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearMessages}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          New Conversation
        </Button>
      </div>

      <Tabs 
        value={currentView} 
        onValueChange={handleViewChange} 
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Heart className="h-4 w-4" /> 
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> 
            <span className="hidden sm:inline">Risk Profile</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-1">
            <ListChecks className="h-4 w-4" /> 
            <span className="hidden sm:inline">Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="coaching" className="flex items-center gap-1">
            <User className="h-4 w-4" /> 
            <span className="hidden sm:inline">Coaching</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ChatHeader;
