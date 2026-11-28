/* Game rules and saved state live here. AI output supplies product copy and
 * customer/event wording; JavaScript owns every game rule and transaction. */
(() => {
  'use strict';

  const SAVE_KEY = 'komugiBiyoriAnimalBakeryV7';
  const V6_KEY = 'komugiBiyoriAnimalBakeryV6';
  const V5_KEY = 'komugiBiyoriAnimalBakeryV5';
  const LEGACY_KEYS = ['komugiBiyoriSimpleSaveV4', 'komugiBiyoriSaveV3'];
  const DAILY_API_TIMEOUT_MS = 10000;
  const DAILY_TEXT_CUSTOMER_LIMIT = 9;
  const PRODUCT_API_TIMEOUT_MS = 45000;
  const TAGS = [
    'いちご', 'りんご', 'ブルーベリー', 'レモン', '果物', 'はちみつ', 'あんこ', '栗', 'さつまいも',
    'くるみ', 'アーモンド', '木の実', 'ミルク', 'バター', 'チーズ', 'たまご', 'ベーコン', 'チョコ',
    '甘い', '甘酸っぱい', 'ふんわり', 'しっとり', 'サクサク', '香ばしい', '食事系', '食べごたえ',
    'かわいい', '珍しい', '和風', '素朴', '温かい', '季節限定'
  ];

  const ANIMALS = [
    { id: 'rabbit', name: 'ミミ', species: 'うさぎ', emoji: '🐰', rare: false, personality: '明るくて人なつこい。うれしいことを素直に話す。', likesIngredients: ['いちご', 'はちみつ'], likesFlavors: ['甘い', '甘酸っぱい'], likesTextures: ['ふんわり'], likesTags: ['かわいい', '果物'], dislikesIngredients: ['ベーコン'], dislikesTags: ['食事系'], lines: ['お花みたいなパンってあるかな？', 'おやつにぴったりの甘いパンが食べたいな。'] },
    { id: 'cat', name: 'バター', species: 'ねこ', emoji: '🐱', rare: false, personality: '気ままで、香りに敏感。自分のペースで話す。', likesIngredients: ['バター', 'ミルク', 'チーズ'], likesFlavors: ['香ばしい'], likesTextures: ['サクサク'], likesTags: ['食事系', '香ばしい'], dislikesIngredients: ['レモン'], dislikesTags: ['甘酸っぱい'], lines: ['バターのいい香りがするパンが好きだな。', 'サクッとした食感のパン、今日はある？'] },
    { id: 'squirrel', name: 'クルミ', species: 'りす', emoji: '🐿️', rare: false, personality: '好奇心旺盛で木の実が好き。珍しいものに目がない。', likesIngredients: ['くるみ', '栗', 'アーモンド'], likesFlavors: ['香ばしい'], likesTextures: ['食べごたえ'], likesTags: ['木の実', '珍しい'], dislikesIngredients: ['ベーコン'], dislikesTags: ['食事系'], lines: ['木の実が入ったパンを探しているんだ。', '森で見かけないようなパンも気になるなあ。'] },
    { id: 'bear', name: 'ポン', species: 'くま', emoji: '🐻', rare: false, personality: 'おだやかで食いしんぼう。ゆっくり親しみやすく話す。', likesIngredients: ['はちみつ', 'チーズ', 'たまご'], likesFlavors: ['甘い'], likesTextures: ['ふんわり', '食べごたえ'], likesTags: ['食べごたえ'], dislikesIngredients: ['レモン'], dislikesTags: ['甘酸っぱい'], lines: ['おなかがぺこぺこ。食べごたえのあるパンがいいな。', 'はちみつの甘い香りがした気がするよ。'] },
    { id: 'fox', name: 'コン', species: 'きつね', emoji: '🦊', rare: false, personality: '新しいもの好きで少し照れ屋。珍しい発想を楽しむ。', likesIngredients: ['いちご', 'ブルーベリー', 'レモン'], likesFlavors: ['甘酸っぱい'], likesTextures: ['しっとり'], likesTags: ['果物', '珍しい'], dislikesIngredients: ['ベーコン'], dislikesTags: ['食事系'], lines: ['果物を使った、ちょっと変わったパンはある？', '甘酸っぱい味が今日は気分に合いそう。'] },
    { id: 'hedgehog', name: 'ハリー', species: 'はりねずみ', emoji: '🦔', rare: false, personality: '静かで素朴な味が好き。落ち着いた言葉で話す。', likesIngredients: ['小麦', 'りんご', 'はちみつ'], likesFlavors: ['素朴', '甘い'], likesTextures: ['ふんわり'], likesTags: ['素朴', '香ばしい'], dislikesIngredients: ['チョコ'], dislikesTags: ['珍しい'], lines: ['小麦の香りがする素朴なパンがいいな。', 'りんごを使ったパンをゆっくり味わいたいね。'] },
    { id: 'dog', name: 'チーズ', species: 'いぬ', emoji: '🐶', rare: false, personality: '元気で食事系のパンが好き。明るく勢いよく話す。', likesIngredients: ['チーズ', 'たまご', 'ベーコン'], likesFlavors: ['香ばしい'], likesTextures: ['食べごたえ'], likesTags: ['食事系', '食べごたえ'], dislikesIngredients: ['あんこ'], dislikesTags: ['甘い'], lines: ['朝ごはんに食べられるパンがほしいな！', 'チーズの入った香ばしいパンってある？'] },
    { id: 'tanuki', name: 'あん', species: 'たぬき', emoji: '🦝', rare: false, personality: 'のんびりした和風の味が好き。穏やかに話す。', likesIngredients: ['あんこ', 'さつまいも', '栗'], likesFlavors: ['和風', '素朴'], likesTextures: ['しっとり'], likesTags: ['和風', '甘い'], dislikesIngredients: ['レモン'], dislikesTags: ['甘酸っぱい'], lines: ['あんこや栗のような、なつかしい味がいいねえ。', 'お茶に合う和風のパンを探しているよ。'] },
    { id: 'owl', name: 'ヨル', species: 'フクロウ', emoji: '🦉', rare: true, personality: '物知りで落ち着いている。香りや食感の違いに詳しい。', likesIngredients: ['はちみつ', 'くるみ'], likesFlavors: ['香ばしい', '素朴'], likesTextures: ['サクサク'], likesTags: ['木の実', '香ばしい'], dislikesIngredients: ['ベーコン'], dislikesTags: ['食事系'], lines: ['夜の森に似合う香ばしいパンはありますか？'] },
    { id: 'panda', name: 'シロ', species: 'パンダ', emoji: '🐼', rare: true, personality: 'のんびり屋で、甘いものを見つけると目が輝く。', likesIngredients: ['ミルク', 'はちみつ', 'チョコ'], likesFlavors: ['甘い'], likesTextures: ['ふんわり', 'しっとり'], likesTags: ['甘い', 'かわいい'], dislikesIngredients: ['レモン'], dislikesTags: ['甘酸っぱい'], lines: ['ミルクの風味がする甘いパンが食べたいな。'] },
    { id: 'otter', name: 'ぷかり', species: 'カワウソ', emoji: '🦦', rare: true, personality: '好奇心旺盛で、水辺の食べものの話が好き。', likesIngredients: ['チーズ', 'りんご'], likesFlavors: ['甘酸っぱい'], likesTextures: ['しっとり'], likesTags: ['果物', '食べごたえ'], dislikesIngredients: ['あんこ'], dislikesTags: ['和風'], lines: ['川辺で食べるのにぴったりのパンはある？'] },
    { id: 'dragon', name: 'ゴン', species: 'ドラゴン', emoji: '🐉', rare: true, personality: '見た目はこわそうだが、熱々のパンに目がない。', likesIngredients: ['チーズ', 'はちみつ'], likesFlavors: ['香ばしい'], likesTextures: ['食べごたえ'], likesTags: ['温かい', '香ばしい'], dislikesIngredients: ['レモン'], dislikesTags: ['甘酸っぱい'], lines: ['火山のように熱々で、力が出るパンがほしい。'] },
    { id: 'unicorn', name: 'ルナ', species: 'ユニコーン', emoji: '🦄', rare: true, personality: '夢見がちで、色や形の美しいものが好き。', likesIngredients: ['いちご', 'ブルーベリー', 'ミルク'], likesFlavors: ['甘い', '甘酸っぱい'], likesTextures: ['ふんわり'], likesTags: ['かわいい', '果物'], dislikesIngredients: ['ベーコン'], dislikesTags: ['食事系'], lines: ['花や星の形をした、夢みたいなパンを探しているの。'] }
  ];

  const VISIT_REASONS = [
    { label: '甘いパンを探している', ingredients: [], tags: ['甘い'] },
    { label: '朝ごはんに食べるパンがほしい', ingredients: [], tags: ['食事系', '香ばしい'] },
    { label: '果物を使ったパンが気になる', ingredients: [], tags: ['果物'] },
    { label: '食べごたえのあるパンがほしい', ingredients: [], tags: ['食べごたえ'] },
    { label: '木の実の香るパンを探している', ingredients: ['くるみ'], tags: ['木の実', '香ばしい'] },
    { label: 'いつもと違うパンを試したい', ingredients: [], tags: ['珍しい'] },
    { label: 'お茶に合うパンが食べたい', ingredients: [], tags: ['和風', '素朴'] }
  ];
  const MOODS = ['ごきげん', 'のんびり', 'わくわく', 'ちょっと疲れ気味', 'おなかぺこぺこ'];

  const MORNING_EVENTS = [
    { id: 'strawberry_fair', name: '森のいちご祭り', group: 'good', description: 'いちごを使ったパンが人気です。', popularTags: ['いちご', '果物', '甘い'], pointsByTag: { 'いちご': 18, '果物': 10, '甘い': 6 } },
    { id: 'sweet_festival', name: '森の甘党フェス', group: 'good', description: '甘いパンを探す動物が多くなりそうです。', popularTags: ['甘い', 'かわいい'], pointsByTag: { '甘い': 16, 'かわいい': 8 } },
    { id: 'social_buzz', name: '森のSNSで話題に！', group: 'good', description: 'うわさを聞いて、いつもより多くのお客さまが来そうです。', popularTags: ['珍しい', 'かわいい'], pointsByTag: { '珍しい': 8, 'かわいい': 6 }, visitorBonus: 1 },
    { id: 'forest_snack', name: '森から朝のおすそわけ', group: 'good', description: '森の仲間が焼きたての木の実を届けてくれて、体力が1回復しました。', popularTags: ['木の実', '香ばしい'], pointsByTag: { '木の実': 8, '香ばしい': 6 }, staminaDelta: 1 },
    { id: 'rainy_day', name: 'しとしと雨の日', group: 'neutral', description: '温かいパンや甘いパンが恋しくなる一日です。', popularTags: ['温かい', '甘い', 'ふんわり'], pointsByTag: { '温かい': 10, '甘い': 8, 'ふんわり': 6 } },
    { id: 'slow_day', name: 'のんびりした一日', group: 'neutral', description: '今日は森もお店ものんびりしています。素朴なパンが人気です。', popularTags: ['素朴', '和風'], pointsByTag: { '素朴': 8, '和風': 6 } },
    { id: 'overslept', name: 'ちょっと寝坊', group: 'challenge', description: '朝の支度に手間取り、体力が1減りました。', popularTags: ['温かい', '素朴'], pointsByTag: { '温かい': 8, '素朴': 6 }, staminaDelta: -1 },
    { id: 'oven_trouble', name: 'オーブンの調子が悪い', group: 'challenge', description: '今日の製造可能数が2個少なくなります。', popularTags: ['香ばしい', '食べごたえ'], pointsByTag: { '香ばしい': 8, '食べごたえ': 6 }, productionDelta: -2 }
  ];

  const MIDDAY_EVENTS = [
    { id: 'birthday', name: 'お客さまの誕生日', description: '今日は誕生日。好みに合うパンなら、いつもより喜んでくれそうです。' },
    { id: 'bulk_order', name: '急なまとめ買い', description: '気に入ったパンを、もう1個買ってくれるかもしれません。' },
    { id: 'popular_tag', name: '特定のパンが人気', description: '今日はある特徴のパンが注目されています。' },
    { id: 'rare_arrival', name: '森の奥から珍しいお客さま', description: '珍しい動物がふらりと立ち寄るようです。' }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_development', name: 'はじめの一歩', description: '初めてオリジナルパンを開発する' },
    { id: 'first_sale', name: '森のパン屋さん', description: '初めてパンを販売する' },
    { id: 'ten_products', name: 'ひらめき職人', description: 'オリジナルパンを10種類開発する' },
    { id: 'sellout', name: '完売御礼', description: 'その日に用意したパンをすべて売り切る' },
    { id: 'three_friends', name: '森の人気者', description: '3匹以上の動物と仲良しになる' },
    { id: 'dragon_sale', name: '幻のお客様', description: 'ドラゴンにパンを買ってもらう' },
    { id: 'day_thirty', name: 'ベテラン店主', description: '30日目に到達する' },
    { id: 'all_best_friends', name: '伝説のパン職人', description: 'すべての動物と大親友になる' },
    { id: 'fifty_products', name: 'パン博士', description: 'オリジナルパンを50種類開発する' },
    { id: 'forest_contest', name: '森のコンテスト入賞', description: '森のパンコンテストで入賞する' }
  ];

  const $ = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const randomItem = items => items[Math.floor(Math.random() * items.length)];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const animal = id => ANIMALS.find(item => item.id === id);
  const product = id => state?.products.find(item => item.id === id);

  let state = null;
  let activeTab = 'shop';
  let busy = false;
  let noticeTimer = 0;
  let serviceTimer = 0;
  let servicePaused = false;
  let serviceFast = false;
  let pendingRestart = false;
  let pendingProduct = null;
  let pendingProductIdea = '';
  let pendingProductOmakase = false;
  let developmentDraft = { idea: '' };

  function recipeSnapshot(item) {
    return {
      id: String(item.id || ''), name: String(item.name || '名前のないパン'),
      breadType: String(item.breadType || 'パン'), ingredients: Array.isArray(item.ingredients) ? [...item.ingredients] : [],
      flavor: String(item.flavor || ''), texture: String(item.texture || ''), appearance: String(item.appearance || ''),
      concept: String(item.concept || ''), description: String(item.description || ''),
      features: String(item.features || item.specialFeature || ''), specialFeature: String(item.specialFeature || item.features || ''),
      priceReason: String(item.priceReason || ''), tags: cleanTags(item.tags),
      recommendedPrice: Math.max(50, Number(item.recommendedPrice) || Number(item.price) || 100),
      createdBy: String(item.createdBy || 'player'), createdOn: Math.max(1, Number(item.createdOn) || 1)
    };
  }

  function mergeRecipes(...groups) {
    const recipes = new Map();
    groups.flat().forEach(item => {
      if (!item || typeof item.id !== 'string' || !item.id) return;
      if (!recipes.has(item.id)) recipes.set(item.id, recipeSnapshot(item));
    });
    return [...recipes.values()];
  }

  function freshState() {
    return {
      version: 7, day: 1, phase: 'planning', totalSales: 0, missedGoalStreak: 0, stamina: 5,
      products: [], encyclopedia: [],
      animals: {}, achievements: {}, daily: null, history: [], developmentDraft: { ...developmentDraft }
    };
  }

  function goalForDay(day) {
    return Math.min(Number.MAX_SAFE_INTEGER, Math.round(900 * (1.2 ** (day - 1))));
  }

  function chooseMorningEvent() {
    const previousIds = state.history.slice(-2).map(entry => entry.morningEventId).filter(Boolean);
    const candidates = MORNING_EVENTS.filter(item => !previousIds.includes(item.id));
    const groups = [
      { id: 'good', weight: 35 }, { id: 'neutral', weight: 35 }, { id: 'challenge', weight: 30 }
    ];
    let roll = Math.random() * 100;
    let group = groups[groups.length - 1].id;
    for (const item of groups) { roll -= item.weight; if (roll < 0) { group = item.id; break; } }
    return randomItem(candidates.filter(item => item.group === group) || MORNING_EVENTS) || MORNING_EVENTS.find(item => item.group === group);
  }

  function createDaily(day) {
    const event = chooseMorningEvent();
    const productionBase = 10 + Math.max(0, day - 1) * 2;
    state.stamina = Math.max(0, 5 + Math.max(0, day - 1) + (event.staminaDelta || 0));
    return {
      day, goal: goalForDay(day), sales: 0, buyers: 0, visitors: 0, customers: [], index: 0,
      morningEvent: { ...event }, eventName: event.name, eventDescription: event.description,
      midEvent: null, closeEvent: null, productionLimit: Math.max(2, productionBase + (event.productionDelta || 0)), manufactured: 0, manufacturedByProduct: {},
      salesByProduct: {}, salesByProductNames: {}, openingStocks: {}, affectionChanges: {},
      events: [{ phase: 'morning', id: event.id, name: event.name, description: event.description }],
      unlockedAchievements: [], archived: false, visitorsRecorded: false, generatedText: false,
      generationStarted: false, generationFinished: false, salesPlanPrepared: false
    };
  }

  function initializeDay() {
    state.daily = createDaily(state.day);
    state.phase = 'planning';
    checkAchievements();
  }

  function validSave(value, version) {
    return value && value.version === version && Number.isInteger(value.day) && value.day >= 1
      && ['planning', 'serving', 'results', 'gameOver'].includes(value.phase)
      && Array.isArray(value.products) && value.products.every(item => item && typeof item.id === 'string' && typeof item.name === 'string')
      && value.daily && Array.isArray(value.history);
  }

  function normalizeSave(saved) {
    if (!saved || ![6, 7].includes(saved.version)) return null;
    if (saved.version === 6) {
      const oldProductionLimit = Number(saved.daily?.morningEvent?.productionLimit);
      if (Number.isFinite(oldProductionLimit)) saved.daily.morningEvent.productionDelta = oldProductionLimit - 10;
      saved.daily.goal = goalForDay(saved.day);
      saved.daily.productionLimit = Math.max(2, 10 + (saved.day - 1) * 2 + (saved.daily.morningEvent?.productionDelta || 0));
      saved.version = 7;
    }
    if (!validSave(saved, 7)) return null;
    return saved;
  }

  function readSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (validSave(saved, 7)) return normalizeLoadedState(normalizeSave(saved));
      const previous = JSON.parse(localStorage.getItem(V6_KEY) || 'null');
      if (!validSave(previous, 6)) return null;
      return normalizeLoadedState(normalizeSave(previous));
    } catch (_) { return null; }
  }

  function normalizeLoadedState(saved) {
      saved.totalSales = Math.max(0, Number(saved.totalSales) || 0);
      saved.missedGoalStreak = Math.max(0, Number(saved.missedGoalStreak) || 0);
      saved.stamina = Math.max(0, Number(saved.stamina) || 0);
      saved.animals = saved.animals && typeof saved.animals === 'object' ? saved.animals : {};
      saved.achievements = saved.achievements && typeof saved.achievements === 'object' ? saved.achievements : {};
      saved.history = Array.isArray(saved.history) ? saved.history : [];
      saved.daily.salesByProduct ||= {};
      saved.daily.salesByProductNames ||= {};
      saved.daily.openingStocks ||= {};
      saved.daily.affectionChanges ||= {};
      saved.daily.events ||= [];
      saved.daily.unlockedAchievements ||= [];
      saved.daily.customers ||= [];
      saved.daily.manufactured = Math.max(0, Number(saved.daily.manufactured) || 0);
      saved.daily.manufacturedByProduct ||= {};
      saved.daily.generationStarted = Boolean(saved.daily.generationStarted);
      saved.daily.generationFinished = Boolean(saved.daily.generationFinished);
      saved.daily.salesPlanPrepared = Boolean(saved.daily.salesPlanPrepared);
      saved.developmentDraft ||= { ...developmentDraft };
      const oldDraft = saved.developmentDraft;
      const legacyIdea = ['breadType', 'ingredients', 'flavor', 'texture', 'concept', 'otherRequests']
        .map(key => String(oldDraft[key] || '').trim()).filter(value => value && value !== 'おまかせ').join('、');
      saved.developmentDraft = { ...oldDraft, idea: String(oldDraft.idea ?? legacyIdea) };
      saved.products.forEach(item => {
        item.ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
        item.tags = cleanTags(item.tags);
        item.stock = Math.max(0, Number(item.stock) || 0);
        item.soldTotal = Math.max(0, Number(item.soldTotal) || 0);
        item.price = Math.max(50, Math.round((Number(item.price) || item.recommendedPrice || 100) / 10) * 10);
        item.recommendedPrice = Math.max(50, Number(item.recommendedPrice) || item.price);
        item.specialFeature = String(item.specialFeature || item.features || item.concept || '');
        item.priceReason = String(item.priceReason || '');
        item.archived = Boolean(item.archived);
      });
      saved.encyclopedia = mergeRecipes(
        Array.isArray(saved.encyclopedia) ? saved.encyclopedia : [],
        saved.products
      );
      if (Array.isArray(saved.daily.customers)) saved.daily.customers.forEach(customer => {
        customer.dialogueStage = clamp(customer.dialogueStage, 0, 4);
        customer.budget = Math.max(0, Number(customer.budget) || randomItem([320, 360, 400, 450, 500, 550]));
      });
      return saved;
  }

  function deriveTags(recipe) {
    const text = `${recipe.name || ''} ${(recipe.ingredients || []).join(' ')} ${recipe.flavor || ''} ${recipe.texture || ''} ${recipe.appearance || ''} ${recipe.features || ''}`;
    return cleanTags(TAGS.filter(tag => text.includes(tag)));
  }

  function cleanTags(values) {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.filter(value => typeof value === 'string' && TAGS.includes(value)))];
  }

  function convertV5(old) {
    if (!old || old.version !== 5 || !Array.isArray(old.recipes) || !Number.isInteger(old.day)) return null;
    const products = old.recipes.map((item, index) => {
      const recommendedPrice = item.breadType?.includes('クロワッサン') ? 260 : item.breadType?.includes('メロン') ? 240 : item.breadType?.includes('食パン') ? 420 : 280;
      return {
        id: String(item.id || `migrated-${index}`), name: String(item.name || '名前のないパン'),
        breadType: String(item.breadType || 'パン'), ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
        flavor: String(item.flavor || '味の記録なし'), texture: String(item.texture || '食感の記録なし'),
        appearance: String(item.appearance || '見た目の記録なし'), concept: '', description: String(item.description || ''),
        features: String(item.features || ''), specialFeature: String(item.features || ''), priceReason: '', tags: deriveTags(item), recommendedPrice, price: recommendedPrice,
        stock: 0, soldTotal: Math.max(0, Number(item.soldTotal) || 0), createdBy: 'player', createdOn: 1, archived: false
      };
    });
    const animals = {};
    for (const profile of ANIMALS) {
      const oldRecord = old.animals?.[profile.id];
      if (!oldRecord) continue;
      animals[profile.id] = {
        discovered: Boolean(oldRecord.met), affection: Math.round(clamp(oldRecord.affection, 0, 100) / 20),
        visits: Math.max(0, Number(oldRecord.visits) || 0), purchases: Math.max(0, Number(oldRecord.purchases) || 0),
        purchasedProducts: Array.isArray(oldRecord.purchasedBreads) ? [...oldRecord.purchasedBreads] : [],
        history: Array.isArray(oldRecord.history) ? oldRecord.history.map(entry => ({ ...entry })) : []
      };
    }
    const history = (Array.isArray(old.history) ? old.history : []).map(entry => ({
      day: entry.day, goal: null, sales: null, visitors: Number(entry.visitors) || entry.customers?.length || 0,
      buyers: entry.customers?.filter(customer => customer.boughtBreadId).length || 0,
      salesByProduct: entry.salesByRecipe || {}, salesByProductNames: entry.salesByRecipeNames || {},
      affectionChanges: entry.affectionChanges || {}, remainingStock: {}, legacy: true
    }));
    const wasServing = old.phase === 'serving' && old.daily;
    if (wasServing && !history.some(entry => entry.day === old.day)) {
      history.push({
        day: old.day, goal: null, sales: null, visitors: old.daily.customers?.length || 0,
        buyers: old.daily.customers?.filter(customer => customer.boughtBreadId).length || 0,
        salesByProduct: old.daily.salesByRecipe || {}, salesByProductNames: old.daily.salesByRecipeNames || {},
        affectionChanges: old.daily.affectionChanges || {}, remainingStock: {}, legacy: true
      });
    }
    const nextDay = old.phase === 'results' ? old.day + 1 : old.day;
    const migrated = {
      version: 7, day: Math.max(1, nextDay), phase: 'planning', totalSales: 0, missedGoalStreak: 0,
      stamina: 5, products, animals, achievements: {}, history, daily: null,
      developmentDraft: { idea: '' }, migratedFrom: 'V5'
    };
    state = migrated;
    initializeDay();
    return state;
  }

  function writeSave() {
    if (!state) return false;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      renderSummary();
      return true;
    } catch (_) {
      showNotice('自動保存できませんでした。ブラウザーの保存容量を確認してください。', true);
      return false;
    }
  }

  function convertibleV5Read() {
    try {
      const old = JSON.parse(localStorage.getItem(V5_KEY) || 'null');
      return old?.version === 5 && Array.isArray(old.recipes) ? old : null;
    } catch (_) { return null; }
  }

  function archiveCurrentSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(V6_KEY);
      if (raw) localStorage.setItem(`${SAVE_KEY}.archive.${Date.now()}`, raw);
      return true;
    } catch (_) {
      showNotice('現在のゲームを保管できなかったため、新しいゲームを始められません。', true);
      return false;
    }
  }

  function openRestartDialog() {
    if (busy) return;
    let hasSavedRun = false;
    try { hasSavedRun = Boolean(localStorage.getItem(SAVE_KEY) || localStorage.getItem(V6_KEY)); } catch (_) { /* storage may be unavailable */ }
    if (!state && !hasSavedRun) return beginNewGame();
    pendingRestart = true;
    const hasCurrentRun = Boolean(state || hasSavedRun);
    $('restartMessage').textContent = hasCurrentRun
      ? 'これまでのセーブを保管して、商品0種類・図鑑0種類・在庫0個・売上0円の1日目から始めます。'
      : '商品0種類・図鑑0種類・在庫0個・売上0円の1日目を始めます。';
    $('confirmRestart').textContent = hasCurrentRun ? '保管して始める' : '新しく始める';
    $('restartDialog').showModal();
  }

  function beginNewGame() {
    let current = null;
    try { current = localStorage.getItem(SAVE_KEY) || localStorage.getItem(V6_KEY); } catch (_) { /* unavailable */ }
    if (current && !archiveCurrentSave()) return;
    clearTimeout(serviceTimer);
    servicePaused = false;
    serviceFast = false;
    pendingProduct = null;
    pendingProductIdea = '';
    pendingProductOmakase = false;
    developmentDraft = { idea: '' };
    state = freshState();
    initializeDay();
    developmentDraft = { ...state.developmentDraft };
    activeTab = 'shop';
    $('startScreen').hidden = true;
    $('gameScreen').hidden = false;
    updateTabs();
    renderPanel();
    writeSave();
  }

  function confirmNewGame(event) {
    event.preventDefault();
    if (!pendingRestart) return;
    pendingRestart = false;
    $('restartDialog').close();
    beginNewGame();
  }

  function continueGame() {
    const saved = readSave();
    if (saved) state = saved;
    else {
      const legacy = convertibleV5Read();
      if (!legacy) return showNotice('続けられるセーブデータが見つかりません。', true);
      state = convertV5(legacy);
      showNotice('以前のセーブを新形式へ移行しました。元のセーブデータはそのまま残しています。');
      if (!writeSave()) return;
    }
    developmentDraft = { ...(state.developmentDraft || developmentDraft) };
    activeTab = state.phase === 'results' || state.phase === 'gameOver' ? 'results' : 'shop';
    $('startScreen').hidden = true;
    $('gameScreen').hidden = false;
    updateTabs();
    renderPanel();
    writeSave();
    if (state.phase === 'serving') {
      if (!state.daily.salesPlanPrepared) prepareSalesPlan();
      prepareLegacyDialogues();
      scheduleBusinessTick(500);
    }
  }

  function showNotice(message, error = false) {
    const notice = $('notice');
    if (!notice) return;
    notice.textContent = message;
    notice.className = `notice${error ? ' error' : ''}`;
    notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 8000);
  }

  function renderSummary() {
    if (!state || $('gameScreen').hidden) return;
    $('summary').hidden = false;
    const status = state.phase === 'planning' ? '開店前' : state.phase === 'serving' ? '営業中' : state.phase === 'gameOver' ? '営業終了' : '閉店';
    $('summary').innerHTML = `<span>第${state.day}日 · ${status}</span><span>体力 <b>${state.stamina}</b></span><span>累計売上 <b>${state.totalSales}円</b></span>`;
  }

  function updateTabs() {
    document.querySelectorAll('.tabs [data-tab]').forEach(button => {
      const tabName = button.dataset.tab;
      const canOpen = state && (tabName === 'encyclopedia'
        || (state.phase === 'planning' && tabName !== 'results')
        || (state.phase === 'serving' && tabName === 'shop')
        || ((state.phase === 'results' || state.phase === 'gameOver') && tabName === 'results'));
      button.disabled = !canOpen || busy;
      button.setAttribute('aria-selected', String(button.dataset.tab === activeTab));
    });
  }

  function header(title, description = '') {
    return `<h1>${escapeHtml(title)}</h1>${description ? `<p class="muted">${escapeHtml(description)}</p>` : ''}`;
  }

  function eventCard(event, name = event?.name, description = event?.description) {
    if (!event) return '';
    const kind = event.group === 'good' ? 'good' : event.group === 'challenge' ? 'challenge' : '';
    const tags = (event.popularTags || Object.keys(event.pointsByTag || {})).slice(0, 4);
    const effects = [];
    const visitorBoost = Math.min(event.visitorBonus || 0, Math.max(0, DAILY_TEXT_CUSTOMER_LIMIT - (4 + state.day)));
    if (visitorBoost) effects.push(`来店客 +${visitorBoost}匹`);
    if (event.staminaDelta) effects.push(`体力 ${event.staminaDelta > 0 ? '+' : ''}${event.staminaDelta}`);
    if (event.productionDelta) effects.push(`製造上限 ${event.productionDelta}個`);
    const effectText = effects.length ? effects.join(' · ') : '特徴に合うパンが購入されやすくなります';
    return `<section class="card event-card ${kind}"><div class="event-title"><h2>📣 ${escapeHtml(name || event.name)}</h2><span class="small">本日のイベント</span></div><p>${escapeHtml(description || event.description || '')}</p><div class="event-tags"><b>人気の特徴</b>${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('') || '<span class="small">森の定番</span>'}</div><p class="event-impact small">${escapeHtml(effectText)}</p></section>`;
  }

  function managerMessage(daily) {
    let message = `今日の目標金額は${daily.goal}円だよ！一緒に頑張ろう！`;
    if (daily.sales >= daily.goal) message = `やったね！今日の目標${daily.goal}円を達成したよ！この調子！`;
    else if (daily.sales > 0) message = `今日の目標金額は${daily.goal}円だよ！あと${daily.goal - daily.sales}円、一緒に頑張ろう！`;
    return `<section class="manager-card" aria-label="クマ店長からのメッセージ"><img class="manager-face" src="/assets/bakery-game/animals/kuma-manager.png" alt=""><div class="manager-copy"><span class="small">クマ店長</span><p>${escapeHtml(message)}</p></div></section>`;
  }

  function goalCard(daily) {
    const ratio = Math.round(daily.sales / daily.goal * 100);
    const visual = Math.min(100, ratio);
    const left = Math.max(0, daily.goal - daily.sales);
    return `<section class="goal-card" aria-label="本日の売上目標"><div class="goal-values"><span>本日の売上目標 <b>${daily.goal}円</b></span><span>現在の売上 <b>${daily.sales}円</b></span></div><div class="goal-progress" role="progressbar" aria-label="売上目標達成率" aria-valuenow="${Math.min(100, ratio)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${visual}%"></span></div><div class="goal-caption"><span>達成率 ${ratio}%</span><b>${left ? `あと${left}円` : '目標達成！'}</b></div></section>`;
  }

  function renderPanel() {
    if (!state) return;
    if (state.phase === 'serving' && activeTab !== 'encyclopedia') activeTab = 'shop';
    if ((state.phase === 'results' || state.phase === 'gameOver') && activeTab !== 'encyclopedia') activeTab = 'results';
    if (state.phase === 'planning' && activeTab === 'results') activeTab = 'shop';
    const views = { shop: renderShop, develop: renderDevelop, prepare: renderPrepare, results: renderResults, encyclopedia: renderEncyclopedia };
    $('panel').innerHTML = (views[activeTab] || renderShop)();
    renderSummary();
    updateTabs();
  }

  function breadAsset(item) {
    const text = `${item.breadType || ''} ${item.name || ''}`;
    if (text.includes('クロワッサン')) return 'croissant';
    if (text.includes('メロン')) return 'melon-pan';
    if (text.includes('食パン') || text.includes('ローフ')) return 'loaf';
    if (text.includes('バゲット') || text.includes('フランス')) return 'baguette';
    if (text.includes('ベーグル')) return 'bagel';
    if (text.includes('ドーナツ') || text.includes('ドーナッツ')) return 'donut';
    if (text.includes('あん')) return 'anko-pan';
    if (text.includes('デニッシュ') || text.includes('パイ')) return 'danish';
    if (text.includes('フォカッチャ')) return 'focaccia';
    return 'round-roll';
  }

  function breadImage(item, large = false) {
    return `<img class="bread-thumb${large ? ' large' : ''}" src="/assets/bakery-game/bread/${breadAsset(item)}.svg" alt="">`;
  }

  function renderShop() {
    if (state.phase === 'serving') return renderBusinessShop();
    const daily = state.daily;
    const stockTotal = state.products.reduce((sum, item) => sum + (item.stock || 0), 0);
    const stocked = state.products.filter(item => item.stock > 0);
    const expected = baseVisitorCount();
    const shelf = stocked.slice(0, 5).map(item => `<span title="${escapeHtml(item.name)}">${breadImage(item)}</span>`).join('');
    const firstDay = state.day === 1 && state.products.length === 0;
    const intro = firstDay ? '<p class="opening-message">今日から、あなたの小さなパン屋さんが始まります。世界に一つだけのパンを作って、森の動物たちに届けましょう！</p>' : '';
    return `<div class="page-intro">${header('お店', `第${state.day}日 · ${state.phase === 'planning' ? '開店前' : '本日の営業は終了しました'}`)}</div>
      <div class="shop-layout">
        <section class="shop-scene" role="img" aria-label="木の棚とショーケースがある森のパン屋">
          <div class="scene-caption"><div><h2>森のちいさなパン屋さん</h2><p>${state.phase === 'planning' ? '今日も焼きたての香りが広がります。' : '店じまいの時間です。今日もおつかれさまでした。'}</p></div><span aria-hidden="true">${state.phase === 'planning' ? '☀' : '☾'}</span></div>
        </section>
        <aside class="store-aside">
          ${managerMessage(daily)}
          ${goalCard(daily)}
          ${intro}
          <section class="card store-stock"><h2>今日のお店</h2><div class="stats"><span>在庫 <b>${stockTotal}個</b></span><span>来店予定 <b>${daily.visitors || expected}匹</b></span></div>
            <div class="shelf-row" aria-label="販売するパン">${shelf || '<span class="muted">まだパンが並んでいません</span>'}</div>
          </section>
        </aside>
      </div>`;
  }

  function renderBusinessShop() {
    const daily = state.daily;
    const customer = daily.customers[daily.index];
    if (!customer) return `${header('営業を終えています')}<section class="card">売上結果をまとめています…</section>`;
    const profile = animal(customer.animalId);
    const progress = daily.customers.length ? Math.round(daily.index / daily.customers.length * 100) : 0;
    const lines = [customer.greeting, customer.reasonLine || `今日は${customer.reason}。`, customer.interest, customer.reaction || customer.resultText, customer.farewell];
    const line = lines[clamp(customer.dialogueStage, 0, lines.length - 1)] || '焼きたてのパンを見せてね。';
    const lineTitles = ['ご来店', '来店の理由', 'パンに注目', 'お買い物', 'また来てね'];
    const recent = daily.customers.slice(0, daily.index + 1).filter(entry => entry.resolved).slice(-3).reverse().map(entry => {
      const who = animal(entry.animalId);
      const item = entry.boughtProductId ? product(entry.boughtProductId) : null;
      return `<article class="sale-note"><strong>${who?.emoji || '🐾'} ${escapeHtml(who?.name || 'お客さま')}</strong><div>${item ? `${escapeHtml(item.name)} · ${entry.boughtQuantity || 1}個 · ${item.price * (entry.boughtQuantity || 1)}円` : '今日はお買い上げなし'}</div><div class="small">${escapeHtml(entry.resultText || '')}</div></article>`;
    }).join('');
    const history = daily.customers.filter(entry => entry.resolved).map(entry => {
      const who = animal(entry.animalId);
      const item = entry.boughtProductId ? product(entry.boughtProductId) : null;
      return `<li>${escapeHtml(who?.name || 'お客さま')}：${item ? `${escapeHtml(item.name)}を${entry.boughtQuantity || 1}個（${item.price * (entry.boughtQuantity || 1)}円）` : '購入なし'} — ${escapeHtml(entry.resultText || '')}</li>`;
    }).join('');
    const visitorImage = profile?.emoji || '🐾';
    const controls = `<div class="service-controls"><button data-action="toggle-fast" aria-pressed="${serviceFast}">${serviceFast ? '通常速度' : '早送り'}</button><button data-action="toggle-pause" aria-pressed="${servicePaused}">${servicePaused ? '再開' : '一時停止'}</button><button data-action="skip-customer">このお客さまの会話をスキップ</button></div>`;
    return `<div class="service-layout"><div class="service-head">${header('営業中', `お客さま ${daily.index + 1} / ${daily.customers.length}`)}</div>
      ${managerMessage(daily)}
      ${goalCard(daily)}
      <div class="service-progress" role="progressbar" aria-label="来店客の進行状況" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
      <section class="service-scene"><div class="customer-face" aria-hidden="true">${visitorImage}</div><div class="speech-card"><strong>${escapeHtml(profile?.name || 'お客さま')} · ${lineTitles[customer.dialogueStage] || 'お客さまの言葉'}</strong><p class="speech-line" aria-live="polite">「${escapeHtml(line)}」</p>${customer.resolved && customer.boughtProductId ? `<p class="small">${escapeHtml(product(customer.boughtProductId)?.name || 'パン')} · ${customer.boughtQuantity || 1}個</p>` : ''}</div></section>
      ${controls}
      <div class="stats"><span class="service-total">本日の売上 <b>${daily.sales}円</b></span><span>残り在庫 <b>${state.products.reduce((sum, item) => sum + item.stock, 0)}個</b></span><span>達成まで <b>${Math.max(0, daily.goal - daily.sales)}円</b></span></div>
      <section class="sale-feed" aria-live="polite">${recent || '<p class="muted">お客さまをお迎えする準備をしています。</p>'}</section>
      <details class="reaction-details"><summary>今日のお客さまの記録を見る</summary><ul class="reaction-list">${history || '<li>これからお客さまをお迎えします。</li>'}</ul></details></div>`;
  }

  function renderDevelop() {
    const draft = state.developmentDraft || developmentDraft;
    const shortcuts = [
      ['季節のパン', '季節の素材を使ったパン。旬らしい色や形にする。'],
      ['魔法のパン', '食べると不思議な魔法の効果があるパン。'],
      ['かわいいパン', '動物や花をモチーフにした、見た目もかわいいパン。'],
      ['珍しいパン', '意外な食材や組み合わせを楽しめる、珍しいパン。']
    ].map(([label, value]) => `<button class="soft" type="button" data-action="idea-shortcut" data-value="${escapeHtml(value)}" ${busy || pendingProduct ? 'disabled' : ''}>${label}</button>`).join('');
    const result = pendingProduct ? `<section class="card product-result"><div class="result-product-top">${breadImage(pendingProduct, true)}<div><h2>${escapeHtml(pendingProduct.name)}</h2><p>${escapeHtml(pendingProduct.description)}</p><div class="recommended-price">${pendingProduct.recommendedPrice}円 <span class="small">AIのおすすめ価格</span></div></div></div>
      <p>${productTags(pendingProduct)}</p><details><summary>食材や詳しい特徴を見る</summary><dl class="details"><dt>パンの種類</dt><dd>${escapeHtml(pendingProduct.breadType)}</dd><dt>使用食材</dt><dd>${pendingProduct.ingredients.map(escapeHtml).join('、')}</dd><dt>味</dt><dd>${escapeHtml(pendingProduct.flavor)}</dd><dt>食感</dt><dd>${escapeHtml(pendingProduct.texture)}</dd><dt>見た目</dt><dd>${escapeHtml(pendingProduct.appearance)}</dd><dt>特殊な特徴</dt><dd>${escapeHtml(pendingProduct.specialFeature)}</dd><dt>価格の理由</dt><dd>${escapeHtml(pendingProduct.priceReason)}</dd></dl></details>
      <div class="actions"><button class="primary" data-action="register-product" ${busy ? 'disabled' : ''}>商品として登録する</button><button data-action="retry-product" ${busy ? 'disabled' : ''}>作り直す</button><button data-action="cancel-product" ${busy ? 'disabled' : ''}>キャンセル</button></div></section>` : '';
    return `<div class="develop-view"><div class="page-intro">${header('パン開発', '思いついたことをひとつの欄に書くだけ。現実の食材も、魔法のアイデアも作れます。')}</div>
      ${eventCard(state.daily.morningEvent, state.daily.eventName, state.daily.eventDescription)}
      ${pendingProduct ? result : `<section class="card idea-box"><label class="idea-label" for="bread-idea">どんなパンを作りたいですか？</label>
        <textarea id="bread-idea" data-draft="idea" maxlength="500" placeholder="例：いちごとチョコのハート形パン。夜になると星のように光る。" ${busy || pendingProduct ? 'disabled' : ''}>${escapeHtml(draft.idea || '')}</textarea>
        <div class="idea-shortcuts" aria-label="アイデア補助">${shortcuts}</div>
        <div class="idea-actions"><button class="primary" data-action="develop" ${busy || pendingProduct ? 'disabled' : ''}>パンを開発する</button><button data-action="develop-omakase" ${busy || pendingProduct ? 'disabled' : ''}>おまかせで作る</button></div>
        <p class="hint">商品案を確認して登録すると、以降はAI通信なしで製造・販売できます。</p>
      </section>`}${busy ? '<section class="card loading-card" role="status"><span class="loading-mark" aria-hidden="true"></span><span>焼き上がりを待っています…</span></section>' : ''}</div>`;
  }

  function productTags(item) {
    return cleanTags(item.tags).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  }

  function renderEncyclopedia() {
    const recipes = mergeRecipes(state.encyclopedia || [], state.products || []);
    const cards = recipes.map(item => {
      const available = state.phase === 'planning'
        ? '<button class="soft" data-action="open-prepare">開店準備で製造する</button>'
        : `<span class="small">${state.phase === 'serving' ? '次の営業で販売できます' : '新しい営業日に製造・販売できます'}</span>`;
      return `<article class="card encyclopedia-card"><div class="result-product-top">${breadImage(item, true)}<div><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.description || '説明はありません。')}</p><div class="recommended-price">${item.recommendedPrice}円 <span class="small">おすすめ価格</span></div></div></div>
        <p>${productTags(item)}</p><details><summary>パンの特徴を見る</summary><dl class="details"><dt>パンの種類</dt><dd>${escapeHtml(item.breadType)}</dd><dt>使用食材</dt><dd>${item.ingredients.map(escapeHtml).join('、') || '記録なし'}</dd><dt>味</dt><dd>${escapeHtml(item.flavor || '記録なし')}</dd><dt>食感</dt><dd>${escapeHtml(item.texture || '記録なし')}</dd><dt>見た目</dt><dd>${escapeHtml(item.appearance || '記録なし')}</dd><dt>特殊な特徴</dt><dd>${escapeHtml(item.specialFeature || 'なし')}</dd></dl></details>
        <div class="encyclopedia-footer"><span class="small">開発 ${item.createdOn}日目 · お店の商品</span>${available}</div></article>`;
    }).join('');
    return `<div class="encyclopedia-view"><div class="page-intro">${header('パン図鑑', `これまでに作ったパン ${recipes.length}種類。図鑑のパンは開店準備で製造して販売できます。`)}</div>
      ${recipes.length ? `<div class="encyclopedia-grid">${cards}</div>` : `<section class="card"><p>まだ図鑑にパンがありません。${state.phase === 'planning' ? 'パン開発で最初の一品を作ってみましょう。' : '次のお店でパンを開発すると、ここに記録されます。'}</p>${state.phase === 'planning' ? '<button class="primary" data-action="open-develop">パンを開発する</button>' : ''}</section>`}</div>`;
  }

  function renderPrepare() {
    if (state.phase !== 'planning') return `${header('開店準備', '営業中と営業終了後は準備を変更できません。')}`;
    const items = state.products.filter(item => !item.archived || item.stock > 0);
    const remainingCapacity = Math.max(0, Math.min(state.stamina * 2, state.daily.productionLimit - state.daily.manufactured));
    const plannedRevenue = state.products.reduce((sum, item) => sum + item.stock * item.price, 0);
    const rows = items.map(item => {
      const made = Number(state.daily.manufacturedByProduct?.[item.id]) || 0;
      const maxPrice = Math.round(item.recommendedPrice * 2.5);
      const priceControl = item.archived
        ? `<div class="price-block"><span class="small">販売価格</span><p><b>${item.price}円</b> <span class="small">推奨 ${item.recommendedPrice}円</span></p></div>`
        : `<div class="price-block"><span class="small">販売価格</span><div class="price-control"><button aria-label="10円値下げ" data-action="price-step" data-id="${escapeHtml(item.id)}" data-step="-10">−</button><input aria-label="${escapeHtml(item.name)}の販売価格" type="number" min="50" max="${maxPrice}" step="10" data-price="${escapeHtml(item.id)}" value="${item.price}"><button aria-label="10円値上げ" data-action="price-step" data-id="${escapeHtml(item.id)}" data-step="10">＋</button></div></div>`;
      return `<article class="prepare-row">
        <div class="prepare-name">${breadImage(item)}<div><strong>${escapeHtml(item.name)}</strong><span class="small">推奨 ${item.recommendedPrice}円</span></div></div>
        <div><span class="small">現在の在庫</span><br><b>${item.stock}個</b></div>
        <div><span class="small">今日の製造</span><div class="control-group"><button class="icon-button" aria-label="${escapeHtml(item.name)}の製造を2個減らす" data-action="undo-manufacture" data-id="${escapeHtml(item.id)}" ${made < 2 ? 'disabled' : ''}>−</button><output>${made}個</output><button class="icon-button" aria-label="${escapeHtml(item.name)}を2個製造する" data-action="manufacture" data-id="${escapeHtml(item.id)}" ${state.stamina < 1 || state.daily.manufactured + 2 > state.daily.productionLimit || item.archived ? 'disabled' : ''}>＋</button></div></div>
        ${priceControl}
      </article>`;
    }).join('');
    return `<div class="prepare-view"><div class="page-intro">${header('開店準備', `体力 ${state.stamina} · 今日の製造上限 ${state.daily.productionLimit}個`)}</div>
      ${eventCard(state.daily.morningEvent, state.daily.eventName, state.daily.eventDescription)}
      ${goalCard(state.daily)}
      <p class="hint">製造ボタン1回で2個作り、体力を1使います。価格は10円ずつ調整できます。在庫を用意して開店しましょう。</p>
      <div class="prepare-list">${rows || '<section class="card">商品がありません。パン開発から新しい商品を作れます。</section>'}</div>
      <footer class="prepare-footer"><div class="footer-stat">今日の製造合計<b>${state.daily.manufactured}個</b></div><div class="footer-stat">残り製造可能数<b>${remainingCapacity}個</b></div><div class="footer-stat">在庫が売れた場合<b>${plannedRevenue}円</b></div>
        <button class="primary" data-action="open" ${state.products.some(item => item.stock > 0) && !busy ? '' : 'disabled'}>${busy ? '開店準備中…' : 'お店を開く'}</button></footer></div>`;
  }

  function renderResults() {
    const daily = state.daily;
    const ratio = daily.goal ? Math.round(daily.sales / daily.goal * 100) : 0;
    const productIds = [...new Set([...Object.keys(daily.openingStocks || {}), ...Object.keys(daily.salesByProduct || {})])];
    const salesByProduct = productIds.map(id => {
      const item = product(id);
      const name = daily.salesByProductNames[id] || item?.name || 'パン';
      const count = daily.salesByProduct[id] || 0;
      const revenue = count * (item?.price || 0);
      const remaining = Math.max(0, (daily.openingStocks[id] || 0) - count);
      return { id, name, count, revenue, remaining };
    });
    const bestRevenue = Math.max(1, ...salesByProduct.map(row => row.revenue));
    const salesRows = salesByProduct.map(row => `<div class="product-sales-row"><strong>${escapeHtml(row.name)}</strong><div class="bar-track" aria-label="${row.revenue}円"><span style="width:${Math.round(row.revenue / bestRevenue * 100)}%"></span></div><span>${row.revenue}円</span></div><p class="small">販売 ${row.count}個 · 売れ残り ${row.remaining}個</p>`).join('') || '<p class="muted">販売できる商品はありませんでした。</p>';
    const soldUnits = Object.values(daily.salesByProduct || {}).reduce((sum, amount) => sum + amount, 0);
    const unsoldUnits = salesByProduct.reduce((sum, row) => sum + row.remaining, 0);
    const reviews = daily.customers.map(customer => {
      const who = animal(customer.animalId);
      const item = customer.boughtProductId ? product(customer.boughtProductId) : null;
      const reaction = customer.boughtProductId ? customer.resultText : declineReaction(customer);
      return `<li>${escapeHtml(who?.name || 'お客さま')}${item ? ` · ${escapeHtml(item.name)}` : ''}：「${escapeHtml(reaction || customer.resultText || 'また来てね。')}」</li>`;
    }).join('');
    const chartHistory = state.history.filter(entry => Number.isFinite(entry.sales)).slice(-14);
    const maxSales = Math.max(1, ...chartHistory.map(entry => entry.sales));
    const chart = chartHistory.map(entry => {
      const height = Math.max(3, Math.round(entry.sales / maxSales * 100));
      return `<div class="chart-column" title="${entry.day}日目 ${entry.sales}円"><div class="chart-bar" style="height:${height}%"></div><span class="chart-label">${entry.day}日</span></div>`;
    }).join('') || '<p class="muted">売上記録がたまると、ここに推移を表示します。</p>';
    const eventLog = daily.events.map(item => `<li>${escapeHtml(item.name)}：${escapeHtml(item.result || item.description || '')}</li>`).join('') || '<li>特別なイベントはありません。</li>';
    const gameOver = state.phase === 'gameOver';
    return `<div class="results-view"><div class="page-intro">${header(gameOver ? 'ゲームオーバー' : '本日の営業結果', gameOver ? `第${state.day}日目で目標に届きませんでした。${Math.max(0, state.day - 1)}日間の記録は保管されています。` : `第${state.day}日 · 売上目標達成！`)}</div>
      <section class="game-result-goal ${gameOver ? 'failed' : 'achieved'}"><div><span>到達日</span><b>${state.day}日目</b></div><div><span>売上目標</span><b>${daily.goal}円</b></div><div><span>実際の売上</span><b>${daily.sales}円</b></div>${gameOver ? `<div><span>不足金額</span><b>${Math.max(0, daily.goal - daily.sales)}円</b></div>` : '<div><span>目標</span><b>達成</b></div>'}</section>
      <div class="stats"><span class="result-lead">本日の売上 <b>${daily.sales}円</b></span><span>販売個数 <b>${soldUnits}個</b></span><span>売れ残り <b>${unsoldUnits}個</b></span><span>来店客数 <b>${daily.customers.length}匹</b></span><span>目標達成率 <b>${ratio}%</b></span></div>
      <div class="results-scroll">
      <div class="grid"><section class="card"><h2>商品別の売上</h2><div class="product-sales">${salesRows}</div></section>
        <section class="card"><h2>今日のイベント</h2><ul class="result-list">${eventLog}</ul></section></div>
      <details class="reaction-details"><summary>お客さまの感想を見る</summary><ul class="reaction-list">${reviews || '<li>今日はお客さまがいませんでした。</li>'}</ul></details>
      <section class="card book-section"><h2>日別売上（直近14日）</h2><div class="chart" role="img" aria-label="日別売上グラフ">${chart}</div></section></div>
      <div class="actions result-actions">${gameOver ? '<button class="primary" data-action="restart">記録を保管して1日目から再挑戦</button>' : '<button class="primary" data-action="advance">翌日へ進む</button>'}</div></div>`;
  }

  function setTab(tabName) {
    if (!state || busy) return;
    if (tabName !== 'encyclopedia') {
      if (state.phase === 'planning' && !['shop', 'develop', 'prepare'].includes(tabName)) return;
      if (state.phase === 'serving' && tabName !== 'shop') return;
      if ((state.phase === 'results' || state.phase === 'gameOver') && tabName !== 'results') return;
    }
    activeTab = tabName;
    renderPanel();
  }

  function normalizePrice(item, raw) {
    const min = 50;
    const max = Math.round(item.recommendedPrice * 2.5);
    return Math.round(clamp(raw, min, max) / 10) * 10;
  }

  function manufacture(itemId) {
    if (state.phase !== 'planning' || state.stamina < 1) return;
    const item = product(itemId);
    if (!item || item.archived) return;
    const made = state.daily.manufactured;
    if (made + 2 > state.daily.productionLimit) return showNotice('今日の製造上限に達しました。', true);
    item.stock += 2;
    state.stamina--;
    state.daily.manufactured += 2;
    state.daily.manufacturedByProduct[item.id] = (state.daily.manufacturedByProduct[item.id] || 0) + 2;
    writeSave();
    renderPanel();
  }

  function undoManufacture(itemId) {
    if (state.phase !== 'planning') return;
    const item = product(itemId);
    const made = Number(state.daily.manufacturedByProduct?.[itemId]) || 0;
    if (!item || made < 2) return;
    item.stock = Math.max(0, item.stock - 2);
    state.stamina++;
    state.daily.manufactured -= 2;
    state.daily.manufacturedByProduct[itemId] = made - 2;
    writeSave();
    renderPanel();
  }

  function exactKeys(value, keys) {
    return value && typeof value === 'object' && !Array.isArray(value)
      && Object.keys(value).sort().join('|') === [...keys].sort().join('|');
  }

  async function callApi(task, context, fields = {}, timeoutMs = PRODUCT_API_TIMEOUT_MS) {
    const body = {
      title: `こむぎ日和・${task}`, task, context: JSON.stringify(context), idea: String(fields.idea || ''),
      breadType: fields.breadType || '', ingredients: JSON.stringify(fields.ingredients ?? 'おまかせ'),
      concept: JSON.stringify(fields.concept ?? 'おまかせ'), flavor: JSON.stringify(fields.flavor ?? 'おまかせ'),
      texture: JSON.stringify(fields.texture ?? 'おまかせ'), otherRequests: JSON.stringify(fields.otherRequests ?? 'おまかせ')
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    let raw;
    try {
      response = await fetch('/api/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: controller.signal
      });
      raw = await response.text();
    } finally { clearTimeout(timeout); }
    let payload;
    try { payload = JSON.parse(raw); } catch (_) { throw new Error('APIからJSON形式の応答を受け取れませんでした。'); }
    if (!response.ok) throw new Error(payload.error || 'API通信に失敗しました。');
    if (!Array.isArray(payload.data)) throw new Error('API応答のdataが配列ではありません。');
    return payload.data;
  }

  function validateProduct(data) {
    const keys = ['name', 'breadType', 'ingredients', 'flavor', 'texture', 'appearance', 'specialFeature', 'description', 'priceReason', 'recommendedPrice', 'tags'];
    if (data.length !== 1 || !exactKeys(data[0], keys)) throw new Error('指定形式の商品が1種類返りませんでした。');
    const item = data[0];
    const limits = { name: [2, 30], breadType: [1, 40], flavor: [1, 80], texture: [1, 80], appearance: [1, 100], specialFeature: [1, 120], description: [1, 150], priceReason: [1, 120] };
    for (const [key, [min, max]] of Object.entries(limits)) {
      if (typeof item[key] !== 'string' || item[key].trim().length < min || item[key].trim().length > max) throw new Error(`商品の「${key}」が指定形式に合いません。`);
    }
    if (!Array.isArray(item.ingredients) || item.ingredients.length < 2 || item.ingredients.length > 8
      || item.ingredients.some(value => typeof value !== 'string' || !value.trim() || value.trim().length > 30)) throw new Error('食材の形式が指定と異なります。');
    if (new Set(item.ingredients.map(value => value.trim())).size !== item.ingredients.length) throw new Error('食材に重複があります。もう一度お試しください。');
    if (!Array.isArray(item.tags) || item.tags.length < 1 || item.tags.length > 8 || item.tags.some(value => typeof value !== 'string')) throw new Error('特徴タグの形式が指定と異なります。');
    if (!Number.isInteger(item.recommendedPrice) || item.recommendedPrice < 50 || item.recommendedPrice > 3000) throw new Error('推奨価格の形式が指定と異なります。');
    const tags = cleanTags(item.tags);
    if (!tags.length) throw new Error('購入判定に使える特徴タグがありませんでした。もう一度お試しください。');
    return { ...item, name: item.name.trim(), ingredients: [...new Set(item.ingredients.map(value => value.trim()))], tags };
  }

  async function developProduct(omakase = false, retry = false) {
    if (busy || state.phase !== 'planning') return;
    const ideaInput = document.querySelector('[data-draft="idea"]');
    const idea = retry ? pendingProductIdea : (omakase ? '' : String(ideaInput?.value || '').trim());
    if (!omakase && !retry && !idea) return showNotice('作りたいパンのアイデアを入力するか、「おまかせで作る」を選んでください。', true);
    pendingProductIdea = idea;
    pendingProductOmakase = omakase || pendingProductOmakase;
    developmentDraft = { ...(state.developmentDraft || {}), idea };
    state.developmentDraft = { ...developmentDraft };
    writeSave();
    busy = true;
    renderPanel();
    updateTabs();
    try {
      const generated = validateProduct(await callApi('product', { idea, omakase: !idea }, { idea }));
      const item = {
        id: `bread-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        ...generated, concept: '', features: generated.specialFeature,
        price: generated.recommendedPrice, stock: 0, soldTotal: 0, createdBy: 'player', createdOn: state.day, archived: false
      };
      pendingProduct = item;
      showNotice(`「${item.name}」の商品案ができました。内容を確認して登録してください。`);
    } catch (error) {
      showNotice(`パンを開発できませんでした。${error.name === 'AbortError' ? '通信がタイムアウトしました。' : error.message} 商品開発は完了していません。`, true);
    } finally {
      busy = false;
      renderPanel();
      updateTabs();
    }
  }

  function registerPendingProduct() {
    if (busy || !pendingProduct || state.phase !== 'planning') return;
    state.products.push(pendingProduct);
    state.encyclopedia = mergeRecipes(state.encyclopedia || [], [pendingProduct]);
    state.developmentDraft = { ...(state.developmentDraft || {}), idea: '' };
    developmentDraft = { ...state.developmentDraft };
    pendingProduct = null;
    pendingProductIdea = '';
    pendingProductOmakase = false;
    writeSave();
    showNotice('新しいパンを商品に登録しました。開店準備から製造できます。');
    activeTab = 'develop';
    renderPanel();
  }

  function appendIdea(value) {
    const input = document.querySelector('[data-draft="idea"]');
    if (!input || busy) return;
    const current = input.value.trim();
    input.value = current ? `${current}。${value}` : value;
    input.focus();
    setDraftValue('idea', input.value);
    renderPanel();
    const updated = document.querySelector('[data-draft="idea"]');
    if (updated) { updated.focus(); updated.setSelectionRange(updated.value.length, updated.value.length); }
  }

  function customerRecord(id) {
    if (!state.animals[id]) state.animals[id] = { discovered: false, affection: 0, visits: 0, purchases: 0, purchasedProducts: [], history: [] };
    const record = state.animals[id];
    record.discovered = Boolean(record.discovered);
    record.affection = clamp(record.affection, 0, 5);
    record.visits = Math.max(0, Number(record.visits) || 0);
    record.purchases = Math.max(0, Number(record.purchases) || 0);
    record.purchasedProducts = Array.isArray(record.purchasedProducts) ? record.purchasedProducts : [];
    record.history = Array.isArray(record.history) ? record.history : [];
    return record;
  }

  function chooseAnimal(rareOnly = false) {
    const pool = ANIMALS.filter(item => item.rare === rareOnly);
    if (rareOnly) return randomItem(pool);
    const weighted = [];
    pool.forEach(item => {
      const affection = Number(state.animals[item.id]?.affection) || 0;
      const weight = 1 + Math.floor(affection / 2);
      for (let count = 0; count < weight; count++) weighted.push(item);
    });
    return randomItem(weighted);
  }

  function createVisitor(index, forceRare = false) {
    const isRare = forceRare || Math.random() < 0.03;
    const profile = chooseAnimal(isRare);
    const reason = randomItem(VISIT_REASONS);
    const id = `d${state.day}-c${index}-${profile.id}`;
    return {
      id, animalId: profile.id, isRare, mood: randomItem(MOODS), reason: reason.label,
      needIngredients: [...reason.ingredients], needTags: [...reason.tags],
      budget: randomItem([320, 360, 400, 450, 500, 550]) + Math.max(0, state.day - 1) * 20,
      greeting: randomItem(profile.lines), purchaseReaction: 'わあ、ありがとう！おいしくいただくね。',
      declineReaction: '今日はちょっと違う気分みたい。また見に来るね。', farewell: 'また来るね。', interest: '', dialogueStage: 0, resolved: false,
      resultText: '', resultTitle: '', resultReason: '', boughtProductId: ''
    };
  }

  function chooseMiddayEvent(visitorCount) {
    if (Math.random() >= 0.20) return null;
    const event = { ...randomItem(MIDDAY_EVENTS), targetIndex: Math.floor(Math.random() * visitorCount) };
    if (event.id === 'popular_tag') {
      const tags = [...new Set(state.products.filter(item => item.stock > 0).flatMap(item => item.tags))];
      event.tag = tags.length ? randomItem(tags) : '甘い';
      event.description = `${event.tag}の特徴があるパンが今日は人気です。`;
    }
    return event;
  }

  function makeVisitors(count, rareIndex = -1) {
    return Array.from({ length: count }, (_, index) => createVisitor(index + 1, index === rareIndex));
  }

  function baseVisitorCount() {
    return Math.min(DAILY_TEXT_CUSTOMER_LIMIT, Math.max(1, 5 + state.day - 1 + (state.daily.morningEvent.visitorBonus || 0)));
  }

  function fallbackDailyText(preserveEvent = false) {
    const event = MORNING_EVENTS.find(item => item.id === state.daily.morningEvent.id) || state.daily.morningEvent;
    if (!preserveEvent) {
      state.daily.eventName = event.name;
      state.daily.eventDescription = event.description;
    }
    state.daily.customers.forEach(customer => {
      const profile = animal(customer.animalId);
      const item = product(customer.plannedProductId);
      customer.greeting ||= randomItem(profile.lines);
      customer.reasonLine ||= `今日は${customer.reason}。`;
      customer.interest ||= item ? `「${item.name}」、${cleanTags(item.tags)[0] || item.breadType}が気になるな。` : '棚を見せてもらえるかな？';
      customer.reaction ||= customer.plannedPurchase
        ? `これを${customer.plannedQuantity > 1 ? `${customer.plannedQuantity}個` : 'ひとつ'}いただくね。`
        : customer.budget < (item?.price || 0) ? `気になるけれど、今日は予算が足りないみたい。` : '今日は見るだけにしておくね。';
      customer.farewell ||= randomItem(['ありがとう、また来るね。', 'ごちそうさま。また寄るね。', 'それじゃあ、またね！']);
    });
  }

  function validateDailyText(data, expectedCustomers) {
    if (data.length !== 1 || !exactKeys(data[0], ['event', 'customers'])) throw new Error('営業文の形式が指定と異なります。');
    const value = data[0];
    if (!exactKeys(value.event, ['name', 'description']) || typeof value.event.name !== 'string' || !value.event.name.trim() || value.event.name.length > 40
      || typeof value.event.description !== 'string' || !value.event.description.trim() || value.event.description.length > 120) throw new Error('イベント文の形式が指定と異なります。');
    if (!Array.isArray(value.customers) || value.customers.length !== expectedCustomers.length) throw new Error('来店客の数が指定と異なります。');
    const ids = new Set(expectedCustomers.map(customer => customer.id));
    const seen = new Set();
    for (const entry of value.customers) {
      if (!exactKeys(entry, ['customerId', 'greeting', 'reasonLine', 'interest', 'reaction', 'farewell'])
        || !ids.has(entry.customerId) || seen.has(entry.customerId)
        || ['greeting', 'reasonLine', 'interest', 'reaction', 'farewell'].some(key => typeof entry[key] !== 'string' || !entry[key].trim() || entry[key].length > 55)) {
        throw new Error('来店客のセリフが指定形式に合いません。');
      }
      seen.add(entry.customerId);
    }
    if (seen.size !== ids.size) throw new Error('来店客のセリフが不足しています。');
    return value;
  }

  function prepareSalesPlan() {
    if (state.daily.salesPlanPrepared) return;
    const daily = state.daily;
    const remaining = new Map(state.products.map(item => [item.id, item.stock]));
    const previousIndex = daily.index;
    daily.customers.forEach((customer, index) => {
      if (customer.resolved) return;
      daily.index = index;
      const available = state.products.filter(item => (remaining.get(item.id) || 0) > 0);
      const affordable = available.filter(item => item.price <= customer.budget);
      const candidates = affordable.length ? affordable : available;
      const ranked = candidates.map(item => ({ item, result: purchaseChance(customer, item) }))
        .sort((left, right) => right.result.chance - left.result.chance);
      const choice = ranked[0];
      customer.plannedProductId = choice?.item.id || '';
      customer.plannedChance = choice?.result.chance || 0;
      customer.plannedPurchase = Boolean(choice && affordable.length && Math.random() * 100 < choice.result.chance);
      customer.plannedQuantity = 1;
      if (customer.plannedPurchase && daily.midEvent?.targetIndex === index && daily.midEvent.id === 'bulk_order'
        && (remaining.get(choice.item.id) || 0) >= 2) customer.plannedQuantity = 2;
      if (customer.plannedPurchase) remaining.set(choice.item.id, remaining.get(choice.item.id) - customer.plannedQuantity);
    });
    daily.index = previousIndex;
    daily.salesPlanPrepared = true;
  }

  function prepareLegacyDialogues() {
    state.daily.customers.forEach(customer => {
      if (customer.resolved && !customer.plannedPurchase && customer.boughtProductId) customer.plannedPurchase = true;
      if (customer.resolved && customer.dialogueStage === 0) customer.dialogueStage = 3;
    });
    fallbackDailyText(Boolean(state.daily.generatedText));
    applyDeclineReactions();
  }

  function declineReaction(customer) {
    const item = product(customer.plannedProductId);
    if (!item) return '今日は気になるパンが見つからなかったから、見るだけにしておくね。';
    if (item.price > customer.budget) return `「${item.name}」は予算を超えてしまうから、今日は見送るね。`;
    if (item.price >= item.recommendedPrice * 1.25) return `「${item.name}」は少し高めだから、今日は見送るね。`;
    const relation = productMatches(item, customer, animal(customer.animalId));
    if (relation.disliked.length) return `「${item.name}」の${relation.disliked[0]}は少し苦手で、今日は見送るね。`;
    if (!relation.matches.length) return `今日は${customer.reason}に合うパンが見つからなくて、見るだけにするね。`;
    return `「${item.name}」も気になるけれど、今日は買わずに帰るね。`;
  }

  function applyDeclineReactions() {
    state.daily.customers.forEach(customer => {
      if (customer.plannedPurchase) return;
      customer.reaction = declineReaction(customer);
      customer.declineReaction = customer.reaction;
      if (customer.resolved && !customer.boughtProductId) customer.resultText = customer.reaction;
    });
  }

  async function openShop() {
    if (busy || state.phase !== 'planning') return;
    if (!state.products.some(item => item.stock > 0)) return showNotice('在庫がありません。パンを製造してから開店してください。', true);
    if (!state.daily.customers.length) {
      const count = baseVisitorCount();
      state.daily.midEvent = chooseMiddayEvent(count);
      const rareIndex = state.daily.midEvent?.id === 'rare_arrival' ? state.daily.midEvent.targetIndex : -1;
      state.daily.customers = makeVisitors(count, rareIndex);
      state.daily.visitors = count;
      state.daily.openingStocks = Object.fromEntries(state.products.filter(item => item.stock > 0).map(item => [item.id, item.stock]));
      if (state.daily.midEvent) state.daily.events.push({ phase: 'serving', id: state.daily.midEvent.id, name: state.daily.midEvent.name, description: state.daily.midEvent.description });
    }
    prepareSalesPlan();
    writeSave();
    const shouldGenerate = !state.daily.generationStarted;
    if (shouldGenerate) {
      state.daily.generationStarted = true;
      writeSave();
    }
    busy = true;
    renderPanel();
    updateTabs();
    try {
      const context = {
        event: { id: state.daily.morningEvent.id, name: state.daily.morningEvent.name, description: state.daily.morningEvent.description },
        customers: state.daily.customers.slice(0, DAILY_TEXT_CUSTOMER_LIMIT).map(customer => {
          const profile = animal(customer.animalId);
          const record = customerRecord(profile.id);
          const offered = product(customer.plannedProductId);
          return { customerId: customer.id, name: profile.name, species: profile.species, personality: profile.personality,
            affection: record.affection, mood: customer.mood, reason: customer.reason,
            hints: [...customer.needIngredients, ...customer.needTags], rare: customer.isRare, budget: customer.budget,
            plannedPurchase: customer.plannedPurchase, declineReason: customer.plannedPurchase ? '' : declineReaction(customer),
            plannedProduct: offered ? { name: offered.name, price: offered.price, tags: offered.tags, feature: offered.specialFeature || offered.description } : null };
        })
      };
      let usedFallback = false;
      if (shouldGenerate) {
        try {
          const scriptedCustomers = state.daily.customers.slice(0, DAILY_TEXT_CUSTOMER_LIMIT);
          const text = validateDailyText(await callApi('daily', context, {}, DAILY_API_TIMEOUT_MS), scriptedCustomers);
          state.daily.eventName = text.event.name.trim();
          state.daily.eventDescription = text.event.description.trim();
          if (state.daily.events[0]) {
            state.daily.events[0].name = state.daily.eventName;
            state.daily.events[0].description = state.daily.eventDescription;
          }
          const byId = new Map(text.customers.map(item => [item.customerId, item]));
          scriptedCustomers.forEach(customer => Object.assign(customer, byId.get(customer.id)));
          fallbackDailyText(true);
          state.daily.generatedText = true;
        } catch (_) {
          fallbackDailyText();
          usedFallback = true;
        }
        state.daily.generationFinished = true;
      } else if (!state.daily.generatedText) {
        fallbackDailyText();
        state.daily.generationFinished = true;
        usedFallback = true;
      }
      applyDeclineReactions();
      state.phase = 'serving';
      servicePaused = false;
      serviceFast = false;
      if (!state.daily.visitorsRecorded) {
        state.daily.customers.forEach(customer => {
          const record = customerRecord(customer.animalId);
          record.discovered = true;
          record.visits++;
        });
        state.daily.visitorsRecorded = true;
      }
      checkAchievements();
      writeSave();
      if (usedFallback) showNotice('営業日のAI文章を取得できなかったため、定型文で開店しました。');
    } finally {
      busy = false;
      activeTab = 'shop';
      renderPanel();
      updateTabs();
      if (state.phase === 'serving') scheduleBusinessTick();
    }
  }

  function productMatches(productItem, visitor, profile) {
    const ingredients = productItem.ingredients.map(value => value.toLocaleLowerCase('ja'));
    const wantedIngredients = profile.likesIngredients.concat(visitor.needIngredients).map(value => value.toLocaleLowerCase('ja'));
    const dislikedIngredients = profile.dislikesIngredients.map(value => value.toLocaleLowerCase('ja'));
    const tags = cleanTags(productItem.tags);
    const dislikedTags = profile.dislikesTags;
    const matches = [];
    const disliked = [];
    wantedIngredients.forEach(word => { if (ingredients.some(value => value.includes(word))) matches.push(word); });
    [...profile.likesFlavors, ...profile.likesTextures, ...profile.likesTags].forEach(word => { if (tags.includes(word)) matches.push(word); });
    visitor.needTags.forEach(word => { if (tags.includes(word)) matches.push(word); });
    dislikedIngredients.forEach(word => { if (ingredients.some(value => value.includes(word))) disliked.push(word); });
    dislikedTags.forEach(word => { if (tags.includes(word)) disliked.push(word); });
    return { matches: [...new Set(matches)], disliked: [...new Set(disliked)] };
  }

  function purchaseChance(customer, item) {
    const profile = animal(customer.animalId);
    const relation = productMatches(item, customer, profile);
    let score = 50;
    score += Math.min(36, relation.matches.filter(tag => profile.likesIngredients.includes(tag) || customer.needIngredients.includes(tag)).length * 18);
    score += Math.min(24, relation.matches.filter(tag => !profile.likesIngredients.includes(tag) && !customer.needIngredients.includes(tag)).length * 12);
    score -= Math.min(45, relation.disliked.length * 30);
    for (const tag of item.tags) score += customer.dailyEvent?.pointsByTag?.[tag] || state.daily.morningEvent.pointsByTag?.[tag] || 0;
    if (state.daily.midEvent?.targetIndex === state.daily.index) {
      if (state.daily.midEvent.id === 'birthday' && relation.matches.length) score += 15;
      if (state.daily.midEvent.id === 'popular_tag' && item.tags.includes(state.daily.midEvent.tag)) score += 15;
    }
    const priceModifier = clamp((1 - item.price / item.recommendedPrice) * 40, -60, 20);
    score += priceModifier;
    return { chance: clamp(score, 5, 90), matches: relation.matches, disliked: relation.disliked, priceModifier };
  }

  function addAffection(animalId, amount) {
    const record = customerRecord(animalId);
    const before = record.affection;
    record.affection = clamp(record.affection + amount, 0, 5);
    const change = record.affection - before;
    if (change && state.daily) state.daily.affectionChanges[animalId] = (state.daily.affectionChanges[animalId] || 0) + change;
    return change;
  }

  function offerBread(productId) {
    if (state.phase !== 'serving') return;
    const customer = state.daily.customers[state.daily.index];
    const item = product(productId);
    if (!customer || customer.resolved || !item || item.stock <= 0) return;
    const profile = animal(customer.animalId);
    const result = purchaseChance(customer, item);
    const bought = Boolean(customer.plannedPurchase);
    customer.resolved = true;
    if (bought) {
      const bulk = (customer.plannedQuantity || 1) > 1;
      const quantity = Math.min(item.stock, Math.max(1, Number(customer.plannedQuantity) || 1));
      item.stock -= quantity;
      item.soldTotal += quantity;
      state.totalSales += item.price * quantity;
      state.daily.sales += item.price * quantity;
      state.daily.buyers++;
      state.daily.salesByProduct[item.id] = (state.daily.salesByProduct[item.id] || 0) + quantity;
      state.daily.salesByProductNames[item.id] = item.name;
      const record = customerRecord(profile.id);
      record.purchases++;
      record.purchasedProducts.unshift(item.id);
      record.purchasedProducts = [...new Set(record.purchasedProducts)].slice(0, 30);
      record.history.unshift({ day: state.day, productId: item.id, productName: item.name, quantity });
      record.history = record.history.slice(0, 30);
      let affectionGain = addAffection(profile.id, 1);
      if (state.daily.midEvent?.targetIndex === state.daily.index && state.daily.midEvent.id === 'birthday') affectionGain += addAffection(profile.id, 1);
      customer.boughtProductId = item.id;
      customer.boughtQuantity = quantity;
      customer.resultTitle = '買ってくれた！';
      customer.resultText = customer.reaction || customer.purchaseReaction || `わあ、「${item.name}」をありがとう！`;
      customer.resultReason = `購入判定 ${result.chance}% · 好みとの一致 ${result.matches.length}件${result.disliked.length ? ` · 苦手な特徴 ${result.disliked.length}件` : ''}${bulk ? ' · まとめ買いでもう1個' : ''} · 好感度 ${affectionGain > 0 ? `+${affectionGain}` : '変化なし'}`;
      if (customer.isRare && profile.id === 'dragon') unlockAchievement('dragon_sale');
      unlockAchievement('first_sale');
      if (state.daily.midEvent?.targetIndex === state.daily.index && state.daily.midEvent.id === 'bulk_order') {
        const entry = state.daily.events.find(itemEvent => itemEvent.id === 'bulk_order');
        if (entry) entry.result = bulk ? `${item.name}を${quantity}個販売しました。` : '購入には至りませんでした。';
      }
    } else {
      customer.resultTitle = '今回は見送り';
      customer.resultText = customer.reaction || customer.declineReaction || '今日は違う気分みたい。また来るね。';
      customer.resultReason = `購入判定 ${result.chance}% · 好みとの一致 ${result.matches.length}件${result.disliked.length ? ` · 苦手な特徴 ${result.disliked.length}件` : ''}`;
    }
    checkAchievements();
    writeSave();
    renderPanel();
  }

  function resolveAutomaticCustomer() {
    const daily = state.daily;
    const customer = daily.customers[daily.index];
    if (!customer || customer.resolved) return;
    const item = product(customer.plannedProductId);
    if (!customer.plannedPurchase || !item || item.stock <= 0) {
      customer.resolved = true;
      customer.resultTitle = '今日はお買い上げなし';
      customer.resultText = customer.reaction || customer.declineReaction || '今日は見るだけにしておくね。';
      writeSave();
      renderPanel();
      return;
    }
    offerBread(item.id);
  }

  function dialogueDelay(customer) {
    const lines = [customer.greeting, customer.reasonLine, customer.interest, customer.reaction, customer.farewell];
    const line = String(lines[clamp(customer.dialogueStage, 0, lines.length - 1)] || '');
    const duration = clamp(1050 + [...line].length * 32, 1450, 2600);
    return serviceFast ? Math.round(duration * 0.48) : duration;
  }

  function scheduleBusinessTick(delay) {
    clearTimeout(serviceTimer);
    if (state?.phase !== 'serving' || servicePaused) return;
    const current = state.daily.customers[state.daily.index];
    const wait = Number.isFinite(delay) ? delay : dialogueDelay(current || {});
    serviceTimer = setTimeout(() => {
      if (state?.phase !== 'serving') return;
      const daily = state.daily;
      const customer = daily.customers[daily.index];
      if (!customer) return finishDay();
      if (customer.dialogueStage === 2 && !customer.resolved) {
        resolveAutomaticCustomer();
      }
      if (customer.dialogueStage < 4) {
        customer.dialogueStage++;
        writeSave();
        renderPanel();
        scheduleBusinessTick();
        return;
      }
      if (daily.index + 1 >= daily.customers.length) return finishDay();
      daily.index++;
      writeSave();
      renderPanel();
      scheduleBusinessTick();
    }, wait);
  }

  function skipCurrentConversation() {
    if (state?.phase !== 'serving') return;
    const customer = state.daily.customers[state.daily.index];
    if (!customer) return;
    clearTimeout(serviceTimer);
    if (!customer.resolved) resolveAutomaticCustomer();
    if (state.daily.index + 1 >= state.daily.customers.length) return finishDay();
    state.daily.index++;
    writeSave();
    renderPanel();
    scheduleBusinessTick(250);
  }

  function unlockAchievement(id) {
    // Achievement records from older saves are retained, but this UI no longer progresses them.
    return false;
  }

  function checkAchievements() {
    return;
  }

  function runCloseEvent() {
    if (Math.random() >= 0.15) return;
    const candidates = ['contest', 'friendship'];
    const type = randomItem(candidates);
    if (type === 'contest') {
      const winner = state.daily.sales >= state.daily.goal;
      state.daily.closeEvent = { id: 'contest', name: '森のパンコンテスト', description: winner ? '今日の売上目標を達成し、コンテストで入賞しました。' : '森のパンコンテストに参加しました。次は入賞を目指しましょう。' };
      if (winner) unlockAchievement('forest_contest');
    } else {
      const friends = ANIMALS.filter(item => state.animals[item.id]?.discovered && state.animals[item.id].affection >= 1 && state.animals[item.id].affection < 5);
      if (!friends.length) {
        state.daily.closeEvent = { id: 'contest', name: '森のパンコンテスト', description: '今日の売上目標を達成すると入賞できるコンテストが開かれています。' };
        state.daily.events.push({ phase: 'close', ...state.daily.closeEvent });
        return;
      }
      const friend = randomItem(friends);
      addAffection(friend.id, 1);
      state.daily.closeEvent = { id: 'friendship', name: `${friend.name}との特別な交流`, description: `${friend.name}が閉店後に訪ねてきて、少し仲良くなりました。` };
    }
    state.daily.events.push({ phase: 'close', ...state.daily.closeEvent });
  }

  function finishDay() {
    if (state.phase !== 'serving' || state.daily.archived) return;
    clearTimeout(serviceTimer);
    const metGoal = state.daily.sales >= state.daily.goal;
    state.missedGoalStreak = metGoal ? 0 : state.missedGoalStreak + 1;
    const starting = Object.entries(state.daily.openingStocks).filter(([, amount]) => amount > 0);
    if (starting.length && starting.every(([id]) => (product(id)?.stock || 0) === 0)) unlockAchievement('sellout');
    runCloseEvent();
    checkAchievements();
    state.history.push({
      day: state.day, goal: state.daily.goal, sales: state.daily.sales, visitors: state.daily.customers.length,
      buyers: state.daily.buyers, salesByProduct: { ...state.daily.salesByProduct },
      salesByProductNames: { ...state.daily.salesByProductNames }, affectionChanges: { ...state.daily.affectionChanges },
      remainingStock: Object.fromEntries(state.products.map(item => [item.id, item.stock])),
      remainingStockNames: Object.fromEntries(state.products.map(item => [item.id, item.name])),
      morningEventId: state.daily.morningEvent.id, events: state.daily.events.map(item => ({ ...item }))
    });
    state.daily.archived = true;
    state.phase = metGoal ? 'results' : 'gameOver';
    activeTab = 'results';
    writeSave();
    renderPanel();
  }

  function advanceDay() {
    if (state.phase !== 'results') return;
    state.day++;
    initializeDay();
    activeTab = 'shop';
    writeSave();
    renderPanel();
  }

  function setDraftValue(field, value) {
    developmentDraft[field] = value;
    state.developmentDraft = { ...developmentDraft };
    writeSave();
  }

  function stepPrice(itemId, amount) {
    const item = product(itemId);
    if (!item || item.archived || state.phase !== 'planning') return;
    item.price = normalizePrice(item, item.price + amount);
    writeSave();
    renderPanel();
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const tab = target.closest('[data-tab]');
    if (tab) { setTab(tab.dataset.tab); return; }
    const tabLink = target.closest('[data-tab-link]');
    if (tabLink) { setTab(tabLink.dataset.tabLink); return; }
    const button = target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'open') openShop();
    else if (action === 'develop') developProduct(false);
    else if (action === 'develop-omakase') developProduct(true);
    else if (action === 'retry-product') developProduct(pendingProductOmakase, true);
    else if (action === 'register-product') registerPendingProduct();
    else if (action === 'cancel-product') {
      if (!busy) { pendingProduct = null; pendingProductIdea = ''; pendingProductOmakase = false; renderPanel(); }
    } else if (action === 'idea-shortcut') appendIdea(button.dataset.value || '');
    else if (action === 'manufacture') manufacture(button.dataset.id);
    else if (action === 'undo-manufacture') undoManufacture(button.dataset.id);
    else if (action === 'price-step') stepPrice(button.dataset.id, Number(button.dataset.step) || 0);
    else if (action === 'advance') advanceDay();
    else if (action === 'restart') openRestartDialog();
    else if (action === 'open-prepare' && state.phase === 'planning') { activeTab = 'prepare'; renderPanel(); }
    else if (action === 'open-develop' && state.phase === 'planning') { activeTab = 'develop'; renderPanel(); }
    else if (action === 'toggle-fast') { serviceFast = !serviceFast; renderPanel(); }
    else if (action === 'toggle-pause') {
      servicePaused = !servicePaused;
      clearTimeout(serviceTimer);
      renderPanel();
      if (!servicePaused) scheduleBusinessTick();
    }
    else if (action === 'skip-customer') skipCurrentConversation();

  });

  document.addEventListener('input', event => {
    const target = event.target;
    if (target.matches('[data-draft]')) setDraftValue(target.dataset.draft, target.value);
  });

  document.addEventListener('change', event => {
    const target = event.target;
    if (!target.matches('[data-price]')) return;
    const item = product(target.dataset.price);
    if (!item || item.archived || state.phase !== 'planning') return;
    item.price = normalizePrice(item, target.value);
    writeSave();
    renderPanel();
  });

  $('newGame').addEventListener('click', openRestartDialog);
  $('continueGame').addEventListener('click', continueGame);
  $('confirmRestart').addEventListener('click', confirmNewGame);
  $('restartDialog').addEventListener('close', () => { pendingRestart = false; });
  $('helpButton').addEventListener('click', () => $('helpDialog').showModal());

  const saved = readSave();
  const legacy = convertibleV5Read();
  let oldKeyExists = false;
  try { oldKeyExists = LEGACY_KEYS.some(key => Boolean(localStorage.getItem(key))); } catch (_) { /* localStorage unavailable */ }
  $('continueGame').disabled = !saved && !legacy;
  $('saveNotice').textContent = saved ? `保存データ：第${saved.day}日（続きから再開できます）` : legacy ? '以前のセーブデータがあります。続きからを選ぶと、元データを残して引き継ぎます。' : oldKeyExists ? '以前のセーブデータは変更せず保管しています。' : 'ゲームの進行状況は自動保存されます。';
})();
