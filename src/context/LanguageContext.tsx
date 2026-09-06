import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, SupportedLanguageCode } from '../types.ts';

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  code: SupportedLanguageCode;
  flag: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: 'English', name: 'English', nativeName: 'English', code: 'en', flag: '🇬🇧', speechCode: 'en-US' },
  { id: 'Hindi', name: 'Hindi', nativeName: 'हिन्दी', code: 'hi', flag: '🇮🇳', speechCode: 'hi-IN' },
  { id: 'Marathi', name: 'Marathi', nativeName: 'मराठी', code: 'mr', flag: '🇮🇳', speechCode: 'mr-IN' },
];

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  langCode: SupportedLanguageCode;
  speechCode: string;
  t: (key: string, fallback?: string) => string;
}

const UI_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    // Nav tabs
    'dashboard': 'Dashboard',
    'files': 'Storage & Versions',
    'assistant': 'AI Assistant',
    'tutor': 'AI Tutor',
    'quiz': 'Quiz Generator',
    'resume': 'Resume Analyzer',
    'skills': 'Skill Gap',
    'planner': 'Study Planner',
    'interview': 'Interview Coach',
    'academic': 'Academic Exchange',
    'notes': 'Notes & Flashcards',
    'multilingual': 'Multilingual + Voice',

    // NLP badges
    'nlp_assistant': 'Question Understanding + RAG',
    'nlp_tutor': 'Personalized Explanations',
    'nlp_quiz': 'Question Gen + Understanding',
    'nlp_resume': 'NER + Info Extraction',
    'nlp_skills': 'Extraction + Semantic Match',
    'nlp_planner': 'Topic Extraction & Schedule',
    'nlp_interview': 'Answer NLP Evaluation',
    'nlp_academic': 'Classification + Search',
    'nlp_notes': 'Summarization + Keypoints',
    'nlp_multilingual': 'Translation & Speech',

    // Common UI terms
    'language_choice': 'AI Output Language',
    'language_prompt': 'Choose your preferred language for AI responses & generated content:',
    'active_language': 'Active Language',
    'generate': 'Generate',
    'analyze': 'Analyze',
    'summarize': 'Summarize',
    'translate': 'Translate',
    'evaluate': 'Evaluate',
    'speak': 'Speak with Audio',
    'stop_audio': 'Stop Audio',
    'copied': 'Copied!',
    'copy': 'Copy',
    'select_file': 'Select File',
    'custom_input': 'Custom Input',
  },
  Hindi: {
    // Nav tabs
    'dashboard': 'डैशबोर्ड (Dashboard)',
    'files': 'स्टोरेज और संस्करण (Storage)',
    'assistant': 'एआई सहायक (AI Assistant)',
    'tutor': 'एआई ट्यूटर (AI Tutor)',
    'quiz': 'क्विज़ जनरेटर (Quiz)',
    'resume': 'रिज़्यूमे विश्लेषक (Resume)',
    'skills': 'कौशल अंतर (Skill Gap)',
    'planner': 'अध्ययन योजना (Study Planner)',
    'interview': 'साक्षात्कार कोच (Interview)',
    'academic': 'अकादमिक मंच (Academic)',
    'notes': 'नोट्स और फ्लैशकार्ड्स (Notes)',
    'multilingual': 'बहुभाषी और आवाज़ (Voice)',

    // NLP badges
    'nlp_assistant': 'प्रश्न समझ और RAG',
    'nlp_tutor': 'व्यक्तिगत अवधारणा समझ',
    'nlp_quiz': 'प्रश्न निर्माण और मूल्यांकन',
    'nlp_resume': 'NER और कौशल निष्कर्षण',
    'nlp_skills': 'कौशल मिलान और विश्लेषण',
    'nlp_planner': 'विषय निष्कर्षण और समय सारिणी',
    'nlp_interview': 'उत्तर विश्लेषण और मूल्यांकन',
    'nlp_academic': 'वर्गीकरण और खोज',
    'nlp_notes': 'सारांश और मुख्य बिंदु',
    'nlp_multilingual': 'अनुवाद और वाक् संश्लेषण',

    // Common UI terms
    'language_choice': 'एआई प्रतिक्रिया भाषा (Language)',
    'language_prompt': 'एआई प्रतिक्रियाओं और सामग्री के लिए पसंदीदा भाषा चुनें:',
    'active_language': 'सक्रिय भाषा',
    'generate': 'उत्पन्न करें (Generate)',
    'analyze': 'विश्लेषण करें (Analyze)',
    'summarize': 'सारांश बनाएं (Summarize)',
    'translate': 'अनुवाद करें (Translate)',
    'evaluate': 'मूल्यांकन करें (Evaluate)',
    'speak': 'आवाज़ में सुनें (Speak)',
    'stop_audio': 'आवाज़ रोकें (Stop)',
    'copied': 'कॉपी किया गया!',
    'copy': 'कॉपी करें',
    'select_file': 'फ़ाइल चुनें',
    'custom_input': 'कस्टम इनपुट',
  },
  Marathi: {
    // Nav tabs
    'dashboard': 'डॅशबोर्ड (Dashboard)',
    'files': 'स्टोरेज आणि व्हर्जन (Storage)',
    'assistant': 'एआय सहाय्यक (AI Assistant)',
    'tutor': 'एआय ट्यूटर (AI Tutor)',
    'quiz': 'प्रश्नमंजुषा जनरेटर (Quiz)',
    'resume': 'बायोडाटा विश्लेषक (Resume)',
    'skills': 'कौशल्य अंतर (Skill Gap)',
    'planner': 'अभ्यास नियोजक (Study Planner)',
    'interview': 'मुलाखत प्रशिक्षक (Interview)',
    'academic': 'शैक्षणिक मंच (Academic)',
    'notes': 'टिपा आणि फ्लॅशकार्ड्स (Notes)',
    'multilingual': 'बहुभाषिक आणि आवाज (Voice)',

    // NLP badges
    'nlp_assistant': 'प्रश्न आकलन आणि RAG',
    'nlp_tutor': 'वैयक्तिक संकल्पना स्पष्टीकरण',
    'nlp_quiz': 'प्रश्न निर्मिती आणि आकलन',
    'nlp_resume': 'NER आणि माहिती निष्कर्षण',
    'nlp_skills': 'कौशल्य मॅचिंग आणि विश्लेषण',
    'nlp_planner': 'विषय निष्कर्षण आणि वेळापत्रक',
    'nlp_interview': 'उत्तर मूल्यांकन आणि अभिप्राय',
    'nlp_academic': 'संशोधन वर्गीकरण आणि शोध',
    'nlp_notes': 'सारांश आणि मुख्य मुद्दे',
    'nlp_multilingual': 'भाषांतर आणि वाक् संश्लेषण',

    // Common UI terms
    'language_choice': 'एआय प्रतिसाद भाषा (Language)',
    'language_prompt': 'एआय प्रतिसाद आणि विश्लेषणासाठी आपली पसंतीची भाषा निवडा:',
    'active_language': 'सक्रिय भाषा',
    'generate': 'तयार करा (Generate)',
    'analyze': 'विश्लेषण करा (Analyze)',
    'summarize': 'सारांश काढा (Summarize)',
    'translate': 'भाषांतर करा (Translate)',
    'evaluate': 'मूल्यांकन करा (Evaluate)',
    'speak': 'आवाजात ऐका (Speak)',
    'stop_audio': 'आवाज थांबवा (Stop)',
    'copied': 'कॉपी केले!',
    'copy': 'कॉपी करा',
    'select_file': 'फाइल निवडा',
    'custom_input': 'स्वतः मजकूर लिहा',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('unimate_language');
      if (saved === 'Hindi' || saved === 'Marathi' || saved === 'English') {
        return saved;
      }
    } catch {
      // ignore localStorage errors
    }
    return 'English';
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('unimate_language', newLang);
    } catch {
      // ignore
    }
  };

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const langDict = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;
    return langDict[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        langCode: currentOption.code,
        speechCode: currentOption.speechCode,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
