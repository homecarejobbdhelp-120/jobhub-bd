import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

interface ChatWindowProps {
  partnerId: string;
  partnerName: string;
  partnerCompany?: string;
  onBack: () => void;
}

const ChatWindow = ({ partnerId, partnerName, partnerCompany, onBack }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        await fetchMessages(user.id);
      }
      setLoading(false);
    };

    initializeChat();
  }, [partnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`chat-${currentUserId}-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${partnerId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's from the partner and to the current user
          if (newMsg.receiver_id === currentUserId) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, partnerId]);

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || sending) return;

    setSending(true);
    try {
      const messageData = {
        sender_id: currentUserId,
        receiver_id: partnerId,
        text: newMessage.trim(),
      };

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Optimistically add the message
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-card rounded-t-lg">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {partnerName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{partnerName}</p>
          {partnerCompany && (
            <p className="text-xs text-muted-foreground truncate">{partnerCompany}</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-card rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
