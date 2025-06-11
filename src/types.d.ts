interface ChatboxConfig {
  primaryColor: string;
  backgroundColor: string;
  title: string;
  welcomeMessage: string;
}

interface Chatbox {
  init: (config: {
    selector: string;
    token: string;
    config: ChatboxConfig;
  }) => void;
}

declare global {
  interface Window {
    Chatbox: Chatbox;
  }
} 