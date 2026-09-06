import React, { useState, useEffect } from 'react';
import { MultilingualResult } from '../types.ts';
import { Languages, Volume2, VolumeX, Mic, MicOff, Sparkles, Copy, Check, Globe, BookOpen } from 'lucide-react';

export const MultilingualView: React.FC = () => {
  const [inputText, setInputText] = useState(
    'Self-attention mechanisms allow deep neural networks to compute semantic representations by weighting distant context vectors dynamically.'
  );
  const [targetLang, setTargetLang] = useState('Marathi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultilingualResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Speech synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const popularLanguages = [
    { name: 'Marathi', nativeName: 'मराठी', code: 'mr-IN', flag: '🇮🇳' },
    { name: 'English', nativeName: 'English', code: 'en-US', flag: '🇬🇧' },
    { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN', flag: '🇮🇳' },
    { name: 'Spanish', nativeName: 'Español', code: 'es-ES', flag: '🇪🇸' },
    { name: 'French', nativeName: 'Français', code: 'fr-FR', flag: '🇫🇷' },
    { name: 'German', nativeName: 'Deutsch', code: 'de-DE', flag: '🇩🇪' },
    { name: 'Japanese', nativeName: '日本語', code: 'ja-JP', flag: '🇯🇵' },
    { name: 'Mandarin Chinese', nativeName: '中文', code: 'zh-CN', flag: '🇨🇳' },
    { name: 'Arabic', nativeName: 'العربية', code: 'ar-SA', flag: '🇸🇦' },
    { name: 'Portuguese', nativeName: 'Português', code: 'pt-BR', flag: '🇧🇷' },
    { name: 'Russian', nativeName: 'Русский', code: 'ru-RU', flag: '🇷🇺' },
    { name: 'Korean', nativeName: '한국어', code: 'ko-KR', flag: '🇰🇷' },
    { name: 'Italian', nativeName: 'Italiano', code: 'it-IT', flag: '🇮🇹' },
  ];

  // Speech recognition
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && isRecording) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          if (text) {
            setInputText((prev) => (prev ? prev + ' ' + text : text));
          }
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.start();
      } catch {
        setIsRecording(false);
      }
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isRecording]);

  const handleTranslate = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLang,
        }),
      });

      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(`Translation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Browser Speech Synthesis
  const handlePlaySpeech = (textToSpeak: string, langName: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langObj = popularLanguages.find((l) => l.name.toLowerCase() === langName.toLowerCase());
    if (langObj) {
      utterance.lang = langObj.code;
      const voices = window.speechSynthesis.getVoices();
      const codePrefix = langObj.code.split('-')[0].toLowerCase();
      const voice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(codePrefix));
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (!result?.translatedText) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>MULTILINGUAL NLP & SPEECH SYNTHESIS</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold">CROSS-LINGUAL INTELLIGENCE</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Languages className="w-6 h-6 text-indigo-600" />
            <span>Multilingual & Voice Translation Studio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Translate complex technical and academic concepts with grammatical breakdowns, phonetic pronunciations, and audible speech synthesis. Supporting Marathi, English, Hindi, and global languages.
          </p>
        </div>
      </div>

      {/* Input / Controls card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Language
            </label>
            {/* Quick Language Pills */}
            <div className="flex flex-wrap gap-1.5">
              {popularLanguages.slice(0, 7).map((lang) => (
                <button
                  key={lang.name}
                  onClick={() => setTargetLang(lang.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    targetLang === lang.name
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({lang.nativeName})</span>
                </button>
              ))}
            </div>
          </div>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {popularLanguages.map((l) => (
              <option key={l.name} value={l.name}>
                {l.flag} {l.name} ({l.nativeName} • {l.code})
              </option>
            ))}
          </select>
        </div>

        {/* Text Input area with voice button */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Source Text to Translate
              </label>
              <button
                type="button"
                onClick={() =>
                  setInputText(
                    'The Gramseva portal facilitates transparent civic governance, digital certificate issuance, and citizen complaint tracking for rural communities.'
                  )
                }
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Insert E-Governance Text
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isRecording
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
            </button>
          </div>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or dictate text to translate..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Target Language: <strong className="text-slate-700">{targetLang}</strong>
          </span>
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Processing & Translating...' : `Translate to ${targetLang}`}</span>
          </button>
        </div>
      </div>

      {/* Translation Output */}
      {result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Translation Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {result.detectedSourceLanguage || 'Detected'} → {result.targetLanguage}
                  </h3>
                  {result.phoneticPronunciation && (
                    <p className="text-xs text-slate-500 italic mt-0.5">
                      Pronunciation: {result.phoneticPronunciation}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions: Audio Playback & Copy */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all"
                  title="Copy translated text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handlePlaySpeech(result.translatedText, result.targetLanguage)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : `Speak in ${result.targetLanguage}`}</span>
                </button>
              </div>
            </div>

            {/* Translated Text box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 leading-relaxed font-sans">
              {result.translatedText}
            </div>

            {/* Linguistic Notes */}
            {result.linguisticNotes?.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Linguistic & Grammatical Context:
                </h4>
                <ul className="space-y-1 list-disc pl-4 text-xs text-slate-600">
                  {result.linguisticNotes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Vocabulary Table */}
            {result.keyVocabulary?.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Technical Vocabulary Glossary:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {result.keyVocabulary.map((v, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{v.term}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{v.partOfSpeech}</span>
                      </div>
                      <p className="text-indigo-600 font-semibold mt-0.5">{v.translation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
