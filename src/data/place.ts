export const place = {
  name: "龍門の滝",
  kana: "りゅうもんのたき",
  englishName: "Ryumon Falls",
  area: "栃木県那須烏山市",
  city: "那須烏山市",
  cityEnglish: "Nasukarasuyama",
  state: "栃木県",
  stateEnglish: "Tochigi",
  country: "日本",
  countryEnglish: "Japan",
  countryCode: "JP",
  postalCode: "321-0633",
  streetAddress: "滝414",
  address: "〒321-0633 栃木県那須烏山市滝414",
  addressEnglish: "414 Taki, Nasukarasuyama, Tochigi 321-0633, Japan",
  plusCode: "J4WQ+6W 那須烏山市 栃木県",
  nearbyLandmark1: "龍門ふるさと民芸館",
  nearbyLandmark2: "太平寺",
  telephone: "+81-287-83-2765",
  latitude: 36.6455986,
  longitude: 140.1398144,
  size: "高さ約20m・幅約65m",
  fee: "見学無料",
  parking: "普通車約50台・無料",
  station: "JR烏山線 滝駅から徒歩約5分",
  car交通: "北関東自動車道 宇都宮上三川ICから車で約45〜50分",
  facilityHours: "龍門ふるさと民芸館 9:00〜16:00／龍門カフェ 10:00〜15:00",
  facilityClosed: "毎週火曜日、年末年始。祝日の場合は翌日休館の案内あり。",
  ratingValue: "4.1",
  reviewCount: "2796",
  reviewCountLabel: "2,796",
  ratingSource: "Google マップ（Google Maps）のユーザー評価",
  ratingSyncedAt: "2026年9月",
  ratingSyncedYearMonth: "2026-09",
  ratingSourceNote:
    "Google マップのユーザー評価を引用しています。最新の評価・口コミは必ず Google マップの掲載ページでご確認ください。",
  description:
    "江川にかかる幅広の滝。大蛇が棲むという伝説、男釜・女釜の甌穴、滝の上を走るJR烏山線の風景が重なり、四季ごとに表情を変える那須烏山の景勝地です。",
  shortDescription:
    "滝・列車・民話が一枚の風景になる、那須烏山の静かな名瀑。",
  recommendedStay: "滝だけなら30〜45分、民芸館・カフェ・太平寺まで巡るなら60〜90分",
  bestSeason: "新緑の初夏、紅葉の秋、条件が合う冬の氷瀑、春の桜が人気です。"
} as const;

export const mapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3201.201675451455!2d140.1398144!3d36.64559860000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6021dd822e761117%3A0xd438758a36a7f932!2sRyumon%20Falls!5e0!3m2!1sja!2sjp!4v1785485469303!5m2!1sja!2sjp";

export const googleMapsShareUrl = "https://maps.app.goo.gl/J2wZZzp5F75kgLmy7";
export const googleMapsReviewsUrl = googleMapsShareUrl;
export const googleMapsSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`${place.englishName} ${place.addressEnglish}`);

export const entityTrail = [
  place.name,
  place.city,
  place.state,
  place.country
] as const;

export const officialLinks = [
  {
    name: "那須烏山市 公式ホームページ",
    url: "https://www.city.nasukarasuyama.lg.jp/",
    note: "所在地・施設案内・観光情報の一次情報。"
  },
  {
    name: "那須烏山市観光協会",
    url: "https://www.nasukarasuyama.com/",
    note: "那須烏山エリアの観光情報・イベント情報。"
  },
  {
    name: "栃木県 公式ホームページ",
    url: "https://www.pref.tochigi.lg.jp/",
    note: "栃木県の観光・交通・防災などの公式案内。"
  },
  {
    name: "日本政府観光局（JNTO）",
    url: "https://www.jnto.go.jp/",
    note: "日本全国の公式観光情報ポータル。"
  }
] as const;

export const siteNavigation = [
  { label: "見どころ", href: "/guide/" },
  { label: "交通・駐車場", href: "/access/" },
  { label: "旅の計画", href: "/planning/" },
  { label: "写真", href: "/gallery/" },
  { label: "記念カード", href: "/memorial-card/" },
  { label: "質問", href: "/faq/" }
] as const;

export const images = [
  {
    src: "/images/ryumon-falls-hero.webp",
    thumb: "/images/ryumon-falls-hero-thumb.webp",
    alt: "水しぶきを上げる龍門の滝の正面風景",
    title: "水面から仰ぐ大滝",
    caption: "滝壺近くから見上げる、幅広い岩肌と白い水流。"
  },
  {
    src: "/images/ryumon-falls-sakura.webp",
    thumb: "/images/ryumon-falls-sakura-thumb.webp",
    alt: "桜と龍門の滝",
    title: "春の桜",
    caption: "淡い花色と滝の白さが重なる、やわらかな季節。"
  },
  {
    src: "/images/ryumon-falls-summer.webp",
    thumb: "/images/ryumon-falls-summer-thumb.webp",
    alt: "新緑に包まれる龍門の滝",
    title: "初夏の新緑",
    caption: "木々の緑と水音に包まれる、涼を感じる時間。"
  },
  {
    src: "/images/ryumon-falls-autumn.webp",
    thumb: "/images/ryumon-falls-autumn-thumb.webp",
    alt: "紅葉の季節の龍門の滝",
    title: "紅葉の気配",
    caption: "赤や黄に染まる周辺の木々が、滝の輪郭を引き立てます。"
  },
  {
    src: "/images/ryumon-falls-winter.webp",
    thumb: "/images/ryumon-falls-winter-thumb.webp",
    alt: "冬の龍門の滝と水面の氷",
    title: "冬の静けさ",
    caption: "冷え込む時期は、滝と水面に凛とした表情が現れます。"
  },
  {
    src: "/images/ryumon-falls-ice.webp",
    thumb: "/images/ryumon-falls-ice-thumb.webp",
    alt: "氷瀑が見られる冬の龍門の滝",
    title: "条件が合う日の氷瀑",
    caption: "厳寒の朝だけ出会えることがある、透明な冬景色。"
  },
  {
    src: "/images/ryumon-falls-train.webp",
    thumb: "/images/ryumon-falls-train-thumb.webp",
    alt: "龍門の滝の上を走るJR烏山線の列車",
    title: "滝と列車",
    caption: "JR烏山線が滝の上を通る数秒が、人気の撮影タイミング。"
  }
] as const;

export const highlights = [
  {
    title: "幅65mの水のカーテン",
    text: "落差約20mながら横幅が広く、岩肌を滑る水流を正面からゆったり眺められます。"
  },
  {
    title: "男釜・女釜の甌穴",
    text: "滝の中段には水流が長い時間をかけて岩を削った甌穴があり、自然の造形を感じられます。"
  },
  {
    title: "大蛇伝説と太平寺",
    text: "滝壺に大蛇が棲むという民話が伝わり、近くの太平寺と合わせて歩くと土地の物語が立ち上がります。"
  },
  {
    title: "滝上を走るJR烏山線",
    text: "列車が通過する一瞬を狙えば、滝・鉄道・森が重なる那須烏山らしい一枚に。"
  }
] as const;

export const seasons = [
  { season: "春", theme: "桜と柔らかな光", note: "水辺の散策と写真に向きます。足元は歩きやすい靴がおすすめ。" },
  { season: "初夏", theme: "新緑と水音", note: "涼しさを感じやすい季節。水量と日差しで印象が変わります。" },
  { season: "秋", theme: "紅葉と滝の白", note: "木々の色づきと滝を一緒に楽しめます。午前中は光が穏やか。" },
  { season: "冬", theme: "静けさと氷瀑", note: "冷え込み次第で凍結風景に出会えることがあります。防寒と滑りに注意。" }
] as const;

export const accessSteps = [
  {
    title: "電車で行く",
    body: "JR烏山線「滝駅」下車。駅から龍門ふるさと民芸館・滝入口方面へ徒歩約5分です。列車本数は限られるため、帰りの時刻を先に確認してから散策すると安心です。"
  },
  {
    title: "車で行く",
    body: "北関東自動車道 宇都宮上三川IC方面から那須烏山市へ。現地周辺は生活道路もあるため、ナビの案内後は案内板と歩行者に注意して進みます。"
  },
  {
    title: "滝まで歩く",
    body: "駐車場または民芸館付近から遊歩道へ。階段や濡れた石があるため、雨の後や冬は滑りにくい靴が向いています。"
  }
] as const;

export const foodSpots = [
  {
    name: "龍門カフェ",
    type: "カフェ",
    distance: "滝のすぐ近く",
    note: "民芸館に併設される休憩スポット。滝見学の前後に立ち寄りやすい位置です。"
  },
  {
    name: "らぁめん花",
    type: "ラーメン",
    distance: "徒歩圏の候補",
    note: "短時間の滝見学と合わせやすい、気軽な食事候補。"
  },
  {
    name: "シマダヤ",
    type: "食堂系",
    distance: "車で数分圏の候補",
    note: "那須烏山の町歩きや駅方面と合わせて検討しやすい一軒。"
  },
  {
    name: "松月庵 八溝そば",
    type: "そば・和食",
    distance: "車で数分圏の候補",
    note: "滝と和の昼食を組み合わせたい時の候補です。"
  }
] as const;

export const nearbyAttractions = [
  {
    name: "龍門ふるさと民芸館",
    distance: "すぐ隣",
    note: "民話や地域の文化に触れられる無料施設。カフェ休憩にも便利です。"
  },
  {
    name: "太平寺",
    distance: "徒歩圏",
    note: "龍門の滝の伝説と合わせて訪ねたい、静かな寺院。"
  },
  {
    name: "山あげ会館",
    distance: "車で数分圏",
    note: "那須烏山のユネスコ無形文化遺産に関わる山あげ祭を知る展示施設。"
  },
  {
    name: "島崎酒造",
    distance: "車で数分圏",
    note: "洞窟酒蔵で知られる酒蔵。大人の那須烏山散策に。"
  },
  {
    name: "烏山和紙会館",
    distance: "車で数分圏",
    note: "地域の手仕事に触れたい時に組み合わせやすいスポット。"
  }
] as const;

export const faqItems = [
  {
    question: "龍門の滝の見学料金はかかりますか？",
    answer: "滝の見学は無料です。龍門ふるさと民芸館も入館無料の案内があります。"
  },
  {
    question: "駐車場はありますか？",
    answer: "無料駐車場があります。観光向けには普通車約50台の案内があり、民芸館側にも駐車スペースがあります。"
  },
  {
    question: "電車だけで行けますか？",
    answer: "JR烏山線の滝駅から徒歩約5分で行けます。列車本数は多くないため、往復の時刻を先に確認しておくと安心です。"
  },
  {
    question: "ベビーカーや高齢者でも歩けますか？",
    answer: "民芸館周辺は立ち寄りやすい一方、滝壺近くは階段・坂・濡れた足元があります。無理をせず、天候や体力に合わせて鑑賞位置を選んでください。"
  },
  {
    question: "滝と列車の写真はいつ撮れますか？",
    answer: "JR烏山線が滝の上を通過する数秒が撮影チャンスです。時刻表を確認し、鉄道敷地や私有地に入らず安全な場所から撮影してください。"
  },
  {
    question: "おすすめの滞在時間は？",
    answer: "滝を眺めるだけなら30〜45分ほど。民芸館、カフェ、太平寺を合わせるなら60〜90分ほど見ておくと余裕があります。"
  },
  {
    question: "龍門の滝の所在地はどこですか？",
    answer: "〒321-0633 栃木県那須烏山市滝414（英語表記：414 Taki, Nasukarasuyama, Tochigi 321-0633, Japan）です。プラスコードは「J4WQ+6W 那須烏山市 栃木県」です。"
  },
  {
    question: "トイレはありますか？",
    answer: "滝周辺と隣接する施設側に利用できるトイレがあります。数は多くないため、到着前に済ませておくと安心です。"
  },
  {
    question: "電気自動車の充電やガソリンスタンドは近くにありますか？",
    answer: "給油設備と充電設備はいずれも幹線道路沿いと市街地方面に点在します（おおよそ車で10〜25分圏）。山間部へ向かう前に残量を確認しておくと安心です。"
  },
  {
    question: "Google マップの評価はいくつですか？",
    answer: "2026年9月時点の Google マップのユーザー評価は 4.1（2,796件）です。評価と件数は変動するため、最新の口コミは Google マップの掲載ページでご確認ください。"
  }
] as const;
