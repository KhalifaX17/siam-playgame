const MASCOT_DIALOGUES = {
  north: [
    'ยินดีต้อนฮับสู่ลานล้านนาเจ้า! มาลองเล่นเดินขาโหย่งหรือปั่นบ่าข่างกั๋นเต๊อะ!',
    'ฮู้ก่อเจ้า? โคมลอยยี่เป็งลอยได้เพราะอากาศร้อนข้างในเบากว่าอากาศเย็นข้างนอกนะเจ้า!'
  ],
  isan: [
    'มาเด้อมาเล่นนำกัน ม่วนคักๆ! ลองเป่าแคนตามจังหวะหรือยิงบั้งไฟเบิ่งเด้อ!',
    'แคนเป็นเครื่องดนตรีพื้นบ้านอีสานที่เฮ็ดจากไม้กู่แคน เสียงม่วนหลาย!'
  ],
  central: [
    'สวัสดีครับ! มาประลองปัญญาชักเย่อ หรือดวลคีย์บอร์ด 2 คนในสนามประลองยุทธ์กันได้เลย!',
    'ว่าวจุฬาและว่าวปักเป้าเป็นศิลปะการเล่นว่าวไทยที่มีมาตั้งแต่สมัยสุโขทัยเลยนะ!'
  ],
  south: [
    'หรอยจังฮู้! มาวิ่งเดินกะลาริมหาดหรือทายเงาหนังตะลุงแดนใต้กันเลย!',
    'พะยูนเป็นสัตว์เลี้ยงลูกด้วยนมในทะเลที่กินหญ้าทะเลเป็นอาหาร ช่วยกันอนุรักษ์นะ!'
  ]
};

const DEFAULT_QUESTIONS = [
  { region: 'north', q: 'คำว่า "กิ๋นข้าวแลง" ในภาษาเหนือหมายถึงมื้อใด?', options: ['อาหารเช้า', 'อาหารกลางวัน', 'อาหารเย็น', 'อาหารว่าง'], correct: 2 },
  { region: 'north', q: 'เครื่องหมายรูปตัว V ไขว้บนหลังคาเรือนไทยภาคเหนือเรียกว่าอะไร?', options: ['ช่อฟ้า', 'กาแล', 'ใบระกา', 'หางหงส์'], correct: 1 },
  { region: 'isan', q: 'เครื่องดนตรีชนิดใดเป็นสัญลักษณ์สำคัญของภาคอีสาน?', options: ['ซออู้', 'แคน', 'สะล้อ', 'กลองยาว'], correct: 1 },
  { region: 'isan', q: 'บั้งไฟทะยานขึ้นสู่ท้องฟ้าได้ด้วยหลักการทางวิทยาศาสตร์ข้อใด?', options: ['แรงโน้มถ่วง', 'แรงกิริยา-ปฏิกิริยา', 'แรงแม่เหล็ก', 'แรงลอยตัวในน้ำ'], correct: 1 },
  { region: 'central', q: 'แม่น้ำสายหลักที่หล่อเลี้ยงพื้นที่ภาคกลางของไทยคือแม่น้ำใด?', options: ['แม่น้ำโขง', 'แม่น้ำปิง', 'แม่น้ำเจ้าพระยา', 'แม่น้ำตาปี'], correct: 2 },
  { region: 'central', q: 'ว่าวไทยชนิดใดมีรูปร่างคล้ายดาว 5 แฉก?', options: ['ว่าวปักเป้า', 'ว่าวจุฬา', 'ว่าวงู', 'ว่าวดุ๊ยดุ่ย'], correct: 1 },
  { region: 'south', q: 'ตัวตลกชื่อดังในการแสดงหนังตะลุงภาคใต้คือใคร?', options: ['ไอ้เท่ง', 'ขุนแผน', 'สังข์ทอง', 'สุดสาคร'], correct: 0 },
  { region: 'south', q: 'สัตว์ทะเลหายากที่เป็นสัญลักษณ์ของจังหวัดตรังคือสัตว์ชนิดใด?', options: ['วาฬบรูด้า', 'พะยูน', 'โลมาอิรวดี', 'ฉลามวาฬ'], correct: 1 }
];

const PRESET_PACKS = {
  sci: [
    { region: 'north', q: 'ดาวเคราะห์ดวงใดอยู่ใกล้ดวงอาทิตย์มากที่สุด?', options: ['ดาวศุกร์', 'ดาวพุธ', 'ดาวอังคาร', 'โลก'], correct: 1 },
    { region: 'isan', q: 'พืชใช้ก๊าซชนิดใดในกระบวนการสังเคราะห์ด้วยแสง?', options: ['ออกซิเจน', 'ไนโตรเจน', 'คาร์บอนไดออกไซด์', 'ไฮโดรเจน'], correct: 2 },
    { region: 'central', q: 'สูตรโมเลกุลของน้ำคือข้อใด?', options: ['CO2', 'H2O', 'O2', 'NaCl'], correct: 1 },
    { region: 'south', q: 'สถานะของสสารที่มีรูปร่างและปริมาตรคงที่คือข้อใด?', options: ['ของแข็ง', 'ของเหลว', 'แก๊ส', 'พลาสมา'], correct: 0 }
  ],
  eng: [
    { region: 'north', q: 'คำว่า "Library" แปลว่าสถานที่ใด?', options: ['โรงพยาบาล', 'ห้องสมุด', 'สนามกีฬา', 'ตลาด'], correct: 1 },
    { region: 'isan', q: 'คำตรงข้าม (Antonym) ของคำว่า "Ancient" คือข้อใด?', options: ['Old', 'Modern', 'Historic', 'Traditional'], correct: 1 },
    { region: 'central', q: 'สัตว์ชนิดใดในภาษาอังกฤษเรียกว่า "Dugong"?', options: ['โลมา', 'พะยูน', 'แมวน้ำ', 'วาฬ'], correct: 1 },
    { region: 'south', q: 'ประโยคใดใช้ทักทายเมื่อพบกันครั้งแรกอย่างสุภาพ?', options: ['See you later', 'Nice to meet you', 'Good night', 'Take care'], correct: 1 }
  ]
};

const GAMES_CATALOG = [
  {
    id: 'temple_fair',
    title: 'ซุ้มงานวัด 4 ภาค: ยิงหนังสติ๊กเก็บแต้ม',
    region: 'special',
    regionLabel: '🔥 ฆ่าเวลา 1P (60 วิ)',
    icon: '🎪',
    desc: 'เกมฆ่าเวลาจับเวลา 60 วินาที! ยิงของดี 4 ภาคทำคอมโบเข้าโหมด Fever x2 และยิงหนังสือทองตอบคำถามต่อเวลา',
    stampId: 'stamp_temple',
    gameType: 'temple_fair'
  },
  {
    id: 'keyboard_fight',
    title: 'ศึกประลองยุทธ์คีย์บอร์ด 4 ภาค',
    region: 'special',
    regionLabel: '⚔️ ต่อสู้ 1P / 2P',
    icon: '🥊',
    desc: 'P1 กด WASD เดิน/กระโดด/นั่ง + Space ต่อย | P2 กดลูกศร + 0 ต่อย เก็บ Stack ครบ 3 ขั้นปล่อยท่าไม้ตาย!',
    stampId: 'stamp_fight',
    gameType: 'keyboard_fight'
  },
  {
    id: 'hide_seek',
    title: 'เกมซ่อนแอบ 4 ภาค (4-Region Hide & Seek)',
    region: 'special',
    regionLabel: '🙈 ซ่อนแอบ 1P / 2P',
    icon: '🙈',
    desc: 'เลือกแมพ 4 ภาค! เล่น 1 คนส่องหาเพื่อนที่แอบอยู่ หรือเล่น 2 คนผลัดกันเลือกจุดซ่อนและตอบคำถามจับตัว',
    stampId: 'stamp_hide',
    gameType: 'hide_seek'
  },
  {
    id: 'prop_hunt',
    title: 'เกมหาของตามบ้าน 4 ภาค (Prop Hunt)',
    region: 'special',
    regionLabel: '🔍 หาของ 4 แมพ',
    icon: '🏡',
    desc: 'สำรวจบ้านเรือนไทย 4 ภาค (เรือนกาแล, เรือนอีสาน, เรือนไทย, เรือนปั้นหยา) หาของมงคลที่ซ่อนอยู่ให้ครบ!',
    stampId: 'stamp_prop',
    gameType: 'prop_hunt'
  },
  {
    id: 'north_stilt',
    title: 'แข่งเดินขาโหย่ง (ไม้โกงเกง)',
    region: 'north',
    regionLabel: '🏔️ ภาคเหนือ',
    icon: '🎋',
    desc: 'ก้าวเดินบนไม้ไผ่สูงเข้าเส้นชัย! กดปุ่มก้าวสลับจังหวะและตอบคำถามคำเมืองเพื่อพุ่งแซง',
    stampId: 'stamp_north',
    gameType: 'race',
    p1Emoji: '🐘', p2Emoji: '🐃', actionText: 'ก้าวขาโหย่ง!'
  },
  {
    id: 'north_top',
    title: 'ปั่นบ่าข่างประลองแรงเหวี่ยง',
    region: 'north',
    regionLabel: '🏔️ ภาคเหนือ',
    icon: '🪀',
    desc: 'ปั่นลูกข่างล้านนาให้หมุนนานและแรงที่สุด สะสมรอบหมุนให้เต็มหลอดก่อนหมดเวลา',
    stampId: 'stamp_north',
    gameType: 'race',
    p1Emoji: '🌀', p2Emoji: '💫', actionText: 'ปั่นบ่าข่าง!'
  },
  {
    id: 'north_lantern',
    title: 'ปล่อยโคมลอยยี่เป็งสู่ฟ้า',
    region: 'north',
    regionLabel: '🏔️ ภาคเหนือ',
    icon: '🏮',
    desc: 'เติมลมร้อนให้โคมยี่เป็งลอยขึ้นสู่ท้องฟ้าล้านนา ตอบโจทย์วิทยาศาสตร์เพื่อเร่งความสูง',
    stampId: 'stamp_north',
    gameType: 'race',
    p1Emoji: '🏮', p2Emoji: '✨', actionText: 'เติมลมร้อน!'
  },
  {
    id: 'isan_rocket',
    title: 'บั้งไฟทะยานฟ้าม่วนซื่น',
    region: 'isan',
    regionLabel: '🌾 ภาคอีสาน',
    icon: '🚀',
    desc: 'จุดชนวนบั้งไฟแสนขึ้นสู่ก้อนเมฆ! กดรัวเติมแรงดันก๊าซและตอบคำถามเพื่อจุดบูสเตอร์',
    stampId: 'stamp_isan',
    gameType: 'race',
    p1Emoji: '🚀', p2Emoji: '🔥', actionText: 'จุดชนวนบั้งไฟ!'
  },
  {
    id: 'isan_khaen',
    title: 'ประชันเป่าแคนเสียงทอง',
    region: 'isan',
    regionLabel: '🌾 ภาคอีสาน',
    icon: '🎶',
    desc: 'เป่าแคนทำนองลำเพลินแข่งทำคะแนนความไพเราะ ตอบคำถามดนตรีพื้นบ้านรับโบนัส!',
    stampId: 'stamp_isan',
    gameType: 'race',
    p1Emoji: '🎼', p2Emoji: '🎵', actionText: 'เป่าแคน!'
  },
  {
    id: 'isan_wheel',
    title: 'แข่งกลิ้งยิงกงไม้ไผ่',
    region: 'isan',
    regionLabel: '🌾 ภาคอีสาน',
    icon: '🛞',
    desc: 'ตีวงล้อไม้ไผ่ให้กลิ้งเข้าเส้นชัยโดยไม่ล้ม สนุกได้ทั้งเดี่ยวและคู่',
    stampId: 'stamp_isan',
    gameType: 'race',
    p1Emoji: '🛞', p2Emoji: '🌾', actionText: 'ตีวงล้อ!'
  },
  {
    id: 'central_tug',
    title: 'ชักเย่อประลองปัญญา',
    region: 'central',
    regionLabel: '🏯 ภาคกลาง',
    icon: '🪢',
    desc: 'การละเล่นยอดฮิต! ออกแรงดึงเชือกและตอบคำถามความรู้รอบตัวเพื่อดึงอีกฝ่ายข้ามเส้น',
    stampId: 'stamp_central',
    gameType: 'race',
    p1Emoji: '🐒', p2Emoji: '👹', actionText: 'ดึงเชือก!'
  },
  {
    id: 'central_kite',
    title: 'ศึกชักว่าวจุฬา-ปักเป้า',
    region: 'central',
    regionLabel: '🏯 ภาคกลาง',
    icon: '🪁',
    desc: 'ชักสายป่านส่งว่าวขึ้นโต้ลมมรสุมเจ้าพระยา ใครส่งว่าวถึงยอดเมฆก่อนชนะ!',
    stampId: 'stamp_central',
    gameType: 'race',
    p1Emoji: '🪁', p2Emoji: '🎐', actionText: 'ชักสายป่าน!'
  },
  {
    id: 'central_monsonpha',
    title: 'มอญซ่อนผ้าวิ่งรอบวง',
    region: 'central',
    regionLabel: '🏯 ภาคกลาง',
    icon: '🧣',
    desc: 'วิ่งรอบวงวางผ้าและตอบปริศนาภาษาไทยให้ทันก่อนโดนจับได้!',
    stampId: 'stamp_central',
    gameType: 'race',
    p1Emoji: '🏃', p2Emoji: '🧣', actionText: 'วิ่งรอบวง!'
  },
  {
    id: 'south_coconut',
    title: 'วิ่งเดินกะลาริมหาดใต้',
    region: 'south',
    regionLabel: '🏝️ ภาคใต้',
    icon: '🥥',
    desc: 'ก้าวเดินบนกะลามะพร้าวริมทะเลอันดามัน ตอบคำถามอนุรักษ์ทะเลรับสปีดบูสต์!',
    stampId: 'stamp_south',
    gameType: 'race',
    p1Emoji: '🐬', p2Emoji: '🐢', actionText: 'เดินกะลา!'
  },
  {
    id: 'south_shadow',
    title: 'เชิดหนังตะลุงทายเงา',
    region: 'south',
    regionLabel: '🏝️ ภาคใต้',
    icon: '🎭',
    desc: 'เชิดตัวหนังตะลุงหน้าจอผ้าขาวและตอบปริศนาวัฒนธรรมปักษ์ใต้ให้ครบแต้ม',
    stampId: 'stamp_south',
    gameType: 'race',
    p1Emoji: '🎭', p2Emoji: '🕯️', actionText: 'เชิดหนังตะลุง!'
  },
  {
    id: 'south_boat',
    title: 'พายเรือกอและโต้คลื่น',
    region: 'south',
    regionLabel: '🏝️ ภาคใต้',
    icon: '🛶',
    desc: 'จ้วงฝีพายเรือกอและลวดลายวิจิตรเข้าเส้นชัยริมอ่าวไทย!',
    stampId: 'stamp_south',
    gameType: 'race',
    p1Emoji: '🛶', p2Emoji: '⛵', actionText: 'จ้วงพาย!'
  }
];

const PROP_MAPS = {
  north: {
    name: '🏔️ เรือนกาแล (ภาคเหนือ)',
    bg: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 55%, #78350f 55%, #451a03 100%)',
    items: [
      { icon: '☂️', name: 'ร่มบ่อสร้าง', x: 22, y: 65 },
      { icon: '🏮', name: 'โคมยี่เป็ง', x: 50, y: 28 },
      { icon: '🍲', name: 'ขันโตกอาหารเหนือ', x: 76, y: 74 },
      { icon: '🐘', name: 'ตุ๊กตาช้างไม้แกะสลัก', x: 38, y: 80 }
    ]
  },
  isan: {
    name: '🌾 เรือนอีสาน (ภาคอีสาน)',
    bg: 'linear-gradient(180deg, #fed7aa 0%, #ffedd5 55%, #92400e 55%, #78350f 100%)',
    items: [
      { icon: '🧺', name: 'กระติ๊บข้าวเหนียว', x: 25, y: 72 },
      { icon: '🎶', name: 'แคนไม้ไผ่', x: 68, y: 40 },
      { icon: '🧣', name: 'ผ้าไหมมัดหมี่', x: 48, y: 62 },
      { icon: '🚀', name: 'บั้งไฟจำลอง', x: 82, y: 76 }
    ]
  },
  central: {
    name: '🏯 เรือนไทยภาคกลาง',
    bg: 'linear-gradient(180deg, #fef08a 0%, #fef9c3 55%, #854d0e 55%, #713f12 100%)',
    items: [
      { icon: '🪁', name: 'ว่าวจุฬา', x: 30, y: 30 },
      { icon: '🥥', name: 'กะลามะพร้าว', x: 64, y: 78 },
      { icon: '🏺', name: 'เครื่องเบญจรงค์', x: 46, y: 68 },
      { icon: '🛶', name: 'เรือจำลองเจ้าพระยา', x: 80, y: 72 }
    ]
  },
  south: {
    name: '🏝️ เรือนปั้นหยา (ภาคใต้)',
    bg: 'linear-gradient(180deg, #99f6e4 0%, #ccfbf1 55%, #0f766e 55%, #115e59 100%)',
    items: [
      { icon: '🎭', name: 'ตัวหนังตะลุง', x: 26, y: 45 },
      { icon: '🐚', name: 'เปลือกหอยมุกอันดามัน', x: 54, y: 78 },
      { icon: '🌴', name: 'ลูกสะตอ', x: 75, y: 65 },
      { icon: '🐬', name: 'โมเดลพะยูน', x: 40, y: 72 }
    ]
  }
};

const HIDE_MAPS = {
  north: {
    name: '🏔️ ป่าไผ่และสวนดอกไม้ล้านนา',
    bg: 'linear-gradient(180deg, #e0f2fe 0%, #bbf7d0 60%, #15803d 100%)',
    spots: [
      { icon: '🎋', label: 'กอไผ่ยักษ์', x: 20, y: 65 },
      { icon: '🏯', label: 'ซุ้มประตูโขง', x: 50, y: 52 },
      { icon: '🌸', label: 'พุ่มดอกเอื้อง', x: 78, y: 68 },
      { icon: '🪨', label: 'โขดหินริมธาร', x: 35, y: 80 },
      { icon: '🛖', label: 'ศาลาพักใจ', x: 66, y: 45 }
    ]
  },
  isan: {
    name: '🌾 ทุ่งดอกกระเจียวและเถียงนา',
    bg: 'linear-gradient(180deg, #ffedd5 0%, #fde68a 60%, #65a30d 100%)',
    spots: [
      { icon: '🛖', label: 'เถียงนาน้อย', x: 24, y: 56 },
      { icon: '🌷', label: 'ดงดอกกระเจียว', x: 52, y: 74 },
      { icon: '🌾', label: 'กองฟางข้าว', x: 78, y: 64 },
      { icon: '🌳', label: 'ต้นยางนา', x: 38, y: 48 },
      { icon: '🐃', label: 'คอกควายทุ่ง', x: 68, y: 80 }
    ]
  },
  central: {
    name: '🏯 ตลาดน้ำและสวนผลไม้ภาคกลาง',
    bg: 'linear-gradient(180deg, #fef9c3 0%, #bae6fd 65%, #0284c7 100%)',
    spots: [
      { icon: '🛶', label: 'เรือขายผลไม้', x: 22, y: 75 },
      { icon: '🌉', label: 'สะพานไม้ข้ามคลอง', x: 50, y: 55 },
      { icon: '🥭', label: 'สวนมะม่วง', x: 78, y: 58 },
      { icon: '🏺', label: 'ตุ่มน้ำหน้าเรือน', x: 36, y: 66 },
      { icon: '🏪', label: 'ร้านขนมไทย', x: 66, y: 76 }
    ]
  },
  south: {
    name: '🏝️ เกาะปะการังและป่าชายเลน',
    bg: 'linear-gradient(180deg, #ccfbf1 0%, #fde047 65%, #0d9488 100%)',
    spots: [
      { icon: '🌴', label: 'ดงต้นมะพร้าว', x: 22, y: 54 },
      { icon: '⛵', label: 'เรือกอและจอดฝั่ง', x: 50, y: 72 },
      { icon: '🪸', label: 'โขดหินปะการัง', x: 78, y: 76 },
      { icon: '🌿', label: 'รากโกงกาง', x: 36, y: 68 },
      { icon: '⛱️', label: 'ร่มชายหาด', x: 68, y: 55 }
    ]
  }
};

const STAMPS_LIST = [
  { id: 'stamp_temple', icon: '🎪', name: 'เซียนซุ้มงานวัด' },
  { id: 'stamp_fight', icon: '🥊', name: 'จ้าวยุทธจักร 4 ภาค' },
  { id: 'stamp_hide', icon: '🙈', name: 'ยอดนักซ่อนแอบ' },
  { id: 'stamp_prop', icon: '🔍', name: 'นักสำรวจเรือนไทย' },
  { id: 'stamp_north', icon: '🏔️', name: 'ผู้พิชิตลานล้านนา' },
  { id: 'stamp_isan', icon: '🌾', name: 'ผู้พิชิตลานม่วนซื่น' },
  { id: 'stamp_central', icon: '🏯', name: 'ผู้พิชิตลานเจ้าพระยา' },
  { id: 'stamp_south', icon: '🏝️', name: 'ผู้พิชิตลานแดนสะตอ' }
];
