import { useEffect } from "react";
import { createChat } from "@n8n/chat";
import "@n8n/chat/style.css";
import "../chat.css"

const Chats = () => {
  useEffect(() => {
    createChat({
      webhookUrl: "https://abdalrahmaan8740.app.n8n.cloud/webhook/4fc1debc-9869-4028-907a-ad596923ccbf/chat",
      webhookConfig: {
        method: "POST",
        headers: {},
      },
      target: "#n8n-chat",
      mode: "window",
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      loadPreviousSession: true,
      showWelcomeScreen: false,
      defaultLanguage: "en",
      initialMessages: [
        "Welcome to Your AI Travel Assistant",
        "I can help you plan your trip",
      ],
      i18n: {
        en: {
          title: "Your AI Travel Assistant",
          subtitle: "Ask anything about travel",
          getStarted: "Start Travel Planning",
          inputPlaceholder: "Ask about travel...",
          footer: "",
          closeButtonTooltip: "Close chat",
        },
      },
      enableStreaming: false,
    });
  }, []);

  return <div id="n8n-chat" />;
};

export default Chats;