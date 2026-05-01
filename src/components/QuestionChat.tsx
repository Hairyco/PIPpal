import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Mic,
  Send,
  TrendingUp,
  Undo2,
  List,
  ChevronUp } from
'lucide-react';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS, getQuestion } from '../pipQuestions';
import { motion, AnimatePresence } from 'framer-motion';
type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};
type Step =
'q1' |
'q2a' |
'q2b' |
'q_anxiety' |
'detail_b' |
'detail_c' |
'detail_d' |
'detail_e' |
'detail_f' |
'result_a';
type HistoryEntry = {
  step: Step;
  messages: Message[];
};
export function QuestionChat() {
  const { badDayMode, setQ1Result, navigateTo, goBack, selectedQuestionId, medProfile } = useAppContext();
  const isQ1 = !selectedQuestionId || selectedQuestionId === 'q1';
  const question = getQuestion(selectedQuestionId || 'q1');
  const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';

  const [messages, setMessages] = useState<Message[]>(
    isQ1 ? [{
      id: '1',
      sender: 'bot',
      text: "Let's talk about preparing food. Can you plan and cook a simple meal on your own?"
    }] : []
  );
  const [currentStep, setCurrentStep] = useState<Step>('q1');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState<{role: string; content: string}[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [aiInitialised, setAiInitialised] = useState(false);
  const [showFreeText, setShowFreeText] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = React.useRef<any>(null);
  const [inputText, setInputText] = useState('');
  const [stepHistory, setStepHistory] = useState<HistoryEntry[]>([]);
  const [showDescriptors, setShowDescriptors] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStep]);
  const addMessage = (text: string, sender: 'bot' | 'user') => {
    setMessages((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      sender,
      text
    }]
    );
  };
  const handleOption = (text: string, nextStep: Step, botReply?: string) => {
    // Save current state before transitioning
    setStepHistory((prev) => [
    ...prev,
    {
      step: currentStep,
      messages: [...messages]
    }]
    );
    addMessage(text, 'user');
    setCurrentStep(nextStep);
    if (botReply) {
      setTimeout(() => {
        addMessage(botReply, 'bot');
      }, 600);
    } else if (nextStep.startsWith('detail_')) {
      setTimeout(() => {
        addMessage(
          'Can you tell me a bit more about why you struggle with this? <b>You can check scores in the top right of the page if any apply to you.</b> (You can type or use voice recording)',
          'bot'
        );
      }, 600);
    } else if (nextStep === 'result_a') {
      setTimeout(() => {
        finishChat('A');
      }, 1000);
    }
  };
  const handleUndo = () => {
    if (stepHistory.length === 0) return;
    const previous = stepHistory[stepHistory.length - 1];
    setCurrentStep(previous.step);
    setMessages(previous.messages);
    setStepHistory((prev) => prev.slice(0, -1));
    setInputText('');
  };
  const handleTextInput = () => {
    if (!inputText.trim()) return;
    // Save current state before transitioning
    setStepHistory((prev) => [
    ...prev,
    {
      step: currentStep,
      messages: [...messages]
    }]
    );
    addMessage(inputText, 'user');
    setInputText('');
    // Determine descriptor based on current detail step
    const descriptorMap: Record<string, string> = {
      detail_b: 'B',
      detail_c: 'C',
      detail_d: 'D',
      detail_e: 'E',
      detail_f: 'F'
    };
    const descriptor = descriptorMap[currentStep];
    if (descriptor) {
      setTimeout(() => {
        finishChat(descriptor);
      }, 1000);
    }
  };
  const finishChat = (descriptor: string) => {
    setQ1Result({
      descriptor,
      messages,
      questionId: selectedQuestionId || 'q1',
    });
    navigateTo('q1_result');
  };

  const callAI = async (userMsg: string, conv: {role: string; content: string}[]) => {
    setAiLoading(true);
    setCurrentOptions([]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          medProfile: { conditions: medProfile.conditions, medications: '', notes: '' },
          conversationHistory: conv,
          buttonMode: true,
          questionData: {
            title: question?.title,
            descriptors: question?.descriptors,
          },
        }),
      });
      const data = await response.json();
      const structured = data.structured || {};
      const botMsg = structured.message || 'Could not generate response.';
      const options = structured.options || [];
      const result = structured.result || null;

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botMsg }]);
      setAiConversation(prev => [...prev, { role: 'assistant', content: botMsg }]);

      if (result) {
        setTimeout(() => finishChat(result), 1200);
      } else {
        setCurrentOptions(options);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptionClick = async (option: string) => {
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: option };
    setMessages(prev => [...prev, newMsg]);
    const updatedConv = [...aiConversation, { role: 'user', content: option }];
    setAiConversation(updatedConv);
    // If user wants to add more details, prompt them with a text box instead
    if (option === 'I have more details to add') {
      setCurrentOptions([]);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Please go ahead and share any extra details. Describe what happens on your worst days.',
      }]);
      setShowFreeText(true);
      return;
    }
    await callAI(option, updatedConv);
  };

  const handleFreeTextSubmit = async () => {
    if (!inputText.trim() || aiLoading) return;
    const userMsg = inputText.trim();
    setInputText('');
    setShowFreeText(false);
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: userMsg };
    setMessages(prev => [...prev, newMsg]);
    const updatedConv = [...aiConversation, { role: 'user', content: userMsg }];
    setAiConversation(updatedConv);
    await callAI(userMsg, updatedConv);
  };

  // Initialise AI chat for Q2-Q12 on mount
  useEffect(() => {
    if (!isQ1 && !aiInitialised) {
      setAiInitialised(true);
      const opener = question?.chatOpener || `How does your condition affect ${question?.shortTitle?.toLowerCase()}?`;
      callAI(`START: ${opener}`, []);
    }
  }, [isQ1, aiInitialised]);
  const getScoreInfo = (): {
    descriptor: string;
    points: number;
    label: string;
    confidence: 'low' | 'medium' | 'high';
  } => {
    switch (currentStep) {
      case 'q1':
        return {
          descriptor: '—',
          points: 0,
          label: 'Answering...',
          confidence: 'low'
        };
      case 'q2a':
        return {
          descriptor: 'A–B',
          points: 0,
          label: 'Can cook unaided',
          confidence: 'low'
        };
      case 'q2b':
        return {
          descriptor: 'B–F',
          points: 2,
          label: 'Has difficulty cooking',
          confidence: 'medium'
        };
      case 'q_anxiety':
        return {
          descriptor: 'D',
          points: 2,
          label: 'Mental health affects cooking',
          confidence: 'medium'
        };
      case 'detail_b':
        return {
          descriptor: 'B',
          points: 2,
          label: 'Needs aid or appliance',
          confidence: 'high'
        };
      case 'detail_c':
        return {
          descriptor: 'C',
          points: 2,
          label: 'Can only use microwave',
          confidence: 'high'
        };
      case 'detail_d':
        return {
          descriptor: 'D',
          points: 2,
          label: 'Needs prompting to cook',
          confidence: 'high'
        };
      case 'detail_e':
        return {
          descriptor: 'E',
          points: 4,
          label: 'Needs supervision or help',
          confidence: 'high'
        };
      case 'detail_f':
        return {
          descriptor: 'F',
          points: 8,
          label: 'Cannot prepare food at all',
          confidence: 'high'
        };
      case 'result_a':
        return {
          descriptor: 'A',
          points: 0,
          label: 'Can cook unaided',
          confidence: 'high'
        };
      default:
        return {
          descriptor: '—',
          points: 0,
          label: 'Answering...',
          confidence: 'low'
        };
    }
  };
  const scoreInfo = getScoreInfo();
  const renderOptions = () => {
    switch (currentStep) {
      case 'q1':
        return (
          <div className="space-y-2">
            <button
              onClick={() =>
              handleOption(
                'Yes, no problem',
                'q2a',
                'Can you do it safely every time, without risk of burning or injury?'
              )
              }
              className="chat-option">
              
              Yes, no problem
            </button>
            <button
              onClick={() =>
              handleOption(
                'Sometimes, but I struggle',
                'q2b',
                'What mainly causes difficulty? Is it physical (pain, grip, standing) or mental (concentration, motivation, forgetting)?'
              )
              }
              className="chat-option">
              
              Sometimes, but I struggle
            </button>
            <button
              onClick={() =>
              handleOption(
                "No, I can't cook",
                'detail_f',
                'Can you manage using a microwave instead?'
              )
              }
              className="chat-option">
              
              No, I can't cook
            </button>
          </div>);

      case 'q2a':
        return (
          <div className="space-y-2">
            <button
              onClick={() =>
              handleOption('Yes, I can do it safely', 'result_a')
              }
              className="chat-option">
              
              Yes, I can do it safely
            </button>
            <button
              onClick={() =>
              handleOption('Not always, I need aids or help', 'detail_b')
              }
              className="chat-option">
              
              Not always, I need aids or help
            </button>
          </div>);

      case 'q2b':
        return (
          <div className="space-y-2">
            <button
              onClick={() =>
              handleOption(
                'Mainly mental (concentration, motivation)',
                'q_anxiety',
                'Do you need someone to remind or prompt you to prepare food?'
              )
              }
              className="chat-option">
              
              Mainly mental (concentration, motivation)
            </button>
            <button
              onClick={() =>
              handleOption(
                'Mainly physical (pain, grip, standing)',
                'detail_b'
              )
              }
              className="chat-option">
              
              Mainly physical (pain, grip, standing)
            </button>
          </div>);

      case 'q_anxiety':
        return (
          <div className="space-y-2">
            <button
              onClick={() => handleOption('Yes, most days', 'detail_d')}
              className="chat-option">
              
              Yes, most days
            </button>
            <button
              onClick={() =>
              handleOption('Sometimes, mainly bad days', 'detail_b')
              }
              className="chat-option">
              
              Sometimes, mainly bad days
            </button>
          </div>);

      case 'detail_f':
        return (
          <div className="space-y-2">
            <button
              onClick={() =>
              handleOption('Yes, I can use a microwave', 'detail_c')
              }
              className="chat-option">
              
              Yes, I can use a microwave
            </button>
            <button
              onClick={() =>
              handleOption('No, I need someone to help me', 'detail_e')
              }
              className="chat-option">
              
              No, I need someone to help me
            </button>
            <button
              onClick={() =>
              handleOption("No, I can't prepare food at all", 'detail_f')
              }
              className="chat-option">
              
              No, I can't prepare food at all
            </button>
          </div>);

      default:
        if (currentStep.startsWith('detail_')) {
          return (
            <div className="flex items-end gap-2 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
              <button
                onMouseDown={() => {
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SpeechRecognition) { alert('Voice input is not supported in this browser. Please type your answer.'); return; }
                  const recognition = new SpeechRecognition();
                  recognition.lang = 'en-GB';
                  recognition.continuous = false;
                  recognition.interimResults = false;
                  recognition.onresult = (e: any) => {
                    const transcript = e.results[0][0].transcript;
                    setInputText(prev => prev ? prev + ' ' + transcript : transcript);
                  };
                  recognition.onend = () => setIsRecording(false);
                  recognition.onerror = () => setIsRecording(false);
                  recognitionRef.current = recognition;
                  recognition.start();
                  setIsRecording(true);
                }}
                onMouseUp={() => { recognitionRef.current?.stop(); }}
                onTouchStart={(e) => { e.preventDefault();
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SpeechRecognition) { alert('Voice input is not supported in this browser.'); return; }
                  const recognition = new SpeechRecognition();
                  recognition.lang = 'en-GB';
                  recognition.continuous = false;
                  recognition.interimResults = false;
                  recognition.onresult = (e: any) => {
                    const transcript = e.results[0][0].transcript;
                    setInputText(prev => prev ? prev + ' ' + transcript : transcript);
                  };
                  recognition.onend = () => setIsRecording(false);
                  recognition.onerror = () => setIsRecording(false);
                  recognitionRef.current = recognition;
                  recognition.start();
                  setIsRecording(true);
                }}
                onTouchEnd={() => { recognitionRef.current?.stop(); }}
                className={`p-3 rounded-xl transition-colors ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 text-sm"
                rows={1} />
              
              <button
                onClick={handleTextInput}
                disabled={!inputText.trim()}
                className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:bg-stone-300 transition-colors">
                
                <Send className="w-5 h-5" />
              </button>
            </div>);

        }
        return null;
    }
  };
  // For Q2-Q12 render AI chat
  if (!isQ1) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-stone-900 text-sm">Question {question?.num} of 12</h1>
            <p className="text-xs text-stone-500">{question?.shortTitle}</p>
          </div>
          <button
            onClick={() => setShowDescriptors(!showDescriptors)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${showDescriptors ? 'bg-teal-100 text-teal-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
          >
            <List className="w-3.5 h-3.5" />
            {showDescriptors ? 'Close' : 'Scores'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-100 h-1">
          <div
            className="bg-teal-500 h-1 transition-all duration-300"
            style={{ width: `${((question?.num || 1) / 12) * 100}%` }}
          />
        </div>

        {showDescriptors && question?.descriptors && (
          <div className="bg-white border-b border-stone-100 px-4 py-3 space-y-1.5">
            {question.descriptors.map((d: any) => (
              <div key={d.code} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0">{d.code}</span>
                <span className="text-xs text-stone-600 flex-1">{d.label}</span>
                <span className="text-[10px] font-bold text-teal-700">{d.points}pt{d.points !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-sm'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </div>
              </div>
            </div>
          )}
        </div>

        {currentOptions.length > 0 && !aiLoading && (
          <div className="p-4 bg-white border-t border-stone-100 space-y-2">
            {currentOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(opt)}
                className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 font-medium hover:border-teal-400 hover:bg-teal-50 active:scale-[0.98] transition-all shadow-sm"
              >
                {opt}
              </button>
            ))}
            <button
              onClick={() => handleOptionClick('I have more details to add')}
              className="w-full text-left px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-teal-700 transition-colors text-center"
            >
              I have more details to add
            </button>
          </div>
        )}
        {showFreeText && !aiLoading && (
          <div className="p-4 bg-white border-t border-stone-100 space-y-2">
            <div className="flex items-end gap-2 bg-stone-50 rounded-2xl border border-stone-200 p-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFreeTextSubmit(); } }}
                placeholder="Add any extra details here..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-sm"
                rows={2}
                autoFocus
              />
              <button
                onClick={handleFreeTextSubmit}
                disabled={!inputText.trim()}
                className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        {aiLoading && (
          <div className="p-4 bg-white border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">Thinking...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-stone-900 text-sm">
            Q3: Preparing Food
          </h1>
          <div className="text-xs text-stone-500">PIPpal Assistant</div>
        </div>
        <button
          onClick={() => setShowDescriptors(!showDescriptors)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${showDescriptors ? 'bg-teal-100 text-teal-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
          title="View descriptors">
          
          {showDescriptors ?
          <ChevronUp className="w-3.5 h-3.5" /> :

          <List className="w-3.5 h-3.5" />
          }
          {showDescriptors ? 'Close' : 'Scores'}
        </button>
      </div>

      {/* Progress bar Q1 */}
      <div className="w-full bg-stone-100 h-1">
        <div className="bg-teal-500 h-1" style={{ width: '8.33%' }} />
      </div>

      <AnimatePresence>
        {showDescriptors &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.25
          }}
          className="overflow-hidden bg-white border-b border-stone-100">
          
            <div className="px-5 md:px-8 py-3">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Descriptors — tap to close
              </div>
              <div className="space-y-2">
                {[
              {
                letter: 'A',
                text: 'Can prepare and cook a simple meal unaided.',
                pts: 0,
                color: 'text-stone-400'
              },
              {
                letter: 'B',
                text: 'Needs to use an aid or appliance to prepare or cook a simple meal.',
                pts: 2,
                color: 'text-amber-600'
              },
              {
                letter: 'C',
                text: 'Cannot cook using a conventional cooker but can using a microwave.',
                pts: 2,
                color: 'text-amber-600'
              },
              {
                letter: 'D',
                text: 'Needs prompting to prepare or cook a simple meal.',
                pts: 2,
                color: 'text-amber-600'
              },
              {
                letter: 'E',
                text: 'Needs supervision or assistance to prepare or cook a simple meal.',
                pts: 4,
                color: 'text-blue-600'
              },
              {
                letter: 'F',
                text: 'Cannot prepare and cook food.',
                pts: 8,
                color: 'text-teal-600'
              }].
              map((d) =>
              <div
                key={d.letter}
                className={`flex gap-2 text-xs ${scoreInfo.descriptor === d.letter ? 'bg-teal-50 -mx-2 px-2 py-1.5 rounded-lg border border-teal-100' : ''}`}>
                
                    <span className="font-bold w-4 text-stone-400 shrink-0">
                      {d.letter}
                    </span>
                    <span className="flex-1 text-stone-600 leading-relaxed">
                      {d.text}
                    </span>
                    <span className={`font-bold shrink-0 ${d.color}`}>
                      {d.pts}
                    </span>
                  </div>
              )}
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <motion.div
        key={scoreInfo.descriptor}
        initial={{
          opacity: 0,
          y: -4
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.3
        }}
        className="bg-white border-b border-stone-100 px-5 md:px-8 py-2.5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${scoreInfo.confidence === 'high' ? 'bg-teal-500' : scoreInfo.confidence === 'medium' ? 'bg-amber-400' : 'bg-stone-300'}`} />
            
            <span className="text-xs text-stone-500">
              {scoreInfo.confidence === 'low' ?
              'Estimating score...' :
              `Descriptor ${scoreInfo.descriptor}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {stepHistory.length > 0 &&
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:text-teal-700 transition-colors active:scale-95">
              
                <Undo2 className="w-3.5 h-3.5" />
                Undo
              </button>
            }
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
              <span
                className={`text-sm font-bold ${scoreInfo.points >= 8 ? 'text-teal-700' : scoreInfo.points >= 4 ? 'text-blue-600' : scoreInfo.points >= 2 ? 'text-amber-600' : 'text-stone-400'}`}>
                
                {scoreInfo.confidence === 'low' ?
                '—' :
                `${scoreInfo.points} pts`}
              </span>
            </div>
          </div>
        </div>
        {scoreInfo.confidence !== 'low' &&
        <p className="text-[11px] text-stone-400 mt-1">{scoreInfo.label}</p>
        }
      </motion.div>

      {badDayMode &&
      <div className="bg-rose-50 border-b border-rose-100 px-5 md:px-8 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span className="text-xs font-medium text-rose-800">
            Bad Day Mode Active: Describe your worst days
          </span>
        </div>
      }

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1" />
        <div className="px-5 md:px-8 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) =>
            <motion.div
              key={msg.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
                <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-teal-700 text-white rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'}`}
                dangerouslySetInnerHTML={{
                  __html: msg.text
                }} />
              
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:px-8 bg-stone-100 border-t border-stone-200">
        {renderOptions()}
      </div>

      <style>{`
        .chat-option {
          width: 100%;
          text-align: left;
          background-color: white;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          font-weight: 500;
          color: #1c1917;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
        }
        .chat-option:active {
          transform: scale(0.98);
          border-color: #0f766e;
        }
      `}</style>
    </div>);

}