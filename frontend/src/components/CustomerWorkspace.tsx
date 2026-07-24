/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Mail, Sparkles, AlertCircle, RefreshCw, MessageSquare, 
  HelpCircle, Star, ThumbsUp, ChevronDown, ChevronRight, CornerDownRight, Check,
  MoreVertical, Trash2, Edit3, ArrowLeft, Mic, MicOff, Volume2, VolumeX, Paperclip, 
  Image as ImageIcon, X, User as UserIcon, Lock, LogOut, ArrowRight, Plus, Globe, Menu, Sidebar, Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Ticket, Message, SentimentType } from "../types";
const EMAIL_REGEX = /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]*[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-])?@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const EmailValidator = {
  validate(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: "Please enter a valid email address." };
    }
    const trimmed = email.trim();
    if (!trimmed) {
      return { isValid: false, error: "Please enter a valid email address." };
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return { isValid: false, error: "Please enter a valid email address." };
    }
    return { isValid: true };
  }
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" }
] as const;

const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    hubTitle: "AI Customer Support Hub",
    hubSubtitle: "Register a support account or sign in to track unresolved issues and chat with our RAG-enabled AI.",
    signIn: "Sign In",
    createAccount: "Create Account",
    fullName: "Full Name",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    signInSecurely: "Sign In Securely",
    registerAccount: "Register Support Account",
    supportThreads: "Support Threads",
    newChat: "New Chat",
    logOut: "Log Out",
    backToLogin: "Back to Login",
    backToList: "Back to List",
    askPlaceholder: "Ask support a question (e.g. refund status, error code...)",
    suggestedFaqs: "Suggested FAQ topics",
    status: "Status",
    priority: "Priority",
    sentiment: "Sentiment",
    listening: "Listening... click to stop",
    voiceAssistant: "Start Voice Assistant",
    resolvedMessage: "This thread is resolved. Need further help? Click 'New Chat' to start another thread.",
    welcomeTitle: "How can we help you today?",
    welcomeSubtitle: "Ask us about refunds, subscription cancellation, password resets, or tracking orders.",
    rateThread: "Rate this support session",
    feedbackThankYou: "Thank you for your feedback!",
    back: "Back"
  },
  te: {
    hubTitle: "AI కస్టమర్ సహాయ కేంద్రం",
    hubSubtitle: "నమోదు చేసుకోండి లేదా లాగిన్ అవ్వండి మరియు మా AIతో చాట్ చేయండి.",
    signIn: "లాగిన్ అవ్వండి",
    createAccount: "ఖాతాను సృష్టించండి",
    fullName: "పూర్తి పేరు",
    emailAddress: "ఈమెయిల్ చిరునామా",
    password: "పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    signInSecurely: "సురક્ષితంగా లాగిన్ అవ్వండి",
    registerAccount: "ఖాతాను నమోదు చేయండి",
    supportThreads: "సహాయక థ్రెడ్‌లు",
    newChat: "కొత్త చాట్",
    logOut: "లాగ్ అవుట్",
    backToLogin: "తిరిగి లాగిన్‌కు",
    backToList: "తిరిగి జాబితాకు",
    askPlaceholder: "సహాయకుడిని అడగండి (ఉదా. రీఫండ్ స్థితి, లోపం కోడ్...)",
    suggestedFaqs: "సూచించబడిన ప్రశ్నలు",
    status: "స్థితి",
    priority: "ప్రాధాన్యత",
    sentiment: "భావోద్వేగం",
    listening: "వింటున్నాము... ఆపడానికి క్లిక్ చేయండి",
    voiceAssistant: "వాయిస్ అసిస్టెంట్ ప్రారంభించండి",
    resolvedMessage: "ఈ చాట్ పూర్తయింది. మరింత సహాయం కోసం 'కొత్త చాట్' పై క్లిక్ చేయండి.",
    welcomeTitle: "మేము మీకు ఈరోజు ఎలా సహాయం చేయగలము?",
    welcomeSubtitle: "రీఫండ్‌లు, సబ్‌స్క్రిప్షన్ రద్దు, పాస్‌వర్డ్ రీసెట్‌లు లేదా ఆర్డర్ ట్రాకింగ్ గురించి మమ్మల్ని అడగండి.",
    rateThread: "ఈ సహాయక సె션을 రేట్ చేయండి",
    feedbackThankYou: "మీ అభిప్రায়ానికి ధನ್ಯവാదాలు!",
    back: "వెనుకకు"
  },
  hi: {
    hubTitle: "AI ग्राहक सहायता केंद्र",
    hubSubtitle: "खाता पंजीकृत करें या लॉग इन करें और हमारे AI के साथ चैट करें।",
    signIn: "साइन इन करें",
    createAccount: "खाता बनाएं",
    fullName: "पूरा नाम",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    signInSecurely: "सुरक्षित साइन इन करें",
    registerAccount: "पंजीकरण करें",
    supportThreads: "सहायता सूत्र",
    newChat: "नया चैट",
    logOut: "लॉग आउट",
    backToLogin: "लॉगिन पर वापस जाएं",
    backToList: "सूची पर वापस जाएं",
    askPlaceholder: "सहायता से पूछें (जैसे रिफंड स्थिति, त्रुटि कोड...)",
    suggestedFaqs: "सुझाए गए विषय",
    status: "स्थिति",
    priority: "प्राथमिकता",
    sentiment: "भावना",
    listening: "सुन रहा हूँ... रोकने के लिए क्लिक करें",
    voiceAssistant: "आवाज सहायक शुरू करें",
    resolvedMessage: "यह चैट हल हो गई है। अतिरिक्त सहायता के लिए 'नया चैट' पर क्लिक करें।",
    welcomeTitle: "आज हम आपकी क्या सहायता कर सकते हैं?",
    welcomeSubtitle: "रिफंड, सदस्यता रद्दीकरण, पासवर्ड रीसेट या ऑर्डर ट्रैकिंग के बारे में पूछें।",
    rateThread: "इस सत्र को रेट करें",
    feedbackThankYou: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    back: "पीछे"
  },
  ta: {
    hubTitle: "AI வாடிக்கையாளர் ஆதரவு மையம்",
    hubSubtitle: "வாடிக்கையாளர் கணக்கை பதிவு செய்யவும் அல்லது உள்நுழையவும்.",
    signIn: "உள்நுழை",
    createAccount: "கணக்கை உருவாக்கு",
    fullName: "முழு பெயர்",
    emailAddress: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்து",
    signInSecurely: "பாதுகாப்பாக உள்நுழைக",
    registerAccount: "கணக்கை பதிவுசெய்",
    supportThreads: "ஆதரவு உரையாடல்கள்",
    newChat: "புதிய அரட்டை",
    logOut: "வெளியேறு",
    backToLogin: "உள்நுழைவுக்குத் திரும்பு",
    backToList: "பட்டியலுக்குத் திரும்பு",
    askPlaceholder: "கேள்வி கேளுங்கள் (எ.கா. ரீஃபண்ட் நிலை, பிழைக் குறியீடு...)",
    suggestedFaqs: "பரிந்துரைக்கப்பட்ட தலைப்புகள்",
    status: "நிலை",
    priority: "முன்னுரிமை",
    sentiment: "மனநிலை",
    listening: "கேட்கிறது... நிறுத்த கிளிக் செய்க",
    voiceAssistant: "குரல் உதவியாளரைத் தொடங்கு",
    resolvedMessage: "இந்த உரையாடல் முடிந்தது. மேலும் உதவிக்கு 'புதிய அரட்டை' கிளிக் செய்யவும்.",
    welcomeTitle: "இன்று நாங்கள் உங்களுக்கு எவ்வாறு உதவலாம்?",
    welcomeSubtitle: "ரீஃபண்டுகள், சந்தா ரத்து, கடவுச்சொல் மீட்டமைப்பு அல்லது ஆர்டர் கண்காணிப்பு பற்றி கேளுங்கள்.",
    rateThread: "இந்த அமர்வை மதிப்பிடவும்",
    feedbackThankYou: "உங்கள் கருத்துக்கு நன்றி!",
    back: "பின்னால்"
  },
  kn: {
    hubTitle: "AI ಗ್ರಾಹಕ ಬೆಂಬಲ ಕೇಂದ್ರ",
    hubSubtitle: "ಖಾತೆಯನ್ನು ನೋಂದಾಯಿಸಿ ಅಥವಾ ಲಾಗ್ ಇನ್ ಮಾಡಿ ಮತ್ತು ನಮ್ಮ AI ನೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ.",
    signIn: "ಸೈನ್ ಇನ್",
    createAccount: "ಖಾತೆ ರಚಿಸಿ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    emailAddress: "ಇಮೇಲ್ ವಿಳಾಸ",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    signInSecurely: "ಸುರಕ್ಷಿತವಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    registerAccount: "ಖಾತೆ ನೋಂದಾಯಿಸಿ",
    supportThreads: "ಬೆಂಬಲ ಥ್ರೆಡ್‌ಗಳು",
    newChat: "ಹೊಸ ಚಾಟ್",
    logOut: "ಲಾಗ್ ಔಟ್",
    backToLogin: "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    backToList: "ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ",
    askPlaceholder: "ಬೆಂಬಲವನ್ನು ಕೇಳಿ (ಉದಾ. ಮರುಪಾವತಿ ಸ್ಥಿತಿ, ದೋಷ ಕೋಡ್...)",
    suggestedFaqs: "ಸೂಚಿಸಲಾದ ವಿಷಯಗಳು",
    status: "ಸ್ಥಿತಿ",
    priority: "ಆದ್ಯತೆ",
    sentiment: "ಭಾವನೆ",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ನಿಲ್ಲಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    voiceAssistant: "ಧ್ವಯಿ ಸಹಾಯಕ ಪ್ರಾರಂಭಿಸಿ",
    resolvedMessage: "ಈ ಚಾಟ್ ಪರಿಹರಿಸಲ್ಪಟ್ಟಿದೆ. ಹೆಚ್ಚಿನ ಸಹಾಯಕ್ಕಾಗಿ 'ಹೊಸ ಚಾಟ್' ಕ್ಲಿಕ್ ಮಾಡಿ.",
    welcomeTitle: "ಇಂದು ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    welcomeSubtitle: "ಮರುಪಾವತಿ, ಚಂದಾದಾರಿಕೆ ರದ್ದತಿ, ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವಿಕೆ ಅಥವಾ ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಬಗ್ಗೆ ಕೇಳಿ.",
    rateThread: "ಈ ಸೆಶನ್ ಅನ್ನು ರೇಟ್ ಮಾಡಿ",
    feedbackThankYou: "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!",
    back: "ಹಿಂದಕ್ಕೆ"
  },
  ml: {
    hubTitle: "AI കസ്റ്റമർ സപ്പോർട്ട് ഹബ്",
    hubSubtitle: "രജിസ്റ്റർ ചെയ്യുക അല്ലെങ്കിൽ ലോഗിൻ ചെയ്യുക, ഞങ്ങളുടെ AI-യുമായി ചാറ്റ് ചെയ്യുക.",
    signIn: "ലോഗിൻ ചെയ്യുക",
    createAccount: "അക്കൗണ്ട് സൃഷ്ടിക്കുക",
    fullName: "പൂർണ്ണമായ പേര്",
    emailAddress: "ഇമെയിൽ വിലാസം",
    password: "പാസ്‌വേഡ്",
    confirmPassword: "പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക",
    signInSecurely: "സുരക്ഷിതമായി ലോഗിൻ ചെയ്യുക",
    registerAccount: "അക്കൗണ്ട് രജിസ്റ്റർ ചെയ്യുക",
    supportThreads: "സപ്പോർട്ട് ത്രെഡുകൾ",
    newChat: "പുതിയ ചാറ്റ്",
    logOut: "ലോഗ് ഔട്ട്",
    backToLogin: "ലോഗിനിലേക്ക് തിരികെ പോകുക",
    backToList: "പട്ടികയിലേക്ക് തിരികെ പോകുക",
    askPlaceholder: "സഹായം ചോദിക്കുക (ഉദാ. റീഫണ്ട് സ്റ്റാറ്റസ്, പിശക് കോഡ്...)",
    suggestedFaqs: "നിർദ്ദേശിച്ച വിഷയങ്ങൾ",
    status: "നില",
    priority: "മുൻഗണന",
    sentiment: "വികാരം",
    listening: "ശ്രദ്ധിക്കുന്നു... നിർത്താൻ ക്ലിക്ക് ചെയ്യുക",
    voiceAssistant: "വോയ്‌സ് അസിസ്റ്റന്റ് ആരംഭിക്കുക",
    resolvedMessage: "ഈ സംഭാഷണം പൂർത്തിയായി. കൂടുതൽ സഹായത്തിന് 'പുതിയ ചാറ്റ്' ക്ലിക്ക് ചെയ്യുക.",
    welcomeTitle: "ഇന്ന് ഞങ്ങൾക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?",
    welcomeSubtitle: "റീഫണ്ടുകൾ, സബ്‌സ്‌ക്രിപ്ഷൻ റദ്ദാക്കൽ, പാസ്‌വേഡ് റീസെറ്റുകൾ അല്ലെങ്കിൽ ഓർഡർ ട്രാക്കിംഗ് എന്നിവയെക്കുറിച്ച് ചോദിക്കുക.",
    rateThread: "ഈ സെഷൻ റേറ്റുചെയ്യുക",
    feedbackThankYou: "നിങ്ങളുടെ ഫീഡ്‌ബാക്കിന് നന്ദി!",
    back: "പിന്നിലേക്ക്"
  }
};

const shouldShowAnalysis = (msg: Message): boolean => {
  if (msg.role !== "customer") return false;

  // 1. If we have conversationalType from GeminiService
  if (msg.conversationalType) {
    return msg.conversationalType === "none";
  }

  // 2. Check intent
  if (msg.intent && ["greeting", "unknown"].includes(msg.intent.toLowerCase())) {
    return false;
  }

  // 3. Robust content analysis
  const clean = msg.content
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()!?\s]+/g, ""); // strip punctuation and spaces

  const skipWords = [
    "hi", "hello", "hey", "goodmorning", "goodafternoon", "goodevening", "goodnight", "yo", "howdy", "hola", "namaste",
    "thanks", "thankyou", "thanku", "muchappreciated", "greatthanks", "thankyousomuch", "thanksalot", "ty", "thanks!",
    "bye", "goodbye", "byebye", "seeyou", "seeya", "seeyoulater", "adios", "farewell",
    "ok", "okay", "cool", "nice", "sure", "awesome", "perfect", "good", "great", "yes", "no", "okaythanks", "okaythankyou"
  ];

  if (skipWords.includes(clean)) {
    return false;
  }

  // Check for common off-topic keywords (e.g. joke, marry, color)
  const lowerContent = msg.content.toLowerCase();
  if (
    lowerContent.includes("tell me a joke") ||
    lowerContent.includes("tell a joke") ||
    lowerContent.includes("favorite color") ||
    lowerContent.includes("wanna marry") ||
    lowerContent.includes("want to marry")
  ) {
    return false;
  }

  // Pure emoji detection (e.g., 👍, 😊, 👋, etc.)
  const lettersRegex = /[a-zA-Z0-9\u0900-\u0D7F]/; // English + Indian language scripts
  if (!lettersRegex.test(msg.content)) {
    return false;
  }

  return true;
};

export interface CustomerWorkspaceProps {
  isRegistered?: boolean;
  setIsRegistered?: (val: boolean) => void;
}

export function CustomerWorkspace({
  isRegistered: propIsRegistered,
  setIsRegistered: propSetIsRegistered
}: CustomerWorkspaceProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; email: string; name: string } | null>(null);

  const [localIsRegistered, setLocalIsRegistered] = useState(false);
  const isRegistered = propIsRegistered !== undefined ? propIsRegistered : localIsRegistered;
  const setIsRegistered = propSetIsRegistered !== undefined ? propSetIsRegistered : setLocalIsRegistered;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "te" | "hi" | "ta" | "kn" | "ml">("en");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<string | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Audio and Image Attachment States
  const [isListening, setIsListening] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Ticket | null>(null);
  const [showRenameModal, setShowRenameModal] = useState<Ticket | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search popup and query state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Search and relevance calculation for previous chats
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    const query = searchQuery.toLowerCase().trim();
    const keywords = query.split(/\s+/).filter(Boolean);

    const scored = tickets.map((ticket) => {
      let score = 0;
      const titleLower = (ticket.title || "").toLowerCase();
      const catLower = (ticket.category || "").toLowerCase();
      const idLower = (ticket.id || "").toLowerCase();

      if (titleLower.includes(query)) {
        score += 25;
      }
      keywords.forEach((kw) => {
        if (titleLower.includes(kw)) {
          score += 10;
        }
      });

      if (catLower.includes(query)) {
        score += 15;
      }
      keywords.forEach((kw) => {
        if (catLower.includes(kw)) {
          score += 5;
        }
      });

      if (idLower.includes(query)) {
        score += 20;
      }

      let messageMatchCount = 0;
      (ticket.messages || []).forEach((msg) => {
        const msgContentLower = (msg.content || "").toLowerCase();
        if (msgContentLower.includes(query)) {
          score += 8;
          messageMatchCount++;
        }
        keywords.forEach((kw) => {
          if (msgContentLower.includes(kw)) {
            score += 3;
          }
        });
      });

      return { ticket, score, messageMatchCount };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.ticket);
  }, [tickets, searchQuery]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackAction = () => {
    if (activeTicket && window.innerWidth < 1024) {
      setActiveTicket(null);
    } else {
      setIsRegistered(false);
    }
  };

  // Adjust sidebar state based on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    // Initialize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Suggested FAQ topics
  const quickFaqs = [
    { label: "Refund Timeline", query: "How long does a refund take?" },
    { label: "Cancel Subscription", query: "I want to cancel my premium subscription" },
    { label: "Calendar Sync Error", query: "I am getting a Google Calendar sync error CAL-403" },
    { label: "Failed Charges", query: "What happens if a subscription payment fails?" },
  ];

  // Fetch tickets for registered user
  const fetchUserHistory = async (userEmail: string, keepActiveId?: string | null) => {
    try {
      const response = await fetch(`/api/history?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json() as Ticket[];
        setTickets(data);
        
        // Determine which ticket should be active
        const targetId = keepActiveId !== undefined ? keepActiveId : activeTicket?.id;
        if (targetId) {
          const currentStillExists = data.find(t => t.id === targetId);
          if (currentStillExists) {
            setActiveTicket(currentStillExists);
          } else if (data.length > 0) {
            setActiveTicket(data[0]);
          } else {
            setActiveTicket(null);
          }
        } else {
          if (keepActiveId === null) {
            setActiveTicket(null);
          } else if (data.length > 0) {
            setActiveTicket(data[0]);
          } else {
            setActiveTicket(null);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load user history:", err);
    }
  };

  useEffect(() => {
    if (isRegistered && email) {
      // For a fresh login/registration, start with a completely new chat (keepActiveId = null)
      fetchUserHistory(email, null);
    }
  }, [isRegistered]);

  // Global click listener to close open ticket menus and profile dropdown
  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenMenuId(null);
      setProfileDropdownOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.messages, isTyping]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!email.trim() || !password.trim()) {
      setAuthError("Email and password are required.");
      return;
    }

    try {
      const response = await fetch("https://ai-customer-support-assistant-d4br.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setLoggedInUser(data.user);
        setEmail(data.user.email);
        setName(data.user.name);
        setIsRegistered(true);
        
        // Fetch history and start with a completely NEW CHAT (setActiveTicket(null))
        try {
          const histRes = await fetch(`/api/history?email=${encodeURIComponent(data.user.email)}`);
          if (histRes.ok) {
            const histData = await histRes.json() as Ticket[];
            setTickets(histData);
          }
          setActiveTicket(null); // start fresh
        } catch (hErr) {
          console.error("Failed to fetch history on login:", hErr);
          setActiveTicket(null);
        }
      } else {
        setAuthError(data.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login connection error:", err);
      setAuthError("Could not connect to authentication server.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setAuthError("All registration fields are required.");
      return;
    }

    const trimmedEmail = email.trim();
    const emailValidation = EmailValidator.validate(trimmedEmail);
    if (!emailValidation.isValid) {
      setAuthError(emailValidation.error || "Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("https://ai-customer-support-assistant-d4br.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          password: password.trim(),
          confirmPassword: confirmPassword.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAuthSuccess("Registration successful. Please log in below.");
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        setAuthError(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration connection error:", err);
      setAuthError("Could not connect to registration server.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("https://ai-customer-support-assistant-d4br.onrender.com/api/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed:", e);
    }
    // Clean all user states completely
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setTickets([]);
    setActiveTicket(null);
    setLoggedInUser(null);
    setAuthError("");
    setAuthSuccess("");
    setIsRegistered(false);
    setAttachedImage(null);
    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(null);
    }
  };

  // Speech to Text transcription
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    
    const langMap: Record<string, string> = {
      en: "en-US",
      te: "te-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      ml: "ml-IN"
    };
    rec.lang = langMap[language] || "en-US";

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        setInputMsg(transcript);
        // Automatically send the recognized text
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 800);
      }
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Text to Speech playback
  const speakMessage = (msgId: string, text: string) => {
    if (isPlayingTTS === msgId) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown bold blocks, emojis, etc. for cleaner utterance
    const cleanText = text
      .replace(/\*\*|###|#|\*/g, "")
      .replace(/[`_]/g, "")
      .replace(/[^\w\s\d.,!?'"\u0900-\u0D7F]/g, ""); // retain hindi, tamil, telugu, etc. unicode

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setIsPlayingTTS(null);
    };
    utterance.onerror = () => {
      setIsPlayingTTS(null);
    };

    setIsPlayingTTS(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Image upload base64 converter
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(",")[1];
      setAttachedImage({
        data: base64Data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend && !attachedImage) return;
    if (isLoading) return;

    setIsLoading(true);
    setIsTyping(true);
    setInputMsg("");

    const payload = {
      ticketId: activeTicket?.id || undefined,
      message: textToSend,
      customerName: loggedInUser?.name || name || "Anonymous Customer",
      customerEmail: loggedInUser?.email || email || "anonymous@example.com",
      customerId: loggedInUser?.id || (email ? `u-${email.replace(/[^a-zA-Z0-9]/g, "")}` : "u-anonymous"),
      image: attachedImage ? {
        data: attachedImage.data,
        mimeType: attachedImage.mimeType
      } : undefined,
      language: language
    };

    // Clean attachment preview right away
    setAttachedImage(null);

    try {
      const response = await fetch("https://ai-customer-support-assistant-d4br.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Re-fetch history to sync backend ticket adjustments and keep active
          await fetchUserHistory(loggedInUser?.email || email, data.ticket.id);
        }
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to process chat. Check inputs.");
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleCreateNewTicket = () => {
    setActiveTicket(null);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleRateTicket = async (ticketId: string, ratingValue: number) => {
    try {
      const response = await fetch(`/api/ticket/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratingValue, status: "resolved" })
      });
      if (response.ok) {
        setRatingSubmitted(ticketId);
        const data = await response.json();
        await fetchUserHistory(email, data.ticket.id);
      }
    } catch (err) {
      console.error("Failed to rate ticket:", err);
    }
  };

  const handleRenameTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameModal || !renameTitle.trim() || isSavingRename) return;

    setIsSavingRename(true);
    try {
      const response = await fetch(`/api/ticket/${showRenameModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameTitle.trim() })
      });
      if (response.ok) {
        const data = await response.json();
        await fetchUserHistory(email, showRenameModal.id);
        setShowRenameModal(null);
      } else {
        alert("Failed to rename conversation.");
      }
    } catch (err) {
      console.error("Rename ticket error:", err);
    } finally {
      setIsSavingRename(false);
    }
  };

  const handleDeleteTicketSubmit = async () => {
    if (!showDeleteConfirm || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ticket/${showDeleteConfirm.id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const remaining = tickets.filter(t => t.id !== showDeleteConfirm.id);
        const nextActiveId = remaining.length > 0 ? remaining[0].id : null;
        await fetchUserHistory(email, nextActiveId);
        setShowDeleteConfirm(null);
      } else {
        alert("Failed to delete conversation.");
      }
    } catch (err) {
      console.error("Delete ticket error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to render sentiment emoji pill
  const getSentimentPill = (sentiment?: SentimentType) => {
    if (!sentiment) return null;
    let icon = "😐";
    let text = "Neutral";
    let color = "bg-slate-50 text-slate-700 border-slate-200";

    switch (sentiment) {
      case "positive":
        icon = "😊";
        text = "Positive Accent";
        color = "bg-emerald-50 text-emerald-700 border-emerald-150";
        break;
      case "frustrated":
        icon = "😟";
        text = "Frustrated State";
        color = "bg-amber-50 text-amber-700 border-amber-150 animate-pulse";
        break;
      case "negative":
        icon = "😣";
        text = "Negative Sentiment";
        color = "bg-orange-50 text-orange-700 border-orange-150 animate-pulse";
        break;
      case "angry":
        icon = "😠";
        text = "Escalated Conflict";
        color = "bg-red-50 text-red-700 border-red-150 animate-pulse font-semibold";
        break;
      case "urgent":
        icon = "🚨";
        text = "High Priority";
        color = "bg-rose-50 text-rose-700 border-rose-150 animate-pulse font-semibold";
        break;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${color}`}>
        <span>{icon}</span>
        <span>{text}</span>
      </span>
    );
  };

  if (!isRegistered) {
    const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
    return (
      <div id="customer-register-gate" className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="bg-gradient-to-b from-blue-50/50 to-white px-6 py-7 text-center relative border-b border-slate-100">
          <div className="absolute top-3 right-3 z-50">
            {/* Elegant Language Selector */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLangDropdownOpen(!langDropdownOpen);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>{LANGUAGES.find(l => l.code === language)?.label.split(" ")[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-150 rounded-xl shadow-xl py-1 z-50 text-[11px]">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between transition-all cursor-pointer ${language === lang.code ? "text-blue-600 font-bold bg-blue-50/20" : "text-slate-600"}`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
            <Sparkles className="w-24 h-24 text-blue-600" />
          </div>
          <div className="mx-auto w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 mb-3 shadow-sm">
            <Sparkles className="w-5.5 h-5.5 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{t.hubTitle}</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed px-4">
            {t.hubSubtitle}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/30"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/30"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.createAccount}
            </button>
          </div>

          {/* Validation Alerts */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs rounded-xl flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.emailAddress}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john.doe@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{t.signInSecurely}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.fullName}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.emailAddress}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john.doe@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t.confirmPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{t.registerAccount}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  return (
    <div className={`relative flex h-[calc(100vh-180px)] min-h-[580px] overflow-visible w-full transition-all duration-300 ${sidebarOpen ? "lg:gap-6" : "lg:gap-0"}`}>
      
      {/* Mobile/Tablet Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* 1. Customer Sidebar (Ticket threads) - SOFTER SLATE-BLUE (#1E293B) THEME */}
      <div 
        className={`flex flex-col overflow-visible transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 ${
          sidebarOpen 
            ? "w-72 sm:w-80 lg:w-80 opacity-100 pointer-events-auto" 
            : "w-12 lg:w-12 opacity-100 pointer-events-auto"
        } lg:relative lg:inset-y-auto lg:left-auto lg:z-auto lg:h-full`}
      >
        {/* Sidebar Inner Container (styled visual box) */}
        <div 
          className="w-72 sm:w-80 lg:w-80 h-full bg-[#1E293B] shadow-2xl lg:shadow-xl flex flex-col overflow-hidden rounded-r-2xl lg:rounded-2xl border border-slate-700/50 transition-all duration-300 ease-in-out"
          style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(calc(-100% + 48px))' }}
        >
        {/* Sidebar Header Brand */}
        <div className="p-4 border-b border-slate-700/50 bg-[#1e293b]/50 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse flex-shrink-0" />
            <span className="text-sm font-bold text-white tracking-wide truncate">{t.supportThreads}</span>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Search conversations"
            >
              <Search className="w-4 h-4 text-slate-300" />
            </button>

            {/* Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Sidebar className={`w-4.5 h-4.5 text-slate-300 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180 text-blue-400"}`} />
            </button>
          </div>
        </div>

        {/* ChatGPT New Chat Button */}
        <div className="p-3 border-b border-slate-700/50 flex-shrink-0 bg-[#1e293b]/20">
          <button 
            onClick={handleCreateNewTicket}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold"
            title="New Chat"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400 leading-relaxed">No support tickets found. Start a new chat to begin!</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const isActive = activeTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setActiveTicket(ticket);
                    setRatingSubmitted(null);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 border cursor-pointer relative group shadow-sm border-l-4 ${
                    isActive 
                      ? "bg-[#475569] border-slate-600/40 border-l-[#2563EB] text-white shadow-md" 
                      : "bg-[#334155] border-slate-700/30 border-l-transparent hover:bg-[#3e4f64] hover:border-slate-600/30 text-slate-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="font-mono text-[10px] text-slate-400">{ticket.id}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-extrabold tracking-wider truncate ${
                        ticket.status === "resolved" 
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                          : ticket.status === "escalated"
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/20 animate-pulse"
                          : "bg-blue-500/15 text-blue-300 border-blue-500/20"
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    {/* Three-dot menu button */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === ticket.id ? null : ticket.id);
                        }}
                        className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === ticket.id && (
                        <div 
                          className="absolute right-0 mt-1 w-32 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setRenameTitle(ticket.title);
                              setShowRenameModal(ticket);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDeleteConfirm(ticket);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-all border-t border-slate-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className={`text-xs font-bold line-clamp-2 break-words whitespace-normal leading-relaxed mb-2 ${isActive ? "text-white" : "text-slate-100"}`}>{ticket.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span className="font-semibold text-blue-300">{ticket.category}</span>
                    <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ChatGPT Profile action footer */}
        <div className="mt-auto border-t border-slate-700/50 bg-[#161F30] p-3.5 relative flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setProfileDropdownOpen(!profileDropdownOpen);
            }}
            className="w-full flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                {(loggedInUser?.name || name || "U").substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">{loggedInUser?.name || "Support Customer"}</h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{loggedInUser?.email || email}</p>
              </div>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div 
              className="absolute bottom-full left-3.5 right-3.5 mb-2 bg-[#1E293B] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3.5 py-1.5 border-b border-slate-700/50 text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                User Account
              </div>
              <div className="px-3.5 py-2 text-slate-200 border-b border-slate-700/50 flex flex-col gap-0.5">
                <span className="font-bold text-white text-xs truncate">{loggedInUser?.name || name}</span>
                <span className="text-[10px] text-slate-400 truncate">{loggedInUser?.email || email}</span>
              </div>
              
              <div className="px-3.5 py-2 text-slate-300 flex items-center gap-2.5">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Profile Status: Active</span>
              </div>

              <div className="px-3.5 py-2 text-slate-300 flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Region: Global</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3.5 py-2.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2.5 transition-all border-t border-slate-700/50 font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{t.logOut}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* 2. Main Chat Panel - WHITE COLOR PALETTE WITH LIGHT BLUE ACCENTS */}
      <div className={`flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-md flex flex-col overflow-hidden h-full ${!activeTicket ? "hidden lg:flex" : "flex"} transition-all duration-300`}>
        {/* Active Ticket Header details */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* AI/Ticket Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold font-mono text-sm shadow-sm flex-shrink-0">
              {activeTicket ? "TK" : "AI"}
            </div>
            
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-xs md:max-w-sm">
                  {activeTicket ? activeTicket.title : "Direct Consultation Room"}
                </h2>
                {activeTicket && (
                  <>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 flex-shrink-0">
                      Ticket ID: {activeTicket.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-extrabold tracking-wider flex-shrink-0 ${
                      activeTicket.status === "resolved" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : activeTicket.status === "escalated"
                        ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      Status: {activeTicket.status}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {activeTicket 
                  ? `Customer: ${activeTicket.customerName || loggedInUser?.name || name || "Customer"}` 
                  : "Grounding responses via Real-time Vector Knowledge Retrieval"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Assistant Status Banner */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>AI Support Active</span>
            </div>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {!activeTicket ? (
            <div className="max-w-md mx-auto my-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 mb-4 shadow-sm">
                <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.welcomeTitle}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {t.welcomeSubtitle}
              </p>
              <div className="mt-8 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm text-left">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>{t.suggestedFaqs}</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {quickFaqs.map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(faq.query)}
                      className="text-left text-xs p-3 bg-slate-50 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl text-slate-600 border border-slate-200/60 hover:border-blue-200/50 transition-all flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{faq.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/60 border border-blue-100/70 rounded-2xl flex items-start gap-3 text-xs text-blue-800 shadow-sm">
                <Sparkles className="w-4.5 h-4.5 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="leading-relaxed">
                  <span className="font-bold">AI Assistant Active Status:</span> Every reply is cross-referenced with local vector knowledge embeddings. If confidence falls below 75%, tickets are marked for agent dispatch.
                </div>
              </div>

              {activeTicket.messages.map((msg, index) => {
                const isCustomer = msg.role === "customer";
                const isSystem = msg.role === "system";
                
                if (isSystem) return null;

                // Priority colors
                const priorityColors: Record<string, string> = {
                  low: "bg-slate-100 text-slate-700 border-slate-200",
                  medium: "bg-blue-50 text-blue-700 border-blue-200/60",
                  high: "bg-amber-50 text-amber-800 border-amber-200/60",
                  urgent: "bg-rose-50 text-rose-700 border-rose-200/60 animate-pulse"
                };

                // Sentiment emoji & styling mapping
                const sentimentData: Record<string, { emoji: string; style: string }> = {
                  positive: { emoji: "😊", style: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
                  neutral: { emoji: "😐", style: "bg-slate-100 text-slate-700 border-slate-200" },
                  negative: { emoji: "😞", style: "bg-rose-50 text-rose-700 border-rose-200/60" },
                  frustrated: { emoji: "😠", style: "bg-amber-50 text-amber-700 border-amber-200/60" },
                  angry: { emoji: "😡", style: "bg-red-50 text-red-700 border-red-200/60" },
                  urgent: { emoji: "🚨", style: "bg-indigo-50 text-indigo-700 border-indigo-200/60" }
                };

                const sentimentMeta = msg.sentiment 
                  ? (sentimentData[msg.sentiment.toLowerCase()] || { emoji: "😐", style: "bg-slate-100 text-slate-700 border-slate-200" })
                  : (activeTicket.sentiment ? (sentimentData[activeTicket.sentiment.toLowerCase()] || { emoji: "😐", style: "bg-slate-100 text-slate-700 border-slate-200" }) : { emoji: "😐", style: "bg-slate-100 text-slate-700 border-slate-200" });

                return (
                  <React.Fragment key={msg.id || index}>
                    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${isCustomer ? "order-1" : "order-2"}`}>
                        {/* Avatar name header */}
                        <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 ${isCustomer ? "justify-end" : "justify-start"}`}>
                          <span className="font-bold text-slate-700">
                            {isCustomer ? (loggedInUser?.name || name || "Customer") : msg.role === "admin" ? "Staff Coordinator" : "Support AI Assistant"}
                          </span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {!isCustomer && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => speakMessage(msg.id || `${index}`, msg.content)}
                                className="p-0.5 hover:bg-slate-150 rounded text-slate-400 hover:text-blue-600 transition-all cursor-pointer inline-flex items-center gap-0.5"
                                title={isPlayingTTS === (msg.id || `${index}`) ? "Stop speaking" : "Speak message"}
                              >
                                {isPlayingTTS === (msg.id || `${index}`) ? (
                                  <VolumeX className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>

                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          isCustomer 
                            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-500/5" 
                            : msg.role === "admin"
                            ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none shadow-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                        }`}>
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {/* RAG Citations for AI messages */}
                          {!isCustomer && msg.role !== "admin" && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                              <div className="flex items-center gap-1.5 text-blue-600 font-bold cursor-pointer select-none hover:text-blue-700"
                                onClick={() => setExpandedCitations(expandedCitations === msg.id ? null : msg.id)}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Grounded FAQ References</span>
                                {expandedCitations === msg.id ? <ChevronDown className="w-3 h-3 text-blue-500" /> : <ChevronRight className="w-3 h-3 text-blue-500" />}
                              </div>
                              
                              {expandedCitations === msg.id && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-2 text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs"
                                >
                                  <p className="font-bold text-slate-700">Consulted Knowledge Sources:</p>
                                  <div className="space-y-1 mt-1">
                                    {msg.citations && msg.citations.length > 0 ? (
                                      msg.citations.map((cit, cIdx) => (
                                        <div key={cIdx} className="flex items-start gap-1">
                                          <span className="text-blue-500 font-bold">•</span>
                                          <span>{cit}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-slate-400 italic">No specific external source citation required.</span>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isCustomer && shouldShowAnalysis(msg) && (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-slate-50/95 border border-slate-200/50 rounded-2xl p-3 shadow-sm w-full mt-1 mb-3 animate-fade-in">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 pb-1.5 mb-2.5">
                            <span className="text-xs">📊</span>
                            <span>Message Analysis</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">📂</span>
                              <div>
                                <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider leading-none mb-0.5">Category</span>
                                <span className="font-semibold text-slate-700 text-[11px]">{msg.category || activeTicket.category || "General Inquiry"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">⚡</span>
                              <div>
                                <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider leading-none mb-0.5">Priority</span>
                                <span className={`inline-flex items-center px-1 py-0.2 rounded text-[9px] font-bold capitalize ${priorityColors[(msg.priority || activeTicket.priority || "medium").toLowerCase()] || "bg-slate-100"}`}>
                                  {msg.priority || activeTicket.priority || "medium"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">🎯</span>
                              <div>
                                <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider leading-none mb-0.5">Intent</span>
                                <span className="font-semibold text-slate-700 text-[11px]">{msg.intent || "General Question"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{sentimentMeta.emoji}</span>
                              <div>
                                <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider leading-none mb-0.5">Sentiment</span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${sentimentMeta.style}`}>
                                  {msg.sentiment || activeTicket.sentiment || "neutral"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Customer Resolution Star Rating Prompt */}
        {activeTicket && activeTicket.status === "resolved" && (
          <div className="bg-emerald-50 border-t border-emerald-100 px-4 py-3.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-800 font-semibold">This thread has been resolved. Please rate your assistance:</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {activeTicket.satisfactionRating ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= activeTicket.satisfactionRating! ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} 
                    />
                  ))}
                  <span className="text-xs text-amber-500 font-bold ml-1.5">Rated {activeTicket.satisfactionRating}/5</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateTicket(activeTicket.id, star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-5 h-5 transition-colors ${
                          star <= (hoverRating ?? 0) 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-slate-300 hover:text-amber-400"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input box bottom panel */}
        <div className="p-4 border-t border-slate-100 bg-white">
          {activeTicket && activeTicket.status === "resolved" ? (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-500">
              This thread is resolved. Need further help? Click <span className="font-semibold text-blue-600 cursor-pointer hover:underline" onClick={handleCreateNewTicket}>"New Chat"</span> to start another thread.
            </div>
          ) : (
            <div className="space-y-3">
              {attachedImage && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-600 w-fit max-w-full">
                  <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate max-w-[180px] font-medium">{attachedImage.name}</span>
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="p-1 hover:bg-slate-250 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 flex-nowrap w-full">
                {/* Hidden input for selecting images */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Image attachment button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                  title="Attach an image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Speech-to-Text toggle button */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer flex-shrink-0 ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                  title={isListening ? t.listening : t.voiceAssistant}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputMsg}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputMsg)}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder={t.askPlaceholder}
                  className="flex-1 min-w-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                />

                {/* Elegant Language Selector */}
                <div className="relative inline-block text-left flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLangDropdownOpen(!langDropdownOpen);
                    }}
                    className="flex items-center gap-1.5 px-3 py-3 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm cursor-pointer h-[44px]"
                    title="Select Language"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.label.split(" ")[0]}</span>
                    <span className="sm:hidden">{language.toUpperCase()}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  </button>

                  {langDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white border border-slate-150 rounded-xl shadow-xl py-1 z-50 text-xs">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between transition-all cursor-pointer ${language === lang.code ? "text-blue-600 font-bold bg-blue-50/20" : "text-slate-600"}`}
                        >
                          <span>{lang.label}</span>
                          {language === lang.code && <Check className="w-3 h-3 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSendMessage(inputMsg)}
                  disabled={(!inputMsg.trim() && !attachedImage) || isLoading}
                  className="px-4.5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center cursor-pointer flex-shrink-0 h-[44px]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowDeleteConfirm(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900">Delete Support Thread?</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to delete the support conversation <span className="font-semibold text-slate-800">"{showDeleteConfirm.title}"</span>? This will wipe all messages from our active database.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTicketSubmit}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Conversation Modal */}
      <AnimatePresence>
        {showRenameModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowRenameModal(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleRenameTicketSubmit} className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <Edit3 className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">Rename Support Thread</h3>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Conversation Title</label>
                  <input
                    type="text"
                    required
                    value={renameTitle}
                    onChange={(e) => setRenameTitle(e.target.value)}
                    placeholder="Enter new conversation title"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRenameModal(null)}
                    disabled={isSavingRename}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!renameTitle.trim() || isSavingRename}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    {isSavingRename ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern ChatGPT-like Search Popup */}
      <AnimatePresence>
        {isSearchOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#1E293B] text-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Header */}
              <div className="p-4 border-b border-slate-700/50 flex items-center gap-3 bg-[#1e293b]/80 sticky top-0 z-10">
                <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                  title="Close Search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Body - Scrollable chat list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
                {searchResults.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No matching conversations found</p>
                    {searchQuery && <p className="text-xs text-slate-500 mt-1">Try searching with other keywords</p>}
                  </div>
                ) : (
                  searchResults.map((ticket) => {
                    const isActive = activeTicket?.id === ticket.id;
                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => {
                          setActiveTicket(ticket);
                          setRatingSubmitted(null);
                          setIsSearchOpen(false);
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col gap-1.5 cursor-pointer hover:shadow-md ${
                          isActive
                            ? "bg-[#475569] border-blue-500 text-white"
                            : "bg-[#334155] border-slate-700/40 hover:bg-[#3e4f64] hover:border-slate-600 text-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-[10px] text-slate-400">{ticket.id}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-extrabold tracking-wider ${
                            ticket.status === "resolved"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                              : ticket.status === "escalated"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/20"
                              : "bg-blue-500/15 text-blue-300 border-blue-500/20"
                          }`}>
                            {ticket.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold line-clamp-1 break-words">{ticket.title}</h4>

                        <div className="flex items-center justify-between w-full text-[10px] text-slate-300">
                          <span className="font-semibold text-blue-300">{ticket.category || "General Support"}</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              
              <div className="p-3 bg-[#172033] border-t border-slate-700/30 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                <span>Search scans chat titles, categories, and full conversation transcripts.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline custom mini subcomponents to prevent extra files if needed
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
