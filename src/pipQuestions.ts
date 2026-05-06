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
  free: boolean; // Only Q1 is free
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
    subtext: 'This covers your ability to plan, prepare, and cook a simple meal without help.',
    defaultExplainer: 'This question looks at whether you can plan, prepare, and cook a simple meal safely and reliably. It covers everything from thinking about what to make, gathering ingredients, using kitchen equipment, and cooking safely without risk of harm.',
    conditionExplainers: [
      {
        conditions: ['anxiety', 'panic', 'ptsd', 'agoraphobia'],
        text: 'For conditions like anxiety or PTSD, this question covers whether you can concentrate enough to safely prepare food, whether you forget meals, or whether the process causes overwhelming distress. If you need someone to prompt you to eat or help you cook safely, that counts.',
        example: 'On my worst days, my anxiety is so severe I cannot focus on cooking safely. I have left the hob on by accident and burned food. I need someone to remind me to eat and sometimes to help me prepare meals.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'For neurodivergent conditions, this covers difficulties with planning meals, executive function challenges in following recipes, sensory issues with food preparation, and safety risks from distraction or overwhelm while cooking.',
        example: 'I struggle to plan and follow the steps to prepare a meal. I get distracted and forget what I am doing, which has caused safety incidents. Certain food textures and smells make cooking overwhelming for me.',
      },
      {
        conditions: ['pain', 'fibromyalgia', 'arthritis'],
        text: 'For chronic pain conditions, this covers whether you can safely stand long enough to cook, grip utensils, lift pans, and whether pain makes cooking unreliable or dangerous. If you can only manage a microwave, that is relevant.',
        example: 'My pain means I cannot stand at the cooker for more than a few minutes. I cannot grip or lift a saucepan safely. On most days I rely on a microwave or need someone to cook for me.',
      },
      {
        conditions: ['depression'],
        text: 'For depression, this covers the severe lack of motivation to prepare food, forgetting to eat, or being unable to plan and execute even a simple meal on most days.',
        example: 'On my worst days I have no motivation to prepare food at all. I often forget to eat entirely or rely on ready meals. The effort of planning and cooking even something simple feels impossible.',
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
    tip: 'Use your PIP Diary to log how this activity affects you on bad days. Real examples from your diary make your answers much stronger.',
    free: true,
  },
  {
    id: 'q2',
    chatOpener: 'Can you eat and drink without help, or does your condition make this difficult?',
    num: 2,
    title: 'Taking nutrition',
    shortTitle: 'Eating & drinking',
    category: 'Daily Living',
    pipFormRef: 'Question 4 on PIP2 form',
    headline: 'Can you eat and drink safely and reliably?',
    subtext: 'This covers your ability to cut up food, use utensils, and consume food and drink safely.',
    defaultExplainer: 'This question covers whether you can eat and drink safely and reliably. It includes cutting up food, using a fork, knife or spoon, drinking from a cup, and swallowing food and drink safely without risk of choking or harm.',
    conditionExplainers: [
      {
        conditions: ['ms', 'stroke', 'brain injury', 'parkinson'],
        text: 'For neurological conditions, this covers tremors that affect using cutlery, difficulty swallowing (dysphagia), spilling drinks, or needing adapted equipment or assistance to eat safely.',
        example: 'My condition affects my grip and coordination. I struggle to use cutlery, drop cups, and sometimes choke. I need help or adapted equipment to eat safely.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'For neurodivergent conditions, sensory issues around food textures and the need for prompting to eat regularly are relevant here.',
      },
      {
        conditions: ['depression', 'anxiety'],
        text: 'For mental health conditions, this covers needing prompting to eat, forgetting to eat, or being too distressed to manage meals independently.',
        example: 'My mental health means I often forget to eat or cannot motivate myself. On my worst days I go without meals entirely or need someone to encourage me.',
      },
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia'],
        text: 'For pain conditions, this covers difficulty gripping cutlery, inability to cut food, or pain making the act of eating slow, unreliable, or requiring assistance.',
        example: 'My pain and stiffness make it very hard to grip cutlery or a cup. On bad days I cannot cut up food without help and struggle to eat a full meal.',
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
    tip: 'Think about your worst days — not just typical days. If you sometimes need help, that counts.',
    free: false,
  },
  {
    id: 'q3',
    chatOpener: 'Do you need to follow a treatment plan or take medication regularly? Can you manage this yourself?',
    num: 3,
    title: 'Managing therapy',
    shortTitle: 'Managing therapy',
    category: 'Daily Living',
    pipFormRef: 'Question 5 on PIP2 form',
    headline: 'Can you manage your medication and therapy?',
    subtext: 'This covers taking medication, monitoring your condition, and managing any ongoing therapy.',
    defaultExplainer: 'This question covers whether you can manage your own medication, medical devices, and any therapy or monitoring required for your health condition. It includes remembering to take medication, administering injections, using medical equipment, and attending therapy appointments.',
    conditionExplainers: [
      {
        conditions: ['diabetes'],
        text: 'For diabetes, this covers monitoring blood glucose, administering insulin, managing hypos, and the time and assistance needed to manage your condition safely each day.',
      },
      {
        conditions: ['depression', 'anxiety', 'bipolar', 'schizophrenia'],
        text: 'For mental health conditions, this covers forgetting to take medication, needing prompting to manage your medication regime, or needing supervision to ensure you take medication safely.',
        example: 'I struggle to remember to take my medication. I need reminders and have missed doses which have affected my health. Managing my medication independently is not reliable.',
      },
      {
        conditions: ['epilepsy'],
        text: 'For epilepsy, this covers managing medication to prevent seizures, needing supervision when taking medication, and the time spent managing your condition daily.',
      },
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'For physical conditions, this covers difficulty opening medication packaging, administering patches or injections, or managing complex medication schedules independently.',
        example: 'Managing my treatment takes significant time and causes additional pain. I need help preparing equipment and cannot always complete my therapy without assistance.',
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
    tip: 'Add up the total time you spend each week on medication and therapy — this directly affects which descriptor applies to you.',
    free: false,
  },
  {
    id: 'q4',
    chatOpener: 'Can you wash and bathe yourself without help or supervision?',
    num: 4,
    title: 'Washing and bathing',
    shortTitle: 'Washing & bathing',
    category: 'Daily Living',
    pipFormRef: 'Question 6 on PIP2 form',
    headline: 'Can you wash and bathe yourself safely?',
    subtext: 'This covers washing your face, body, hair, and bathing or showering independently.',
    defaultExplainer: 'This question covers whether you can wash your face and body, bathe or shower, wash your hair, and maintain your personal hygiene safely and reliably. It includes getting in and out of the bath or shower, using taps and controls, and drying yourself afterwards.',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'For pain and physical conditions, this covers difficulty getting in and out of the bath or shower, reaching to wash all parts of the body, gripping taps or shower controls, and the risk of falling.',
        example: 'My pain and fatigue mean I cannot stand in the shower safely. I use a shower seat and grab rails. On my worst days I need someone to assist me or I go without washing.',
      },
      {
        conditions: ['anxiety', 'depression', 'ptsd'],
        text: 'For mental health conditions, this covers the inability to motivate yourself to wash, needing prompting from another person, or distress and anxiety around the process of washing.',
        example: 'On my worst days my depression means I cannot bring myself to wash. I go for days without bathing and need prompting or physical help from someone else.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'For neurodivergent conditions, this covers sensory sensitivities to water temperature or pressure, difficulty following the steps involved in washing, and needing prompting or supervision.',
      },
      {
        conditions: ['visual impairment'],
        text: 'For visual impairments, this covers difficulty safely managing hot water, identifying toiletries, and washing safely without risk of burns or falls.',
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
    tip: 'Think about whether you can wash safely and reliably on your worst days — not just on good days.',
    free: false,
  },
  {
    id: 'q5',
    chatOpener: 'Can you manage your toilet needs including getting there in time and cleaning yourself afterwards?',
    num: 5,
    title: 'Managing toilet needs',
    shortTitle: 'Toilet needs',
    category: 'Daily Living',
    pipFormRef: 'Question 7 on PIP2 form',
    headline: 'Can you manage your toilet needs?',
    subtext: 'This covers getting to the toilet, using it safely, and managing any incontinence.',
    defaultExplainer: 'This question covers whether you can get to and from the toilet, use it safely, manage your clothing before and after, clean yourself, and manage any incontinence. It also covers the use of any continence aids or assistive devices.',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'ms', 'stroke'],
        text: 'For physical conditions, this covers difficulty getting on and off the toilet, managing clothing, reaching to clean yourself, and urgency that means you cannot always get there in time.',
        example: 'My condition causes urgency and I sometimes do not make it to the toilet in time. I need to be close to a toilet at all times and have had accidents without adequate support.',
      },
      {
        conditions: ['crohn', 'ibs', 'bowel'],
        text: 'For bowel conditions, this covers urgency, accidents, managing stoma equipment, and the frequency and unpredictability of toilet needs throughout the day.',
        example: 'My condition causes urgent and unpredictable toilet needs. I cannot always get to the toilet in time without help and need to be near a toilet at all times.',
      },
      {
        conditions: ['anxiety', 'depression'],
        text: 'For mental health conditions, this covers needing prompting to use the toilet, or psychological barriers that affect your ability to manage toilet needs independently.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'For cognitive conditions, this covers forgetting to use the toilet, not recognising the need to go, requiring prompting or supervision, and managing incontinence.',
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
    tip: 'This is a sensitive topic but it is important to be honest. Assessors deal with this every day — describing your difficulties accurately is essential.',
    free: false,
  },
  {
    id: 'q6',
    chatOpener: 'Can you dress and undress yourself, including putting on and taking off shoes and socks?',
    num: 6,
    title: 'Dressing and undressing',
    shortTitle: 'Dressing',
    category: 'Daily Living',
    pipFormRef: 'Question 8 on PIP2 form',
    headline: 'Can you dress and undress yourself?',
    subtext: 'This covers selecting, putting on, and removing clothing and footwear.',
    defaultExplainer: 'This question covers whether you can select appropriate clothing, put it on, fasten buttons and zips, and remove clothing. It includes putting on footwear such as socks and shoes. It also covers whether you can dress appropriately for the weather and occasion.',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'For pain and physical conditions, this covers difficulty with fine motor skills like buttons and zips, reaching to put on socks or shoes, bending, and the energy and pain involved in dressing on bad days.',
        example: 'My pain and stiffness mean I struggle to dress myself independently. I cannot fasten buttons, put on socks or shoes, or raise my arms to dress without help.',
      },
      {
        conditions: ['depression', 'anxiety'],
        text: 'For mental health conditions, this covers needing prompting to get dressed, inability to select appropriate clothing, or days where you cannot manage to dress at all.',
        example: 'On my worst days I cannot motivate myself to get dressed. I need prompting and sometimes physical help to get dressed each day.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'For neurodivergent conditions, this covers sensory sensitivities to clothing, difficulty with the sequence of dressing, and needing prompting or supervision to dress appropriately.',
        example: 'Certain fabrics and clothing cause me significant sensory distress. I need help selecting appropriate clothing and getting dressed can take much longer than normal.',
      },
      {
        conditions: ['dementia', 'memory'],
        text: 'For cognitive conditions, this covers not remembering to get dressed, putting clothes on incorrectly, and needing prompting or assistance to dress appropriately.',
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
    tip: 'Think about how long it takes you to get dressed on a bad day, and whether you need help or prompting from someone else.',
    free: false,
  },
  {
    id: 'q7',
    chatOpener: 'Can you communicate with others — reading, understanding and being understood verbally?',
    num: 7,
    title: 'Communicating verbally',
    shortTitle: 'Communication',
    category: 'Daily Living',
    pipFormRef: 'Question 9 on PIP2 form',
    headline: 'Can you communicate verbally?',
    subtext: 'This covers speaking, understanding speech, and communicating with others verbally.',
    defaultExplainer: 'This question covers your ability to speak and be understood, and to understand what others say to you. It includes issues with speech clarity, processing verbal information, selective mutism, and the use of communication aids.',
    conditionExplainers: [
      {
        conditions: ['autism', 'adhd'],
        text: 'For neurodivergent conditions, this covers difficulties with processing verbal information, selective mutism, difficulty understanding implied meaning, and the energy required for verbal communication.',
        example: 'I find verbal communication very difficult, especially with strangers. I sometimes cannot speak at all and need someone to communicate on my behalf.',
      },
      {
        conditions: ['anxiety', 'ptsd'],
        text: 'For anxiety conditions, this covers panic attacks that affect speech, difficulty speaking to strangers, selective mutism triggered by anxiety, and situations where verbal communication breaks down.',
        example: 'Communicating when anxious is extremely difficult. I cannot process what people say or respond clearly and often need someone to help me in conversations.',
      },
      {
        conditions: ['stroke', 'brain injury', 'ms'],
        text: 'For neurological conditions, this covers aphasia, dysarthria (slurred speech), word-finding difficulties, and the need for communication aids or extra time to communicate.',
      },
      {
        conditions: ['visual impairment'],
        text: 'For visual impairments, difficulty reading lips or non-verbal cues that support communication may be relevant here.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can express and understand verbal information unaided.', points: 0 },
      { code: 'B', text: 'Needs to use an aid or appliance to be able to speak or hear.', points: 2 },
      { code: 'C', text: 'Needs communication support to be able to express or understand complex verbal information.', points: 2 },
      { code: 'D', text: 'Needs communication support to be able to express or understand basic verbal information.', points: 4 },
      { code: 'E', text: 'Cannot express or understand verbal information at all, even with communication support.', points: 12 },
    ],
    tip: 'Think about whether you can make yourself understood and understand others reliably — including with strangers, on the phone, or in stressful situations.',
    free: false,
  },
  {
    id: 'q8',
    chatOpener: 'Can you read and understand written information like letters, signs or instructions?',
    num: 8,
    title: 'Reading and understanding',
    shortTitle: 'Reading',
    category: 'Daily Living',
    pipFormRef: 'Question 10 on PIP2 form',
    headline: 'Can you read and understand written information?',
    subtext: 'This covers reading signs, symbols, words, and understanding written information.',
    defaultExplainer: 'This question covers your ability to read and understand written information — including signs, symbols, labels, and letters. It also covers your ability to understand and process written instructions in everyday life.',
    conditionExplainers: [
      {
        conditions: ['visual impairment'],
        text: 'For visual impairments, this covers inability to read standard print, needing large print or Braille, and difficulty reading signs, screens, or labels.',
      },
      {
        conditions: ['dyslexia', 'adhd', 'autism'],
        text: 'For neurodivergent conditions, this covers difficulties processing written text, needing information in alternative formats, and the significant extra time required to read and understand information.',
        example: 'I struggle to interpret written information correctly, especially complex or formal language. I need help understanding letters and official documents.',
      },
      {
        conditions: ['depression', 'anxiety'],
        text: 'For mental health conditions, this covers cognitive fog making it impossible to concentrate on written information, needing someone to read things to you, or being unable to process written information on bad days.',
        example: 'My depression and poor concentration mean I cannot read and absorb written information reliably. I need things read to me or explained verbally.',
      },
      {
        conditions: ['stroke', 'brain injury', 'dementia', 'memory'],
        text: 'For cognitive conditions, this covers acquired reading difficulties, inability to understand written information, and needing assistance to process letters or signs.',
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
    tip: 'Consider whether you can read and understand a standard letter from the DWP without any help from another person.',
    free: false,
  },
  {
    id: 'q9',
    chatOpener: 'Can you engage socially with other people without significant difficulty?',
    num: 9,
    title: 'Engaging with others',
    shortTitle: 'Social engagement',
    category: 'Daily Living',
    pipFormRef: 'Question 11 on PIP2 form',
    headline: 'Can you engage with other people face to face?',
    subtext: 'This covers your ability to interact socially and engage with others in person.',
    defaultExplainer: 'This question covers your ability to interact with people you don\'t know face to face. This includes engaging in conversation, understanding social norms, maintaining appropriate behaviour, and whether you need support to engage socially without causing distress to yourself or others.',
    conditionExplainers: [
      {
        conditions: ['anxiety', 'ptsd', 'agoraphobia'],
        text: 'For anxiety conditions, this covers panic attacks triggered by social interaction, inability to engage with strangers, avoidance of social situations, and needing someone with you to manage social interactions.',
        example: 'Social situations cause me severe anxiety. I avoid them where possible and need support to manage any interaction with unfamiliar people.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'For neurodivergent conditions, this covers difficulty reading social cues, inappropriate responses in social situations, overwhelm in social settings, and needing support to engage appropriately with others.',
        example: 'Social interaction is extremely difficult for me. I struggle to read social cues and find group situations overwhelming. I need support in most social environments.',
      },
      {
        conditions: ['depression', 'bipolar', 'schizophrenia'],
        text: 'For mental health conditions, this covers withdrawal from social interaction, paranoia affecting social engagement, or behavioural difficulties that make social interaction unsafe or distressing.',
        example: 'My depression means I withdraw from social contact completely on my worst days. I find interacting with others exhausting and distressing.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'For cognitive conditions, this covers difficulty recognising people, inappropriate social behaviour, and needing supervision when interacting with others.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can engage with other people unaided.', points: 0 },
      { code: 'B', text: 'Needs prompting to be able to engage with other people.', points: 2 },
      { code: 'C', text: 'Needs social support to be able to engage with other people.', points: 4 },
      { code: 'D', text: 'Cannot engage with other people due to such engagement causing either psychological distress to the claimant or violent or abusive behaviour by the claimant.', points: 8 },
    ],
    tip: 'Think about whether you can interact with a stranger — like a GP receptionist or a shop assistant — without significant distress or difficulty.',
    free: false,
  },
  {
    id: 'q10',
    chatOpener: 'Can you make decisions about spending money and managing finances?',
    num: 10,
    title: 'Making decisions',
    shortTitle: 'Making decisions',
    category: 'Daily Living',
    pipFormRef: 'Question 12 on PIP2 form',
    headline: 'Can you make decisions about money?',
    subtext: 'This covers your ability to understand and manage budgeting and financial decisions.',
    defaultExplainer: 'This question covers your ability to make decisions about money — including understanding the value of money, budgeting, paying bills, and making financial decisions. It also covers whether you need support to manage your finances safely.',
    conditionExplainers: [
      {
        conditions: ['depression', 'anxiety', 'bipolar'],
        text: 'For mental health conditions, this covers inability to manage money during episodes, making impulsive financial decisions, needing someone else to manage your finances, or being unable to budget reliably.',
        example: 'My depression makes managing money very difficult. I forget to pay bills and cannot engage with financial tasks on my worst days. I need help managing my finances.',
      },
      {
        conditions: ['autism', 'adhd', 'learning disability'],
        text: 'For neurodivergent conditions, this covers difficulty understanding the value of money, needing support to budget, and being vulnerable to financial exploitation.',
        example: 'My condition makes it very difficult to manage money reliably. I forget bills, make impulsive decisions, and need help to stay on top of my finances.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'For cognitive conditions, this covers forgetting to pay bills, being unable to understand financial information, and needing someone else to manage all financial decisions.',
      },
      {
        conditions: ['schizophrenia', 'psychosis'],
        text: 'For psychotic conditions, this covers periods where you are unable to make rational financial decisions, spending erratically, or needing a deputy or appointee to manage your finances.',
      },
    ],
    descriptors: [
      { code: 'A', text: 'Can manage complex budgeting decisions unaided.', points: 0 },
      { code: 'B', text: 'Needs prompting or assistance to be able to make complex budgeting decisions.', points: 2 },
      { code: 'C', text: 'Needs prompting or assistance to be able to make simple budgeting decisions.', points: 4 },
      { code: 'D', text: 'Cannot make any budgeting decisions at all.', points: 6 },
    ],
    tip: 'Think about whether you can manage your own money safely and reliably — including online banking, direct debits, and day-to-day spending decisions.',
    free: false,
  },
  {
    id: 'q11',
    chatOpener: 'Can you plan and follow a journey to an unfamiliar place on your own?',
    num: 11,
    title: 'Planning a journey',
    shortTitle: 'Planning a journey',
    category: 'Mobility',
    pipFormRef: 'Question 13 on PIP2 form',
    headline: 'Can you plan and follow a journey?',
    subtext: 'This covers your ability to plan and navigate a route, and travel independently.',
    defaultExplainer: 'This question covers your ability to plan a route and travel independently — whether by public transport, car, or on foot. It includes whether you can navigate unfamiliar places, manage changes to your route, and travel without becoming overwhelmed or unsafe.',
    conditionExplainers: [
      {
        conditions: ['anxiety', 'ptsd', 'agoraphobia'],
        text: 'For anxiety conditions, this covers being unable to use public transport, needing someone with you to travel, being unable to travel to unfamiliar places, and panic attacks triggered by travel.',
        example: 'I cannot travel to unfamiliar places alone. The anxiety is overwhelming and I have had panic attacks on journeys. I need someone with me at all times when going out.',
      },
      {
        conditions: ['autism', 'adhd'],
        text: 'For neurodivergent conditions, this covers difficulty with route changes, needing a familiar companion to travel, overwhelming sensory experiences on public transport, and anxiety around unexpected changes.',
        example: 'I struggle with changes to routine and unfamiliar routes. I need detailed planning and often someone with me to travel anywhere I have not been before.',
      },
      {
        conditions: ['visual impairment'],
        text: 'For visual impairments, this covers inability to read signs or maps, needing a guide, and the significant limitations on independent travel.',
      },
      {
        conditions: ['dementia', 'memory', 'brain injury'],
        text: 'For cognitive conditions, this covers getting lost on familiar routes, inability to plan a journey, and the safety risks of travelling independently.',
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
    tip: 'Think about whether you can travel to an unfamiliar place alone — not just whether you can travel at all.',
    free: false,
  },
  {
    id: 'q12',
    chatOpener: 'Can you walk safely and reliably, or does your condition limit how far or how you move?',
    num: 12,
    title: 'Moving around',
    shortTitle: 'Moving around',
    category: 'Mobility',
    pipFormRef: 'Question 14 on PIP2 form',
    headline: 'How far can you walk safely?',
    subtext: 'This covers your ability to move around on foot over various distances.',
    defaultExplainer: 'This question covers how far you can walk safely, reliably, and repeatedly — on a flat surface, in a reasonable time, without significant pain or breathlessness, and without risk of falling. The key distances are 20 metres, 50 metres, 200 metres, and further.',
    conditionExplainers: [
      {
        conditions: ['pain', 'arthritis', 'fibromyalgia', 'ms'],
        text: 'For pain and physical conditions, this covers how far you can walk before pain, fatigue, or stiffness stops you. Think about your worst days — and whether you can walk the same distance repeatedly throughout the day.',
        example: 'My pain severely limits how far I can walk. I can only manage a very short distance before it becomes overwhelming. I use a walking aid and need to rest frequently.',
      },
      {
        conditions: ['anxiety', 'agoraphobia', 'ptsd'],
        text: 'For anxiety conditions, this covers psychological barriers to leaving the home, inability to walk in public places, and panic attacks triggered by being outside.',
        example: 'Going out and walking in public spaces causes me severe anxiety. I avoid crowded areas and can only walk short distances in unfamiliar places before needing to return home.',
      },
      {
        conditions: ['epilepsy'],
        text: 'For epilepsy, this covers the risk of seizures when out alone, falls risk, and whether you can safely walk independently without risk of harm.',
      },
      {
        conditions: ['breathlessness', 'copd', 'heart', 'asthma'],
        text: 'For respiratory and cardiac conditions, this covers how far you can walk before breathlessness stops you, and whether the effort of walking causes significant health risks.',
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
    tip: '20 metres is roughly the length of 4 cars. 50 metres is roughly the length of a standard swimming pool. Think carefully about which distance applies to you on your worst days.',
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