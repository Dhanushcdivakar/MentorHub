import { AIChatSession } from "../models/aiChat.model.js";
import { config } from "../config/env.config.js";
import AppError from "../utils/AppError.js";

// Helper system prompt
const SYSTEM_PROMPT = {
  role: "system",
  content: "You are MentorHub AI, a premium, knowledgeable, and encouraging career advisor. You guide students in software engineering, backend/frontend development, interview preparation, resume enhancement, and general tech career growth. Keep your replies structured, clear, and professional. Use markdown formatting when appropriate.",
};

export const getAIChatSessions = async (userId) => {
  // Return sessions sorted by latest update, with message count and latest message preview
  const sessions = await AIChatSession.find({ userId })
    .sort({ updatedAt: -1 })
    .select("_id title createdAt updatedAt messages");
  
  return sessions.map(session => {
    const lastMessage = session.messages.length > 0 ? session.messages[session.messages.length - 1] : null;
    return {
      _id: session._id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      lastMessage: lastMessage ? {
        role: lastMessage.role,
        content: lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? "..." : ""),
        createdAt: lastMessage.createdAt
      } : null
    };
  });
};

export const createAIChatSession = async (userId, title) => {
  const session = await AIChatSession.create({
    userId,
    title: title || "New Chat Session",
    messages: [SYSTEM_PROMPT],
  });
  return session;
};

export const getAIChatSessionDetail = async (userId, sessionId) => {
  const session = await AIChatSession.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new AppError("Chat session not found or unauthorized", 404);
  }
  return session;
};

export const sendAIChatMessage = async (userId, sessionId, content) => {
  const session = await AIChatSession.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new AppError("Chat session not found or unauthorized", 404);
  }

  // Append user message
  session.messages.push({
    role: "user",
    content: content.trim(),
  });

  let assistantReply = "";

  if (!config.huggingfaceApiKey) {
    console.log("[AI Mentor] Hugging Face API key is missing. Using development mock reply.");
    assistantReply = getDevelopmentMockReply(content);
  } else {
    try {
      // Map database messages to format expected by Hugging Face completions endpoint
      const formattedMessages = session.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.huggingfaceApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct",
          messages: formattedMessages,
          max_tokens: 1024,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Mentor] Hugging Face API returned error status ${response.status}:`, errorText);
        assistantReply = "I'm currently having trouble connecting to my brain (Hugging Face server is overloaded or rate-limited). Please try again in a few seconds!";
      } else {
        const data = await response.json();
        assistantReply = data.choices?.[0]?.message?.content || "I received an empty response. Please ask again.";
      }
    } catch (error) {
      console.error("[AI Mentor] Error communicating with Hugging Face API:", error);
      assistantReply = "Oops, I encountered an internal communication error. Let me try to recover. Could you please send your message again?";
    }
  }

  // Append assistant reply
  session.messages.push({
    role: "assistant",
    content: assistantReply
  });

  await session.save();

  return session;
};

export const deleteAIChatSession = async (userId, sessionId) => {
  const result = await AIChatSession.deleteOne({ _id: sessionId, userId });
  if (result.deletedCount === 0) {
    throw new AppError("Chat session not found or unauthorized", 404);
  }
  return { success: true };
};

// Friendly development fallback mock
const getDevelopmentMockReply = (userMessage) => {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes("resume")) {
    return "### 📄 Resume Enhancement Tips\n\nHaving a strong resume is critical! Here are three keys:\n1. **Use Action Verbs:** Start bullet points with strong verbs (e.g., *Built*, *Optimized*, *Architected*).\n2. **Quantify Achievements:** Show results rather than listing responsibilities (e.g., *'Reduced page load time by 40% using code splitting'* instead of *'Responsible for frontend optimization'*).\n3. **Tailor for Keywords:** Scan job listings for key tech stacks and ensure they are prominently listed in your skills section.\n\n*(Note: This is a sandbox response since the Hugging Face API Key is not set yet. Configure it in `.env` to start live chat!)*";
  }
  
  if (msg.includes("backend") || msg.includes("node")) {
    return "### 🛠️ Backend Development Learning Path\n\nTo build robust backend services, I recommend focusing on these topics in order:\n1. **Core Language & Runtime:** Deep dive into JavaScript/Node.js asynchronous event loop, promises, and error handling.\n2. **RESTful API Design:** Understand status codes, route structures, and middleware logic.\n3. **Databases:** Master SQL (PostgreSQL) and NoSQL (MongoDB), database indexing, and query optimization.\n4. **System Architecture:** Learn microservices, caching (Redis), message queues (RabbitMQ), and API Gateways (just like this Mentorship App!).\n\n*(Note: This is a sandbox response since the Hugging Face API Key is not set yet. Configure it in `.env` to start live chat!)*";
  }

  if (msg.includes("interview")) {
    return "### 🤝 Tech Interview Strategy\n\nInterview preparation has three main pillars:\n1. **Data Structures & Algorithms:** Practice arrays, trees, heaps, and dynamic programming on platforms like LeetCode.\n2. **System Design:** Be ready to design scalable services (e.g., how to design a URL shortener, notification system, or chat server).\n3. **Behavioral Questions:** Use the **STAR** method (Situation, Task, Action, Result) to talk about your past challenges and collaborations.\n\n*(Note: This is a sandbox response since the Hugging Face API Key is not set yet. Configure it in `.env` to start live chat!)*";
  }

  return "Hello! I am your **MentorHub AI Career Advisor**. I can guide you through career paths, coding questions, resume writing, or technical interview preparation. \n\nIt looks like the `HUGGINGFACE_API_KEY` is not set in `mentorshipservice/.env`, so I am running in **Development Mock Mode**. Try asking me about **'resume tips'**, **'backend learning path'**, or **'interview prep'** to see my responses, or add a Hugging Face API key to start chatting live!";
};
