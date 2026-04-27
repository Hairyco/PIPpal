import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Menu,
  Home,
  ClipboardCheck,
  Stethoscope,
  MessageSquare,
  BookOpen,
  Clock,
  Calculator,
  Coins,
  Download,
  FileText,
  RefreshCw,
  Scale,
  AlertTriangle,
  CheckSquare,
  X,
  LogOut,
  ChevronLeft,
  Crown,
  Sparkles,
  Loader2,
  Settings,
} from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WhatIsPIP } from './components/WhatIsPIP';
import { ClaimSelector } from './components/ClaimSelector';
import { EligibilityBanner } from './components/EligibilityBanner';
import { ChatPreview } from './components/ChatPreview';
import { ValueProp } from './components/ValueProp';
import { TimelineCalculator } from './components/TimelineCalculator';
import { PaymentCalculator } from './components/PaymentCalculator';
import { BackpayCalculator } from './components/BackpayCalculator';
import { HowItWorks } from './components/HowItWorks';
import { WhyPIPpal } from './components/WhyPIPpal';
import { FinalCTA } from './components/FinalCTA';
import { AppProvider, useAppContext, Screen } from './components/AppContext';
import { HomeScreen } from './components/HomeScreen';
import { EligibilityChecker } from './components/EligibilityChecker';
import { MedicalProfile } from './components/MedicalProfile';
import { QuestionIntro } from './components/QuestionIntro';
import { QuestionChat } from './components/QuestionChat';
import { ResultCard } from './components/ResultCard';
import { QuestionIndex } from './components/QuestionIndex';
import { NewClaimIntro } from './components/NewClaimIntro';
import { ClaimProcess } from './components/ClaimProcess';
import { DescriptorsGuide } from './components/DescriptorsGuide';
import { UpsellScreen } from './components/UpsellScreen';
import { LoginScreen } from './components/LoginScreen';
import { PostPaymentGuide } from './components/PostPaymentGuide';
import {
  TimelineCalculatorScreen,
  PaymentCalculatorScreen,
  BackpayCalculatorScreen,
} from './components/CalculatorScreens';
import {
  AssessmentPrep,
  Downloads,
  ClaimSteps,
  AboutScreen,
  PrivacyScreen,
  AccessibilityScreen,
} from './components/Placeholders';
import { PreClaimChecklist } from './components/PreClaimChecklist';
import { PIPDiaryScreen } from './components/PIPDiaryScreen';
import { ChangeOfCircumstancesScreen } from './components/ChangeOfCircumstancesScreen';
import { DecisionReceivedScreen } from './components/DecisionReceivedScreen';
import { MandatoryReconsiderationScreen } from './components/MandatoryReconsiderationScreen';
import { AppealScreen } from './components/AppealScreen';
import { PIPAssistant } from './components/PIPAssistant';
import { AdminDashboard } from './components/AdminDashboard';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm text-stone-500 font-medium">Loading…</p>
      </div>
    </div>
  );
}

function AppContent() {
  const {
    currentScreen,
    navigateTo,
    goBack,
    isLoggedIn,
    user,
    logout,
    hasPaid,
    isLoading,
  } = useAppContext();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    setAnimKey((k) => k + 1);
    setDrawerOpen(false);
  }, [currentScreen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleNavigate = (screen: Screen) => {
    if (screen === 'home' && !isLoggedIn) {
      navigateTo('login');
    } else {
      navigateTo(screen);
    }
  };

  const isLanding = currentScreen === ('landing' as any);
  const showAssistant = currentScreen !== 'q1_chat';

  const drawerNav = (screen: any) => {
    navigateTo(screen);
    setDrawerOpen(false);
  };

  const NavItem = ({
    icon: Icon,
    label,
    screen,
    badge,
  }: {
    icon: React.ElementType;
    label: string;
    screen: any;
    badge?: string;
  }) => {
    const isActive = currentScreen === screen;
    return (
      <button
        onClick={() => drawerNav(screen)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150
          ${isActive
            ? 'bg-teal-50 text-teal-700'
            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98]'
          }`}
      >
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600' : 'text-stone-400'}`} />
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const renderAppScreen = () => {
    switch (currentScreen) {
      case 'login': return <LoginScreen />;
      case 'home': return <HomeScreen />;
      case 'eligibility': return <EligibilityChecker />;
      case 'medical_profile': return <MedicalProfile />;
      case 'q1_intro': return <QuestionIntro />;
      case 'q1_chat': return <QuestionChat />;
      case 'q1_result': return <ResultCard />;
      case 'question_index': return <QuestionIndex />;
      case 'new_claim_intro': return <NewClaimIntro />;
      case 'claim_process': return <ClaimProcess />;
      case 'descriptors_guide': return <DescriptorsGuide />;
      case 'scoring_criteria': return <DescriptorsGuide />;
      case 'upsell': return <UpsellScreen />;
      case 'post_payment_guide': return <PostPaymentGuide />;
      case 'timeline_calculator': return <TimelineCalculatorScreen />;
      case 'payment_calculator': return <PaymentCalculatorScreen />;
      case 'backpay_calculator': return <BackpayCalculatorScreen />;
      case 'assessment_prep': return <AssessmentPrep />;
      case 'pip_diary': return <PIPDiaryScreen />;
      case 'downloads': return <Downloads />;
      case 'decision_received': return <DecisionReceivedScreen />;
      case 'mandatory_reconsideration': return <MandatoryReconsiderationScreen />;
      case 'appeal': return <AppealScreen />;
      case 'change_of_circumstances': return <ChangeOfCircumstancesScreen />;
      case 'pre_claim_checklist': return <PreClaimChecklist />;
      case 'claim_steps': return <ClaimSteps />;
      case 'about': return <AboutScreen />;
      case 'privacy': return <PrivacyScreen />;
      case 'accessibility': return <AccessibilityScreen />;
      case 'admin' as any: return <AdminDashboard />;
      default: return null;
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {isLoading && <LoadingOverlay />}

      {isLanding ? (
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            <Header onGetStarted={() => handleNavigate('home')} />
            <main className="pb-12 relative">
              <Hero onStart={() => handleNavigate('home')} />
              <WhatIsPIP />
              <WhyPIPpal />
              <HowItWorks />
              <EligibilityBanner onStart={() => handleNavigate('eligibility')} />
              <section
                id="free-tools"
                className="px-5 md:px-8 py-8 bg-stone-100/50 border-y border-stone-200/50 my-4"
              >
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-stone-900 mb-1">Try our free tools</h2>
                  <p className="text-stone-500 text-sm">Get instant estimates — no sign-up required</p>
                </div>
                <div className="md:grid md:grid-cols-3 md:gap-6 space-y-4 md:space-y-0">
                  <TimelineCalculator />
                  <PaymentCalculator />
                  <BackpayCalculator />
                </div>
              </section>
              <ChatPreview onStart={() => handleNavigate('home')} />
              <ValueProp />
              <ClaimSelector onSelect={handleNavigate} />
              <FinalCTA onStart={() => handleNavigate('home')} />
              <PIPAssistant
                isVisible={showAssistant}
                hasPaid={hasPaid}
                onUpgrade={() => handleNavigate('upsell')}
              />
            </main>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center bg-stone-200/50 min-h-screen">
          <div className="w-full max-w-4xl flex flex-col flex-1 bg-stone-50 shadow-2xl sm:border-x border-stone-200 relative">

            {currentScreen !== 'login' && (
              <header className="pt-4 pb-3 px-5 md:px-8 bg-teal-700 text-white flex items-center justify-between z-40 relative sticky top-0">
                <button
                  onClick={() => navigateTo('landing' as Screen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <HeartHandshake className="w-6 h-6" />
                  <span className="font-bold text-xl tracking-tight">PIPpal</span>
                </button>
                <button
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="p-2 hover:bg-teal-600 rounded-full transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </header>
            )}

            {drawerOpen && (
              <div className="fixed inset-0 z-50 flex">
                <div
                  className="flex-1 bg-black/40 backdrop-blur-sm"
                  onClick={() => setDrawerOpen(false)}
                />
                <div className="w-72 bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
                  <div className="p-5 bg-teal-700 text-white shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5" />
                        <span className="font-bold text-lg">PIPpal</span>
                      </div>
                      <button
                        onClick={() => setDrawerOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                          {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                          <p className="text-teal-200 text-xs truncate">{user.email}</p>
                        </div>
                        {hasPaid && (
                          <div className="flex items-center gap-1 bg-amber-400/20 text-amber-200 px-2 py-1 rounded-full shrink-0">
                            <Crown className="w-3 h-3" />
                            <span className="text-[10px] font-bold">PRO</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-teal-200 text-sm">Welcome to PIPpal</p>
                    )}
                  </div>

                  <div className="flex-1 px-3 py-4 space-y-5">
                    <div>
                      <NavItem icon={Home} label="Home" screen="home" />
                    </div>

                    <div>
                      <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Your Claim</p>
                      <NavItem icon={MessageSquare} label="My Questions" screen="question_index" />
                      {hasPaid && (
                        <>
                          <NavItem icon={FileText} label="PIP Diary" screen="pip_diary" />
                          <NavItem icon={Download} label="Downloads" screen="downloads" />
                          <NavItem icon={CheckSquare} label="Pre-Claim Checklist" screen="pre_claim_checklist" />
                        </>
                      )}
                    </div>

                    <div>
                      <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Tools & Prep</p>
                      <NavItem icon={ClipboardCheck} label="Am I Eligible?" screen="eligibility" />
                      <NavItem icon={Stethoscope} label="Medical Profile" screen="medical_profile" />
                      <NavItem icon={BookOpen} label="How It Works" screen="claim_process" />
                      <NavItem icon={Scale} label="What Assessors Look For" screen="descriptors_guide" />
                    </div>

                    <div>
                      <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Free Calculators</p>
                      <NavItem icon={Clock} label="Timeline Calculator" screen="timeline_calculator" badge="Free" />
                      <NavItem icon={Calculator} label="Payment Calculator" screen="payment_calculator" badge="Free" />
                      <NavItem icon={Coins} label="Backpay Calculator" screen="backpay_calculator" badge="Free" />
                    </div>

                    <div>
                      <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">After Your Decision</p>
                      <NavItem icon={FileText} label="Decision Received" screen="decision_received" />
                      <NavItem icon={AlertTriangle} label="Mandatory Reconsideration" screen="mandatory_reconsideration" />
                      <NavItem icon={Scale} label="Appeal" screen="appeal" />
                      <NavItem icon={RefreshCw} label="Change of Circumstances" screen="change_of_circumstances" />
                    </div>

                    {!hasPaid && (
                      <div className="mx-1">
                        <button
                          onClick={() => drawerNav('upsell')}
                          className="w-full bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-left hover:bg-orange-100 transition-colors active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-bold text-orange-900">Unlock Full Access</span>
                          </div>
                          <p className="text-[11px] text-orange-700 leading-relaxed">
                            All 12 questions, PIP Diary, downloads & more — £12.99 one-time
                          </p>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-stone-100 p-3 space-y-1 shrink-0">
                    <button
                      onClick={() => drawerNav('landing')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-500 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-stone-400" />
                      Back to Landing Page
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => drawerNav('admin')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-500 rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-stone-400" />
                        Admin Dashboard
                      </button>
                    )}
                    {isLoggedIn && (
                      <button
                        onClick={() => { logout(); setDrawerOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              <div key={animKey} className="screen-enter h-full">
                {renderAppScreen()}
              </div>
              <PIPAssistant
                isVisible={showAssistant}
                hasPaid={hasPaid}
                onUpgrade={() => navigateTo('upsell')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}