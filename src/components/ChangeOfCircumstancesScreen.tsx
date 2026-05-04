import React, { useState, createElement } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Calculator,
  AlertTriangle,
  Phone,
  ChevronRight,
  MessageSquare,
  Sparkles,
  FileSearch,
  Info,
  Upload,
  Download,
  Image,
  Trash2,
  RotateCcw } from
'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
interface UploadedFile {
  id: string;
  name: string;
  url: string;
  file: File;
}
export function ChangeOfCircumstancesScreen() {
  const { goBack, navigateTo, hasPaid, savedAnswers } = useAppContext();
  const hasAnswers = Object.keys(savedAnswers).length > 0;
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadError(null);
    const newFiles = Array.from(files);
    // Max 5 at a time
    if (newFiles.length > 5) {
      setUploadError('You can upload a maximum of 5 images at a time.');
      return;
    }
    // Check total doesn't exceed reasonable limit
    if (uploadedFiles.length + newFiles.length > 20) {
      setUploadError('Maximum 20 images total. Please remove some first.');
      return;
    }
    const validFiles = newFiles.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length !== newFiles.length) {
      setUploadError('Only image files are accepted (JPG, PNG, etc).');
      return;
    }
    const mapped: UploadedFile[] = validFiles.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      url: URL.createObjectURL(f),
      file: f
    }));
    setUploadedFiles((prev) => [...prev, ...mapped]);
    // Reset input
    e.target.value = '';
  };
  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter((f) => f.id !== id);
    });
  };
  const downloadFile = (file: UploadedFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const downloadAll = () => {
    uploadedFiles.forEach((file) => {
      setTimeout(() => downloadFile(file), 100);
    });
  };
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">
          Change of Circumstances
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
        {/* 1. Hero */}
        <div className="bg-purple-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">Update your existing award</h2>
          <p className="text-purple-100 text-sm leading-relaxed">If your condition has worsened or you have a new condition, you can ask DWP to review your award. We'll help you describe what's changed.</p>
        </div>

        {/* 2. Important Warning */}
        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-rose-900 text-sm">
              Important Warning
            </h3>
          </div>
          <p className="text-sm text-rose-800 leading-relaxed mb-3">
            Be aware: reporting a change means your{' '}
            <strong>ENTIRE award is reviewed</strong>. Your payments could go
            up, stay the same, or go down. Only report if you genuinely believe
            your needs have increased.
          </p>
          <div className="bg-white rounded-lg px-3.5 py-2.5 border border-rose-100">
            <p className="text-xs text-stone-700 leading-relaxed">
              That said,{' '}
              <strong className="text-stone-900">88% of people</strong> who
              report a change of circumstances keep their PIP or get more money.
              Only about <strong className="text-stone-900">11%</strong> see
              their award reduced or stopped entirely.
            </p>
          </div>
        </div>

        {/* 3. When to report a change */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">
            When to report a change
          </h3>
          <ul className="space-y-3">
            {[
            'Your condition has got significantly worse',
            "You've developed a new condition",
            'You now need more help than before',
            'Your medication has changed significantly'].
            map((item, i) =>
            <li key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span className="text-sm text-stone-700">{item}</span>
              </li>
            )}
          </ul>
        </div>

        {/* 4. How it works — the process */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">
            How the process works
          </h3>
          <div className="space-y-4 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-purple-100" />

            {[
            'Call DWP to report the change',
            'They may send you a new PIP2 form',
            'You describe how things have changed',
            'A new assessment may be arranged',
            'DWP makes a new decision'].
            map((step, i) =>
            <div key={i} className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-600 z-10 shrink-0">
                  {i + 1}
                </div>
                <div className="text-sm text-stone-700 pt-0.5">{step}</div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Report a change — phone number */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-2">
            Report a change
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Call the PIP enquiry line for existing claims (this is different
            from the new claims line).
          </p>
          <a
            href="tel:08001214433"
            className="flex items-center justify-center gap-2 w-full bg-purple-50 text-purple-800 py-3 rounded-xl font-semibold text-sm hover:bg-purple-100 transition-colors border border-purple-100">
            
            <Phone className="w-4 h-4" />
            0800 121 4433
          </a>
        </div>

        {/* 6. Get your previous records */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <FileSearch className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900 text-sm">
              Get your previous records first
            </h3>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed mb-3">
            Before filling in your new form, request copies of your{' '}
            <strong>original PIP2 form</strong> and{' '}
            <strong>assessor's report</strong> from DWP. This lets you see
            exactly what you said last time and what the assessor wrote — so you
            can clearly show what has changed.
          </p>

          <div className="bg-white rounded-xl p-4 border border-blue-100 space-y-3 mb-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 mb-1">
                How to request your records
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Make a <strong>Subject Access Request (SAR)</strong> to DWP.
                They're legally required to provide your data within 1 month
                under GDPR.
              </p>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <h4 className="text-xs font-bold text-stone-900 mb-1">
                What to ask for
              </h4>
              <ul className="space-y-1.5">
                <li className="text-xs text-stone-600 flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  Your completed PIP2 form (what you submitted)
                </li>
                <li className="text-xs text-stone-600 flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  The assessor's report (their findings and recommendations)
                </li>
                <li className="text-xs text-stone-600 flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  The DWP decision maker's report (how they scored you)
                </li>
              </ul>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <h4 className="text-xs font-bold text-stone-900 mb-1">
                Where to send it
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Email: <strong>dwp.sar@dwp.gov.uk</strong>
                <br />
                Include your full name, National Insurance number, date of
                birth, and ask specifically for your PIP assessment records.
              </p>
            </div>
          </div>

          <div className="bg-blue-100/60 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>You don't need to wait</strong> for your records to start
              using PIPpal. You can begin your updated answers now and refine
              them later once your records arrive.
            </p>
          </div>
        </div>

        {/* 7. How PIPpal helps — UPDATED with paid/unpaid flow */}
        <div className="bg-purple-50 rounded-2xl border border-purple-100 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 text-sm">
                  How PIPpal helps with your review
                </h3>
                <p className="text-xs text-purple-700">
                  Whether you used PIPpal before or not
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <p className="text-sm text-purple-900 leading-relaxed">
                  Re-answer all 12 PIP questions focused on{' '}
                  <strong>how things have changed</strong> since your last
                  assessment
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <p className="text-sm text-purple-900 leading-relaxed">
                  Our chatbot helps you{' '}
                  <strong>clearly demonstrate the worsening</strong> of your
                  condition in the language DWP scores against
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <p className="text-sm text-purple-900 leading-relaxed">
                  Get <strong>updated, form-ready answers</strong> to copy onto
                  your new PIP2 — showing exactly why your award should increase
                </p>
              </div>
            </div>

            {/* Conditional CTA based on paid status and existing answers */}
            {!hasPaid /* Unpaid users — upsell CTA */ ?
            <button
              onClick={() => navigateTo('upsell')}
              className="w-full bg-purple-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
              
                <Sparkles className="w-4 h-4" />
                Get Full Access to Start
                <ChevronRight className="w-4 h-4" />
              </button> /* Paid users — action options */ :

            <div className="space-y-2.5">
                {/* Option 1: Continue with existing answers (only if they have answers) */}
                {hasAnswers &&
              <button
                onClick={() => navigateTo('question_index')}
                className="w-full bg-purple-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                
                    <MessageSquare className="w-4 h-4" />
                    Continue With Existing Answers
                    <ChevronRight className="w-4 h-4" />
                  </button>
              }

                {/* Option 2: Start fresh */}
                <button
                onClick={() => navigateTo('question_index')}
                className={`w-full py-3 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 ${hasAnswers ? 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50' : 'bg-purple-700 text-white hover:bg-purple-800'}`}>
                
                  <RotateCcw className="w-4 h-4" />
                  Start Fresh
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Option 3: Upload screenshots */}
                <button
                onClick={() => setShowUploadSection(!showUploadSection)}
                className="w-full bg-white text-purple-700 border border-purple-200 py-3 rounded-xl font-semibold text-sm hover:bg-purple-50 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                
                  <Upload className="w-4 h-4" />
                  Upload Previous Form Screenshots
                  {uploadedFiles.length > 0 &&
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {uploadedFiles.length}
                    </span>
                }
                </button>
              </div>
            }
          </div>

          {/* Upload Section — expandable for paid users */}
          <AnimatePresence>
            {hasPaid && showUploadSection &&
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
              className="overflow-hidden">
              
                <div className="px-5 md:px-8 pb-5 pt-2 border-t border-purple-100 space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-purple-100">
                    <div className="flex items-start gap-2.5 mb-3">
                      <Image className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 mb-1">
                          Upload screenshots of your previous PIP2 or assessor
                          report
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          Upload up to <strong>5 images at a time</strong> (JPG,
                          PNG). These are saved locally so you can download them
                          later from here.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center justify-center gap-2 w-full bg-purple-50 text-purple-700 py-3 rounded-xl font-semibold text-sm hover:bg-purple-100 active:scale-[0.98] transition-all cursor-pointer border border-dashed border-purple-200">
                      <Upload className="w-4 h-4" />
                      Choose Images (max 5)
                      <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden" />
                    
                    </label>

                    {uploadError &&
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: -4
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    className="text-xs text-rose-600 mt-2 font-medium">
                    
                        {uploadError}
                      </motion.p>
                  }
                  </div>

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 &&
                <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Uploaded ({uploadedFiles.length})
                        </h4>
                        <button
                      onClick={downloadAll}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors">
                      
                          <Download className="w-3.5 h-3.5" />
                          Download All
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {uploadedFiles.map((file) =>
                    <motion.div
                      key={file.id}
                      initial={{
                        opacity: 0,
                        scale: 0.95
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.95
                      }}
                      className="bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
                      
                            <div className="aspect-[4/3] bg-stone-100 relative">
                              <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover" />
                        
                            </div>
                            <div className="p-2">
                              <p className="text-[10px] text-stone-600 truncate mb-1.5">
                                {file.name}
                              </p>
                              <div className="flex gap-1.5">
                                <button
                            onClick={() => downloadFile(file)}
                            className="flex-1 flex items-center justify-center gap-1 bg-purple-50 text-purple-700 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-purple-100 transition-colors">
                            
                                  <Download className="w-3 h-3" />
                                  Save
                                </button>
                                <button
                            onClick={() => removeFile(file.id)}
                            className="flex items-center justify-center bg-stone-100 text-stone-500 p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors">
                            
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                    )}
                      </div>

                      <div className="bg-amber-50 rounded-lg px-3.5 py-2.5 flex items-start gap-2 border border-amber-100">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          <strong>Tip:</strong> These images are stored in your
                          browser session. Use the <strong>Save</strong> button
                          on each image or <strong>Download All</strong> to save
                          them to your device permanently.
                        </p>
                      </div>
                    </div>
                }
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* 8. Estimate your new award */}
        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-purple-900 text-sm">
              Estimate your new award
            </h3>
          </div>
          <p className="text-xs text-purple-800 leading-relaxed mb-4">
            Use our Change of Circumstances calculator to estimate what your new
            award could be and see the potential uplift.
          </p>
          <button
            onClick={() => navigateTo('payment_calculator')}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
            
            Open Calculator
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>);

}