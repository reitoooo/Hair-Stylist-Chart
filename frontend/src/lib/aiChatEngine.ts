/**
 * AI Chat Engine — Advanced conversational chat logic for the style consultation.
 *
 * Provides context-aware responses that simulate a real stylist conversation,
 * including face-shape analysis, personalized advice, and proactive suggestions.
 */

import type { QuestionnaireData } from '../types';

export interface ChatContext {
  topicsDiscussed: Set<string>;
  questionsAsked: number;
  currentStyle: string;
  currentColor: string;
  currentPerm: string;
  hasDiscussedDamage: boolean;
  hasDiscussedFaceShape: boolean;
  hasDiscussedLifestyle: boolean;
  hasDiscussedMaintenance: boolean;
  hasDiscussedPerm: boolean;
}

export function createInitialContext(): ChatContext {
  return {
    topicsDiscussed: new Set(),
    questionsAsked: 0,
    currentStyle: '',
    currentColor: '',
    currentPerm: 'none',
    hasDiscussedDamage: false,
    hasDiscussedFaceShape: false,
    hasDiscussedLifestyle: false,
    hasDiscussedMaintenance: false,
    hasDiscussedPerm: false,
  };
}

interface AIResponse {
  text: string;
  tags: string[];
  styleChange?: string;
  colorChange?: string;
  permChange?: string;
  followUpQuestion?: string;
}

/**
 * Generate an AI response based on the user's message, context, and questionnaire data.
 */
export function generateAIResponse(
  message: string,
  context: ChatContext,
  qData: QuestionnaireData | null,
): AIResponse {
  const textLower = message.toLowerCase();
  const tags: string[] = [];
  let text = '';
  let styleChange: string | undefined;
  let colorChange: string | undefined;
  let permChange: string | undefined;
  let followUpQuestion: string | undefined;

  // ─── Face Shape & Suitability Consultation ───
  if (matchesAny(textLower, ['似合う', '顔型', '顔の形', '丸顔', '面長', '卵型', 'フェイス'])) {
    context.hasDiscussedFaceShape = true;
    context.topicsDiscussed.add('face_shape');
    tags.push('顔型診断：パーソナル分析済み');

    text = `素晴らしい質問です！顔型に合わせた提案をしますね。

AIによる顔型分析の結果、以下のポイントが重要です：

🔍 **分析結果**
• 顔の輪郭に合わせて、サイドのボリュームと前髪のバランスを調整することで、最も美しいシルエットが作れます
• ${qData?.hair_length === 'short' || qData?.hair_length === 'bob'
  ? 'ショート〜ボブの場合、顔まわりの毛束を活かしたフレーミングが効果的です'
  : 'ミディアム〜ロングの場合、レイヤーの入れ方で印象が大きく変わります'}

💡 **おすすめポイント**
• 前髪は目の上ギリギリの長さが、目元を大きく見せる黄金バランスです
• 顔まわりに後れ毛を作ると、小顔効果が期待できます

他にも「前髪の長さ」や「サイドの量感」など、気になる部分はありますか？`;
    followUpQuestion = '前髪の長さやスタイリングで気になることは？';
    return { text, tags, styleChange, colorChange, permChange, followUpQuestion };
  }

  // ─── Lifestyle & Maintenance Consultation ───
  if (matchesAny(textLower, ['ライフスタイル', '普段', '日常', 'セット', 'スタイリング', '朝', '時間', '楽'])) {
    context.hasDiscussedLifestyle = true;
    context.topicsDiscussed.add('lifestyle');
    tags.push('ライフスタイル：相談済み');

    text = `毎日のスタイリングについても大切なポイントですね！

⏰ **スタイリング時間の目安**
• 今のベーススタイルなら、朝のセットは約5-10分で仕上がります
• ドライヤーで8割乾かして、軽くコテやアイロンで整えるだけでOK

🎯 **お手入れのしやすさを考えると**
${qData?.damage_level && qData.damage_level >= 3
  ? '• 現在のダメージレベルを考慮して、熱ダメージの少ないスタイリングを心がけましょう\n• ヒートプロテクトスプレーは必須です'
  : '• 比較的ダメージが少ないので、コテ巻きも楽しめます\n• 週1回のヘアマスクでツヤをキープできます'}

「毎朝もっと楽にしたい」「特別な日の巻き方」なども相談できますよ！`;
    return { text, tags, styleChange, colorChange, permChange };
  }

  // ─── Perm Consultation ───
  if (matchesAny(textLower, ['パーマ', 'ウェーブ', 'カール', '巻き', 'ゆるふわ', 'スパイラル'])) {
    context.hasDiscussedPerm = true;
    context.topicsDiscussed.add('perm');

    // Check feasibility based on questionnaire
    const hasStraightening = qData?.has_straightening || false;
    const damageLevel = qData?.damage_level || 1;
    const permCount = qData?.perm_count || 0;

    if (hasStraightening && damageLevel >= 3) {
      tags.push('パーマ：⚠️ リスク要注意');
      text = `パーマのご希望ですね。率直にお伝えすると、現在の髪の状態ではいくつか注意点があります。

⚠️ **リスク要因**
• 縮毛矯正の履歴があり、パーマの薬剤との相性で髪に大きな負担がかかる可能性があります
• ダメージレベルが${damageLevel}/5と${damageLevel >= 4 ? '高め' : 'やや高め'}のため、チリつきや断毛のリスクがあります
${permCount >= 5 ? '• パーマ施術5回以上の履歴があり、毛髪構造が弱っている可能性があります' : ''}

💡 **代替案のご提案**
• コテやアイロンでの「巻き髪スタイリング」なら、同じようなウェーブ感を低リスクで実現できます
• どうしてもパーマをご希望の場合は、サイステアミン系の低ダメージパーマ液をおすすめします

安全第一で施術方法を提案させていただきます。詳しくは担当スタイリストとご相談ください。`;
    } else {
      // Determine perm type from message
      if (matchesAny(textLower, ['ゆるふわ', 'ゆる', 'ナチュラル', 'ゆるめ'])) {
        permChange = 'loose_wave';
        tags.push('パーマ：ゆるふわウェーブ');
        text = `ゆるふわウェーブのパーマですね！今とても人気のスタイルです✨

🌊 **おすすめパーマタイプ：ルーズウェーブ**
• 大きめのロッドで巻くことで、自然で柔らかいウェーブを作ります
• 乾かすだけでキマるので、朝のスタイリングが格段に楽になります
• ${qData?.hair_length === 'medium' || qData?.hair_length === 'long' ? '今のレングスとの相性◎' : 'ボブ以上の長さだとより映えます'}

シミュレーションに「ゆるふわウェーブ」を反映しました！`;
      } else if (matchesAny(textLower, ['スパイラル', '強め', 'しっかり', 'くるくる'])) {
        permChange = 'spiral';
        tags.push('パーマ：スパイラルパーマ');
        text = `スパイラルパーマで個性的なスタイルを作りましょう！

🔄 **スパイラルパーマの特徴**
• 縦巻きの立体的なカールで、ボリュームと動きが出ます
• スタイリングはムースやジェルで揉み込むだけでOK
• メンズにもレディースにも人気のスタイルです

シミュレーションに反映しました！`;
      } else if (matchesAny(textLower, ['ボディ', 'ニュアンス', 'ふんわり'])) {
        permChange = 'body_perm';
        tags.push('パーマ：ボディパーマ');
        text = `ボディパーマでナチュラルなボリューム感を出しましょう！

✨ **ボディパーマの魅力**
• 根元からふんわり立ち上がりが出て、ペタンコ髪の悩みを解消
• カールというよりも「ボリュームアップ」のイメージ
• 他のパーマに比べてダメージが少ないのもポイントです

シミュレーションに反映しました！`;
      } else {
        permChange = 'loose_wave';
        tags.push('パーマ：ウェーブパーマ');
        text = `パーマをご希望ですね！今の髪の状態なら${damageLevel <= 2 ? '問題なく施術可能' : '注意しながら施術可能'}です。

どのようなパーマがお好みですか？
• **ゆるふわウェーブ** — ナチュラルで柔らかい印象
• **スパイラルパーマ** — しっかりカールで個性的に
• **ボディパーマ** — ふんわりボリュームアップ

お好みを教えていただければ、シミュレーションに反映します！`;
      }
    }
    return { text, tags, styleChange, colorChange, permChange };
  }

  // ─── Style Changes ───
  let styleChanged = false;
  let matchedStyleName = '';
  if (textLower.includes('ショート')) {
    styleChange = 'short'; matchedStyleName = 'ショート'; styleChanged = true;
  } else if (textLower.includes('ボブ')) {
    styleChange = 'bob'; matchedStyleName = 'ボブ'; styleChanged = true;
  } else if (textLower.includes('ミディアム')) {
    styleChange = 'medium'; matchedStyleName = 'ミディアム'; styleChanged = true;
  } else if (matchesAny(textLower, ['ロング', '長め'])) {
    styleChange = 'long'; matchedStyleName = 'ロング'; styleChanged = true;
  }

  // ─── Color Changes ───
  let colorChanged = false;
  let matchedColorName = '';
  if (matchesAny(textLower, ['アッシュ', 'グレー', '灰'])) {
    colorChange = 'ash'; matchedColorName = 'アッシュグレー'; colorChanged = true;
  } else if (matchesAny(textLower, ['ベージュ', 'ミルクティー'])) {
    colorChange = 'beige'; matchedColorName = 'ミルクティーベージュ'; colorChanged = true;
  } else if (matchesAny(textLower, ['ピンク', '赤'])) {
    colorChange = 'pink'; matchedColorName = 'ピンクブラウン'; colorChanged = true;
  } else if (matchesAny(textLower, ['ブラウン', '茶'])) {
    colorChange = 'brown'; matchedColorName = 'ナチュラルブラウン'; colorChanged = true;
  } else if (matchesAny(textLower, ['ブラック', '黒', '暗髪'])) {
    colorChange = 'black'; matchedColorName = 'ブルーブラック'; colorChanged = true;
  }

  // ─── Specific Detail Requests ───
  if (matchesAny(textLower, ['前髪', 'シースルー', 'うすめ', '薄'])) {
    tags.push('前髪：シースルーバング');
    text = `シースルーバングのご要望ですね！前髪の毛量を薄く整えることで、おでこが透けて抜け感が出て、目元がはっきりと明るい印象になります。

💇 **ポイント**
• 額の透け感が今っぽいトレンド感を演出
• 顔型を選ばず、どんな方にも似合いやすい
• ${context.hasDiscussedFaceShape ? '先ほどの顔型分析とも相性バッチリです！' : '顔型に合わせた微調整も可能です'}

シミュレーションに反映しました！他にこだわりたいポイントはありますか？`;
  } else if (matchesAny(textLower, ['レイヤー', '軽', 'すいて', 'すく'])) {
    tags.push('カット：レイヤーカット（軽め）');
    text = `レイヤーカットを追加しました！

✂️ **レイヤーの効果**
• 顔まわりや全体に段差を入れることで、軽やかさと動きが出やすくなります
• 普段のコテ巻きも立体的でおしゃれに仕上がります
• ${qData?.hair_length === 'long' || qData?.hair_length === 'very_long'
    ? '長めのレングスなので、ローレイヤーで上品な軽さを出すのがおすすめです'
    : 'ミディアム〜ボブなら、くびれレイヤーで小顔効果も期待できます'}`;
  } else if (matchesAny(textLower, ['毛先', 'ワンカール', 'ハネ'])) {
    tags.push('スタイリング：毛先ワンカール');
    text = `毛先のワンカールスタイリングですね！毛先を内巻き、または外ハネのワンカールにするだけで、大人可愛くまとまります。

🎯 **仕上がりイメージ**
• 内巻き → 清楚で上品な印象
• 外ハネ → こなれ感のあるカジュアルスタイル
• ミックス巻き → 動きのある華やかスタイル

レシピに「毛先ワンカールの仕上げ」を追加しました！`;
  } else if (matchesAny(textLower, ['ダメージ', '傷', '痛', 'いたみ', 'ケアブリーチ'])) {
    context.hasDiscussedDamage = true;
    tags.push('ヘアケア：低ダメージ・ケアブリーチ優先');
    text = `髪のダメージを抑えたいのですね。大切なお悩みです！

🛡️ **ダメージ軽減プラン**
${qData?.damage_level && qData.damage_level >= 3
  ? `• 現在のダメージレベル(${qData.damage_level}/5)を考慮し、最も優しい処方を組みます`
  : '• ダメージは比較的軽いですが、予防的ケアを組み込みます'}
• ケアブリーチ（OLAPLEX等）でダメージを最大98%削減
• 中間処理でPPT結合補修トリートメントを実施
• 後処理で酸性リンスとモイスチャーマスクをプラス

${qData?.bleach_count && qData.bleach_count >= 2
  ? `⚠️ ブリーチ${qData.bleach_count}回の履歴があるため、特に中間〜毛先のケアを重点的に行います`
  : ''}

これでハイトーンもツヤを保ちやすくなります！`;
  } else if (matchesAny(textLower, ['ブリーチなし', 'ブリーチしたくない'])) {
    tags.push('施術方法：ブリーチなしダブルカラー');
    colorChange = 'pink';
    text = `ブリーチなしのダブルカラーをご希望ですね！

💡 **ブリーチなしダブルカラーとは**
• 1回目：一番明るいライトナーでベースを限界まで明るく
• 2回目：希望のカラーを重ねる
• ブリーチより大幅にダメージを抑えられます

🎨 **実現できる色味**
• ピンクブラウン、オリーブベージュ、ラベンダーグレージュなど
• アッシュ系やミルクティー系はブリーチなしだと透明感が出にくい場合があります

シミュレーションには「ピンクブラウン」を反映しました！`;
  } else if (styleChanged && colorChanged) {
    tags.push(`スタイル：${matchedStyleName}`);
    tags.push(`カラー：${matchedColorName}`);
    text = `全体のイメージを「${matchedStyleName}」×「${matchedColorName}」に変更しました！

✨ 大人っぽく透明感のある組み合わせで、とてもお似合いだと思います。このスタイルにさらに前髪や毛先のディテール、パーマの有無など、細かいこだわりを加えていきますか？`;
    followUpQuestion = 'パーマやレイヤーなど、さらにこだわりたい部分は？';
  } else if (styleChanged) {
    tags.push(`スタイル：${matchedStyleName}`);
    text = `髪の長さ・ベーススタイルを「${matchedStyleName}」に変更しました！全体の雰囲気が変わりましたね。

${matchedStyleName === 'ショート' ? '🔥 ショートスタイルは骨格がきれいに見えて、小顔効果も抜群です！' :
  matchedStyleName === 'ボブ' ? '💎 ボブは丸みのあるシルエットで、上品さと可愛さのバランスが◎' :
  matchedStyleName === 'ミディアム' ? '✨ ミディアムはアレンジの幅が広く、オン・オフどちらにも対応しやすい万能レングスです' :
  '🌸 ロングスタイルは女性らしい印象で、巻き方次第で毎日違う雰囲気を楽しめます'}

毛先の動きや前髪のカット方法など、さらにこだわりたい部分はありますか？`;
  } else if (colorChanged) {
    tags.push(`カラー：${matchedColorName}`);
    const requiresBleach = matchedColorName === 'ミルクティーベージュ' || matchedColorName === 'アッシュグレー';
    if (requiresBleach && qData?.has_black_dye) {
      text = `髪色を「${matchedColorName}」にシミュレーションしました！

⚠️ **注意点**
黒染めの履歴があるため、ブリーチ1回では赤みが残りやすい可能性があります。
• 髪に優しいケアブリーチで徐々にトーンアップすることをおすすめします
• 2回に分けて施術するのが安全で、仕上がりもきれいです

施術リスクメモにも記載しておきました！`;
    } else {
      text = `髪色を「${matchedColorName}」に変更しました！

🎨 ${matchedColorName}の特徴
${matchedColorName === 'アッシュグレー' ? '• 透明感と抜け感が出る人気No.1カラー\n• 肌をきれいに見せる効果もあります' :
  matchedColorName === 'ミルクティーベージュ' ? '• 柔らかく優しい印象のハイトーンカラー\n• 髪に透明感が出て、外国人風の質感に' :
  matchedColorName === 'ピンクブラウン' ? '• 暖かみのある女性らしいカラー\n• ブリーチなしでも実現可能なのが嬉しいポイント' :
  matchedColorName === 'ナチュラルブラウン' ? '• 自然で上品な色合い\n• オフィスにもOK、万能カラーです' :
  '• クールでモードな印象\n• 光に当たると透ける青みが美しいカラーです'}

パーソナルカラーにも映える色味です。ケア方法やカットの調整もお気軽にどうぞ！`;
    }
  } else {
    // Generic response with proactive follow-up
    const newTag = `要望：${message.substring(0, 15)}${message.length > 15 ? '...' : ''}`;
    tags.push(newTag);

    // Proactive suggestions based on what hasn't been discussed
    const suggestions: string[] = [];
    if (!context.hasDiscussedFaceShape) suggestions.push('「どんな顔型に似合う？」');
    if (!context.hasDiscussedPerm) suggestions.push('「パーマをかけたい」');
    if (!context.hasDiscussedDamage) suggestions.push('「ダメージを抑えたい」');
    if (!context.hasDiscussedLifestyle) suggestions.push('「朝のスタイリングを楽にしたい」');

    text = `ご要望「${message}」を承りました！こだわり条件に追加し、施術レシピとスタイリストへの伝達事項へ反映しました。

${suggestions.length > 0 ? `\n💬 他にもこんな相談ができます：\n${suggestions.map(s => `  • ${s}`).join('\n')}\n\n何でもお気軽にどうぞ！` : 'とことんこだわりをお聞きしますので、他にご希望があれば遠慮なくお申し付けくださいね。'}`;
  }

  context.questionsAsked++;
  return { text, tags, styleChange, colorChange, permChange, followUpQuestion };
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}
