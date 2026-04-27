import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppContext, Condition } from './AppContext';
import { supabase } from '../supabaseClient';

const PRESET_CONDITIONS = [
  'Anxiety disorder',
  'Depression',
  'PTSD',
  'Agoraphobia',
  'Autism',
  'ADHD',
  'Visual impairment',
  'Memory loss',
  'Dementia',
  'Brain injury',
  'Epilepsy',
  'Chronic pain',
  'MS',
  'Stroke',
  'Bipolar disorder',
  'Schizophrenia',
  'Fibromyalgia',
  'Arthritis',
  'Diabetes',
  'Crohn\'s disease',
];

export function MedicalProfile() {
  const { medProfile, setMedProfile, navigateTo, goBack, user, showToast } = useAppContext();
  const [conditions, setConditions] = useState<Condition[]>(medProfile.conditions);
  const [customCondition, setCustomCondition] = useState('');
  const [medications, setMedications] = useState(medProfile.medications);
  const [notes, setNotes] = useState(medProfile.notes);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('medical_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data && !error) {
          const loaded = {
            conditions: data.conditions || [],
            medications: data.medications || '',
            notes: data.notes || '',
          };
          setConditions(loaded.conditions);
          setMedications(loaded.medications);
          setNotes(loaded.notes);
          setMedProfile(loaded);
        }
      } catch {
        // No profile yet — use defaults
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user?.id]);

  const toggleCondition = (name: string) => {
    if (conditions.some((c) => c.name === name)) {
      setConditions(conditions.filter((c) => c.name !== name));
    } else {
      setConditions([...conditions, { name, durationNum: '', durationUnit: 'years' }]);
    }
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !conditions.some((c) => c.name === customCondition.trim())) {
      setConditions([...conditions, { name: customCondition.trim(), durationNum: '', durationUnit: 'years' }]);
      setCustomCondition('');
    }
  };

  const updateDuration = (name: string, field: 'durationNum' | 'durationUnit', value: string) => {
    setConditions(conditions.map((c) => c.name === name ? { ...c, [field]: value } : c));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const profile = { conditions, medications, notes };
    setMedProfile(profile);

    // Save to Supabase if logged in
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('medical_profiles')
          .upsert({
            user_id: user.id,
            conditions,
            medications,
            notes,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) throw error;
        setSaved(true);
        showToast('Medical profile saved!', 'success');
        setTimeout(() => {
          navigateTo('q1_intro');
        }, 800);
      } catch (err) {
        showToast('Saved locally — will sync when connection is restored.', 'info');
        navigateTo('q1_intro');
      }
    } else {
      navigateTo('q1_intro');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-stone-50 gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm text-stone-500">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Medical Profile</h1>
        {conditions.length > 0 && (
          <span className="ml-auto text-xs font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
            {conditions.length} condition{conditions.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-8 pb-28">

        {/* Conditions */}
        <section>
          <h2 className="text-base font-bold text-stone-900 mb-1">Your Conditions</h2>
          <p className="text-sm text-stone-500 mb-4">Select all that apply to you.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_CONDITIONS.map((cond) => {
              const isSelected = conditions.some((c) => c.name === cond);
              return (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border active:scale-95
                    ${isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-teal-300 hover:bg-teal-50'
                    }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />}
                  {cond}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Other condition..."
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomCondition()}
              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              onClick={addCustomCondition}
              className="bg-stone-100 text-stone-700 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-200 transition-colors active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Duration */}
        {conditions.length > 0 && (
          <section className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 mb-3">How long have you had them?</h2>
            <div className="space-y-3">
              {conditions.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="flex-1 text-sm font-medium text-stone-700 truncate">{c.name}</div>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={c.durationNum}
                    onChange={(e) => updateDuration(c.name, 'durationNum', e.target.value)}
                    className="w-16 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-teal-500"
                  />
                  <select
                    value={c.durationUnit}
                    onChange={(e) => updateDuration(c.name, 'durationUnit', e.target.value as 'months' | 'years')}
                    className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Medications */}
        <section>
          <h2 className="text-base font-bold text-stone-900 mb-1">Medications</h2>
          <p className="text-sm text-stone-500 mb-3">List any medications you take.</p>
          <input
            type="text"
            placeholder="e.g. Sertraline 50mg, Paracetamol..."
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-base font-bold text-stone-900 mb-1">Additional Notes</h2>
          <p className="text-sm text-stone-500 mb-3">Anything else we should know?</p>
          <textarea
            rows={3}
            placeholder="e.g. I have good days and bad days..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
        </section>
      </div>

      <div className="p-5 md:px-8 bg-white border-t border-stone-100">
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-5 h-5" /> Saved!</>
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </div>
  );
}