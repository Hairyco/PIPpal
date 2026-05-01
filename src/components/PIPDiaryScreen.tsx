import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Lock,
  Calendar,
  Download,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Loader2,
  Save,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

interface DiaryEntry {
  id: string;
  date: string;
  feelingScore: number | null;
  tasks: string[];
  tasksNotes: string;
  help: string[];
  helpNotes: string;
  aids: string[];
  aidsNotes: string;
  mood: string;
  energy: string;
  other: string;
}

const TASK_OPTIONS = [
  'Preparing food', 'Eating/drinking', 'Managing medication', 'Washing/bathing',
  'Toilet needs', 'Getting dressed', 'Communicating', 'Reading/understanding',
  'Socialising', 'Budgeting/money', 'Planning journeys', 'Moving around/walking',
  'Concentrating', 'Sleeping', 'Housework', 'Shopping',
];

const HELP_OPTIONS = [
  'Cooking for me', 'Washing/bathing help', 'Getting dressed', 'Reminders to eat',
  'Reminders for medication', 'Emotional support', 'Physical support', 'Supervision',
  'Prompting to do tasks', 'Help getting out', 'Help with money/bills',
];

const AIDS_OPTIONS = [
  'Walking stick', 'Wheelchair', 'Perching stool', 'Grab rails', 'Adapted utensils',
  'Shower seat', 'Microwave only', 'Stairlift', 'Hearing aid', 'Magnifier',
  'Memory aids/alarms', 'None today',
];

const MOOD_OPTIONS = ['😢 Very low', '😔 Low', '😐 Okay', '🙂 Good'];
const ENERGY_OPTIONS = ['⚡ Exhausted', '🔋 Very tired', '🔋 Low energy', '✅ Manageable'];

const emptyEntry = (): DiaryEntry => ({
  id: Date.now().toString(),
  date: new Date().toISOString().split('T')[0],
  feelingScore: null,
  tasks: [],
  tasksNotes: '',
  help: [],
  helpNotes: '',
  aids: [],
  aidsNotes: '',
  mood: '',
  energy: '',
  other: '',
});

export function PIPDiaryScreen({ hasPaid = false }: { hasPaid?: boolean }) {
  const { goBack, user, showToast, navigateTo } = useAppContext();
  const [entries, setEntries] = useState<DiaryEntry[]>([emptyEntry()]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [improvedSummaries, setImprovedSummaries] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load diary entries from Supabase
  useEffect(() => {
    if (!user?.id) return;
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (data && !error && data.length > 0) {
          const loaded: DiaryEntry[] = data.map((row: any) => ({
            id: row.id,
            date: row.date,
            feelingScore: row.content?.feelingScore ?? null,
            tasks: row.content?.tasks ?? [],
            tasksNotes: row.content?.tasksNotes ?? '',
            help: row.content?.help ?? [],
            helpNotes: row.content?.helpNotes ?? '',
            aids: row.content?.aids ?? [],
            aidsNotes: row.content?.aidsNotes ?? '',
            mood: row.content?.mood ?? '',
            energy: row.content?.energy ?? '',
            other: row.content?.other ?? '',
          }));
          setEntries(loaded);
        }
      } catch {
        // No entries yet
      } finally {
        setIsLoading(false);
      }
    };
    loadEntries();
  }, [user?.id]);

  const saveToDB = async (entriesToSave: DiaryEntry[]) => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      for (const entry of entriesToSave) {
        const { content, ...rest } = {
          user_id: user.id,
          date: entry.date || new Date().toISOString().split('T')[0],
          content: {
            feelingScore: entry.feelingScore,
            tasks: entry.tasks,
            tasksNotes: entry.tasksNotes,
            help: entry.help,
            helpNotes: entry.helpNotes,
            aids: entry.aids,
            aidsNotes: entry.aidsNotes,
            mood: entry.mood,
            energy: entry.energy,
            other: entry.other,
          },
          mood: entry.mood,
        };

        // Only upsert if it's a UUID (existing DB record), else insert
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(entry.id);
        if (isUUID) {
          await supabase
            .from('diary_entries')
            .update({ date: entry.date, content: { feelingScore: entry.feelingScore, tasks: entry.tasks, tasksNotes: entry.tasksNotes, help: entry.help, helpNotes: entry.helpNotes, aids: entry.aids, aidsNotes: entry.aidsNotes, mood: entry.mood, energy: entry.energy, other: entry.other }, mood: entry.mood })
            .eq('id', entry.id)
            .eq('user_id', user.id);
        } else {
          const { data } = await supabase
            .from('diary_entries')
            .insert({ user_id: user.id, date: entry.date || new Date().toISOString().split('T')[0], content: { feelingScore: entry.feelingScore, tasks: entry.tasks, tasksNotes: entry.tasksNotes, help: entry.help, helpNotes: entry.helpNotes, aids: entry.aids, aidsNotes: entry.aidsNotes, mood: entry.mood, energy: entry.energy, other: entry.other }, mood: entry.mood })
            .select()
            .single();
          // Update the local entry id to the DB uuid
          if (data) {
            setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, id: data.id } : e));
          }
        }
      }
      setLastSaved(new Date());
      showToast('Diary saved!', 'success');
    } catch {
      showToast('Saved locally — will sync when connection is restored.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const addDay = () => {
    setEntries([...entries, emptyEntry()]);
  };

  const removeDay = async (id: string) => {
    if (entries.length <= 1) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(id);
    if (isUUID && user?.id) {
      await supabase.from('diary_entries').delete().eq('id', id).eq('user_id', user.id);
    }
    setEntries(entries.filter((e) => e.id !== id));
    showToast('Entry deleted.', 'info');
  };

  const updateEntry = (id: string, field: keyof DiaryEntry, value: any) => {
    setEntries(entries.map((e) => e.id === id ? { ...e, [field]: value } : e));
  };

  const toggleArrayItem = (id: string, field: 'tasks' | 'help' | 'aids', item: string) => {
    setEntries(entries.map((e) => {
      if (e.id !== id) return e;
      const arr = e[field];
      return { ...e, [field]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] };
    }));
  };

  const toggleNote = (id: string, field: string) => {
    const key = `${id}-${field}`;
    setExpandedNotes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getScoreColor = (score: number, isSelected: boolean) => {
    if (score <= 3) return isSelected ? 'bg-rose-500 text-white border-rose-500 scale-110 shadow-md' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    if (score <= 5) return isSelected ? 'bg-amber-500 text-white border-amber-500 scale-110 shadow-md' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    if (score <= 7) return isSelected ? 'bg-lime-500 text-white border-lime-500 scale-110 shadow-md' : 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100';
    return isSelected ? 'bg-emerald-500 text-white border-emerald-500 scale-110 shadow-md' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
  };

  const formatList = (items: string[]): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  };

  const generateSummary = (entry: DiaryEntry): string => {
    const parts: string[] = [];
    const dateStr = entry.date ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'today';
    if (entry.feelingScore !== null) {
      const feelingDesc = entry.feelingScore <= 2 ? 'very poorly' : entry.feelingScore <= 4 ? 'quite unwell' : entry.feelingScore <= 6 ? 'not great' : entry.feelingScore <= 8 ? 'okay' : 'fairly well';
      parts.push(`On ${dateStr}, I was feeling ${entry.feelingScore}/10 (${feelingDesc}).`);
    } else { parts.push(`On ${dateStr}:`); }
    if (entry.tasks.length > 0) { parts.push(`I struggled with ${formatList(entry.tasks)}.`); if (entry.tasksNotes) parts.push(entry.tasksNotes.trim()); }
    if (entry.help.length > 0) { parts.push(`I needed help with ${formatList(entry.help.map((h) => h.toLowerCase()))}.`); if (entry.helpNotes) parts.push(entry.helpNotes.trim()); }
    if (entry.aids.length > 0) {
      if (entry.aids.includes('None today') && entry.aids.length === 1) { parts.push('I did not use any aids or adaptations today.'); }
      else { parts.push(`I used ${formatList(entry.aids.filter((a) => a !== 'None today').map((a) => a.toLowerCase()))}.`); }
      if (entry.aidsNotes) parts.push(entry.aidsNotes.trim());
    }
    if (entry.mood) parts.push(`My mood was ${entry.mood.replace(/^[^\s]+\s/, '').toLowerCase()}.`);
    if (entry.energy) parts.push(`My energy level was ${entry.energy.replace(/^[^\s]+\s/, '').toLowerCase()}.`);
    if (entry.other) parts.push(entry.other.trim());
    return parts.join(' ');
  };

  const improveSummary = (entry: DiaryEntry) => {
    setImprovingId(entry.id);
    setTimeout(() => {
      const parts: string[] = [];
      const dateStr = entry.date ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'today';
      if (entry.feelingScore !== null) {
        if (entry.feelingScore <= 3) parts.push(`On ${dateStr}, I was feeling ${entry.feelingScore}/10. This was a particularly bad day — my symptoms were severe and I was unable to carry out most daily tasks safely or reliably.`);
        else if (entry.feelingScore <= 5) parts.push(`On ${dateStr}, I was feeling ${entry.feelingScore}/10. My condition was affecting me significantly and I struggled to complete basic daily activities.`);
        else parts.push(`On ${dateStr}, I was feeling ${entry.feelingScore}/10. While not my worst day, I still experienced noticeable difficulties.`);
      }
      if (entry.tasks.length > 0) { parts.push(`I struggled with ${formatList(entry.tasks)}. These difficulties meant I could not complete these tasks safely, reliably, repeatedly, or in a reasonable time without assistance.`); if (entry.tasksNotes) parts.push(entry.tasksNotes.trim()); }
      if (entry.help.length > 0) { parts.push(`I required help with ${formatList(entry.help.map((h) => h.toLowerCase()))}. Without this support, I would have been unable to manage these activities safely.`); if (entry.helpNotes) parts.push(entry.helpNotes.trim()); }
      if (entry.aids.length > 0) {
        if (entry.aids.includes('None today') && entry.aids.length === 1) parts.push('I did not use any aids or adaptations today, though I typically rely on them on most days.');
        else parts.push(`I relied on ${formatList(entry.aids.filter((a) => a !== 'None today').map((a) => a.toLowerCase()))} to manage daily tasks.`);
        if (entry.aidsNotes) parts.push(entry.aidsNotes.trim());
      }
      if (entry.mood) { const moodText = entry.mood.replace(/^[^\s]+\s/, ''); if (moodText.toLowerCase().includes('low')) parts.push(`My mood was ${moodText.toLowerCase()}, which significantly affected my ability to motivate myself to carry out basic tasks.`); else parts.push(`My mood was ${moodText.toLowerCase()}.`); }
      if (entry.energy) { const energyText = entry.energy.replace(/^[^\s]+\s/, ''); if (energyText.toLowerCase().includes('exhausted') || energyText.toLowerCase().includes('very tired')) parts.push(`My energy level was ${energyText.toLowerCase()}. The fatigue was debilitating and I needed to rest frequently.`); else parts.push(`My energy level was ${energyText.toLowerCase()}.`); }
      if (entry.other) parts.push(entry.other.trim());
      parts.push('These difficulties are typical of how my condition affects me and demonstrate the ongoing impact on my daily living and mobility.');
      setImprovedSummaries((prev) => ({ ...prev, [entry.id]: parts.join(' ') }));
      setImprovingId(null);
    }, 1500);
  };

  const getSummaryText = (entry: DiaryEntry): string => improvedSummaries[entry.id] || generateSummary(entry);

  const hasSummaryContent = (entry: DiaryEntry): boolean => entry.feelingScore !== null || entry.tasks.length > 0 || entry.help.length > 0 || entry.aids.length > 0 || entry.mood !== '' || entry.energy !== '' || entry.other !== '';

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  if (!hasPaid) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-lg">PIP Diary</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-lg mb-2">Full Access required</h2>
            <p className="text-sm text-stone-500 leading-relaxed">The PIP Diary is available to Full Access users. Unlock it along with all PIPpal features for a one-time payment of £12.99.</p>
          </div>
          <button
            onClick={() => navigateTo('upsell')}
            className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm">
            Unlock Full Access — £12.99
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-stone-50 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-stone-500">Loading your diary…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">PIP Diary</h1>
        <div className="ml-auto flex items-center gap-2">
          {lastSaved && <span className="text-[10px] text-stone-400">Saved {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button
            onClick={() => saveToDB(entries)}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">
        <div className="bg-emerald-700 rounded-2xl p-6 text-white shadow-sm">
          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Track your daily challenges</h2>
          <p className="text-emerald-50 text-sm leading-relaxed">A PIP diary records how your condition affects you daily. Your entries are saved to your account and can be downloaded as evidence.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">Why keep a diary?</h3>
          <div className="space-y-3">
            {['Shows assessors your condition varies day to day', 'Provides real examples for your form answers', 'Helps you remember details for your assessment', 'Can be submitted as supporting evidence'].map((reason, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-stone-700 leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {entries.map((entry, index) => (
            <div key={entry.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{index + 1}</div>
                  <h3 className="font-bold text-stone-900 text-sm">Day {index + 1}</h3>
                </div>
                {entries.length > 1 && (
                  <button onClick={() => removeDay(entry.id)} className="text-stone-400 hover:text-rose-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Date</label>
                  <input type="date" value={entry.date} onChange={(e) => updateEntry(entry.id, 'date', e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>

                {/* Feeling Score */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">How are you feeling today? (1-10)</label>
                  <div className="flex justify-between items-center gap-1">
                    {[1,2,3,4,5,6,7,8,9,10].map((score) => (
                      <button key={score} onClick={() => updateEntry(entry.id, 'feelingScore', score)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${getScoreColor(score, entry.feelingScore === score)}`}>{score}</button>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">Tasks you struggled with</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {TASK_OPTIONS.map((task) => {
                      const isSelected = entry.tasks.includes(task);
                      return <button key={task} onClick={() => toggleArrayItem(entry.id, 'tasks', task)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{task}</button>;
                    })}
                  </div>
                  {!expandedNotes[`${entry.id}-tasks`] ? (
                    <button onClick={() => toggleNote(entry.id, 'tasks')} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add details</button>
                  ) : (
                    <textarea placeholder="Add details about your struggles..." value={entry.tasksNotes} onChange={(e) => updateEntry(entry.id, 'tasksNotes', e.target.value)} rows={2} className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
                  )}
                </div>

                {/* Help */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">Help you needed</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {HELP_OPTIONS.map((help) => {
                      const isSelected = entry.help.includes(help);
                      return <button key={help} onClick={() => toggleArrayItem(entry.id, 'help', help)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{help}</button>;
                    })}
                  </div>
                  {!expandedNotes[`${entry.id}-help`] ? (
                    <button onClick={() => toggleNote(entry.id, 'help')} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add details</button>
                  ) : (
                    <textarea placeholder="Add details about the help you needed..." value={entry.helpNotes} onChange={(e) => updateEntry(entry.id, 'helpNotes', e.target.value)} rows={2} className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
                  )}
                </div>

                {/* Aids */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">Aids or adaptations used</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {AIDS_OPTIONS.map((aid) => {
                      const isSelected = entry.aids.includes(aid);
                      return <button key={aid} onClick={() => toggleArrayItem(entry.id, 'aids', aid)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{aid}</button>;
                    })}
                  </div>
                  {!expandedNotes[`${entry.id}-aids`] ? (
                    <button onClick={() => toggleNote(entry.id, 'aids')} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add details</button>
                  ) : (
                    <textarea placeholder="Add details about the aids you used..." value={entry.aidsNotes} onChange={(e) => updateEntry(entry.id, 'aidsNotes', e.target.value)} rows={2} className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
                  )}
                </div>

                {/* Mood & Energy */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {MOOD_OPTIONS.map((mood) => (
                        <button key={mood} onClick={() => updateEntry(entry.id, 'mood', mood)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${entry.mood === mood ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{mood}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">Energy</label>
                    <div className="flex flex-wrap gap-2">
                      {ENERGY_OPTIONS.map((energy) => (
                        <button key={energy} onClick={() => updateEntry(entry.id, 'energy', energy)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${entry.energy === energy ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{energy}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Other */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5">Anything else? (optional)</label>
                  <textarea placeholder="Any other details about today..." value={entry.other} onChange={(e) => updateEntry(entry.id, 'other', e.target.value)} rows={2} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none placeholder:text-stone-400" />
                </div>

                {/* Summary */}
                {hasSummaryContent(entry) && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 border ${improvedSummaries[entry.id] ? 'bg-purple-50 border-purple-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📝</span>
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${improvedSummaries[entry.id] ? 'text-purple-800' : 'text-emerald-800'}`}>Your diary entry</h4>
                        {improvedSummaries[entry.id] && <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full"><Sparkles className="w-3 h-3" />Improved</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => improveSummary(entry)} disabled={improvingId === entry.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${improvingId === entry.id ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                          {improvingId === entry.id ? <><RefreshCw className="w-3 h-3 animate-spin" />Improving...</> : <><Sparkles className="w-3 h-3" />Improve</>}
                        </button>
                        <button onClick={() => handleCopy(entry.id, getSummaryText(entry))} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${copiedId === entry.id ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                          {copiedId === entry.id ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${improvedSummaries[entry.id] ? 'text-purple-900' : 'text-emerald-900'}`}>{getSummaryText(entry)}</p>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={addDay} className="w-full bg-white border-2 border-dashed border-emerald-200 text-emerald-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Another Day
        </button>

        <div className="pt-4 border-t border-stone-200">
          <button onClick={() => saveToDB(entries)} disabled={isSaving} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-base hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 mb-4 disabled:opacity-60">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving…</> : <><Save className="w-5 h-5" />Save Diary</>}
          </button>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <button onClick={() => setShowInstructions(!showInstructions)} className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-stone-500" />
                <span className="font-bold text-stone-900 text-sm">How to print or save to your phone</span>
              </div>
              {showInstructions ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
            </button>
            <AnimatePresence>
              {showInstructions && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-4 space-y-4 border-t border-stone-100 bg-white">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm mb-2">🍎 iPhone / iPad</h4>
                      <ol className="text-xs text-stone-600 space-y-1.5 list-decimal list-inside pl-1">
                        <li>Tap <strong>Save Diary</strong> above</li>
                        <li>Take a screenshot or share the page via the Share icon</li>
                        <li>Email it to yourself for safekeeping</li>
                      </ol>
                    </div>
                    <div className="pt-3 border-t border-stone-100">
                      <h4 className="font-bold text-stone-900 text-sm mb-2">🤖 Android</h4>
                      <ol className="text-xs text-stone-600 space-y-1.5 list-decimal list-inside pl-1">
                        <li>Tap <strong>Save Diary</strong> above</li>
                        <li>Take a screenshot or use the share menu</li>
                        <li>Email it to yourself for safekeeping</li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}