// Coach-session vocabulary. Separated by "|" and newlines; duplicates are removed automatically.
const RAW = `
performance|coffee|uber|tesla|Elon Musk|mindset|growth|hustle|grind|focus|vision|mission|purpose|passion|energy|synergy
leverage|impact|scale|disrupt|pivot|agile|scrum|sprint|backlog|standup|kanban|roadmap|milestone|deadline|deliverable
stakeholder|alignment|bandwidth|paradigm|paradigm shift|game changer|low hanging fruit|move the needle|circle back|deep dive
touch base|win win|think outside the box|quick win|best practice|core values|north star|value proposition|thought leader
thought leadership|growth hacking|hockey stick|unicorn|decacorn|startup|scaleup|founder|cofounder|CEO|CFO|CTO|COO
board meeting|investor|angel investor|venture capital|seed round|series A|series B|IPO|valuation|burn rate|runway|revenue
profit|margin|KPI|OKR|ROI|EBITDA|benchmark|metrics|dashboard|analytics|insights|data driven|customer centric|user experience
onboarding|offboarding|retention|churn|funnel|conversion|lead|prospect|pipeline|quota|upsell|cross sell|pitch|elevator pitch
pitch deck|slide deck|keynote|webinar|podcast|masterclass|bootcamp|workshop|retreat|offsite|team building|icebreaker
brainstorm|ideation|innovation|creativity|resilience|grit|discipline|consistency|accountability|ownership|empowerment
authenticity|vulnerability|gratitude|mindfulness|meditation|breathwork|cold shower|ice bath|morning routine|five AM club
journaling|affirmation|manifestation|visualization|abundance|scarcity|comfort zone|growth zone|flow state|deep work
time blocking|pomodoro|productivity|efficiency|optimization|prioritization|delegation|leadership|management|mentorship
coaching|feedback|radical candor|transparency|trust|collaboration|communication|empathy|emotional intelligence|self awareness
self care|self love|self discipline|willpower|motivation|inspiration|aspiration|ambition|success|failure|fail fast
fail forward|iterate|experiment|hypothesis|MVP|minimum viable product|product market fit|go to market|blue ocean|red ocean
competitive advantage|moat|flywheel|ecosystem|platform|marketplace|network effect|viral|influencer|personal brand|LinkedIn
Twitter|Instagram|TikTok|YouTube|followers|engagement|content creator|hashtag|algorithm|newsletter|storytelling|narrative
blockchain|crypto|bitcoin|ethereum|NFT|metaverse|web3|AI|artificial intelligence|machine learning|deep learning
neural network|ChatGPT|large language model|prompt engineering|cloud|serverless|kubernetes|docker|microservices|API|SaaS
big data|quantum|quantum computing|qubit|superposition|entanglement|quantum leap|quantum mindset|quantum coach
quantum energy|vibration|frequency|cybersecurity|automation|robotics|drone|smartwatch|iPhone|Apple|Google|Amazon|Microsoft
Netflix|Spotify|Airbnb|SpaceX|Starlink|Neuralink|Mars|rocket|Falcon Heavy|Cybertruck|Model S|Model X|Model 3|Model Y
autopilot|electric car|Jeff Bezos|Bill Gates|Steve Jobs|Mark Zuckerberg|Warren Buffett|Oprah|Tony Robbins|Simon Sinek
Gary Vee|Napoleon Hill|Dale Carnegie|Peter Drucker|Jack Welch|Richard Branson|Sam Altman|Jensen Huang|Satya Nadella
Tim Cook|Sundar Pichai|Steve Ballmer|Larry Page|Sergey Brin|Jack Ma|Elon|Bezos|Zuck|Musk|Jobs|Gates|Buffett
espresso|cappuccino|latte|macchiato|flat white|cold brew|oat milk latte|matcha|kombucha|green juice|smoothie|avocado toast
protein shake|intermittent fasting|keto|paleo|superfood|chia seeds|quinoa|acai bowl|energy drink|double espresso|caffeine
barista|croissant|bagel|sushi|almond milk|pumpkin spice latte|triple shot|ristretto|americano|mocha|frappuccino|decaf
Uber Eats|Lambo|Lamborghini|Ferrari|Porsche|Rolex|yacht|private jet|penthouse|Dubai|Bali|Silicon Valley|Wall Street|Davos
Monaco|first class|business class|airport lounge|gym|crossfit|marathon|triathlon|ironman|yoga|pilates|sneakers|hoodie
turtleneck|standing desk|home office|remote work|hybrid work|digital nomad|coworking|WeWork|Zoom|Teams|Slack|Notion|Trello
Jira|Excel|PowerPoint|spreadsheet|email|inbox zero|calendar|meeting|all hands|one on one|town hall|quarterly review
performance review|annual bonus|promotion|raise|salary|equity|stock options|vesting|cliff|exit strategy|acquisition|merger
never give up|dream big|work hard play hard|rise and grind|just do it|no pain no gain|carpe diem|YOLO|lets go|crush it
level up|next level|ten x|10x|100x|all in|hustle culture|beast mode|sigma mindset|alpha energy|high performer|top performer
rockstar|ninja|guru|wizard|evangelist|visionary|trailblazer|change maker|disruptor|rainmaker|closer|always be closing
fake it till you make it|stay hungry stay foolish|the grind never stops|sleep is for the weak|money never sleeps
time is money|knowledge is power|failure is not an option|the sky is the limit|follow your passion|trust the process
embrace the chaos|lean in|start with why|eat the frog|seven habits|atomic habits|the power of now|rich dad poor dad
think and grow rich|the lean startup|zero to one|good to great|who moved my cheese|the art of war|ikigai|kaizen|hygge
feng shui|zen|namaste|chakra|aura|karma|dharma|nirvana|exponential|transformational|holistic|scalable|sustainable
frictionless|seamless|robust|cutting edge|bleeding edge|state of the art|world class|best in class|next generation
mission critical|future proof|cloud native|AI powered|data centric|hyper growth|omnichannel|end to end|full stack
plug and play|turnkey|bespoke|curated|artisanal|premium|exclusive|limited edition|VIP|masterpiece|legendary|epic|mythical
unstoppable|limitless|fearless|relentless|obsessed|hungry|humble|grateful|blessed|energized|aligned|empowered|inspired
motivated|focused|driven|committed|dedicated|execute|deliver|optimize|maximize|monetize|incentivize|synergize|strategize
prioritize|visualize|actualize|operationalize|productize|democratize|gamify|streamline|unlock|unleash|ignite|elevate
amplify|accelerate|transform|reinvent|reimagine|rethink|unlearn|upskill|reskill|onboard|deploy|ship it|launch|scale up
double down|lean into it|pivot hard|go big|think big|pizza|taco tuesday|free snacks|ping pong table|beanbag
kombucha on tap|nap pod|standing ovation|mic drop|applause|wow|boom|bazinga|epic fail|plot twist|big brain|galaxy brain
touch grass|vibe check|good vibes only|main character energy|it is what it is|per my last email|reply all|you are on mute
can you see my screen|lets take this offline|quick sync|hard stop|parking lot|action items|next steps|EOD|ASAP|FYI|TLDR
out of office|Friday deploy|Monday motivation|throwback Thursday|weekend warrior|coach|goal|goals|win|winner|winning
champion|legend|hero|boss|lion|wolf|eagle|shark|tiger|beast|alpha|sigma|king|queen|crown|throne|empire|legacy|dream
believe|achieve|conquer|dominate|thrive|shine|glow|spark|fire|flame|blaze|rise|soar|fly|climb|summit|peak|apex|zenith
journey|path|quest|adventure|mountain|ocean|wave|storm|thunder|lightning|rocket fuel|jet fuel|moonshot|stretch goal
big hairy audacious goal|SMART goals|vision board|mood board|gratitude journal|power pose|high five|fist bump|hug
handshake|eye contact|body language|charisma|presence|confidence|courage|bravery|boldness|hunger|drive|heart|soul|spirit
mind|body|balance|harmony|clarity|simplicity|minimalism|essentialism|stoicism|Marcus Aurelius|Seneca|Socrates|Plato
Aristotle|Sun Tzu|Confucius|Buddha|Einstein|Newton|Tesla coil|Nikola Tesla|Edison|Da Vinci|Picasso|Mozart|Beethoven
Michael Jordan|Kobe Bryant|Cristiano Ronaldo|Lionel Messi|Serena Williams|Usain Bolt|Muhammad Ali|Mike Tyson|Rocky
Arnold Schwarzenegger|The Rock|Dwayne Johnson|Keanu Reeves|Taylor Swift|Beyonce|Kanye|Drake|Rihanna|Lady Gaga
Iron Man|Batman|Superman|Spider Man|Yoda|Jedi|the force|Darth Vader|Gandalf|Frodo|Harry Potter|Hogwarts|Matrix|red pill
blue pill|Neo|Morpheus|Wolf of Wall Street|Gordon Gekko|Jordan Belfort|Shark Tank|Dragons Den|The Apprentice|youre fired
Mr Beast|Joe Rogan|Andrew Huberman|Jordan Peterson|Mark Manson|David Goggins|Jocko Willink|Cal Newport|James Clear
Brene Brown|Adam Grant|Malcolm Gladwell|Seth Godin|Tim Ferriss|four hour work week|passive income|side hustle
financial freedom|early retirement|compound interest|index fund|real estate|rental property|dividends|stock market
bull market|bear market|to the moon|diamond hands|paper hands|HODL|dogecoin|altcoin|wallet|mining|staking|DeFi|DAO
smart contract|tokenomics|whitepaper|roadmap reveal|ecosystem play|first mover|fast follower|market leader|category king
thought partner|sparring partner|accountability buddy|mastermind|inner circle|tribe|community|movement|revolution
culture|culture fit|culture add|values driven|purpose driven|impact driven|people first|customer obsession|bias for action
day one|working backwards|two pizza team|disagree and commit|move fast and break things|done is better than perfect
stay humble|hustle harder|outwork everyone|no days off|day zero|ground zero|from zero to hero|rags to riches
underdog|comeback|grit and grace|level ten|ten out of ten|one percent better|kaizen mindset|growth mindset|fixed mindset
abundance mindset|scarcity mindset|winner mindset|millionaire mindset|billionaire mindset|CEO mindset|founder mode
manager mode|beginner mind|monkey mind|lizard brain|dopamine|serotonin|endorphins|cortisol|adrenaline|oxytocin
dopamine detox|digital detox|screen time|blue light|sleep hygiene|power nap|circadian rhythm|biohacking|nootropics
red light therapy|cryotherapy|sauna|cold plunge|wim hof|box breathing|grounding|earthing|forest bathing|sound bath
crystal|essential oils|sage|incense|retreat center|silent retreat|vision quest|ayahuasca|spirit animal|inner child
higher self|alter ego|limiting beliefs|imposter syndrome|burnout|work life balance|work life integration|quiet quitting
great resignation|career pivot|career ladder|career lattice|personal growth|professional development|lifelong learning
upskilling|soft skills|hard skills|power skills|transferable skills|people skills|active listening|open ended question
powerful question|aha moment|eureka|epiphany|breakthrough|quantum breakthrough|transformation|metamorphosis|butterfly
phoenix|rise from the ashes|the comeback kid|second wind|green light|red flag|green flag|deal breaker|game plan
playbook|blueprint|framework|toolkit|cheat sheet|checklist|template|matrix|quadrant|eisenhower matrix|SWOT analysis
PESTEL|five forces|porter|business model canvas|lean canvas|value chain|supply chain|logistics|last mile|drone delivery
same day delivery|prime|subscription|freemium|paywall|upgrade|premium tier|enterprise plan|pricing strategy|price anchor
discount|black friday|cyber monday|flash sale|limited time offer|scarcity tactic|urgency|FOMO|JOMO|clickbait|growth loop
retention curve|cohort|north star metric|vanity metric|actionable metric|AB test|split test|heatmap|bounce rate
click through rate|CTR|CAC|LTV|ARR|MRR|NPS|CSAT|SLA|SOP|RFP|POC|PoV|QBR|OOO|WFH|B2B|B2C|D2C|P2P|GTM|PMF|USP|CRM|ERP
Salesforce|HubSpot|SAP|Oracle|IBM|Intel|Nvidia|AMD|OpenAI|Anthropic|DeepMind|Meta|Twitter Blue|X dot com|Threads
Snapchat|Pinterest|Reddit|Discord|Twitch|Clubhouse|WhatsApp|Telegram|Signal|Gmail|Outlook|Google Meet|FaceTime|Loom
Figma|Canva|Miro|Asana|Monday dot com|Airtable|Zapier|Shopify|Stripe|PayPal|Venmo|Robinhood|Coinbase|Binance|Revolut
Nubank|iFood|Rappi|Mercado Livre|Lyft|DoorDash|Deliveroo|Glovo|Bolt|Waymo|robotaxi|hyperloop|The Boring Company
flamethrower|not a flamethrower|Mars colony|multiplanetary|Starship|Dragon capsule|Tesla Roadster|Model S Plaid|ludicrous mode
full self driving|gigafactory|Optimus robot|Grok|Twitter takeover|cage match|Elon tweet|Doge to the moon|first principles
first principles thinking|occams razor|pareto principle|eighty twenty rule|parkinsons law|murphys law|dunning kruger
sunk cost|opportunity cost|black swan|grey rhino|unknown unknowns|known knowns|VUCA|BANI|antifragile|resilient
adaptability|flexibility|agility|velocity|momentum|traction|runway extension|bridge round|down round|unicorn status
exit|liquidity event|lockup period|cap table|term sheet|due diligence|pitch competition|demo day|accelerator|incubator
Y Combinator|Techstars|Sequoia|Andreessen Horowitz|SoftBank|Tiger Global|family office|limited partner|general partner
carry|management fee|fund of funds|private equity|hedge fund|leveraged buyout|spinoff|carve out|turnaround|restructuring
layoffs|rightsizing|efficiency year|year of efficiency|cost cutting|lean operations|six sigma|black belt|lean six sigma
total quality|continuous improvement|process mining|digital transformation|cloud migration|lift and shift|tech debt
legacy system|mainframe|COBOL|Python|JavaScript|TypeScript|Rust|Golang|Java|low code|no code|vibe coding|copilot
pair programming|code review|pull request|merge conflict|hotfix|rollback|feature flag|canary release|blue green deploy
CI CD|DevOps|DevSecOps|MLOps|FinOps|observability|uptime|nine nines|five nines|incident|postmortem|blameless culture
war room|all hands on deck|fire drill|firefighting|escalation|root cause|five whys|fishbone diagram|retro|retrospective
sprint planning|daily standup|story points|velocity chart|burndown chart|epic|user story|acceptance criteria|definition of done
product owner|scrum master|agile coach|chief happiness officer|chief vibes officer|chief evangelist|growth hacker
ninja developer|10x engineer|full stack developer|prompt engineer|AI whisperer|thought influencer|serial entrepreneur
solopreneur|intrapreneur|wantrepreneur|mompreneur|technopreneur|edupreneur|philanthropist|impact investor|ESG|net zero
carbon neutral|green energy|solar panel|wind turbine|battery|lithium|hydrogen|nuclear fusion|climate tech|clean tech
fintech|edtech|healthtech|proptech|insurtech|agritech|legaltech|regtech|martech|adtech|deep tech|frontier tech|moonshot factory
skunkworks|innovation lab|design thinking|human centered design|empathy map|customer journey|persona|pain point|gain creator
jobs to be done|value curve|wow factor|delight|surprise and delight|magic moment|north star vision|BHAG|purpose statement
mission statement|vision statement|elevator speech|personal mission|life purpose|legacy project|ikigai diagram|wheel of life
life coach|business coach|executive coach|career coach|health coach|fitness coach|mindset coach|money coach|dating coach
spiritual coach|quantum healing|quantum manifestation|quantum frequency|quantum vibes|quantum jump|quantum alignment
quantum abundance|quantum success|quantum performance|quantum coffee|quantum uber|quantum hustle|quantum synergy
quantum leadership|quantum entrepreneur|quantum breathing|quantum gratitude|quantum smoothie|quantum podcast
Schrodinger|Schrodingers cat|wave function|particle|photon|electron|atom|string theory|multiverse|parallel universe
black hole|wormhole|time travel|warp speed|light speed|speed of light|hyperdrive|galaxy|nebula|supernova|stardust
cosmic energy|universe|the universe provides|law of attraction|the secret|positive thinking|good energy|high vibe
low vibe|raise your vibration|energy vampire|toxic positivity|safe space|holding space|deep breath|let it go|let go
lets circle back|lets unpack that|lets double click on that|lets level set|lets align|lets ideate|lets sync|lets pivot
synergistic|paradigmatic|disruptive|innovative|strategic|tactical|operational|visionary leader|servant leader
transformational leader|charismatic leader|thought provoking|mind blowing|life changing|game changing|world changing
earth shattering|groundbreaking|revolutionary|unprecedented|next big thing|silver bullet|secret sauce|special sauce
magic formula|holy grail|golden goose|cash cow|rising star|dark horse|wild card|ace|trump card|home run|slam dunk
touchdown|hat trick|grand slam|knockout|hole in one|bullseye|jackpot|mic check|sound check|spotlight|center stage
standing room only|sold out|front row|backstage|green room|red carpet|VIP pass|lanyard|name badge|swag bag|free tshirt
conference|summit|expo|trade show|networking|business card|QR code|cold call|cold email|follow up|warm intro|referral
testimonial|case study|social proof|word of mouth|brand awareness|brand ambassador|brand loyalty|top of mind|mindshare
market share|blue chip|penny stock|meme stock|GameStop|AMC|stonks|wagmi|ngmi|gm|lfg|alpha leak|based|sus|no cap
slay|rizz|goat|GOAT|fire emoji|rocket emoji|hundred emoji|lit|vibes|mood|iconic|legendary status|hall of fame
`;

function tierOf(w) {
  const words = w.split(' ').length;
  if (w.length <= 6 && words === 1) return 1;
  if (w.length >= 13 || words >= 3) return 3;
  return 2;
}

const seen = new Set();
export const WORDS = [];
for (const raw of RAW.split(/[|\n]/)) {
  const w = raw.trim();
  if (!w) continue;
  const key = w.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  WORDS.push({ text: w, tier: tierOf(w) });
}

export const BY_TIER = { 1: [], 2: [], 3: [] };
for (const w of WORDS) BY_TIER[w.tier].push(w);

// Oliver's TED-talk lines. {w} is replaced by the word to type.
export const LINES = [
  "Ladies and gentlemen... {w} changes EVERYTHING!",
  "I woke up at 3:45 AM and the universe whispered: {w}.",
  "Repeat after me: {w}!",
  "My quantum mentor told me one word: {w}.",
  "You don't need a plan. You need {w}.",
  "Close your eyes. Breathe in. Breathe out. {w}.",
  "They laughed at me. Then I discovered {w}.",
  "Write this down, it's worth 10 thousand dollars: {w}.",
  "What separates winners from losers? {w}.",
  "I sold my car and bought {w}. Best decision ever.",
  "Science can't explain it, but {w} works at a quantum level.",
  "Elon called me last night. He only said: {w}.",
  "Your comfort zone is lying to you. The truth is {w}.",
  "Raise your hand if you believe in {w}!",
  "In my 3-day bootcamp, we only talk about {w}.",
  "Champions don't sleep. They {w}.",
  "Everybody wants success. Nobody wants {w}.",
  "Let me tell you a story about {w}...",
  "I'm not a coach. I'm a {w} architect.",
  "Turn to the person next to you and say: {w}!",
  "My morning routine? Cold shower, coffee, {w}.",
  "Stop scrolling. Start {w}.",
  "The secret billionaires don't want you to know: {w}.",
  "Feel that energy? That's {w} vibrating at high frequency!",
  "Rule number one of the quantum coach: {w}.",
  "I charge 5 thousand an hour to say this: {w}.",
  "Your ex didn't understand {w}. I do.",
  "Pain is temporary. {w} is forever.",
  "Who here is ready for {w}? I can't HEAR YOU!",
  "If {w} were easy, everybody would do it.",
  "I took an Uber to the mountains to find {w}.",
  "Tesla? Coffee? No. The real fuel is {w}.",
];

export const CHEERS = [
  "YES! You FELT that!", "That's QUANTUM energy!", "Give yourselves a hand!", "Unstoppable!",
  "This is a 10x moment!", "Write that on your vision board!", "Pure synergy!", "I'm literally vibrating!",
];
export const FAILS = [
  "Is... is anyone listening?", "Hey! Who threw that?!", "Ok, let's circle back...", "That was a test. Obviously.",
  "Failure is just data!", "Please don't leave, there's free kombucha!", "My vision board did not predict this.",
  "Remember: fail forward!", "Security? SECURITY?!",
];
export const MYTHIC = [
  "MYTHICAL COACH POWER ACTIVATED!!!", "I AM THE QUANTUM FIELD!", "CAN YOU FEEL THE HEAT?!",
  "FIRE IS JUST HIGH FREQUENCY MOTIVATION!", "THIS STAGE CANNOT CONTAIN ME!",
];
export const GAME_OVER = [
  "\"I'll be back. With a new book.\"", "\"Failure is just success in progress.\"",
  "\"The universe needed me somewhere else.\"", "\"Refunds are a limiting belief.\"",
];
