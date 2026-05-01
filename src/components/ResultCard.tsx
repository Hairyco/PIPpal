import React, { useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Edit3,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Highlighter,
  X,
  Save,
  Users,
  ExternalLink,
  TrendingUp,
  BookOpen } from
'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
const descriptorData: Record<
  string,
  {
    points: number;
    heading: string;
    text: string;
    why: string;
  }> =
{
  A: {
    points: 0,
    heading: 'No difficulty preparing food',
    text: 'I can prepare and cook a simple meal unaided. I do not experience significant difficulties or risks when cooking.',
    why: 'Based on your answers, you can plan, prepare and cook a simple meal without help.'
  },
  B: {
    points: 2,
    heading: 'Needs an aid or appliance to cook',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>need to use aids and appliances</span> to prepare a simple meal. <span class='bg-amber-100 text-amber-900 px-1 rounded'>On most days</span>, I experience <span class='bg-purple-100 text-purple-900 px-1 rounded'>pain and difficulty gripping</span>. I rely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>adapted utensils and a perching stool</span> to cook safely.",
    why: 'You indicated you need aids like adapted utensils or appliances to cook safely.'
  },
  C: {
    points: 2,
    heading: 'Can only use a microwave',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>cannot cook using a conventional cooker</span> but can use a microwave. <span class='bg-amber-100 text-amber-900 px-1 rounded'>Every time I cook</span>, I experience <span class='bg-purple-100 text-purple-900 px-1 rounded'>severe fatigue and pain</span> standing at the stove. I rely entirely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>the microwave</span> to prepare hot meals.",
    why: 'You indicated you cannot safely use a conventional cooker but can manage a microwave.'
  },
  D: {
    points: 2,
    heading: 'Needs prompting to prepare food',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>need prompting to prepare or cook a simple meal</span>. <span class='bg-amber-100 text-amber-900 px-1 rounded'>On the majority of days</span>, I experience <span class='bg-purple-100 text-purple-900 px-1 rounded'>severe lack of motivation and forgetfulness</span>. I rely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>my partner to remind and encourage me</span> to eat.",
    why: 'You indicated you need someone to remind or prompt you to prepare meals.'
  },
  E: {
    points: 4,
    heading: 'Needs supervision or assistance',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>need supervision or assistance to prepare or cook a simple meal</span>. <span class='bg-amber-100 text-amber-900 px-1 rounded'>Whenever I try to cook</span>, I am at <span class='bg-purple-100 text-purple-900 px-1 rounded'>high risk of burning myself or leaving the stove on</span>. I must have <span class='bg-blue-100 text-blue-900 px-1 rounded'>another person with me in the kitchen</span> to stay safe.",
    why: 'You indicated you need someone to supervise or assist you when preparing food.'
  },
  F: {
    points: 8,
    heading: 'Cannot prepare and cook food',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>cannot prepare and cook food at all</span>. <span class='bg-amber-100 text-amber-900 px-1 rounded'>Every single day</span>, my condition causes such <span class='bg-purple-100 text-purple-900 px-1 rounded'>severe physical and cognitive difficulties</span> that I cannot safely be in the kitchen. I rely entirely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>others to prepare all my meals</span>.",
    why: 'You indicated you cannot prepare or cook food at all and rely entirely on others.'
  }
};
function determineDescriptorFromText(text: string): string {
  const lower = text.toLowerCase();
  // Check from highest points to lowest (F=8, E=4, D=2, C=2, B=2, A=0)
  // F: Cannot prepare and cook food at all
  if (
  lower.includes('cannot prepare') && lower.includes('cook food at all') ||
  lower.includes('cannot') && lower.includes('safely be in the kitchen') ||
  lower.includes('rely entirely on') && lower.includes('all my meals') ||
  lower.includes('cannot prepare and cook food'))
  {
    return 'F';
  }
  // E: Needs supervision or assistance
  if (
  lower.includes('supervision') && (
  lower.includes('assistance') || lower.includes('prepare')) ||
  lower.includes('someone with me') && lower.includes('kitchen') ||
  lower.includes('high risk') && (
  lower.includes('burning') || lower.includes('leaving the stove')) ||
  lower.includes('need supervision') ||
  lower.includes('needs supervision'))
  {
    return 'E';
  }
  // D: Needs prompting
  if (
  lower.includes('prompting') && lower.includes('prepare') ||
  lower.includes('remind') && (
  lower.includes('eat') ||
  lower.includes('cook') ||
  lower.includes('meal')) ||
  lower.includes('encourage me') && (
  lower.includes('eat') || lower.includes('cook')) ||
  lower.includes('lack of motivation') && (
  lower.includes('forget') || lower.includes('meal')) ||
  lower.includes('need prompting') ||
  lower.includes('needs prompting'))
  {
    return 'D';
  }
  // C: Can only use microwave
  if (
  lower.includes('cannot cook') && lower.includes('conventional cooker') ||
  lower.includes('cannot use') && lower.includes('cooker') ||
  lower.includes('rely entirely on') && lower.includes('microwave') ||
  lower.includes('can only') && lower.includes('microwave') ||
  lower.includes('only use') && lower.includes('microwave'))
  {
    return 'C';
  }
  // B: Needs aid or appliance
  if (
  lower.includes('aid') && lower.includes('appliance') ||
  lower.includes('adapted utensils') ||
  lower.includes('perching stool') ||
  lower.includes('need to use') && (
  lower.includes('aid') || lower.includes('appliance')) ||
  lower.includes('difficulty gripping') ||
  lower.includes('pain') && lower.includes('grip'))
  {
    return 'B';
  }
  // A: No difficulty
  if (
  lower.includes('no difficulty') ||
  lower.includes('unaided') ||
  lower.includes('can prepare') &&
  lower.includes('cook') &&
  !lower.includes('cannot'))
  {
    return 'A';
  }
  // Default: return null to indicate no change detected
  return '';
}
export function ResultCard() {
  const {
    q1Result,
    setQ1Result,
    selectedQuestionId,
    setSelectedQuestionId,
    medProfile,
    navigateTo,
    goBack,
    saveAnswer,
    getSavedAnswer,
    hasPaid
  } = useAppContext();
  const [showChat, setShowChat] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [showDescriptors, setShowDescriptors] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [showImprovePreview, setShowImprovePreview] = useState(false);
  const [isImprovedVersion, setIsImprovedVersion] = useState(false);
  const [discardToast, setDiscardToast] = useState(false);
  const [descriptorChanged, setDescriptorChanged] = useState(false);
  const [pendingDescriptor, setPendingDescriptor] = useState<string | null>(
    null
  );
  const descriptor = q1Result?.descriptor || 'A';
  const data = descriptorData[descriptor];
  // Load saved answer on mount
  const savedAnswer = getSavedAnswer('q1');
  const currentDisplayText =
  editedText !== null ?
  editedText :
  savedAnswer !== undefined ?
  savedAnswer :
  null;
  const stripHighlights = (html: string) => {
    return html.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  };
  const getPlainText = (html: string) => {
    return html.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  };
  const handleStartEditing = () => {
    const textToEdit =
    currentDisplayText !== null ? currentDisplayText : getPlainText(data.text);
    setEditedText(textToEdit);
    setIsEditing(true);
    setShowImprovePreview(false);
  };
  const handleSave = () => {
    if (editedText !== null) {
      saveAnswer('q1', editedText);
    }
    setIsEditing(false);
    setEditedText(null);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(null);
  };
  const getScoreColor = (pts: number) => {
    if (pts === 0) return 'bg-stone-100 text-stone-600 border-stone-200';
    if (pts === 2) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (pts === 4) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (pts === 8) return 'bg-teal-100 text-teal-700 border-teal-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };
  const handleImprove = () => {
    setIsImproving(true);
    // Simulate improvement with a delay
    setTimeout(() => {
      const baseText =
      currentDisplayText !== null ?
      currentDisplayText :
      getPlainText(data.text);
      // Analyze the current text to see if descriptor should change
      const detectedDescriptor = determineDescriptorFromText(baseText);
      const improved =
      baseText +
      '\n\nThis significantly impacts my daily life and independence. I experience these difficulties on the majority of days, which means I cannot reliably or safely complete this activity without the support described above. My condition is variable, and on my worst days the difficulties are even more severe.';
      setImprovedText(improved);
      setShowImprovePreview(true);
      setIsImproving(false);
      // Check if the detected descriptor differs from current
      if (detectedDescriptor && detectedDescriptor !== descriptor) {
        setPendingDescriptor(detectedDescriptor);
        setDescriptorChanged(true);
      } else {
        setPendingDescriptor(null);
        setDescriptorChanged(false);
      }
    }, 1500);
  };
  const handleSaveImproved = () => {
    if (improvedText !== null) {
      setEditedText(improvedText);
      saveAnswer('q1', improvedText);
      setShowImprovePreview(false);
      setImprovedText(null);
      setIsImprovedVersion(true);
      setShowHighlights(true);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
      // Update descriptor if it changed
      if (pendingDescriptor && pendingDescriptor !== descriptor) {
        setQ1Result({
          ...q1Result,
          descriptor: pendingDescriptor
        });
      }
      setPendingDescriptor(null);
      setDescriptorChanged(false);
    }
  };
  const handleDiscardImproved = () => {
    setShowImprovePreview(false);
    setImprovedText(null);
    setShowHighlights(true);
    setDiscardToast(true);
    setTimeout(() => setDiscardToast(false), 2000);
    setPendingDescriptor(null);
    setDescriptorChanged(false);
  };
  return (
    <div className="flex flex-col h-full bg-stone-50 relative">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg flex-1">Your Answer</h1>
        <button
          onClick={() => setShowDescriptors(!showDescriptors)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${getScoreColor(data.points)} ${showDescriptors ? 'ring-2 ring-teal-500/30' : ''}`}>
          
          <span>{data.points} pts</span>
          <span className="opacity-60">·</span>
          <span className="opacity-80">{descriptor}</span>
          {showDescriptors ?
          <ChevronUp className="w-3 h-3 opacity-60" /> :

          <ChevronDown className="w-3 h-3 opacity-60" />
          }
        </button>
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
          className="overflow-hidden bg-white border-b border-stone-100 z-10 relative">
          
            <div className="px-5 md:px-8 py-3">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                All Descriptors — Q3: Preparing Food
              </div>
              <div className="space-y-2">
                {(
              [
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
              }] as
              const).
              map((d) =>
              <div
                key={d.letter}
                className={`flex gap-2 text-xs ${descriptor === d.letter ? 'bg-teal-50 -mx-2 px-2 py-1.5 rounded-lg border border-teal-100' : ''}`}>
                
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

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Chat Collapse Bar */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full bg-stone-200/50 py-2 flex items-center justify-center gap-2 text-xs font-medium text-stone-500 hover:bg-stone-200 transition-colors">
          
          Your conversation is saved
          {showChat ?
          <ChevronUp className="w-4 h-4" /> :

          <ChevronDown className="w-4 h-4" />
          }
        </button>

        <AnimatePresence>
          {showChat &&
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
            className="overflow-hidden bg-stone-100 px-5 md:px-8 py-4 space-y-3 border-b border-stone-200">
            
              {q1Result?.messages?.slice(1).map((msg: any, i: number) =>
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
                  <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${msg.sender === 'user' ? 'bg-teal-700 text-white' : 'bg-white border border-stone-200 text-stone-800'}`}>
                
                    {msg.text}
                  </div>
                </div>
            )}
            </motion.div>
          }
        </AnimatePresence>

        <div className="px-5 md:px-8 py-6 space-y-6">
          {/* Score Hero */}
          <div
            className={`rounded-2xl p-6 border text-center ${getScoreColor(data.points)}`}>
            
            <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">
              Descriptor {descriptor}
            </div>
            <div className="text-5xl font-black mb-2">
              {data.points}{' '}
              <span className="text-2xl font-bold opacity-70">pts</span>
            </div>
            <div className="font-medium leading-tight">{data.heading}</div>
          </div>

          {/* Generated Answer */}
          <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isImprovedVersion && !isEditing ? 'border-purple-200 ring-2 ring-purple-100' : 'border-stone-200'}`}>
            
            <div
              className={`px-4 py-3 border-b flex justify-between items-center ${isImprovedVersion && !isEditing ? 'bg-purple-50 border-purple-100' : 'bg-stone-50 border-stone-100'}`}>
              
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm">
                  {isEditing ? 'Editing Answer' : 'Draft Answer'}
                </span>
                {isImprovedVersion && !isEditing &&
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Improved
                  </span>
                }
              </div>
              <div className="flex items-center gap-1">
                {!isEditing &&
                <button
                  onClick={() => setShowHighlights(!showHighlights)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${showHighlights ? 'bg-teal-100 text-teal-700' : 'bg-stone-200 text-stone-500'}`}>
                  
                    <Highlighter className="w-3.5 h-3.5" />
                    {showHighlights ? 'On' : 'Off'}
                  </button>
                }
                {isEditing ?
                <div className="flex items-center gap-1">
                    <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-200 text-stone-600 hover:bg-stone-300 transition-all">
                    
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-all">
                    
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div> :

                <button
                  onClick={handleStartEditing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-200 text-stone-600 hover:bg-stone-300 transition-all active:scale-95">
                  
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                }
              </div>
            </div>
            <div className="p-5">
              {isEditing ?
              <textarea
                value={editedText || ''}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full text-stone-800 leading-relaxed text-sm bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none min-h-[150px]"
                rows={6} /> :

              showImprovePreview ?
              <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Improved Version
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-sm whitespace-pre-wrap">
                      {improvedText}
                    </p>
                  </div>

                  {/* Descriptor change notice */}
                  {descriptorChanged && pendingDescriptor &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-900 mb-1">
                            Descriptor update detected
                          </h4>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Your edited answer better matches{' '}
                            <strong>Descriptor {pendingDescriptor}</strong> (
                            {descriptorData[pendingDescriptor]?.heading}) for{' '}
                            <strong>
                              {descriptorData[pendingDescriptor]?.points} points
                            </strong>
                            {descriptorData[pendingDescriptor]?.points !==
                        data.points &&
                        <span>
                                {' '}
                                —{' '}
                                {descriptorData[pendingDescriptor]?.points >
                          data.points ?
                          'up' :
                          'down'}{' '}
                                from {data.points} pts
                              </span>
                        }
                            . Saving will update your score.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                }

                  <div className="flex gap-2">
                    <button
                    onClick={handleDiscardImproved}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
                    
                      <X className="w-4 h-4" />
                      Discard
                    </button>
                    <button
                    onClick={handleSaveImproved}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-all active:scale-95">
                    
                      <Save className="w-4 h-4" />
                      Save Improved
                    </button>
                  </div>
                </div> :

              <p
                className={`text-stone-800 leading-relaxed text-sm whitespace-pre-wrap ${isImprovedVersion && showHighlights ? 'bg-purple-50/50 rounded-lg p-3 border border-purple-100' : ''}`}
                dangerouslySetInnerHTML={{
                  __html:
                  currentDisplayText !== null ?
                  currentDisplayText :
                  showHighlights ?
                  data.text :
                  stripHighlights(data.text)
                }}>
              </p>
              }
            </div>

            {/* Highlight Legend */}
            {showHighlights && !isEditing && !showImprovePreview &&
            <div className="bg-stone-50 p-4 border-t border-stone-100 grid grid-cols-2 gap-2 text-[10px] font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>What
                  you can/cannot do
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>Aid or
                  support relied on
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  Frequency / how often
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Emotional/physical impact
                </div>
                {isImprovedVersion &&
              <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-stone-200 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Enhanced answer
                  </div>
              }
              </div>
            }
          </div>

          {/* Why this meets */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <h3 className="font-bold text-stone-900 text-sm mb-2">
              Why this meets the descriptor
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">{data.why}</p>
          </div>

          {/* PIP Diary CTA */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-sm mb-1">
                  Strengthen this answer with your PIP Diary
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Log specific days when preparing food was difficult — dates,
                  symptoms, and what happened. Real diary entries are powerful
                  evidence for assessors.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('pip_diary')}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              
              <BookOpen className="w-4 h-4" />
              Open PIP Diary
            </button>
          </div>

          {/* Medical Panel */}
          {medProfile.conditions.length > 0 &&
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
              <h3 className="font-bold text-stone-900 text-sm mb-3">
                Linked Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {medProfile.conditions.map((c, i) =>
              <span
                key={i}
                className="bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-md font-medium border border-stone-200">
                
                    {c.name}
                  </span>
              )}
              </div>
            </div>
          }

          {/* Join Our Community */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-teal-50 rounded-2xl p-4 border border-teal-100 hover:border-teal-200 transition-all active:scale-[0.98]">
            
            <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-teal-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-stone-900 text-xs">
                Join our community
              </h3>
              <p className="text-[11px] text-stone-500">
                Get support from others who've been through this
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-teal-600 shrink-0" />
          </a>

          {/* Stat */}
          <div className="text-center px-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              <strong>A well-documented claim makes all the difference.</strong>{' '}
              Take your time and describe your worst days — that's what
              assessors need to see.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Fixed Bottom */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t border-stone-200 px-5 md:px-8 pt-4 pb-8 flex gap-2.5 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => navigateTo('q1_chat')}
          className="shrink-0 bg-stone-100 text-stone-700 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-stone-200 active:scale-95 transition-all">
          
          <RefreshCw className="w-4 h-4" /> Redo
        </button>
        <button
          onClick={handleImprove}
          disabled={isImproving}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all ${isImproving ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
          
          {isImproving ?
          <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Improving...
            </> :

          <>
              <Sparkles className="w-4 h-4 shrink-0" /> Improve
            </>
          }
        </button>
        <button
          onClick={() => {
            if (!hasPaid) { navigateTo('upsell'); return; }
            // Find next question
            import('../pipQuestions').then(({ PIP_QUESTIONS }) => {
              const currentIndex = PIP_QUESTIONS.findIndex((q: any) => q.id === selectedQuestionId);
              const nextQ = PIP_QUESTIONS[currentIndex + 1];
              if (nextQ) {
                setSelectedQuestionId(nextQ.id);
                navigateTo('q1_intro');
              } else {
                navigateTo('question_index');
              }
            });
          }}
          className="flex-[1.5] bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all shadow-sm">
          
          <Sparkles className="w-4 h-4" /> Next Question
        </button>
      </div>

      {/* Saved Toast */}
      <AnimatePresence>
        {savedToast &&
        <motion.div
          initial={{
            opacity: 0,
            y: 50
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 50
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap z-50 flex items-center gap-2">
          
            <Check className="w-4 h-4" />
            Answer saved
          </motion.div>
        }
      </AnimatePresence>

      {/* Discard Toast */}
      <AnimatePresence>
        {discardToast &&
        <motion.div
          initial={{
            opacity: 0,
            y: 50
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 50
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-stone-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap z-50 flex items-center gap-2">
          
            <X className="w-4 h-4" />
            Improvement discarded — previous version kept
          </motion.div>
        }
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast &&
        <motion.div
          initial={{
            opacity: 0,
            y: 50
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 50
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap z-50">
          
            Feature not available in demo
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}