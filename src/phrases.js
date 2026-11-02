// Power phrases: long, performative coaching mantras. Typing is case-insensitive and
// phrases use only letters and spaces, so they are fair to type at speed.
// A hand-written core is topped up to PHRASE_COUNT with a seeded template generator,
// so the list is identical on every load.
export const PHRASE_COUNT = 2000;
const MIN_LEN = 16, MAX_LEN = 46;

const CORE = `
your network is your net worth|fake it till you make it|done is better than perfect
move fast and break things|work hard and stay humble|rise and grind|stay hungry stay foolish
the grind never sleeps|success is a mindset|failure is not an option|dream big work harder
think outside the box|feedback is a gift|culture eats strategy for breakfast|be the change
you miss every shot you do not take|comfort zones are where dreams go to die|the best time to start is now
your vibe attracts your tribe|hustle in silence let success make noise|winners never quit
if it does not challenge you it will not change you|discipline beats motivation|small steps every day
energy flows where attention goes|progress over perfection|the only limit is your mind
you are one decision away from greatness|believe it and you will achieve it|good vibes only
make today your masterpiece|ideas are cheap execution is everything|ship it and iterate
fail fast fail forward fail often|the market rewards the bold|growth begins at the end of comfort
your future self is watching you|wake up kick butt repeat|less talking more doing
coffee first then world domination|i drink coffee and close deals|my uber driver is my mentor
elon musk sleeps on the factory floor|tesla on autopilot mindset on full power
i took an uber to my higher self|cold showers build hot careers|ice baths for a fiery mindset
my morning routine starts at four am|journal manifest repeat|gratitude is my superpower
every no gets you closer to a yes|rejection is redirection|obstacles are opportunities in disguise
you are the ceo of your life|be your own unicorn|scale your dreams not your fears
think like a founder act like an owner|leaders eat last but they eat well|lead from the front
synergy is just teamwork in a suit|circle back to your inner child|lets take this offline forever
quantum leap your comfort zone|vibrate at the frequency of success|align your chakras with your kpis
manifest your quarterly targets|visualize the ipo|your calendar is a mirror of your priorities
time is money and money is time|invest in yourself first|you are the product and the brand
build a personal brand that slaps|post on linkedin like nobody is watching|add value then add more value
over deliver and under promise|treat every meeting like a ted talk|breathe in confidence breathe out doubt
your mindset is your moat|the flywheel starts with you|ten x your thinking not your hours
hustle harder than your excuses|outwork your doubts|do it scared|feel the fear and ship it anyway
champions are made when nobody is watching|stay focused and never settle|go the extra mile it is never crowded
the comeback is stronger than the setback|turn your pain into power|turn your mess into your message
pressure creates diamonds|storms make trees take deeper roots|you are not stuck you are loading
the universe is your accountability partner|ask for forgiveness not permission|be relentlessly resourceful
you become what you repeat|your habits write your future|win the morning win the day
kombucha is liquid ambition|eat the frog before breakfast|monetize your morning routine
disrupt yourself before someone else does|pivot like your life depends on it|the dip is where legends are made
real leaders do not need slides|i am not a coach i am a movement|this is not a talk it is a revolution
clap if you feel the synergy|say it louder for the people in the back|this is your sign to begin
you were born to scale|your potential is unlimited and so is my fee|refunds are a limiting belief
do not count the days make the days count|work smarter not harder|stay positive work hard make it happen
nothing changes if nothing changes|act as if|the magic happens outside your comfort zone
be so good they cannot ignore you|consistency is the new talent|motivation gets you started habit keeps you going
the harder you work the luckier you get|stop wishing start doing|focus on the step in front of you
`;

const TPL = {
  verb: ['unleash', 'monetize', 'disrupt', 'optimize', 'scale', 'upgrade', 'reinvent', 'hack', 'unlock', 'manifest',
    'ignite', 'align', 'elevate', 'supercharge', 'automate', 'gamify', 'rebrand', 'activate', 'amplify', 'level up',
    'future proof', 'reboot', 'awaken', 'empower', 'transform', 'decode', 'onboard', 'accelerate', 'tokenize', 'galvanize'],
  own: ['morning routine', 'inner unicorn', 'personal brand', 'comfort zone', 'vision board', 'linkedin profile', 'quantum field',
    'inner ceo', 'network', 'calendar', 'mindset', 'potential', 'energy', 'story', 'legacy', 'superpower', 'inner child',
    'sales funnel', 'daily habits', 'bandwidth', 'north star', 'coffee ritual', 'inner tesla', 'growth zone', 'gut feeling',
    'core values', 'side hustle', 'deep work', 'aura', 'dopamine', 'breathwork', 'pitch deck', 'five year plan', 'inner circle'],
  noun: ['coffee', 'kombucha', 'gratitude', 'hustle', 'discipline', 'focus', 'momentum', 'synergy', 'clarity', 'abundance',
    'resilience', 'grit', 'vision', 'passion', 'purpose', 'alignment', 'ambition', 'consistency', 'failure', 'success',
    'leadership', 'courage', 'confidence', 'curiosity', 'execution', 'empathy', 'patience', 'silence', 'networking',
    'storytelling', 'journaling', 'accountability', 'ownership', 'intuition', 'innovation', 'velocity', 'humility', 'mindfulness'],
  adj: ['quantum', 'radical', 'relentless', 'unstoppable', 'exponential', 'authentic', 'intentional', 'bulletproof', 'limitless',
    'holistic', 'disruptive', 'magnetic', 'legendary', 'mythical', 'massive', 'fearless', 'agile', 'premium', 'organic', 'viral'],
  bad: ['complaining', 'scrolling', 'waiting', 'doubting', 'sleeping in', 'overthinking', 'procrastinating', 'apologizing',
    'settling', 'hiding', 'making excuses', 'playing small', 'people pleasing', 'snoozing', 'blaming the market', 'second guessing'],
  good: ['building', 'shipping', 'hustling', 'manifesting', 'closing deals', 'journaling', 'sprinting', 'scaling', 'leading',
    'cold plunging', 'networking', 'pivoting', 'executing', 'visualizing', 'iterating', 'posting on linkedin', 'saying yes'],
  obst: ['setback', 'failure', 'meeting', 'deadline', 'rejection', 'traffic jam', 'cold coffee', 'bad review', 'monday',
    'layoff', 'budget cut', 'canceled uber', 'reply all email', 'dead battery', 'tough quarter', 'missed flight'],
  opp: ['opportunity', 'lesson', 'launchpad', 'blessing', 'pivot', 'growth spurt', 'masterclass', 'gift', 'plot twist',
    'breakthrough', 'wake up call', 'stepping stone', 'business idea', 'keynote story'],
  role: ['ceo', 'hero', 'architect', 'author', 'director', 'uber driver', 'pilot', 'founder', 'captain', 'chief vibe officer'],
  story: ['destiny', 'journey', 'startup', 'movie', 'story', 'universe', 'ted talk', 'life', 'empire', 'podcast'],
  vi: ['hustle', 'execute', 'ship', 'grind', 'sprint', 'pivot', 'lead', 'build', 'show up', 'dream', 'scale', 'iterate', 'deliver'],
  imagine: ['dream', 'imagine', 'visualize', 'manifest', 'journal', 'pitch', 'whiteboard', 'tweet'],
  make: ['scale', 'build', 'ship', 'sell', 'monetize', 'launch', 'fund', 'automate', 'franchise'],
  place: ['world', 'office', 'boardroom', 'uber', 'metaverse', 'standup', 'market', 'mirror', 'group chat', 'quarterly review'],
  tail: ['before your first coffee', 'in the back of an uber', 'like elon on a monday', 'at five am', 'in a tesla on autopilot',
    'during the ice bath', 'one post at a time', 'with a green smoothie', 'in this economy', 'before lunch', 'every single day',
    'like a unicorn', 'with quantum energy', 'and never look back', 'on the main stage'],
};

const TEMPLATES = [
  r => `${r('verb')} your ${r('own')}`,
  r => `${r('verb')} your ${r('own')} ${r('tail')}`,
  r => `${r('noun')} is the new ${r('noun')}`,
  r => `stop ${r('bad')} and start ${r('good')}`,
  r => `${r('adj')} ${r('noun')} creates ${r('adj')} results`,
  r => `every ${r('obst')} is a ${r('opp')} in disguise`,
  r => `you are the ${r('role')} of your own ${r('story')}`,
  r => `${r('good')} beats ${r('bad')} every single time`,
  r => `never let ${r('noun')} kill your ${r('noun')}`,
  r => `the universe rewards ${r('adj')} ${r('noun')}`,
  r => `do not chase ${r('noun')} chase ${r('noun')}`,
  r => `be the ${r('noun')} you want to see in the ${r('place')}`,
  r => `dream ${r('adj')} and ${r('vi')} harder`,
  r => `${r('vi')} today so you can ${r('vi')} tomorrow`,
  r => `${r('noun')} plus ${r('noun')} equals ${r('noun')}`,
  r => `if you can ${r('imagine')} it you can ${r('make')} it`,
  r => `${r('noun')} is a muscle so train it ${r('tail')}`,
  r => `your ${r('own')} is your ${r('adj')} advantage`,
  r => `${r('vi')} like nobody is watching ${r('tail')}`,
  r => `${r('adj')} people do not wait for ${r('noun')}`,
  r => `choose ${r('noun')} over ${r('noun')} ${r('tail')}`,
  r => `less ${r('bad')} more ${r('good')}`,
];

// Deterministic PRNG so the phrase set is the same for every player.
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function build() {
  const out = [], seen = new Set();
  const add = s => {
    const text = s.trim().replace(/\s+/g, ' ');
    if (!/^[a-z ]+$/.test(text) || text.length < MIN_LEN || text.length > MAX_LEN || seen.has(text)) return;
    seen.add(text); out.push(text);
  };
  for (const s of CORE.split(/[|\n]/)) if (s.trim()) add(s.toLowerCase());
  const rand = mulberry32(0x0117e5);
  let used;
  // Never use the same value twice in one phrase ("focus is the new focus").
  const r = key => { let v; do { v = TPL[key][(rand() * TPL[key].length) | 0]; } while (used.has(v)); used.add(v); return v; };
  for (let guard = 0; out.length < PHRASE_COUNT && guard < 200000; guard++) {
    used = new Set();
    add(TEMPLATES[(rand() * TEMPLATES.length) | 0](r));
  }
  return out.slice(0, PHRASE_COUNT);
}

export const PHRASES = build().map(text => ({ text, tier: 4, phrase: true }));

// Bubble lines used when Oliver drops a power phrase. {w} is the phrase.
export const PHRASE_LINES = [
  "Repeat after me: {w}!", "Everybody, say it with me: {w}!", "Write this on your mirror: {w}.",
  "Tattoo this on your soul: {w}.", "This tweet changed my life: {w}.", "My grandmother's last words: {w}.",
  "Put it on your vision board: {w}!", "Louder for the people in the back: {w}!", "Screenshot this: {w}.",
  "I charge 5000 dollars for this one: {w}.", "Elon called me at 4 AM to say: {w}.", "My Uber driver whispered: {w}.",
];
export const JOBS_PHRASE_LINES = ["And one more thing... {w}.", "Boom. {w}.", "Here's to the crazy ones: {w}."];
