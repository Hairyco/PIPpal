/**
 * Shared question wizard data used by QuestionWizard and the CoC activity-by-activity review.
 */

export const FREQUENCIES = [
  { key: 'never',     label: 'Never',     sub: 'Less than 1 day a week' },
  { key: 'rarely',    label: 'Rarely',    sub: '1–3 days a week' },
  { key: 'sometimes', label: 'Sometimes', sub: '4–6 days a week' },
  { key: 'often',     label: 'Often',     sub: 'Most days' },
  { key: 'most',      label: 'Every day', sub: '7 days a week' },
] as const;

export const DIFFICULTY_OPTIONS: Record<string, { category: string; icon: string; items: string[] }[]> = {
  q1: [
    { category: 'Mental Health', icon: '🧠', items: ['I get overwhelmed or panicky in the kitchen', 'I avoid using the hob or oven', 'I forget food is cooking and leave it on', 'I lose concentration mid-cook', 'I need someone to remind me to eat', 'I get anxious cooking alone'] },
    { category: 'Physical', icon: '💪', items: ['Standing at the cooker causes pain', 'I struggle to grip or lift pans', 'Tremors or weak hands make it unsafe', 'I need to sit down to cook', 'Fatigue stops me finishing meals'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['I forget the steps involved in cooking', 'I get distracted and things go wrong', 'I struggle to plan what to cook', 'I need someone with me for safety'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q2: [
    { category: 'Physical', icon: '💪', items: ['I struggle to use cutlery', 'I drop cups or spill drinks regularly', 'I cannot cut up my own food', 'I choke or have swallowing difficulties', 'I need adapted cutlery or equipment'] },
    { category: 'Mental Health', icon: '🧠', items: ['I forget to eat without being reminded', 'I need prompting to get through meals', 'Eating causes me distress or anxiety'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['Textures or smells make eating impossible', 'I get distracted and leave meals unfinished', 'I need a strict routine around food'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q3: [
    { category: 'Memory & Prompting', icon: '🧠', items: ['I forget to take my medication', 'I need reminders to manage my treatment', 'I have missed doses that caused harm', 'I cannot be trusted to manage it alone'] },
    { category: 'Physical', icon: '💪', items: ['I struggle to open packaging', 'I cannot administer injections or patches myself', 'My treatment takes significant time each day', 'I need help preparing equipment'] },
    { category: 'Mental Health', icon: '🌿', items: ['My condition affects my ability to engage with treatment', 'I need supervision when taking medication', 'Managing my treatment causes me distress'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q4: [
    { category: 'Physical', icon: '💪', items: ['I cannot get in or out of the bath or shower safely', 'I need to use a shower seat or grab rails', 'I cannot reach all parts of my body', 'Standing in the shower is too painful', 'Drying myself is difficult or impossible'] },
    { category: 'Mental Health', icon: '🧠', items: ['I go days without washing because of my condition', 'I need prompting to wash regularly', 'Washing causes me distress or anxiety'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['Sensory issues with water or products', 'I need prompting through each step of washing', 'I forget to wash without reminders'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q5: [
    { category: 'Physical', icon: '💪', items: ['I cannot always get to the toilet in time', 'Getting on or off the toilet is difficult', 'I cannot clean myself properly afterwards', 'I have bladder or bowel accidents', 'I need aids or equipment to manage'] },
    { category: 'Bowel / Bladder', icon: '⚠️', items: ['Urgency means I cannot always make it', 'My condition is unpredictable day to day', 'I have to plan everything around toilet access', 'I manage a stoma or catheter'] },
    { category: 'Cognitive / Mental Health', icon: '🧠', items: ['I need prompting to use the toilet', 'I sometimes do not recognise the need to go', 'Psychological barriers affect my toilet use'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q6: [
    { category: 'Physical', icon: '💪', items: ['I cannot do up buttons or zips', 'Getting socks or shoes on is very difficult', 'Raising my arms to dress causes pain', 'Bending to dress my lower body is impossible', 'Fatigue means dressing wipes me out'] },
    { category: 'Mental Health', icon: '🧠', items: ['I need prompting to get dressed each day', 'Some days I cannot get dressed at all', 'Getting dressed causes me distress'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['Certain fabrics cause sensory distress', 'I need help choosing appropriate clothing', 'I struggle with the steps involved in dressing'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q7: [
    { category: 'Speech & Processing', icon: '🗣️', items: ['I sometimes cannot speak at all', 'People struggle to understand me', 'I struggle to process what people say', 'I need extra time to respond in conversation', 'I need a communication aid'] },
    { category: 'Mental Health / Anxiety', icon: '🧠', items: ['Anxiety stops me being able to speak', 'I freeze or lose words when stressed', 'I need someone to speak on my behalf'] },
    { category: 'Neurodivergent', icon: '⚡', items: ['I find verbal communication exhausting', 'I misunderstand what people mean', 'I respond in ways others find inappropriate'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q8: [
    { category: 'Reading Difficulties', icon: '📖', items: ['I cannot read standard print', 'I need large print or audio formats', 'I misread things regularly', 'Reading takes me much longer than others', 'I need someone to read things to me'] },
    { category: 'Mental Health / Cognitive', icon: '🧠', items: ['Brain fog means I cannot take in what I read', 'I need to read things multiple times to understand', 'I need someone to explain letters and documents'] },
    { category: 'Neurodivergent', icon: '⚡', items: ['Dyslexia affects my reading significantly', 'I struggle with complex or formal language', 'Written information does not make sense to me'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q9: [
    { category: 'Anxiety / Mental Health', icon: '🧠', items: ['Social situations cause me panic or severe distress', 'I avoid all interactions with strangers', 'I need someone with me in any social situation', 'I cannot engage with people I do not know'] },
    { category: 'Neurodivergent', icon: '⚡', items: ['I misread social cues and situations', 'Group settings are overwhelming for me', 'I respond in ways that cause problems', 'Social interaction exhausts me'] },
    { category: 'Mental Health Conditions', icon: '🌿', items: ['I withdraw from all social contact', 'Paranoia affects my ability to engage with others', 'My condition makes social situations unsafe'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q10: [
    { category: 'Mental Health', icon: '🧠', items: ['I forget to pay bills and manage accounts', 'I make impulsive financial decisions I regret', 'Someone else manages my money for me', 'I cannot engage with money tasks on bad days'] },
    { category: 'Cognitive', icon: '⚡', items: ['Understanding the value of money is difficult', 'I am vulnerable to financial exploitation', 'I cannot budget reliably without help', 'I need someone to check my decisions'] },
    { category: 'Practical Difficulties', icon: '💳', items: ['Online banking is beyond me', 'I cannot manage direct debits or standing orders', 'I need support with any financial paperwork'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q11: [
    { category: 'Anxiety / Mental Health', icon: '🧠', items: ['I cannot leave the house alone', 'Travelling causes panic or overwhelming distress', 'I need someone with me whenever I go out', 'I can only travel on familiar routes I know well'] },
    { category: 'Navigation', icon: '🗺️', items: ['I get lost even on familiar routes', 'I cannot plan a journey to somewhere new', 'Unexpected changes to my route cause crisis', 'I need an orientation aid to travel'] },
    { category: 'Physical / Sensory', icon: '💪', items: ['Public transport is inaccessible for me', 'Sensory overwhelm on public transport stops me', 'I cannot travel alone due to safety risks'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q12: [
    { category: 'Pain & Fatigue', icon: '💪', items: ['Pain stops me after a short distance', 'Fatigue means I cannot walk far reliably', 'I need to stop and rest frequently', 'I use a walking stick, frame or wheelchair', 'Walking the same distance again is impossible'] },
    { category: 'Breathlessness', icon: '🫁', items: ['I become breathless very quickly', 'My heart or breathing condition limits my walking', 'I cannot walk far without health risks'] },
    { category: 'Safety & Other', icon: '⚠️', items: ['I cannot walk outside alone safely', 'Falls risk limits how far I can go', 'Anxiety or panic stops me leaving the house'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  default: [
    { category: 'Physical', icon: '💪', items: ['Pain or discomfort limits me', 'Fatigue stops me managing reliably', 'I have strength or mobility difficulties'] },
    { category: 'Mental Health', icon: '🧠', items: ['Anxiety or distress affects this activity', 'I need prompting or reminders', 'I avoid this activity when I can'] },
    { category: 'Cognitive', icon: '⚡', items: ['I struggle to concentrate', 'I forget steps or instructions', 'I need supervision to stay safe'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
};

export const SUPPORT_OPTIONS: Record<string, { icon: string; label: string; sub: string }[]> = {
  q1: [
    { icon: '🔔', label: 'I need reminders or encouragement', sub: 'Someone has to remind or encourage me to cook or eat.' },
    { icon: '🛡️', label: 'I need supervision for safety', sub: 'Someone needs to be nearby to make sure I stay safe.' },
    { icon: '🍴', label: 'I get help with parts of cooking', sub: 'Someone helps me with tasks like chopping, using the hob, etc.' },
    { icon: '🍽️', label: 'I get all my meals prepared by someone else', sub: 'I cannot prepare or cook any meals myself.' },
    { icon: '✅', label: "I don't need help", sub: 'I can prepare and cook without any help.' },
  ],
  default: [
    { icon: '🔔', label: 'I need reminders or prompting', sub: 'Someone reminds or encourages me.' },
    { icon: '🛡️', label: 'I need supervision for safety', sub: 'Someone needs to be nearby.' },
    { icon: '🤝', label: 'I need physical help', sub: 'Someone assists me directly.' },
    { icon: '👤', label: 'Someone does this entirely for me', sub: 'I cannot manage this activity at all.' },
    { icon: '✅', label: "I don't need help", sub: 'I can manage without any help.' },
  ],
};

export const REAL_LIFE_OPTIONS: Record<string, { icon: string; label: string; sub: string }[]> = {
  q1: [
    { icon: '🚫', label: 'I avoid cooking', sub: 'I avoid using the hob/oven or making meals.' },
    { icon: '🥡', label: 'I rely on ready meals or takeaways', sub: "It's easier or safer for me." },
    { icon: '⏱️', label: 'It takes me much longer', sub: 'I need breaks or it takes far longer than others.' },
    { icon: '😴', label: 'I become exhausted', sub: 'It leaves me very tired or drained.' },
    { icon: '⚠️', label: "I've had accidents", sub: 'Burns, leaving the hob on, or other incidents.' },
    { icon: '🍽️', label: "I can't always eat properly", sub: "I skip meals or don't eat enough." },
  ],
  default: [
    { icon: '🚫', label: 'I avoid this activity', sub: 'I avoid it when I can.' },
    { icon: '⏱️', label: 'It takes me much longer', sub: 'It takes far longer than for most people.' },
    { icon: '😴', label: 'I become exhausted afterwards', sub: 'It leaves me very tired or drained.' },
    { icon: '😰', label: 'It causes me distress', sub: 'Anxiety, pain or overwhelm during or after.' },
    { icon: '⚠️', label: "I've had accidents or near misses", sub: 'Incidents due to my condition.' },
  ],
};
