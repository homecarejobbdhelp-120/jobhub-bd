import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import ChatWindow from "./ChatWindow";

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_company: string;
  last_message: string;
  created_at: string;
}

interface MessagesTabProps {
  initialPartnerId?: string;
  initialPartnerName?: string;
  initialPartnerCompany?: string;
}

const MessagesTab = ({ initialPartnerId, initialPartnerName, initialPartnerCompany }: MessagesTabProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle initial partner (when coming from a profile's Message button)
  useEffect(() => {
    if (initialPartnerId && initialPartnerName) {
      setSelectedConversation({
        id: initialPartnerId,
        other_user_id: initialPartnerId,
        other_user_name: initialPartnerName,
        other_user_company: initialPartnerCompany || "",
        last_message: "",
        created_at: new Date().toISOString(),
      });
    }
  }, [initialPartnerId, initialPartnerName, initialPartnerCompany]);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch messages where user is sender or receiver
      const { data: messages } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(name, company_name),
          receiver:profiles!messages_receiver_id_fkey(name, company_name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messages) {
        // Group by conversation partner
        const convMap = new Map<string, Conversation>();
        
        messages.forEach((msg: any) => {
          const isReceiver = msg.receiver_id === user.id;
          const otherId = isReceiver ? msg.sender_id : msg.receiver_id;
          const otherUser = isReceiver ? msg.sender : msg.receiver;
          
          if (!convMap.has(otherId)) {
            convMap.set(otherId, {
              id: otherId,
              other_user_id: otherId,
              other_user_name: otherUser?.name || "Unknown",
              other_user_company: otherUser?.company_name || "",
              last_message: msg.text,
              created_at: msg.created_at,
            });
          }
        });

        setConversations(Array.from(convMap.values()));
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    fetchConversations(); // Refresh list to show latest messages
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  // Show chat window if a conversation is selected (mobile: full screen, desktop: side by side)
  if (selectedConversation) {
    return (
      <div className="pb-20 md:pb-0 md:flex md:gap-4">
        {/* Desktop: Show conversation list on the left */}
        <div className="hidden md:block md:w-1/3 space-y-2">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className={`cursor-pointer transition-colors ${
                selectedConversation.id === conv.id
                  ? "bg-accent border-primary"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => handleSelectConversation(conv)}
            >
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {conv.other_user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.other_user_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Chat window */}
        <div className="md:flex-1">
          <ChatWindow
            partnerId={selectedConversation.other_user_id}
            partnerName={selectedConversation.other_user_name}
            partnerCompany={selectedConversation.other_user_company}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="space-y-3">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Messages will appear here when employers accept your applications
              </p>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSelectConversation(conv)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conv.other_user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {conv.other_user_name}
                    </CardTitle>
                    {conv.other_user_company && (
                      <CardDescription className="text-xs truncate">
                        {conv.other_user_company}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {conv.last_message}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
