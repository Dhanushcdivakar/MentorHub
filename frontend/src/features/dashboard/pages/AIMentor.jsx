import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  User, 
  Bot, 
  ArrowRight,
  ClipboardList,
  Compass,
  FileText,
  ChevronLeft
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  getAIChatSessions, 
  createAIChatSession, 
  getAIChatSessionDetails, 
  sendAIChatMessage, 
  deleteAIChatSession 
} from "@/api/ai.api";

// Starter Prompts for the Welcome screen
const STARTER_PROMPTS = [
  {
    title: "Backend Roadmap",
    prompt: "What does a modern backend engineer road map look like? What technologies should I learn?",
    icon: Compass,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Resume Enhancer",
    prompt: "Give me tips on how to quantify achievements in my resume to stand out to FAANG recruiters.",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Interview Prep",
    prompt: "How do I prepare for a behavioral system design interview? Give me a quick strategy.",
    icon: ClipboardList,
    color: "from-amber-500 to-orange-500",
  },
];

export default function AIMentor() {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Queries
  const { data: sessionsResponse, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["aiSessions"],
    queryFn: getAIChatSessions,
  });

  const { data: sessionDetailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ["aiSessionDetails", activeSessionId],
    queryFn: () => getAIChatSessionDetails(activeSessionId),
    enabled: !!activeSessionId,
  });

  const sessions = useMemo(() => sessionsResponse?.data || [], [sessionsResponse]);
  const activeSession = useMemo(() => sessionDetailResponse?.data || null, [sessionDetailResponse]);

  // Filter out system prompt from displaying in UI
  const visibleMessages = useMemo(() => {
    if (!activeSession) return [];
    return activeSession.messages.filter((m) => m.role !== "system");
  }, [activeSession]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (visibleMessages.length > 0) {
      scrollToBottom();
    }
  }, [visibleMessages, isDetailLoading]);

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: createAIChatSession,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["aiSessions"] });
      setActiveSessionId(response.data._id);
    },
    onError: () => {
      toast.error("Failed to start new chat session");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, message }) => sendAIChatMessage(sessionId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiSessionDetails", activeSessionId] });
      queryClient.invalidateQueries({ queryKey: ["aiSessions"] });
      setInputMessage("");
    },
    onError: () => {
      toast.error("Failed to get response from AI Mentor");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteAIChatSession,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["aiSessions"] });
      toast.success("Conversation deleted successfully");
      if (activeSessionId === deletedId) {
        setActiveSessionId(null);
      }
    },
    onError: () => {
      toast.error("Failed to delete chat session");
    },
  });

  // Action Handlers
  const handleStartNewChat = (title = "New Chat Session") => {
    createSessionMutation.mutate(title);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      sessionId: activeSessionId,
      message: inputMessage.trim(),
    });
  };

  const handleSelectStarterPrompt = async (promptText, title) => {
    // 1. Create a session with starter title
    createSessionMutation.mutate(title, {
      onSuccess: (res) => {
        // 2. Automatically send the prompt
        sendMessageMutation.mutate({
          sessionId: res.data._id,
          message: promptText,
        });
      }
    });
  };

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] md:rounded-2xl overflow-hidden bg-background md:border md:border-border/40 shadow-xl max-w-7xl mx-auto md:my-4 w-full">
      {/* ==========================================
          SIDEBAR: CHAT HISTORY LIST
      ========================================== */}
      <aside className={`w-full md:w-80 bg-card md:border-r border-border/40 flex flex-col shrink-0 ${activeSessionId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border/40">
          <button
            onClick={() => handleStartNewChat()}
            disabled={createSessionMutation.isPending}
            className="w-full h-11 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 disabled:opacity-70 text-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            New Conversation
          </button>
        </div>

        {/* History Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isSessionsLoading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-muted/40 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <MessageSquare className="h-8 w-8 text-muted-foreground/45 mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">No conversation history yet.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session._id === activeSessionId;
              return (
                <div
                  key={session._id}
                  onClick={() => setActiveSessionId(session._id)}
                  className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                    isActive
                      ? "bg-primary/5 border-primary/20 text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MessageSquare className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/60"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-normal truncate">{session.title}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-medium">
                        {session.lastMessage ? session.lastMessage.content : "Empty chat"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, session._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
                    title="Delete Conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA: CHAT INTERFACE
      ========================================== */}
      <main className={`flex-grow md:flex-1 flex flex-col bg-card/10 backdrop-blur-md relative overflow-hidden ${!activeSessionId ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        {activeSession && (
          <div className="h-16 border-b border-border/40 px-4 md:px-6 flex items-center justify-between bg-card shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              {/* Back Button for Mobile Viewport */}
              <button
                onClick={() => setActiveSessionId(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors mr-1"
                title="Back to History"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground truncate">{activeSession.title}</h2>
                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  AI Career Mentor Active
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {!activeSessionId ? (
            /* ==========================================
                WELCOME / STARTER SCREEN
            ========================================== */
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center px-4 space-y-8">
              <div className="space-y-3">
                <div className="inline-flex bg-gradient-to-r from-primary/10 to-violet-600/10 p-4 rounded-3xl text-primary border border-primary/20 shadow-md">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Meet your{" "}
                  <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                    AI Mentor
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto font-medium">
                  Get instant technical guidance, interview strategies, resume feedback, and learning paths 24/7.
                </p>
              </div>

              {/* Starter Suggestions */}
              <div className="w-full space-y-3">
                <p className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                  Select a topic to start:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {STARTER_PROMPTS.map((starter) => {
                    const Icon = starter.icon;
                    return (
                      <button
                        key={starter.title}
                        onClick={() => handleSelectStarterPrompt(starter.prompt, starter.title)}
                        disabled={createSessionMutation.isPending || sendMessageMutation.isPending}
                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/30 text-left hover:bg-primary/5 transition-all duration-300 shadow-sm group hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${starter.color} text-white shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground leading-none">{starter.title}</h4>
                            <p className="text-[10.5px] text-muted-foreground mt-1 line-clamp-1 font-medium">
                              {starter.prompt}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 group-hover:translate-x-1 duration-200" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : isDetailLoading ? (
            /* ==========================================
                LOADING SCREEN
            ========================================== */
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-muted-foreground">Loading chat details...</p>
              </div>
            </div>
          ) : (
            /* ==========================================
                CHAT MESSAGES AREA
            ========================================== */
            <div className="space-y-6">
              {visibleMessages.length === 0 ? (
                <div className="text-center py-16">
                  <Sparkles className="h-8 w-8 text-primary/45 mx-auto animate-pulse" />
                  <p className="text-xs text-muted-foreground font-semibold mt-2">Send a message to start conversing.</p>
                </div>
              ) : (
                visibleMessages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {/* Avatar */}
                      <div className={`h-8.5 w-8.5 rounded-full shrink-0 flex items-center justify-center border shadow-sm ${
                        isUser 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "bg-gradient-to-r from-primary to-violet-600 border-border/40 text-white"
                      }`}>
                        {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                      </div>

                      {/* Bubble */}
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm font-medium border ${
                        isUser
                          ? "bg-primary text-primary-foreground border-primary rounded-tr-none"
                          : "bg-card border-border/80 text-foreground rounded-tl-none prose prose-slate dark:prose-invert max-w-none"
                      }`}>
                        {/* Render simple markdown structures (lines, lists, code blocks) */}
                        <div className="whitespace-pre-wrap leading-relaxed select-text">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* AI Bouncing loader when typing */}
              {sendMessageMutation.isPending && (
                <div className="flex gap-3 mr-auto max-w-lg">
                  <div className="h-8.5 w-8.5 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-r from-primary to-violet-600 border border-border/40 text-white shadow-sm">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-card border border-border/80 text-foreground rounded-tl-none flex items-center gap-1.5 h-11">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        {activeSessionId && (
          <div className="p-4 border-t border-border/40 bg-card shrink-0">
            <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                placeholder="Ask about resume keywords, interview topics, code bugs..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="flex-grow h-11 px-4 text-xs font-semibold bg-muted/20 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-60 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="h-11 w-11 bg-primary text-primary-foreground hover:bg-primary/95 shrink-0 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
