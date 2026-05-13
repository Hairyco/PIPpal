// src/data/questionFlowData.ts
// Data powering the 5-step question flow for all 12 PIP activities

export type FrequencyLevel = 'never' | 'rarely' | 'sometimes' | 'often' | 'most_days';
export type DescriptorCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface Difficulty {
  id: string;
  text: string;
}

export interface DifficultyCategory {
  id: string;
  name: string;
  selectedBg: string;   // Tailwind bg class when selected
  selectedText: string; // Tailwind text class when selected
  difficulties: Difficulty[];
}

export interface SupportOption {
  id: string;
  title: string;
  description: string;
  weight: number; // 0=no help, 1=aid, 2=prompting, 3=supervision, 4=full help
}

export interface ImpactOption {
  id: string;
  title: string;
  description: string;
}

export interface FlowAnswers {
  selectedDifficulties: string[];
  frequencies: Record<string, FrequencyLevel>;
  supportTypes: string[];
  impacts: string[];
  additionalDetail: string;
}

export interface QuestionFlowConfig {
  questionId: string;          // 'q1'–'q12'
  activityType: 'daily' | 'mobility';
  activityNum: number;         // 1–10 daily, 1–2 mobility
  pipFormRef: string;          // e.g. 'Q3' on official PIP2
  title: string;
  subtitle: string;
  explained: string;
  helpQuestions: string[];
  exampleAnswer: {
    name: string;
    age: number;
    label: string;
    quote: string;
  };
  difficultyCategories: DifficultyCategory[];
  supportOptions: SupportOption[];
  noHelpId: string;
  impactOptions: ImpactOption[];
  calculateDescriptor: (answers: FlowAnswers) => DescriptorCode;
}

// ─── SCORING HELPERS ───────────────────────────────────────────────────────

function frequencyScore(freq: FrequencyLevel): number {
  const map: Record<FrequencyLevel, number> = {
    never: 0, rarely: 1, sometimes: 2, often: 3, most_days: 4,
  };
  return map[freq] ?? 0;
}

function anyFreqAbove(frequencies: Record<string, FrequencyLevel>, ids: string[], threshold: number): boolean {
  return ids.some(id => frequencyScore(frequencies[id] ?? 'never') >= threshold);
}

// ─── ALL 12 QUESTIONS ──────────────────────────────────────────────────────

export const QUESTION_FLOW_DATA: Record<string, QuestionFlowConfig> = {

  q1: {
    questionId: 'q1',
    activityType: 'daily',
    activityNum: 1,
    pipFormRef: 'Q3',
    title: 'Can you prepare and cook a simple meal safely?',
    subtitle: 'Can you safely plan, prepare, and cook a proper cooked meal from scratch — not just reheat or make a sandwich?',
    explained: "When DWP ask about preparing food, they mean a proper cooked meal — like pasta, a roast, or a hot dish — made from scratch for one person. Not a microwave ready meal. They want to know whether you can do the whole thing safely on most days: deciding what to make, getting ingredients ready, using the hob or oven, and finishing without putting yourself at risk. Pain, fatigue, memory, anxiety, tremors — all of these affect your ability to cook safely and they all count. Think about your worst days, not your best. If someone has to step in, you've had accidents, or you avoid it altogether — that's what we need to know.",
    helpQuestions: [
      'Give me another example',
      'How does this apply to anxiety?',
      "What counts as 'safely'?",
      'What if I can only use a microwave?',
      'Does forgetting to eat count?',
    ],
    exampleAnswer: {
      name: 'Alex', age: 41, label: 'Anxiety and chronic pain',
      quote: "Most days I can't cook safely. I've burned myself leaving things on the hob, and once I completely forgot a pan was on — my partner smelled it from upstairs. On a good day I might manage to heat something in the microwave, but even that takes me three times as long because my grip is poor and I have to sit down between each step. My partner prepares all my proper meals now. I haven't cooked a full meal safely by myself in about two years, and honestly I'm frightened to try. On my worst days — which is most days — I can't stand long enough to even fill the kettle safely.",
    },
    difficultyCategories: [
      {
        id: 'mental',
        name: 'Mental Health',
        selectedBg: 'bg-teal-700',
        selectedText: 'text-white',
        difficulties: [
          { id: 'overwhelmed_cooking', text: 'I get overwhelmed cooking' },
          { id: 'avoid_hob', text: 'I avoid using the hob' },
          { id: 'forget_food_on', text: 'I forget food is cooking' },
          { id: 'lose_concentration', text: 'I lose concentration' },
          { id: 'need_reminders_cook', text: 'I need reminders or encouragement' },
          { id: 'anxious_cooking_alone', text: 'I get anxious or panicky cooking alone' },
        ],
      },
      {
        id: 'physical',
        name: 'Physical',
        selectedBg: 'bg-teal-700',
        selectedText: 'text-white',
        difficulties: [
          { id: 'standing_pain', text: 'Standing causes pain or fatigue' },
          { id: 'struggle_chopping', text: 'I struggle chopping ingredients' },
          { id: 'weak_grip', text: 'Weak grip or tremors' },
          { id: 'balance_problems', text: 'Balance problems' },
          { id: 'need_to_sit', text: 'I need to sit while preparing food' },
          { id: 'microwave_only', text: 'I can only safely use a microwave' },
        ],
      },
      {
        id: 'cognitive',
        name: 'Cognitive / Neurodivergent',
        selectedBg: 'bg-teal-700',
        selectedText: 'text-white',
        difficulties: [
          { id: 'forget_steps', text: 'I forget steps mid-way through' },
          { id: 'distracted_easily', text: 'I get distracted easily' },
          { id: 'struggle_planning_meals', text: 'I struggle planning meals' },
          { id: 'need_supervision_safety', text: 'I need someone present for safety' },
        ],
      },
    ],
    supportOptions: [
      { id: 'all_meals_others', title: 'All my meals are prepared by someone else', description: 'I cannot prepare or cook any meals myself.', weight: 4 },
      { id: 'supervision', title: 'I need supervision for safety', description: 'Someone needs to be nearby to make sure I stay safe.', weight: 3 },
      { id: 'help_parts', title: 'I get help with parts of cooking', description: 'Someone helps me with tasks like chopping, using the hob, etc.', weight: 3 },
      { id: 'prompting', title: 'I need reminders or encouragement', description: 'Someone has to remind or encourage me to cook or eat.', weight: 2 },
      { id: 'aids_appliances', title: 'I use aids or special equipment', description: 'Grab rails, perching stool, adapted utensils, etc.', weight: 1 },
      { id: 'no_help', title: "I don't need help", description: 'I can prepare and cook without any help.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'avoid_cooking', title: 'I avoid cooking', description: 'I avoid using the hob/oven or making meals.' },
      { id: 'rely_ready_meals', title: 'I rely on ready meals or takeaways', description: "It's easier or safer for me." },
      { id: 'takes_much_longer', title: 'It takes me much longer', description: 'I need breaks or it takes far longer than others.' },
      { id: 'become_exhausted', title: 'I become exhausted', description: 'It leaves me very tired or drained.' },
      { id: 'had_accidents', title: "I've had accidents", description: 'Burns, leaving the hob on, or other incidents.' },
      { id: 'skip_meals', title: "I can't always eat properly", description: "I skip meals or don't eat enough." },
    ],
    calculateDescriptor(answers) {
      const { supportTypes, selectedDifficulties, frequencies } = answers;
      if (supportTypes.includes('all_meals_others')) return 'F';
      if (supportTypes.includes('supervision') || supportTypes.includes('help_parts')) return 'E';
      if (supportTypes.includes('prompting')) return 'D';
      if (selectedDifficulties.includes('microwave_only') &&
        anyFreqAbove(frequencies, ['microwave_only'], 2)) return 'C';
      if (supportTypes.includes('aids_appliances')) return 'B';
      return 'A';
    },
  },

  q2: {
    questionId: 'q2',
    activityType: 'daily',
    activityNum: 2,
    pipFormRef: 'Q4',
    title: 'Can you eat and drink safely and reliably?',
    subtitle: 'Once food is in front of you — can you actually eat and drink safely and on your own?',
    explained: "This is separate from cooking — it's about what happens when the food is already there. Can you cut it up, pick it up, swallow it safely, and get through the whole meal on your own? Tremors, swallowing difficulties, choking, needing someone to cut your food, or forgetting to eat — they all count here. So does needing encouragement or supervision at mealtimes. DWP want to know whether you can do this reliably, not just on a good day.",
    helpQuestions: [
      'What if I can eat some foods but not others?',
      'Does choking count?',
      'What about forgetting to eat?',
      'Does eating very slowly count?',
    ],
    exampleAnswer: {
      name: 'Maria', age: 56, label: 'Neurological condition',
      quote: "I have a swallowing condition and I choke at almost every meal. My carer cuts my food into tiny pieces before I start and sits with me throughout in case I need to be helped. Even with all of that, I've had to call for help twice when I choked badly. On bad days I can't eat solid food at all and I'm losing weight because of it. Without my carer present I would not be safe eating. It's frightening and exhausting, and it's got worse over the past year.",
    },
    difficultyCategories: [
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'anxious_eating', text: 'I get anxious about eating' },
          { id: 'forget_to_eat', text: 'I forget to eat or lose appetite' },
          { id: 'restrict_eating', text: 'I restrict what or how much I eat' },
          { id: 'need_encouragement_eat', text: 'I need encouragement to eat' },
        ],
      },
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'swallowing_difficulty', text: 'I have difficulty swallowing' },
          { id: 'struggle_cutting', text: 'I struggle to cut food' },
          { id: 'weak_grip_eating', text: 'Weak grip or tremors when eating' },
          { id: 'choke_regularly', text: 'I choke or cough frequently' },
          { id: 'need_special_utensils', text: 'I need special utensils or crockery' },
          { id: 'tube_fed', text: 'I am tube-fed or PEG-fed' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'distracted_eating', text: 'I get distracted and stop eating' },
          { id: 'forget_eating_mid', text: 'I forget I am eating' },
          { id: 'sensory_food', text: 'Sensory issues affect what I can eat' },
        ],
      },
    ],
    supportOptions: [
      { id: 'fed_by_others', title: 'I am fed by someone else', description: 'I cannot eat independently at all.', weight: 4 },
      { id: 'supervision_eating', title: 'I need supervision while eating', description: 'Someone needs to be present for my safety.', weight: 3 },
      { id: 'help_cutting', title: 'I need help cutting or preparing food to eat', description: 'Someone cuts my food or helps me manage it.', weight: 3 },
      { id: 'prompting_eat', title: 'I need reminders to eat', description: 'Someone has to prompt me to eat or drink.', weight: 2 },
      { id: 'aids_eating', title: 'I use adapted utensils or equipment', description: 'Special cups, plates, utensils, etc.', weight: 1 },
      { id: 'no_help', title: "I don't need help eating", description: 'I can eat and drink independently.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'skip_meals_eat', title: 'I skip meals or eat very little', description: "I often don't eat enough." },
      { id: 'takes_long_eating', title: 'Eating takes much longer than normal', description: 'Mealtimes are exhausting or slow.' },
      { id: 'choke_incidents', title: "I've had choking incidents", description: 'I have choked or had near-misses.' },
      { id: 'lose_weight', title: 'I have lost weight unintentionally', description: 'My condition affects my nutrition.' },
      { id: 'exhausted_after', title: 'I am exhausted after eating', description: 'The effort of eating drains me.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('fed_by_others')) return 'F';
      if (supportTypes.includes('supervision_eating') || supportTypes.includes('help_cutting')) return 'E';
      if (supportTypes.includes('prompting_eat')) return 'D';
      if (supportTypes.includes('aids_eating')) return 'B';
      return 'A';
    },
  },

  q3: {
    questionId: 'q3',
    activityType: 'daily',
    activityNum: 3,
    pipFormRef: 'Q5',
    title: 'Can you manage your therapy or health monitoring?',
    subtitle: 'Can you manage your medication, treatments, and therapy exercises safely and consistently — without reminders or help?',
    explained: "This covers everything involved in keeping on top of your health: taking medication at the right time and in the right dose, using equipment like nebulisers or CPAP machines, monitoring your condition (like checking blood glucose or blood pressure), and doing any therapy exercises. If you forget doses, take the wrong amount, need reminders, or need someone to help you with injections or equipment — that all counts. Think about whether you can do all of this consistently and safely without someone stepping in.",
    helpQuestions: [
      'What if I take medication but forget doses?',
      'Does physiotherapy count?',
      'What about dialysis or injections?',
      'Does monitoring blood glucose count?',
    ],
    exampleAnswer: {
      name: 'James', age: 34, label: 'Type 1 diabetes and anxiety',
      quote: "I need to inject insulin up to five times a day. When I'm anxious or tired — which is most days — I either forget completely or miscalculate the dose, which has landed me in hospital twice. My partner now manages all of it. She sets my alarms, draws up the doses, and checks I've actually taken them. Left to myself it genuinely wouldn't be safe. I also have physiotherapy exercises I'm supposed to do daily, but the fatigue means I can only manage them maybe twice a week at best.",
    },
    difficultyCategories: [
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'forget_medication', text: 'I forget to take medication' },
          { id: 'struggle_motivation', text: 'I struggle to motivate myself to manage treatment' },
          { id: 'anxious_treatment', text: 'I get anxious about taking medication or treatment' },
          { id: 'self_neglect', text: 'I sometimes skip treatment when unwell mentally' },
        ],
      },
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'struggle_injections', text: 'I struggle to self-inject or use equipment' },
          { id: 'complex_regime', text: 'I have a complex medication regime' },
          { id: 'cant_manage_equipment', text: "I can't manage treatment equipment alone" },
          { id: 'pain_during_therapy', text: 'Therapy exercises cause significant pain or fatigue' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'wrong_dose', text: 'I sometimes take the wrong dose' },
          { id: 'forget_monitoring', text: 'I forget to monitor my condition' },
          { id: 'cant_follow_regime', text: "I can't follow a complex treatment plan independently" },
        ],
      },
    ],
    supportOptions: [
      { id: 'all_managed_others', title: 'Someone else manages all my treatment', description: 'I cannot manage medication or therapy myself.', weight: 4 },
      { id: 'supervision_treatment', title: 'I need supervision when taking treatment', description: 'Someone must be present to ensure I do it safely.', weight: 3 },
      { id: 'help_treatment', title: 'I need help with parts of my treatment', description: 'Help with injections, equipment, therapy, etc.', weight: 3 },
      { id: 'prompting_treatment', title: 'I need reminders to take medication', description: 'Someone prompts me or sets alarms for me.', weight: 2 },
      { id: 'aids_treatment', title: 'I use aids to manage treatment', description: 'Dosette box, monitored dosage system, etc.', weight: 1 },
      { id: 'no_help', title: "I manage my treatment independently", description: 'I can manage all medication and therapy myself.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'miss_doses', title: 'I regularly miss doses', description: "I don't always take medication on time or at all." },
      { id: 'wrong_dose_impact', title: "I've taken the wrong dose", description: "This has caused problems or near-misses." },
      { id: 'condition_worsens', title: 'My condition worsens without consistent treatment', description: 'Missing treatment has real consequences.' },
      { id: 'therapy_inconsistent', title: 'I cannot do therapy exercises consistently', description: 'Pain, fatigue, or forgetting prevents this.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('all_managed_others')) return 'G'; // Needs >3.5hrs therapy
      if (supportTypes.includes('supervision_treatment') || supportTypes.includes('help_treatment')) return 'F';
      if (supportTypes.includes('prompting_treatment')) return 'E';
      if (supportTypes.includes('aids_treatment')) return 'D';
      return 'A';
    },
  },

  q4: {
    questionId: 'q4',
    activityType: 'daily',
    activityNum: 4,
    pipFormRef: 'Q6',
    title: 'Can you wash and bathe safely?',
    subtitle: 'Can you wash your whole body safely — including getting in and out of the bath or shower — on most days?',
    explained: "DWP aren't just asking whether you have a wash sometimes — they want to know if you can do it safely, reliably, and to an acceptable standard on most days. That includes getting in and out of the bath or shower without risking a fall, washing all parts of your body including your hair, and drying off. If it takes much longer, you can only manage it every few days, you use aids like grab rails or a shower seat, or you need someone's help — all of that is relevant. Don't forget bad days.",
    helpQuestions: [
      'Does hair washing count separately?',
      'What if I can shower but not bathe?',
      'Does needing a shower chair count?',
      'What about on bad days?',
    ],
    exampleAnswer: {
      name: 'Sarah', age: 47, label: 'Chronic pain condition',
      quote: "I use a shower seat and grab rails just to be able to get in. Even with those, I can only shower safely about twice a week — on other days the pain and fatigue are too much. I can't wash my hair without help because I can't keep my arms raised long enough, and my partner has to wash the lower half of my body because I can't bend or reach. Without her I wouldn't be safe in the shower at all. Last month I slipped getting out even with the rail — I was on the floor for 20 minutes before she found me.",
    },
    difficultyCategories: [
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'no_motivation_wash', text: 'Lack of motivation to wash' },
          { id: 'anxious_bathing', text: 'Anxiety about bathing or showering' },
          { id: 'forget_to_wash', text: 'I forget to wash or how often I have' },
          { id: 'distress_washing', text: 'Washing causes significant distress' },
        ],
      },
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'cant_get_in_bath', text: "I can't get in or out of the bath safely" },
          { id: 'balance_washing', text: 'Balance problems make washing unsafe' },
          { id: 'pain_washing', text: 'Pain prevents me washing properly' },
          { id: 'reach_body', text: "I can't reach all parts of my body" },
          { id: 'fatigue_washing', text: 'Fatigue means I can only wash partially' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'forget_washing_steps', text: "I forget steps or whether I've washed" },
          { id: 'need_prompting_wash', text: 'I need reminding to wash' },
          { id: 'sensory_washing', text: 'Sensory issues make washing very difficult' },
        ],
      },
    ],
    supportOptions: [
      { id: 'all_wash_by_others', title: 'Someone washes me completely', description: 'I cannot wash any part of myself unaided.', weight: 4 },
      { id: 'supervision_washing', title: 'I need supervision while washing', description: 'Someone must be present for my safety.', weight: 3 },
      { id: 'help_parts_washing', title: 'I need help with some parts of washing', description: 'Help with hair, back, feet, getting in/out.', weight: 3 },
      { id: 'prompting_washing', title: 'I need reminders to wash', description: 'Someone has to encourage or prompt me.', weight: 2 },
      { id: 'aids_washing', title: 'I use aids or adaptations', description: 'Grab rails, shower seat, bath board, long-handled brush.', weight: 1 },
      { id: 'no_help', title: "I wash independently", description: 'I can wash my whole body without help.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'wash_less_often', title: 'I wash less often than I should', description: 'I can only manage every few days.' },
      { id: 'partial_wash_only', title: 'I can only do a partial wash', description: "I can't wash my whole body each time." },
      { id: 'exhausted_after_wash', title: 'Washing exhausts me', description: 'I need to rest significantly afterwards.' },
      { id: 'fall_risk', title: "I've had falls or near-falls", description: 'Washing is genuinely dangerous for me.' },
      { id: 'pain_after_wash', title: 'Washing causes or worsens pain', description: 'I pay a physical price afterwards.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('all_wash_by_others')) return 'F';
      if (supportTypes.includes('supervision_washing') || supportTypes.includes('help_parts_washing')) return 'E';
      if (supportTypes.includes('prompting_washing')) return 'D';
      if (supportTypes.includes('aids_washing')) return 'C';
      return 'A';
    },
  },

  q5: {
    questionId: 'q5',
    activityType: 'daily',
    activityNum: 5,
    pipFormRef: 'Q7',
    title: 'Can you manage your toilet needs safely?',
    subtitle: 'Can you get to the toilet in time, manage your clothing, and clean yourself — reliably, safely, and with dignity?',
    explained: "This covers the whole process: getting there quickly enough, managing your clothing, cleaning yourself properly, and dealing with any continence issues. If you use a catheter, stoma bag, or commode, that's relevant too. Accidents, urgency that means you don't always make it, needing help to clean yourself, needing prompting — all of it matters. It can feel like a hard thing to talk about, but it's an important part of your claim and DWP need you to be honest.",
    helpQuestions: [
      'Does using a catheter count?',
      'What about urgency and accidents?',
      'Does managing a stoma count?',
      'What if I need help with clothing only?',
    ],
    exampleAnswer: {
      name: 'David', age: 63, label: 'Mobility and continence condition',
      quote: "I have urgency incontinence and I don't always make it in time — probably two or three accidents a week. I also can't clean myself properly because of limited reach and severe back pain, so my wife helps me after every bowel movement. Getting my clothing up and down quickly enough is a real struggle too. I've had to cut the sides of some trousers to make it faster. It affects my life every single day and I can't manage it safely or with dignity on my own.",
    },
    difficultyCategories: [
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'urgency_accidents', text: 'I have urgency and sometimes have accidents' },
          { id: 'cant_clean_self', text: "I can't clean myself properly" },
          { id: 'pain_toilet', text: 'Pain makes using the toilet difficult' },
          { id: 'cant_manage_clothing', text: "I can't manage clothing quickly enough" },
          { id: 'stoma_catheter', text: 'I use a stoma or catheter' },
          { id: 'need_commode', text: 'I use a commode or bedpan' },
        ],
      },
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'anxiety_toilet', text: 'Anxiety affects my toilet needs' },
          { id: 'distress_accidents', text: 'Accidents cause severe distress' },
          { id: 'forget_toilet_needs', text: 'I forget or ignore toilet needs' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'need_prompting_toilet', text: 'I need reminding to use the toilet' },
          { id: 'cant_manage_stoma', text: "I can't manage stoma/catheter independently" },
        ],
      },
    ],
    supportOptions: [
      { id: 'full_help_toilet', title: 'Someone assists me completely', description: 'I cannot manage toilet needs independently at all.', weight: 4 },
      { id: 'supervision_toilet', title: 'I need supervision in the toilet', description: 'Someone must be present for safety.', weight: 3 },
      { id: 'help_parts_toilet', title: 'I need help with some aspects', description: 'Help with cleaning, clothing, managing products.', weight: 3 },
      { id: 'prompting_toilet', title: 'I need reminders', description: 'Someone has to prompt me to use the toilet.', weight: 2 },
      { id: 'aids_toilet', title: 'I use aids or adaptations', description: 'Raised seat, grab rails, continence products.', weight: 1 },
      { id: 'no_help', title: 'I manage independently', description: 'I can manage all toilet needs without help.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'regular_accidents', title: 'I regularly have accidents', description: 'I frequently do not make it to the toilet in time.' },
      { id: 'restrict_activities', title: 'I restrict activities due to toilet needs', description: "I avoid going out because of continence worries." },
      { id: 'distress_toilet', title: 'Accidents cause significant distress', description: "It affects my confidence and mental health." },
      { id: 'takes_long_toilet', title: 'It takes me much longer', description: 'Managing toilet needs is very time-consuming.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('full_help_toilet')) return 'F';
      if (supportTypes.includes('supervision_toilet') || supportTypes.includes('help_parts_toilet')) return 'E';
      if (supportTypes.includes('prompting_toilet')) return 'D';
      if (supportTypes.includes('aids_toilet')) return 'C';
      return 'A';
    },
  },

  q6: {
    questionId: 'q6',
    activityType: 'daily',
    activityNum: 6,
    pipFormRef: 'Q8',
    title: 'Can you dress and undress safely?',
    subtitle: 'Can you put on and take off your clothes — including shoes, socks, and fastenings — without help?',
    explained: "This covers the whole process of getting dressed and undressed each day: choosing appropriate clothing for the weather, managing fastenings like buttons and zips, getting socks and shoes on, and dressing your whole body including both upper and lower half. If it causes significant pain, takes much longer than it should, you can only wear loose or adapted clothing, or you need someone to help you with any part of it — that all counts. Think about most days, not just when things are going well.",
    helpQuestions: [
      'Does struggling with buttons count?',
      'What if I can dress but not undress?',
      'Does taking much longer count?',
      'What about on bad days?',
    ],
    exampleAnswer: {
      name: 'Lynn', age: 52, label: 'Joint condition',
      quote: "Most mornings I can't lift my arms high enough to put on a top without help. My husband dresses me every day. I can't do buttons or zips because of the pain in my fingers and my grip, and I haven't been able to put my own socks or shoes on in over a year — I wear slip-ons and my husband does my socks. Some days the pain is so bad I stay in what I slept in. Even with his help, getting dressed takes at least 45 minutes and I'm exhausted before the day has started.",
    },
    difficultyCategories: [
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'pain_dressing', text: 'Dressing causes pain' },
          { id: 'limited_reach', text: 'Limited reach or movement' },
          { id: 'cant_do_fastenings', text: "I can't manage buttons, zips, or laces" },
          { id: 'cant_do_socks_shoes', text: "I can't put on socks or shoes" },
          { id: 'balance_dressing', text: 'Balance problems make dressing unsafe' },
          { id: 'fatigue_dressing', text: 'Dressing exhausts me' },
        ],
      },
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'no_motivation_dress', text: 'Lack of motivation to dress' },
          { id: 'forget_to_dress', text: 'I forget to dress or choose appropriate clothing' },
          { id: 'distress_dressing', text: 'Getting dressed causes significant distress' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'sensory_clothing', text: 'Sensory issues with clothing textures' },
          { id: 'wrong_clothes', text: 'I put on wrong or inappropriate clothing' },
          { id: 'need_prompting_dress', text: 'I need reminding to dress' },
        ],
      },
    ],
    supportOptions: [
      { id: 'dressed_by_others', title: 'Someone dresses me completely', description: 'I cannot dress or undress at all unaided.', weight: 4 },
      { id: 'supervision_dressing', title: 'I need supervision while dressing', description: 'Someone must be present for safety.', weight: 3 },
      { id: 'help_parts_dressing', title: 'I need help with some items', description: 'Help with socks, shoes, fastenings, top half, etc.', weight: 3 },
      { id: 'prompting_dressing', title: 'I need reminders to dress', description: 'Someone has to prompt or encourage me.', weight: 2 },
      { id: 'aids_dressing', title: 'I use aids', description: 'Dressing stick, button hook, elastic laces, etc.', weight: 1 },
      { id: 'no_help', title: 'I dress independently', description: 'I can dress and undress without help.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'stay_in_pyjamas', title: 'I sometimes stay in pyjamas all day', description: "I can't always manage to dress." },
      { id: 'only_loose_clothing', title: 'I can only wear loose or adapted clothing', description: 'Regular clothes are too difficult.' },
      { id: 'takes_long_dressing', title: 'Dressing takes much longer than normal', description: "It's very time-consuming and exhausting." },
      { id: 'pain_after_dressing', title: 'Dressing causes or worsens pain', description: 'I suffer for it afterwards.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('dressed_by_others')) return 'F';
      if (supportTypes.includes('supervision_dressing') || supportTypes.includes('help_parts_dressing')) return 'E';
      if (supportTypes.includes('prompting_dressing')) return 'D';
      if (supportTypes.includes('aids_dressing')) return 'C';
      return 'A';
    },
  },

  q7: {
    questionId: 'q7',
    activityType: 'daily',
    activityNum: 7,
    pipFormRef: 'Q9',
    title: 'Can you communicate verbally?',
    subtitle: 'Can you speak and be understood by others — and understand what people say to you?',
    explained: "This is about whether your condition affects your ability to communicate out loud. That could be because you struggle to speak clearly, you have a stammer, you lose your words, or because understanding what people say is difficult. Things like needing people to repeat themselves, speak more slowly, or use simpler language all count. Aphasia, anxiety that makes speaking feel impossible, selective mutism, and significant hearing loss are all relevant here.",
    helpQuestions: [
      'What if I can talk but not be understood?',
      'Does a stammer count?',
      'What about understanding fast speech?',
      'Does using AAC count?',
    ],
    exampleAnswer: {
      name: 'Tom', age: 38, label: 'Stroke survivor with aphasia',
      quote: "Since my stroke I know what I want to say but the words come out wrong or don't come at all. Sometimes I say a completely different word to the one I mean. I use a communication app on my phone but even that takes a long time and people still look confused. Phone calls are nearly impossible — I had to stop answering the phone altogether. My partner speaks for me in most situations now. Anything important I have to prepare in writing in advance, and even then I need her to check it makes sense.",
    },
    difficultyCategories: [
      {
        id: 'physical', name: 'Physical / Speech', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'unclear_speech', text: 'My speech is unclear or hard to understand' },
          { id: 'stammer', text: 'I have a significant stammer or stutter' },
          { id: 'voice_problems', text: 'I have voice problems (loss, hoarseness)' },
          { id: 'aphasia', text: 'I have aphasia or word-finding difficulties' },
          { id: 'hearing_loss', text: 'Hearing loss affects my communication' },
        ],
      },
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'anxiety_speaking', text: 'Anxiety severely affects my ability to speak' },
          { id: 'selective_mutism', text: 'I have selective mutism' },
          { id: 'dissociation_communication', text: 'Dissociation affects my communication' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'process_verbal_info', text: 'I struggle to process verbal information quickly' },
          { id: 'overwhelmed_conversation', text: 'Conversations overwhelm me' },
          { id: 'need_info_repeated', text: 'I need information repeated or simplified' },
        ],
      },
    ],
    supportOptions: [
      { id: 'cannot_communicate_verbal', title: 'I cannot communicate verbally at all', description: 'I rely completely on non-verbal or aided communication.', weight: 4 },
      { id: 'aac_device', title: 'I use a communication aid or device', description: 'Communication board, AAC app, text-to-speech, etc.', weight: 3 },
      { id: 'interpreter', title: 'I need an interpreter or specialist communicator', description: 'BSL interpreter, lip speaker, etc.', weight: 3 },
      { id: 'need_people_adapt', title: 'People need to adapt how they communicate with me', description: 'Speak slowly, simply, use writing, etc.', weight: 2 },
      { id: 'can_communicate', title: 'I can communicate verbally with difficulty', description: 'I struggle but manage.', weight: 1 },
      { id: 'no_help', title: 'I communicate without difficulty', description: 'Verbal communication is not significantly affected.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'avoid_conversation', title: 'I avoid conversations', description: 'I avoid speaking where possible.' },
      { id: 'misunderstood', title: 'I am frequently misunderstood', description: 'People often cannot understand me.' },
      { id: 'miss_information', title: 'I miss important information', description: "I don't always understand what is said to me." },
      { id: 'distress_communication', title: 'Communication causes distress', description: 'Trying to communicate is exhausting or upsetting.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('cannot_communicate_verbal')) return 'F';
      if (supportTypes.includes('aac_device') || supportTypes.includes('interpreter')) return 'E';
      if (supportTypes.includes('need_people_adapt')) return 'D';
      if (supportTypes.includes('can_communicate')) return 'C';
      return 'A';
    },
  },

  q8: {
    questionId: 'q8',
    activityType: 'daily',
    activityNum: 8,
    pipFormRef: 'Q10',
    title: 'Can you read and understand written information?',
    subtitle: 'Can you read and understand written information — like letters, signs, forms, and instructions?',
    explained: "This is about whether your condition stops you from reading and taking in written information. It could be a visual impairment, dyslexia, concentration or memory problems, or anxiety that makes absorbing written content very difficult. If you need someone to read letters to you, you use a screen reader, or you struggle to understand complex or lengthy written information — all of that counts. DWP use this to understand whether you can manage things like official letters, medical instructions, and everyday written communication.",
    helpQuestions: [
      'Does poor eyesight count?',
      'What about dyslexia?',
      'Does needing someone to read letters count?',
    ],
    exampleAnswer: {
      name: 'Priya', age: 44, label: 'Visual impairment',
      quote: "I'm registered blind and can't read standard print at all. Everything that comes through the post — letters from DWP, bills, hospital appointments — I have to wait for my daughter to come and read to me and explain. I use a screen reader for my phone and computer, but anything on paper is completely inaccessible. I missed two medical appointments in the past year because letters arrived when my daughter was away and I had no way of knowing what they said.",
    },
    difficultyCategories: [
      {
        id: 'physical', name: 'Physical / Visual', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'low_vision', text: 'I have low vision or am blind' },
          { id: 'pain_reading', text: 'Reading causes pain (eyes, headaches)' },
          { id: 'cant_read_standard', text: 'I cannot read standard print' },
        ],
      },
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'concentration_reading', text: 'Concentration problems affect my reading' },
          { id: 'anxiety_reading', text: 'Anxiety affects my ability to read and take in information' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'dyslexia', text: 'Dyslexia makes reading difficult' },
          { id: 'cant_understand_complex', text: "I can't understand complex written information" },
          { id: 'forget_what_i_read', text: 'I forget what I have just read' },
          { id: 'need_info_simplified', text: 'I need information simplified or explained' },
        ],
      },
    ],
    supportOptions: [
      { id: 'cannot_read', title: 'I cannot read or understand any written information', description: 'I rely completely on others or technology.', weight: 4 },
      { id: 'needs_reader', title: 'Someone reads things to me', description: 'I need a person to read and explain written information.', weight: 3 },
      { id: 'assistive_tech', title: 'I use assistive technology', description: 'Screen reader, magnifier, text-to-speech.', weight: 2 },
      { id: 'large_print', title: 'I need large print or adapted formats', description: 'Standard print is not accessible for me.', weight: 1 },
      { id: 'no_help', title: 'I can read and understand without help', description: 'Reading is not significantly affected.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'miss_important_info', title: 'I miss important written information', description: 'Letters, notices, instructions cause problems.' },
      { id: 'rely_on_others', title: 'I rely on others to read for me', description: 'I cannot manage without help.' },
      { id: 'safety_risk_reading', title: 'Not being able to read creates safety risks', description: 'Labels, signs, warnings.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('cannot_read')) return 'F';
      if (supportTypes.includes('needs_reader')) return 'E';
      if (supportTypes.includes('assistive_tech')) return 'D';
      if (supportTypes.includes('large_print')) return 'C';
      return 'A';
    },
  },

  q9: {
    questionId: 'q9',
    activityType: 'daily',
    activityNum: 9,
    pipFormRef: 'Q11',
    title: 'Can you engage with other people face to face?',
    subtitle: 'Can you cope with being around and talking to other people — including strangers — without it causing you serious distress?',
    explained: "This question is about face-to-face social interaction — not just with people you know well, but also with strangers or in unfamiliar situations. If your condition causes severe anxiety, panic attacks, paranoia, or overwhelming distress in social situations, that matters. Even if you can sometimes manage with great difficulty, the question is whether you can do it reliably without causing significant psychological harm. Needing someone with you to cope counts too.",
    helpQuestions: [
      'What if I can talk to family but not strangers?',
      'Does social anxiety count?',
      'What about autism and social difficulties?',
      'Does needing someone with me count?',
    ],
    exampleAnswer: {
      name: 'Rachel', age: 29, label: 'PTSD and severe anxiety',
      quote: "I haven't been to a shop alone in 18 months. Even leaving my house to speak to someone outside my immediate family causes extreme distress — panic attacks, shaking, and sometimes being physically sick. When I have to attend appointments, my mum comes and does most of the talking because I freeze completely. I had to cancel a GP appointment three times in a row because I couldn't face the waiting room. My world has shrunk to my home and the thought of any social situation fills me with terror.",
    },
    difficultyCategories: [
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'severe_anxiety_social', text: 'Severe anxiety in social situations' },
          { id: 'panic_attacks_social', text: 'Panic attacks around other people' },
          { id: 'paranoia_social', text: 'Paranoia or fear of others' },
          { id: 'cant_cope_strangers', text: "I can't cope with strangers" },
          { id: 'avoid_all_social', text: 'I avoid all social interaction' },
        ],
      },
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'communication_physical', text: 'Physical condition affects my communication' },
          { id: 'pain_social', text: 'Being around people causes physical problems' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'misread_social', text: "I misread social cues or people's intentions" },
          { id: 'overwhelmed_groups', text: 'Groups or social settings overwhelm me' },
          { id: 'need_prep_social', text: 'I need significant preparation before any social situation' },
        ],
      },
    ],
    supportOptions: [
      { id: 'cannot_engage', title: 'I cannot engage with other people at all', description: 'All social interaction is impossible for me.', weight: 4 },
      { id: 'needs_someone', title: 'I need someone with me to engage with others', description: 'I cannot cope with social interaction alone.', weight: 3 },
      { id: 'limited_familiar', title: 'I can only engage with very familiar people', description: 'Family only, in a controlled environment.', weight: 2 },
      { id: 'struggle_but_manage', title: 'I struggle significantly but can sometimes manage', description: 'With great difficulty or distress.', weight: 1 },
      { id: 'no_help', title: 'I can engage with others without significant difficulty', description: 'Social interaction is not significantly affected.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'housebound_social', title: 'I am mostly housebound', description: 'I rarely or never leave home due to social anxiety.' },
      { id: 'panic_attacks_impact', title: "I've had panic attacks in social situations", description: 'These are frequent and severe.' },
      { id: 'lost_relationships', title: 'My condition has damaged my relationships', description: "I can't maintain social connections." },
      { id: 'distress_after', title: 'Social interaction causes significant distress', description: 'I suffer mentally for hours or days afterwards.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('cannot_engage')) return 'F';
      if (supportTypes.includes('needs_someone')) return 'E';
      if (supportTypes.includes('limited_familiar')) return 'D';
      if (supportTypes.includes('struggle_but_manage')) return 'C';
      return 'A';
    },
  },

  q10: {
    questionId: 'q10',
    activityType: 'daily',
    activityNum: 10,
    pipFormRef: 'Q12',
    title: 'Can you make budgeting decisions?',
    subtitle: 'Can you manage your money and make decisions about spending — safely and without help?',
    explained: "This is about whether your condition affects your ability to understand and manage money. It's not about how much money you have — it's about whether you can make sensible financial decisions, manage a simple budget, understand the value of money, and avoid being taken advantage of. Impulsive spending, an inability to plan financially, or needing someone else to manage your money for you because you can't do it safely — all of that matters.",
    helpQuestions: [
      'What counts as a simple budgeting decision?',
      'Does needing support with bills count?',
      'What about being exploited financially?',
    ],
    exampleAnswer: {
      name: 'Ben', age: 41, label: 'Learning disability and bipolar disorder',
      quote: "When I'm in a high phase I spend money without any sense of consequences — I once spent my entire month's rent in two days buying things online I don't even remember ordering. My support worker now manages my bank account and gives me a small amount of cash each week. Even simple things like working out change or understanding a bill are things I need help with. I've been financially exploited twice by people who took advantage. I genuinely can't manage money safely on my own.",
    },
    difficultyCategories: [
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'dont_understand_value', text: "I don't understand the value of money" },
          { id: 'impulsive_spending', text: 'I spend impulsively without thinking of consequences' },
          { id: 'cant_budget', text: "I can't manage a budget" },
          { id: 'exploited_financially', text: 'I have been financially exploited' },
          { id: 'cant_plan_finances', text: "I can't plan or prioritise spending" },
        ],
      },
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'mania_spending', text: 'Mania or highs lead to excessive spending' },
          { id: 'anxiety_money', text: 'Anxiety about money is overwhelming' },
          { id: 'neglect_finances', text: 'Depression causes me to neglect finances' },
        ],
      },
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'brain_fog_money', text: 'Brain fog or fatigue affects financial thinking' },
          { id: 'pain_concentration_money', text: 'Pain or fatigue affects my concentration for financial tasks' },
        ],
      },
    ],
    supportOptions: [
      { id: 'all_finances_managed', title: 'Someone else manages all my finances', description: 'I cannot make any financial decisions.', weight: 4 },
      { id: 'supervised_spending', title: 'I need supervision for financial decisions', description: 'Someone must oversee my spending and decisions.', weight: 3 },
      { id: 'help_complex_decisions', title: 'I need help with complex budgeting decisions', description: 'Bills, larger purchases, financial planning.', weight: 2 },
      { id: 'help_simple_decisions', title: 'I need help with simple purchases', description: 'Working out change, basic transactions.', weight: 1 },
      { id: 'no_help', title: 'I manage my finances independently', description: 'My condition does not affect financial decisions.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'debt_problems', title: "I've gotten into debt", description: 'Poor financial decisions have caused debt.' },
      { id: 'exploited', title: "I've been exploited financially", description: 'Others have taken advantage of my difficulties.' },
      { id: 'miss_bills', title: 'I miss bills or financial obligations', description: "I can't keep track of what needs paying." },
      { id: 'financial_distress', title: 'Financial decisions cause significant distress', description: "I'm overwhelmed by financial matters." },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('all_finances_managed')) return 'F';
      if (supportTypes.includes('supervised_spending')) return 'E';
      if (supportTypes.includes('help_complex_decisions')) return 'D';
      if (supportTypes.includes('help_simple_decisions')) return 'C';
      return 'A';
    },
  },

  q11: {
    questionId: 'q11',
    activityType: 'mobility',
    activityNum: 1,
    pipFormRef: 'Q13',
    title: 'Can you plan and follow a journey?',
    subtitle: 'Can you leave home and find your way around — even on a route you know well?',
    explained: "This is about whether you can get from A to B independently — whether that's walking to the shops, getting on a bus, or going somewhere less familiar. It covers physical barriers like pain or fatigue, but also psychological ones like severe anxiety, agoraphobia, or confusion that makes going out alone unsafe. Even if you can manage a familiar route on a good day, the question is whether you can do it reliably. Needing someone with you, turning back, or getting lost all count.",
    helpQuestions: [
      'What if I can do familiar routes but not new ones?',
      'Does agoraphobia count?',
      'What about getting lost?',
      'Does needing someone with me count?',
    ],
    exampleAnswer: {
      name: 'Gemma', age: 33, label: 'Agoraphobia and PTSD',
      quote: "I haven't left the house alone in over a year. Even walking to the end of my street triggers a panic attack — my heart races, I can't breathe, and I feel like something terrible is about to happen. On the rare occasions I've tried, I've had to turn back within minutes. My husband takes me to every appointment and does all the shopping. I used to be able to get a bus alone. Now the thought of being somewhere without him nearby makes me feel physically ill.",
    },
    difficultyCategories: [
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'cant_go_out_anxiety', text: "I can't go out alone due to anxiety" },
          { id: 'panic_on_journeys', text: 'Panic attacks on journeys' },
          { id: 'agoraphobia', text: 'Agoraphobia prevents journeys' },
          { id: 'paranoia_outside', text: 'Paranoia or fear prevents me going out' },
          { id: 'ptsd_outside', text: 'PTSD makes going out very difficult' },
        ],
      },
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'cant_walk_far', text: "I can't walk far enough to complete journeys" },
          { id: 'pain_travel', text: 'Pain prevents me from travelling' },
          { id: 'fatigue_travel', text: 'Fatigue means I cannot complete journeys' },
          { id: 'wheelchair_transport', text: 'I need wheelchair accessible transport' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'get_lost', text: 'I get lost or confused on journeys' },
          { id: 'cant_plan_route', text: "I can't plan a route or use maps/apps" },
          { id: 'need_familiar_route', text: 'I can only manage routes I know very well' },
          { id: 'overwhelmed_transport', text: 'Transport (buses, trains) overwhelms me' },
        ],
      },
    ],
    supportOptions: [
      { id: 'cannot_go_out', title: 'I cannot go out at all', description: 'I never go out independently.', weight: 4 },
      { id: 'needs_accompaniment', title: 'I need someone with me on all journeys', description: 'I cannot travel alone at all.', weight: 3 },
      { id: 'familiar_only', title: 'I can only manage very familiar routes alone', description: 'Short, well-known routes with difficulty.', weight: 2 },
      { id: 'prompting_planning', title: 'I need help planning journeys', description: 'I need someone to plan routes for me.', weight: 1 },
      { id: 'no_help', title: 'I can plan and follow journeys independently', description: 'Journeys are not significantly affected.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'housebound', title: 'I am mostly or completely housebound', description: 'I rarely or never leave my home.' },
      { id: 'cant_use_public_transport', title: "I can't use public transport alone", description: "Buses, trains, etc. are not accessible to me independently." },
      { id: 'abandoned_journeys', title: "I've had to abandon journeys", description: 'Panic, pain, or confusion has forced me to turn back.' },
      { id: 'rely_taxis', title: 'I rely completely on taxis or lifts', description: "I can't use public transport at all." },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('cannot_go_out')) return 'F';
      if (supportTypes.includes('needs_accompaniment')) return 'E';
      if (supportTypes.includes('familiar_only')) return 'D';
      if (supportTypes.includes('prompting_planning')) return 'C';
      return 'A';
    },
  },

  q12: {
    questionId: 'q12',
    activityType: 'mobility',
    activityNum: 2,
    pipFormRef: 'Q14',
    title: 'How far can you move around?',
    subtitle: 'How far can you actually walk — safely, reliably, and without it causing serious pain or leaving you wiped out?',
    explained: "DWP aren't just asking what distance you can walk — they're asking whether you can walk it safely, as often as you need to, without falling, and without leaving you in significant pain or exhausted. Your worst days count here too, not just the good ones. If you use a wheelchair, walking stick, or any walking aid; if you stop frequently; if you're at real risk of falls — all of that is relevant. Be honest about the distance you can actually manage on most days.",
    helpQuestions: [
      'What counts as "reliably"?',
      'Does using a wheelchair count?',
      'What if it varies day to day?',
      'Does pain while walking count?',
    ],
    exampleAnswer: {
      name: 'Robert', age: 58, label: 'Degenerative joint condition',
      quote: "On a good day — maybe twice a month — I can walk about 50 metres before the pain becomes unbearable. On most days I can barely manage 15 to 20 metres. I use a stick but I still stumble, and I've fallen three times in the past six months. After any walking at all I need to rest for at least an hour and I'm in pain for the rest of the day. I use a wheelchair for anything more than a few metres. I've had to give up going out unless someone is with me and my wheelchair is available.",
    },
    difficultyCategories: [
      {
        id: 'physical', name: 'Physical', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'pain_walking', text: 'Pain severely limits how far I can walk' },
          { id: 'fatigue_walking', text: 'Fatigue means I cannot walk far' },
          { id: 'balance_walking', text: 'Balance problems make walking unsafe' },
          { id: 'falls_risk', text: 'I am at high risk of falls' },
          { id: 'use_wheelchair', text: 'I use a wheelchair for longer distances' },
          { id: 'use_walking_aids', text: 'I use a walking aid or orthoses' },
          { id: 'breathlessness', text: 'Breathlessness limits how far I can walk' },
        ],
      },
      {
        id: 'mental', name: 'Mental Health', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'anxiety_walking', text: 'Anxiety affects my ability to walk outside' },
          { id: 'dissociation_walking', text: 'Dissociation makes walking unsafe' },
        ],
      },
      {
        id: 'cognitive', name: 'Cognitive / Neurodivergent', selectedBg: 'bg-teal-700', selectedText: 'text-white',
        difficulties: [
          { id: 'sensory_walking', text: 'Sensory difficulties make walking difficult' },
          { id: 'need_supervision_walking', text: 'I need supervision to walk safely' },
        ],
      },
    ],
    supportOptions: [
      { id: 'cannot_walk', title: 'I cannot stand or move at all', description: 'I am completely unable to walk.', weight: 4 },
      { id: 'wheelchair_always', title: 'I use a wheelchair for all movement', description: 'I cannot walk at all independently.', weight: 4 },
      { id: 'walk_under_20m', title: 'I can only walk up to 20 metres', description: 'More than this is impossible for me reliably.', weight: 3 },
      { id: 'walk_20_50m', title: 'I can walk 20–50 metres reliably', description: 'More than this causes significant problems.', weight: 2 },
      { id: 'walk_50_200m', title: 'I can walk 50–200 metres reliably', description: 'Further distances are too difficult.', weight: 1 },
      { id: 'no_help', title: 'I can walk more than 200 metres reliably', description: 'Walking is not significantly affected.', weight: 0 },
    ],
    noHelpId: 'no_help',
    impactOptions: [
      { id: 'cant_use_pub_transport_walk', title: "I can't use public transport", description: "Walking to stops/stations is too far." },
      { id: 'pain_after_walking', title: 'Walking causes pain or exhaustion', description: 'I pay a physical price for any walking I do.' },
      { id: 'falls_happened', title: "I've had falls", description: 'I have fallen while walking.' },
      { id: 'use_motability', title: 'I use Motability or need adapted transport', description: 'Standard transport is not accessible.' },
    ],
    calculateDescriptor(answers) {
      const { supportTypes } = answers;
      if (supportTypes.includes('cannot_walk') || supportTypes.includes('wheelchair_always')) return 'F';
      if (supportTypes.includes('walk_under_20m')) return 'E';
      if (supportTypes.includes('walk_20_50m')) return 'D';
      if (supportTypes.includes('walk_50_200m')) return 'C';
      return 'A';
    },
  },
};

export function getQuestionFlow(questionId: string): QuestionFlowConfig | null {
  return QUESTION_FLOW_DATA[questionId] ?? null;
}
