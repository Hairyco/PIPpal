export interface Descriptor {
  code: string;
  text: string;
  points: number;
}

export interface PIPQuestion {
  id: string;
  num: number;
  title: string;
  shortTitle: string;
  category: 'Daily Living' | 'Mobility';
  pipFormRef: string;
  headline: string;
  subtext: string;
  defaultExplainer: string;
  chatOpener?: string;
  conditionExplainers: {
    conditions: string[];
    text: string;
    example?: string;
  }[];
  descriptors: Descriptor[];
  tip: string;
  free: boolean;
}

export const PIP_QUESTIONS: PIPQuestion[] = [
  {
    id: 'q1',
    num: 1,
    title: 'Preparing food',
    shortTitle: 'Preparing food',
    category: 'Daily Living',
    pipFormRef: 'Question 3 on PIP2 form',
    headline: 'Can you prepare and cook a simple meal safely?',
    subtext: 'This is about whether you can plan, prepare and cook a basic meal on your own — safely, and on most days.',
    defaultExplainer: 'DWP wants to know if you can cook something like beans on toast or a bowl of soup — from start to finish — on your own, safely, on most days. It\'s not just whether you can technically do it once. It\'s whether you can do it reliably without burning yourself, leaving the hob on, needing someone to watch over you, or it completely wiping you out. Think about your worst days, not your best.',
    chatOpener: 'Let\'s talk about preparing food. On most days, how do you get on in the kitchen?',
    conditionExplainers: [
      {
        conditions: ['anxiety', 'panic', 'ptsd', 'agoraphobia'],
        text: 'If anxiety or PTSD makes cooking feel dangerous or impossible — whether that\'s forgetting the hob, not being able to concentrate, panicking in the kitchen, or needing someone there to feel safe — that all counts. Be honest about what happens on your worst days.',
        example: 'When my anxiety is bad I can\'t concentrate on cooking. I\'ve left the hob on without realising. I need someone with me or I don\'t cook at all — I eat cold food or go without.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'If you struggle to plan what to cook, get distracted halfway through, or find kitchens overwhelming due to sensory issues — that\'s relevant here. Cooking involves a lot of steps and things that can go wrong.',
        example: 'I lose track of what I\'m doing mid-cook. I\'ve burned things because I got distracted. The smells and noise can make the kitchen unbearable and I often give up and don\'t eat properly.',
      },
      {
        conditions: ['pain', 'fibromyalgia', 'arthritis'],
        text: 'If standing at the cooker causes pain, you can\'t grip pans safely, or the effort means you can\'t do it on most days — that\'s what DWP needs to hear. A microwave-only approach matters too.',
        example: 'I can\'t stand long enough to cook on the hob. My grip means lifting pans is unsafe. Most days I use the microwave or someone else cooks for me.',
      },
      {
        conditions: ['depression'],
        text: 'Not being able to face cooking, forgetting to eat, or only managing it on a handful of days — that\'s all relevant. Depression affects cooking just as much as a physical condition does.',
        example: 'Most days I have no motivation to cook anything. I forget to eat or just have something cold. The idea of cooking a meal properly feels completely out of reach.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can prepare and cook a simple meal unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to either prepare or cook a simple meal.', points: 2 },
      { code: 'C', text: 'Cannot cook a simple meal using a conventional cooker but is able to do so using a microwave.', points: 2 },
      { code: 'D', text: 'Needs prompting to be able to either prepare or cook a simple meal.', points: 2 },
      { code: 'E', text: 'Needs supervision or assistance to either prepare or cook a simple meal.', points: 4 },
      { code: 'F', text: 'Cannot prepare and cook food.', points: 8 },
    ],
    tip: 'Log what happens in the kitchen on your bad days — even small things like leaving the hob on or needing reminding to eat. Real examples make a huge difference.',
    free: true,
  },
  {
    id: 'q2',
    num: 2,
    title: 'Taking nutrition',
    shortTitle: 'Eating & drinking',
    category: 'Daily Living',
    pipFormRef: 'Question 4 on PIP2 form',
    headline: 'Can you eat and drink safely on your own?',
    subtext: 'This is about whether you can actually get food and drink into your mouth safely — cutting it up, using cutlery, and swallowing without difficulty.',
    defaultExplainer: 'This isn\'t about cooking — it\'s about eating. Can you use a knife and fork, drink from a cup without spilling, cut up your food, and swallow safely? If you need adapted equipment, someone to help you, or you often go without eating because you can\'t manage it alone — that all matters here.',
    chatOpener: 'Can you eat and drink safely on your own, or does your condition make that difficult?',
    conditionExplainers: [
      {
        conditions: ['ms', 'stroke', 'brain injury', 'parkinson'],
        text: 'Tremors, coordination problems, or swallowing difficulties (dysphagia) directly affect this question. If you drop cups, struggle with cutlery, or choke regularly, be specific about how often and what help you need.',
        example: 'My tremors mean I spill drinks and drop cutlery. I\'ve choked on food before. I use adapted cutlery and sometimes need help being fed.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'Sensory issues around food textures, forgetting to eat, or needing prompting to get through a meal are all relevant here.',
        example: 'Certain textures make eating impossible for me. I get distracted and forget to finish meals. I often need reminding to eat at all.',
      },
      {
        conditions: ['depression', 'anxiety'],
        text: 'If you forget to eat, can\'t motivate yourself to eat, or need someone to encourage you through meals — that counts. Mental health affects eating just as much as physical health.',
        example: 'On bad days I don\'t eat at all. I forget, or the effort feels too much. I need someone to remind me and sometimes sit with me while I eat.',
      },
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia'],
        text: 'If gripping cutlery is painful, cutting food is beyond you, or eating is slow and exhausting because of your condition — describe exactly what you struggle with.',
        example: 'My grip is so poor I can\'t use a standard knife. I need my food cut up for me and even holding a cup causes pain.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can take nutrition unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to take nutrition.', points: 2 },
      { code: 'C', text: 'Needs assistance to be able to cut up food.', points: 2 },
      { code: 'D', text: 'Needs prompting to be able to take nutrition.', points: 4 },
      { code: 'E', text: 'Needs assistance to be able to take nutrition.', points: 6 },
      { code: 'F', text: 'Cannot convey food and drink to their mouth and needs another person to do so.', points: 10 },
    ],
    tip: 'Think about your worst days. If you sometimes skip meals because eating is too hard — that matters, even if you manage fine on better days.',
    free: false,
  },
  {
    id: 'q3',
    num: 3,
    title: 'Managing therapy',
    shortTitle: 'Managing therapy',
    category: 'Daily Living',
    pipFormRef: 'Question 5 on PIP2 form',
    headline: 'Can you manage your medication and treatment?',
    subtext: 'This is about whether you can handle your own medication, medical equipment, and any ongoing therapy — without someone else doing it for you.',
    defaultExplainer: 'This covers everything from remembering to take tablets to administering injections, using medical devices, or attending regular therapy. The key question is whether you can manage all of this safely on your own, or whether you need reminding, supervision, or physical help. The amount of time your treatment takes each week also affects your score.',
    chatOpener: 'Do you take medication or follow a treatment plan? Can you manage that yourself, or do you need help?',
    conditionExplainers: [
      {
        conditions: ['diabetes'],
        text: 'Monitoring blood sugar, injecting insulin, managing hypos, and the time all of this takes each day — it adds up. Be specific about how long your daily management takes and what happens when you get it wrong.',
        example: 'Managing my diabetes takes about two hours a day. I need help remembering checks and have had dangerous hypos when I\'ve lost track.',
      },
      {
        conditions: ['depression', 'anxiety', 'bipolar', 'schizophrenia'],
        text: 'Forgetting medication is common with mental health conditions and can be dangerous. If you need prompting, have missed doses that caused problems, or can\'t be trusted to manage your medication alone — say so.',
        example: 'I forget to take my medication without reminders. I\'ve missed doses that made my condition much worse. I can\'t reliably manage it on my own.',
      },
      {
        conditions: ['epilepsy'],
        text: 'Missing medication can trigger seizures. If you need supervision to ensure you take it safely, or if managing your medication takes significant time and effort each day, that\'s relevant.',
      },
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'If your treatment involves physiotherapy, injections, patches, or complex regimes that are physically hard to manage — or that take significant time each week — describe exactly what\'s involved.',
        example: 'My treatment regime takes over an hour a day and I struggle to manage equipment on my own. I need help preparing my injections because of my grip problems.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Either does not receive medication or therapy or can manage medication or therapy unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to manage medication.', points: 1 },
      { code: 'C', text: 'Needs supervision, prompting or assistance to be able to manage medication or monitor a health condition.', points: 2 },
      { code: 'D', text: 'Needs supervision, prompting or assistance to be able to manage therapy that takes more than 3.5 hours a week.', points: 2 },
      { code: 'E', text: 'Needs supervision, prompting or assistance to be able to manage therapy that takes more than 7 hours a week.', points: 4 },
      { code: 'F', text: 'Needs supervision, prompting or assistance to be able to manage therapy that takes more than 14 hours a week.', points: 8 },
    ],
    tip: 'Add up all the time you spend each week on medication and treatment — including preparation time, not just the treatment itself. The total hours directly affect which descriptor applies.',
    free: false,
  },
  {
    id: 'q4',
    num: 4,
    title: 'Washing and bathing',
    shortTitle: 'Washing & bathing',
    category: 'Daily Living',
    pipFormRef: 'Question 6 on PIP2 form',
    headline: 'Can you wash and bathe yourself safely?',
    subtext: 'This is about washing your face, body and hair — getting in and out of the bath or shower, and keeping yourself clean without help.',
    defaultExplainer: 'DWP wants to know if you can wash yourself safely and reliably. That includes getting in and out of the bath or shower, reaching all parts of your body, using taps and controls, and drying yourself. If you need equipment like a shower seat or grab rails, or if you need someone there to help or watch over you, that\'s what they need to hear.',
    chatOpener: 'Can you wash and bathe yourself safely, or does your condition make that difficult?',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'If getting in or out of the bath is a fall risk, standing in the shower causes pain, or you can\'t reach to wash yourself — be specific. If you go without washing on bad days because it\'s too hard, say that.',
        example: 'I can\'t get in or out of the bath safely without help. I have a shower seat and grab rails. On my worst days I can\'t wash at all.',
      },
      {
        conditions: ['anxiety', 'depression', 'ptsd'],
        text: 'If depression or trauma means you go days without washing, need someone to prompt you, or find the process distressing — that\'s directly relevant to this question.',
        example: 'My depression means I go days without washing. I need someone to encourage me to get in the shower and sometimes help me. Left to myself I wouldn\'t manage it most days.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'Sensory sensitivities to water, difficulty following the steps of washing, or needing someone to prompt you through the process all count here.',
        example: 'Certain water temperatures and the sensation of showering cause me real distress. I need prompting and sometimes help to get through it.',
      },
      {
        conditions: ['visual impairment'],
        text: 'If you struggle to manage hot water safely, identify products, or wash safely without risk of burns or falls, describe the specific difficulties and any aids you use.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can wash and bathe unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to wash or bathe.', points: 2 },
      { code: 'C', text: 'Needs supervision or prompting to be able to wash or bathe.', points: 2 },
      { code: 'D', text: 'Needs assistance to be able to wash either their hair or body below the waist.', points: 2 },
      { code: 'E', text: 'Needs assistance to be able to get in or out of a bath or shower.', points: 3 },
      { code: 'F', text: 'Needs assistance to be able to wash their body between the shoulders and waist.', points: 4 },
      { code: 'G', text: 'Cannot wash and bathe at all and needs another person to wash their entire body.', points: 8 },
    ],
    tip: 'Think about your worst days. If you go without washing sometimes, or need help with any part of it — that\'s relevant, even if you manage on better days.',
    free: false,
  },
  {
    id: 'q5',
    num: 5,
    title: 'Managing toilet needs',
    shortTitle: 'Toilet needs',
    category: 'Daily Living',
    pipFormRef: 'Question 7 on PIP2 form',
    headline: 'Can you manage your toilet needs?',
    subtext: 'This is about getting to the toilet in time, using it safely, cleaning yourself, and managing any incontinence.',
    defaultExplainer: 'This covers everything involved in managing your toilet needs — getting there in time, managing your clothing, cleaning yourself afterwards, and dealing with any bladder or bowel problems. It\'s a personal topic but an important one. Assessors hear this every day. Being honest here could make a real difference to your score.',
    chatOpener: 'Can you manage your toilet needs on your own, or does your condition cause difficulties?',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'ms', 'stroke'],
        text: 'If urgency means you can\'t always make it in time, getting on and off the toilet is difficult, or you can\'t clean yourself properly — describe what actually happens, including any accidents.',
        example: 'My condition causes sudden urgency and I don\'t always make it to the toilet. I\'ve had accidents and need to be near a toilet at all times.',
      },
      {
        conditions: ['crohn', 'ibs', 'bowel'],
        text: 'Urgency, unpredictability, accidents, and managing a stoma — these are all directly relevant. Be honest about how often difficulties occur and the impact on your day.',
        example: 'My condition is unpredictable. I have accidents regularly and can\'t stray far from a toilet. This affects everything I do.',
      },
      {
        conditions: ['anxiety', 'depression'],
        text: 'Psychological barriers to using toilets in certain places, or needing prompting to manage your toilet needs, can be relevant here too.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'Not recognising the need to go, needing prompting, or managing incontinence due to cognitive difficulties all count here.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can manage toilet needs or incontinence unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to manage toilet needs or incontinence.', points: 2 },
      { code: 'C', text: 'Needs supervision or prompting to be able to manage toilet needs.', points: 2 },
      { code: 'D', text: 'Needs assistance to be able to manage toilet needs.', points: 4 },
      { code: 'E', text: 'Needs assistance to be able to manage incontinence of either bladder or bowel.', points: 6 },
      { code: 'F', text: 'Needs assistance to be able to manage incontinence of both bladder and bowel.', points: 8 },
    ],
    tip: 'This is personal, but being specific matters. Describe real incidents — accidents, near-misses, how often they happen, and what help you need.',
    free: false,
  },
  {
    id: 'q6',
    num: 6,
    title: 'Dressing and undressing',
    shortTitle: 'Dressing',
    category: 'Daily Living',
    pipFormRef: 'Question 8 on PIP2 form',
    headline: 'Can you get dressed and undressed on your own?',
    subtext: 'This is about choosing appropriate clothing, putting it on, fastening it, and taking it off — including shoes and socks.',
    defaultExplainer: 'This covers whether you can select suitable clothes, put them on, fasten buttons and zips, and take them off — including getting socks and shoes on and off. If you need aids like a button hook, someone to help you dress, or prompting to get dressed at all — that all matters here. Think about whether dressing takes you much longer than it should, or whether you often can\'t manage certain items.',
    chatOpener: 'Can you get dressed and undressed on your own, or does your condition cause problems?',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'If buttons and zips are beyond you, getting socks on is a struggle, or raising your arms to dress causes significant pain — be specific. If dressing takes you much longer than normal or sometimes you just can\'t manage, say so.',
        example: 'I can\'t do buttons or zips. Getting my socks and shoes on is very difficult and painful. Sometimes I stay in my pyjamas because getting dressed is too much.',
      },
      {
        conditions: ['depression', 'anxiety'],
        text: 'If you need someone to remind you to get dressed, or there are days when you simply can\'t manage it at all — that counts just as much as a physical difficulty.',
        example: 'On my worst days I can\'t get dressed at all. I need prompting and sometimes help. I\'ve spent whole days in bed because I couldn\'t face it.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'Sensory issues with certain fabrics, difficulty choosing appropriate clothing, or needing prompting and support to get dressed all count here.',
        example: 'Certain fabrics cause me real distress. I struggle to choose what to wear and need help with the order and steps of getting dressed.',
      },
      {
        conditions: ['dementia', 'memory'],
        text: 'Putting clothing on the wrong way, forgetting to get dressed, or needing supervision and assistance — describe what actually happens.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can dress and undress unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to dress or undress.', points: 2 },
      { code: 'C', text: 'Needs either prompting or assistance to be able to select appropriate clothing.', points: 2 },
      { code: 'D', text: 'Needs assistance to be able to dress or undress their lower body.', points: 2 },
      { code: 'E', text: 'Needs assistance to be able to dress or undress their upper body.', points: 4 },
      { code: 'F', text: 'Cannot dress or undress at all.', points: 8 },
    ],
    tip: 'Think about how long getting dressed takes on a bad day, and whether there are items of clothing you simply can\'t manage without help.',
    free: false,
  },
  {
    id: 'q7',
    num: 7,
    title: 'Communicating verbally',
    shortTitle: 'Communication',
    category: 'Daily Living',
    pipFormRef: 'Question 9 on PIP2 form',
    headline: 'Can you communicate verbally?',
    subtext: 'This is about whether you can speak and be understood, and whether you can understand what people say to you.',
    defaultExplainer: 'This covers your ability to have a spoken conversation — making yourself understood and understanding others. It includes problems with speaking clearly, processing what people say, or situations where communication breaks down entirely. If you need aids to communicate, or someone to help you in conversations, that\'s what DWP needs to know.',
    chatOpener: 'Can you communicate with other people verbally, or does your condition make that difficult?',
    conditionExplainers: [
      {
        conditions: ['autism', 'adhd'],
        text: 'If processing spoken information is hard, you sometimes can\'t speak at all (selective mutism), or communicating with others is exhausting and unreliable — that\'s relevant here. Think about how you manage with strangers.',
        example: 'I sometimes can\'t speak when anxious or overwhelmed. I need someone to communicate on my behalf in many situations. Processing what people say takes much longer than it should.',
      },
      {
        conditions: ['anxiety', 'ptsd'],
        text: 'If anxiety makes speaking very difficult, you freeze in conversations, or you need someone with you to handle communication on your behalf — describe what actually happens.',
        example: 'When I\'m anxious I can\'t speak properly. I lose words and can\'t respond clearly. In stressful situations I need someone else to communicate for me.',
      },
      {
        conditions: ['stroke', 'brain injury', 'ms'],
        text: 'Aphasia, slurred speech, word-finding difficulties, or needing a communication aid — describe the specific difficulties and how they affect your daily life.',
      },
      {
        conditions: ['visual impairment'],
        text: 'Difficulty reading lips or missing non-verbal cues that others rely on to communicate may be relevant here.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can express and understand verbal information unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to speak or hear.', points: 2 },
      { code: 'C', text: 'Needs communication support to be able to express or understand complex verbal information.', points: 2 },
      { code: 'D', text: 'Needs communication support to be able to express or understand basic verbal information.', points: 4 },
      { code: 'E', text: 'Cannot express or understand verbal information at all, even with communication support.', points: 12 },
    ],
    tip: 'Think about whether you can hold a conversation with a stranger — like calling a GP or speaking to someone at a counter — without significant difficulty.',
    free: false,
  },
  {
    id: 'q8',
    num: 8,
    title: 'Reading and understanding',
    shortTitle: 'Reading',
    category: 'Daily Living',
    pipFormRef: 'Question 10 on PIP2 form',
    headline: 'Can you read and understand written information?',
    subtext: 'This is about reading signs, letters, labels and instructions — and actually understanding what they mean.',
    defaultExplainer: 'This covers whether you can read and make sense of written information in everyday life — road signs, letters from the council, instructions on packaging. It\'s not just whether you can read the words, but whether you can understand and act on what they say. If you need help with letters, someone to explain things to you, or can\'t read reliably because of your condition, that\'s relevant.',
    chatOpener: 'Can you read and understand written information — like letters or signs — without help?',
    conditionExplainers: [
      {
        conditions: ['visual impairment'],
        text: 'If you can\'t read standard print, need large print or Braille, or rely on someone else to read things to you — be specific about what you can and can\'t manage.',
      },
      {
        conditions: ['dyslexia', 'adhd', 'autism'],
        text: 'If processing written text takes you much longer than most people, you frequently misread things, or you need information in a different format to understand it — that matters here.',
        example: 'I struggle significantly with written information. I misread things, need to read sentences multiple times, and often need someone to explain what a letter means.',
      },
      {
        conditions: ['depression', 'anxiety'],
        text: 'If brain fog, poor concentration, or anxiety means you can\'t take in what you\'ve read on many days — that counts. Describe what actually happens when you try to read something important.',
        example: 'My concentration is so poor I can\'t absorb written information. I read the same sentence repeatedly without taking it in. I need someone to explain letters to me.',
      },
      {
        conditions: ['stroke', 'brain injury', 'dementia', 'memory'],
        text: 'Acquired reading difficulties, inability to process written information, or needing help to understand letters and signs — describe the specific impact on daily life.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can read and understand basic and complex written information unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to read or understand written information.', points: 2 },
      { code: 'C', text: 'Needs prompting to be able to read or understand complex written information.', points: 2 },
      { code: 'D', text: 'Needs prompting to be able to read or understand basic written information.', points: 4 },
      { code: 'E', text: 'Cannot read or understand sign or symbols but is able to read or understand basic written information.', points: 4 },
      { code: 'F', text: 'Cannot read or understand written information at all.', points: 8 },
    ],
    tip: 'Ask yourself: could you read and understand a letter from DWP on your own, without any help? If not, that\'s exactly what this question is about.',
    free: false,
  },
  {
    id: 'q9',
    num: 9,
    title: 'Engaging with others',
    shortTitle: 'Social engagement',
    category: 'Daily Living',
    pipFormRef: 'Question 11 on PIP2 form',
    headline: 'Can you engage with other people face to face?',
    subtext: 'This is about whether you can interact with people — especially strangers — without it causing significant distress or problems.',
    defaultExplainer: 'This covers how you manage in social situations — particularly with people you don\'t know well. It\'s about whether you can have a basic interaction, understand social cues, and engage without it causing real harm to your wellbeing. If social situations cause panic, if you avoid them completely, or if your behaviour in social settings causes problems — that\'s what DWP needs to know.',
    chatOpener: 'How do you find interacting with other people, especially strangers, face to face?',
    conditionExplainers: [
      {
        conditions: ['anxiety', 'ptsd', 'agoraphobia'],
        text: 'If social interactions trigger panic attacks, you avoid them entirely, or you need someone with you to manage any interaction with people you don\'t know — that\'s directly relevant.',
        example: 'I can\'t interact with strangers without severe anxiety. I avoid all social situations and need someone with me even for basic interactions like at a shop.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'If reading social cues is very difficult, group situations are overwhelming, or you often respond inappropriately without meaning to — be specific about the impact on your life.',
        example: 'Social situations are exhausting and overwhelming. I misread cues, say the wrong things, and often need someone to help me navigate interactions.',
      },
      {
        conditions: ['depression', 'bipolar', 'schizophrenia'],
        text: 'Complete withdrawal from social contact, paranoia around other people, or periods where engaging with others is impossible or unsafe — describe what your worst times look like.',
        example: 'On my worst days I cannot be around other people at all. The effort is too much and I become distressed. I need support in any social situation.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'Not recognising people, inappropriate behaviour in social situations, or needing supervision when interacting with others — describe what actually happens.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can engage with other people unaided.', points: 0 },
      { code: 'B', text: 'Needs prompting to be able to engage with other people.', points: 2 },
      { code: 'C', text: 'Needs social support to be able to engage with other people.', points: 4 },
      { code: 'D', text: 'Cannot engage with other people due to such engagement causing either psychological distress to the claimant or violent or abusive behaviour by the claimant.', points: 8 },
    ],
    tip: 'Think about interacting with a GP receptionist, a shop assistant, or someone at a counter. Can you manage that without significant distress or difficulty?',
    free: false,
  },
  {
    id: 'q10',
    num: 10,
    title: 'Making decisions',
    shortTitle: 'Making decisions',
    category: 'Daily Living',
    pipFormRef: 'Question 12 on PIP2 form',
    headline: 'Can you make decisions about money?',
    subtext: 'This is about whether you can manage your finances — budgeting, paying bills, and making sensible decisions about spending.',
    defaultExplainer: 'This covers whether you can handle money reliably — understanding the value of things, budgeting, paying bills on time, and making financial decisions without putting yourself at risk. If someone else manages your money for you, if you make impulsive financial decisions because of your condition, or if you can\'t engage with money matters on many days — that\'s relevant.',
    chatOpener: 'Can you manage your own money and make financial decisions, or does your condition make that difficult?',
    conditionExplainers: [
      {
        conditions: ['depression', 'anxiety', 'bipolar'],
        text: 'During a depressive or manic episode, managing money can become impossible. If you\'ve run up debt, missed bills, or need someone else to manage your finances — say so.',
        example: 'I can\'t engage with financial tasks when I\'m unwell. I\'ve missed bills, spent erratically, and need someone else to manage my money to keep me safe.',
      },
      {
        conditions: ['autism', 'adhd', 'learning disability'],
        text: 'If understanding the value of money is genuinely difficult, you\'re vulnerable to being exploited, or you need someone to help you budget and manage accounts — describe that.',
        example: 'I find managing money very difficult. I forget bills, make impulsive purchases, and need help to stay on top of my finances and not get into debt.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'Forgetting bills, being unable to understand financial information, or needing a deputy or appointee to manage your money — be specific about what support you need.',
      },
      {
        conditions: ['schizophrenia', 'psychosis'],
        text: 'During episodes, rational financial decisions may be impossible. If you have an appointee or someone who manages your finances for you, that\'s directly relevant.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can manage complex budgeting decisions unaided.', points: 0 },
      { code: 'B', text: 'Needs prompting or assistance to be able to make complex budgeting decisions.', points: 2 },
      { code: 'C', text: 'Needs prompting or assistance to be able to make simple budgeting decisions.', points: 4 },
      { code: 'D', text: 'Cannot make any budgeting decisions at all.', points: 6 },
    ],
    tip: 'Think about whether you can manage a bank account, pay bills on time, and make day-to-day spending decisions reliably — on your worst days as well as your best.',
    free: false,
  },
  {
    id: 'q11',
    num: 11,
    title: 'Planning a journey',
    shortTitle: 'Planning a journey',
    category: 'Mobility',
    pipFormRef: 'Question 13 on PIP2 form',
    headline: 'Can you plan and follow a journey?',
    subtext: 'This is about whether you can get from A to B on your own — planning a route and actually following it.',
    defaultExplainer: 'This covers whether you can travel independently — by bus, train, car, or on foot. The key question is whether you can plan a route and follow it safely, including to places you haven\'t been before. If leaving the house alone is frightening or impossible, if you get lost even on familiar routes, or if you need someone with you whenever you go out — that\'s what DWP needs to hear.',
    chatOpener: 'Can you plan and follow a journey on your own, or does your condition make it difficult to get around?',
    conditionExplainers: [
      {
        conditions: ['anxiety', 'ptsd', 'agoraphobia'],
        text: 'If leaving the house alone is impossible or causes panic attacks, if you can\'t use public transport, or if you need someone with you whenever you go out — describe what your life actually looks like.',
        example: 'I can\'t leave the house alone. Even familiar journeys cause overwhelming panic. I need someone with me whenever I go anywhere.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'If unexpected changes to your route cause extreme distress, if you need detailed planning and a companion for any journey, or if sensory overwhelm on public transport stops you — say so.',
        example: 'Any deviation from a planned route causes severe distress. I need someone with me for any journey and can\'t use public transport alone.',
      },
      {
        conditions: ['visual impairment'],
        text: 'If you can\'t read signs, navigate safely, or travel without a guide or orientation aid — be specific about what you can and can\'t manage independently.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'If you get lost on familiar routes, can\'t plan a journey, or it\'s unsafe to travel alone — describe what supervision or support you need.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can plan and follow the route of a journey unaided.', points: 0 },
      { code: 'B', text: 'Needs prompting to be able to undertake any journey to avoid overwhelming psychological distress.', points: 4 },
      { code: 'C', text: 'Cannot plan the route of a journey.', points: 8 },
      { code: 'D', text: 'Cannot follow the route of an unfamiliar journey without another person, assistance dog or orientation aid.', points: 10 },
      { code: 'E', text: 'Cannot undertake any journey because it would cause overwhelming psychological distress.', points: 10 },
      { code: 'F', text: 'Cannot follow the route of a familiar journey without another person, an assistance dog or an orientation aid.', points: 12 },
    ],
    tip: 'Think about whether you could travel alone to somewhere you\'ve never been — by public transport. Could you manage that reliably, on most days?',
    free: false,
  },
  {
    id: 'q12',
    num: 12,
    title: 'Moving around',
    shortTitle: 'Moving around',
    category: 'Mobility',
    pipFormRef: 'Question 14 on PIP2 form',
    headline: 'How far can you walk?',
    subtext: 'This is about how far you can move on foot — safely, reliably, and without it causing serious problems.',
    defaultExplainer: 'DWP wants to know how far you can walk on a flat surface before pain, breathlessness, fatigue or safety concerns stop you. It\'s not about your best day — it\'s about what you can manage on most days, repeatedly, without it causing significant harm. The distances that matter are 20 metres, 50 metres and 200 metres. 20 metres is roughly the length of 4 cars. 50 metres is about the length of a swimming pool.',
    chatOpener: 'How far can you walk? Does your condition limit how you move around?',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'Think about the distance you can walk before it becomes impossible — not before it becomes uncomfortable. Consider whether you can walk that same distance again later in the day, and what happens afterwards.',
        example: 'I can only walk about 20 metres before the pain is too severe. I use a walking stick and have to stop and rest. I couldn\'t walk that distance again without a very long break.',
      },
      {
        conditions: ['anxiety', 'agoraphobia', 'ptsd'],
        text: 'If you can physically walk but psychological distress or panic stops you going out — that is genuinely relevant to this question and can qualify for enhanced mobility.',
        example: 'I can physically walk but leaving the house causes overwhelming panic. I can\'t walk anywhere outside without someone with me.',
      },
      {
        conditions: ['epilepsy'],
        text: 'If seizure risk means it\'s unsafe to walk alone, or falling risk limits how far you can go — describe the safety concerns specifically.',
      },
      {
        conditions: ['breathlessness', 'copd', 'heart', 'asthma'],
        text: 'If breathlessness stops you after a short distance — describe exactly how far and what happens when you try to go further.',
        example: 'I become severely breathless after about 20 metres. I have to stop and it takes several minutes to recover before I can move again.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can stand and then move more than 200 metres, either aided or unaided.', points: 0 },
      { code: 'B', text: 'Can stand and then move more than 50 metres but no more than 200 metres, either aided or unaided.', points: 4 },
      { code: 'C', text: 'Can stand and then move unaided more than 20 metres but no more than 50 metres.', points: 8 },
      { code: 'D', text: 'Can stand and then move using an aid or appliance more than 20 metres but no more than 50 metres.', points: 10 },
      { code: 'E', text: 'Can stand and then move more than 1 metre but no more than 20 metres, either aided or unaided.', points: 12 },
      { code: 'F', text: 'Cannot, either aided or unaided, stand and then move more than 1 metre.', points: 12 },
    ],
    tip: 'Be honest about your worst days. If you use a stick or wheelchair, include that. If you can only walk 20 metres before stopping — that\'s your answer, not the distance on a good day.',
    free: false,
  },
];

export function getQuestion(id: string): PIPQuestion | undefined {
  return PIP_QUESTIONS.find((q) => q.id === id);
}

export function getNextQuestion(currentId: string): PIPQuestion | undefined {
  const idx = PIP_QUESTIONS.findIndex((q) => q.id === currentId);
  return PIP_QUESTIONS[idx + 1];
}

export function getPrevQuestion(currentId: string): PIPQuestion | undefined {
  const idx = PIP_QUESTIONS.findIndex((q) => q.id === currentId);
  return idx > 0 ? PIP_QUESTIONS[idx - 1] : undefined;
}

export function getTotalPoints(answers: Record<string, string>): number {
  let total = 0;
  for (const [questionId, answerStr] of Object.entries(answers)) {
    const question = getQuestion(questionId);
    if (question) {
      const match = answerStr?.match(/Descriptor\s+([A-Z])/i);
      const code = match ? match[1].toUpperCase() : answerStr;
      const descriptor = question.descriptors.find((d) => d.code === code);
      if (descriptor) total += descriptor.points;
    }
  }
  return total;
}
