import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  ChevronLeft,
  Phone,
  Video,
  Send,
  Maximize2
} from "lucide-react";

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online: boolean;
  role?: string;
}

interface QuickChatWidgetProps {
  users: ChatUser[];
  onOpenFullChat?: (user: ChatUser) => void;
}

const QuickChatWidget: React.FC<QuickChatWidgetProps> = ({ users, onOpenFullChat }) => {
  const [expandedUser, setExpandedUser] = useState<ChatUser | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    // Mock send functionality
    setInputValue("");
  };

  return (
    <div className="bg-card border border-border/40 rounded-[1.5rem] p-6 shadow-sm overflow-hidden relative min-h-[220px] flex flex-col justify-center transition-all duration-300">
      <AnimatePresence mode="wait">
        {!expandedUser ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 w-full"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                Quick Chat
              </h3>
              <button className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
                View All
              </button>
            </div>

            {users.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-secondary">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setExpandedUser(user)}
                    className="flex flex-col items-center gap-2 min-w-[70px] group"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 border border-border/50">
                        {user.avatar}
                      </div>
                      {user.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-card rounded-full" />
                      )}
                      {user.unread && user.unread > 0 ? (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-card">
                          {user.unread}
                        </div>
                      ) : null}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
                <button className="flex flex-col items-center gap-2 min-w-[70px] group">
                  <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    New
                  </span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No active users
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-[300px] w-full"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpandedUser(null)}
                  className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {expandedUser.avatar}
                  </div>
                  {expandedUser.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">{expandedUser.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {expandedUser.role || "Online"}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
                  <Video className="w-4 h-4" />
                </button>
                {onOpenFullChat && (
                   <button 
                    onClick={() => onOpenFullChat(expandedUser)}
                    className="p-2 hover:bg-secondary rounded-full text-muted-foreground"
                    title="Open full chat"
                   >
                     <Maximize2 className="w-4 h-4" />
                   </button>
                )}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin mb-4">
              <div className="text-center text-[10px] text-muted-foreground my-2">
                Today, 9:41 AM
              </div>
              <div className="flex justify-start">
                <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] text-foreground/90 shadow-sm">
                  {expandedUser.lastMessage}
                </div>
              </div>
              {/* Mocking some history */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-sm text-sm max-w-[85%] shadow-sm">
                  Sure, I'll take a look right now!
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message ${expandedUser.name.split(" ")[0]}...`}
                className="w-full pl-4 pr-10 py-3 bg-secondary/50 border border-transparent focus:border-border/50 rounded-xl text-sm outline-none transition-all"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 top-2 p-1.5 bg-background shadow-sm rounded-lg text-primary hover:text-primary/80 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickChatWidget;
