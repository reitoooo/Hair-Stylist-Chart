"""
SOAP Chart Generator Service.

Auto-generates SOAP (Subjective, Objective, Assessment, Plan) chart entries from:
- User questionnaire data
- AI chat history
- Refined style details
- Recipe data

Can be overridden/edited by the stylist after initial generation.
"""

from datetime import datetime, timezone
import uuid


def generate_soap_chart(
    booking_id: str,
    stylist_id: str,
    questionnaire: dict | None = None,
    chat_history: list[dict] | None = None,
    refined_details: list[str] | None = None,
    desired_style: str = "",
    allergy_data: dict | None = None,
) -> dict:
    """
    Auto-generate a SOAP chart from available booking data.

    S (Subjective): Client's own words, concerns, wishes
    O (Objective): Measurable/observable data
    A (Assessment): Professional analysis
    P (Plan): Treatment plan
    """
    q = questionnaire or {}

    # ─── S: Subjective (主観的情報) ───
    subjective_parts = []

    # From chat history — extract user messages
    if chat_history:
        user_messages = [m["text"] for m in chat_history if m.get("sender") == "user"]
        if user_messages:
            subjective_parts.append("【お客様の事前相談内容】")
            for msg in user_messages[:5]:
                subjective_parts.append(f"  ・「{msg}」")

    # From refined details
    if refined_details:
        subjective_parts.append("\n【希望スタイルのこだわり条件（AIカウンセリングより）】")
        for detail in refined_details:
            subjective_parts.append(f"  ・{detail}")

    # From additional notes
    if q.get("additional_notes"):
        subjective_parts.append(f"\n【お客様からの補足メモ】\n  {q['additional_notes']}")

    if desired_style:
        subjective_parts.append(f"\n【希望のヘアスタイル】\n  {desired_style}")

    if not subjective_parts:
        subjective_parts.append("(カウンセリング情報がありません。お客様とのカウンセリングを完了させてください。)")

    # ─── O: Objective (客観的情報) ───
    objective_parts = []

    if q:
        hair_length_map = {
            "short": "ショート",
            "bob": "ボブ",
            "medium": "ミディアム",
            "long": "ロング",
            "very_long": "スーパーロング",
        }
        objective_parts.append("【髪質の状態診断】")
        objective_parts.append(f"  ・髪の長さ: {hair_length_map.get(q.get('hair_length', ''), '不明')}")
        objective_parts.append(f"  ・ブリーチ履歴: {q.get('bleach_count', 0)}回")
        objective_parts.append(f"  ・黒染め履歴: {'あり（' + str(q.get('black_dye_count', 0)) + '回）' if q.get('has_black_dye') else 'なし'}")
        objective_parts.append(f"  ・縮毛矯正履歴: {'あり' if q.get('has_straightening') else 'なし'}")
        objective_parts.append(f"  ・パーマ履歴: {'あり' if q.get('has_perm') else 'なし'}")
        objective_parts.append(f"  ・現在の髪色: {q.get('current_hair_color', '未記入')}")
        objective_parts.append(f"  ・自己評価ダメージレベル: {q.get('damage_level', 'N/A')}/5")

        # Expanded fields
        if q.get("straightening_count", 0) > 0:
            objective_parts.append(f"  ・縮毛矯正の回数: {q['straightening_count']}回")
            if q.get("straightening_date"):
                objective_parts.append(f"  ・最終の縮毛矯正: {q['straightening_date']}")

        if q.get("perm_count", 0) > 0:
            objective_parts.append(f"  ・パーマの回数: {q['perm_count']}回")
            if q.get("perm_date"):
                objective_parts.append(f"  ・最終のパーマ: {q['perm_date']}")
            if q.get("perm_count_over_5"):
                objective_parts.append("  ・⚠️ パーマ履歴5回以上（毛髪構造の脆弱性に注意）")

        if q.get("previous_chemicals"):
            objective_parts.append(f"  ・前回の使用薬剤: {q['previous_chemicals']}")

    # Allergy information
    if allergy_data:
        objective_parts.append("\n【アレルギー・リスクチェック結果】")
        if allergy_data.get("has_skin_trouble"):
            objective_parts.append(f"  ・⚠️ 肌トラブル歴: {allergy_data.get('skin_trouble_detail', 'あり')}")
        if allergy_data.get("has_allergy"):
            objective_parts.append(f"  ・⚠️ アレルギー物質: {allergy_data.get('allergy_detail', 'あり')}")
        if allergy_data.get("has_scalp_sensitivity"):
            objective_parts.append("  ・⚠️ 頭皮がしみやすい敏感肌")
        if allergy_data.get("has_previous_reaction"):
            objective_parts.append(f"  ・⚠️ 過去の副反応: {allergy_data.get('previous_reaction_detail', 'あり')}")
        if allergy_data.get("has_patch_test"):
            objective_parts.append(f"  ・パッチテスト履歴: {allergy_data.get('patch_test_result', '異常なし')}")
        else:
            objective_parts.append("  ・パッチテスト: 未実施（施術前の実施を推奨）")

    if not objective_parts:
        objective_parts.append("(問診票が未入力です。お客様に入力を依頼してください。)")

    # ─── A: Assessment (評価・見立て) ───
    assessment_parts = []
    risk_level = "低リスク"
    damage = q.get("damage_level", 1)
    bleach = q.get("bleach_count", 0)

    if damage >= 4 or bleach >= 4:
        risk_level = "高リスク"
    elif damage >= 3 or bleach >= 2:
        risk_level = "中リスク"

    assessment_parts.append(f"【総合施術リスク判定: {risk_level}】")

    if damage >= 4:
        assessment_parts.append("  ・髪のダメージレベルが非常に高い状態です。強い薬剤による施術は避ける必要があります。")
        assessment_parts.append("  ・カラーやパーマの前に、髪の強度を回復させる修復トリートメントを推奨します。")
    elif damage >= 3:
        assessment_parts.append("  ・中程度のダメージが検出されました。低アルカリの優しい薬剤を使用し、十分な前処理（PPT/CMC補給）を行ってください。")
    else:
        assessment_parts.append("  ・健康的な髪状態であり、通常の施術は問題なく進行可能です。")

    if q.get("has_black_dye") and desired_style and any(word in desired_style.lower() for word in ["beige", "ash", "high tone", "ベージュ", "アッシュ", "ブリーチ"]):
        assessment_parts.append("  ・⚠️ 黒染めの履歴があるため、ご希望のハイトーンカラーにするには赤みが残りやすく、複数回の施術が必要になる可能性があります。")

    if q.get("has_straightening") and q.get("has_perm"):
        assessment_parts.append("  ・⚠️ 縮毛矯正とパーマの両方の履歴があります。毛髪結合が著しく弱っている可能性があるため、極めて慎重に施術する必要があります。")

    # Allergy-related assessment
    has_allergy_risk = allergy_data and (
        allergy_data.get("has_allergy") or
        allergy_data.get("has_skin_trouble") or
        allergy_data.get("has_previous_reaction")
    )
    if has_allergy_risk:
        assessment_parts.append("  ・⚠️ アレルギーリスクが検出されました。いかなる薬剤施術の前にも、パッチテストを必ず実施してください。")

    # ─── P: Plan (施術計画) ───
    plan_parts = []
    plan_parts.append("【施術計画】")
    plan_parts.append("  1. 最もダメージの激しい箇所でストランドテストを実施")
    plan_parts.append("  2. 髪の弾力と多孔性を評価")

    if has_allergy_risk:
        plan_parts.append("  3. ⚠️ 施術48時間前にパッチテストを実施")
    else:
        plan_parts.append("  3. 薬剤使用に関するクライアントの同意を確認")

    if damage >= 3:
        plan_parts.append("  4. 結合強化剤（OLAPLEX等）による前処理を塗布")
    plan_parts.append(f"  {'5' if damage >= 3 else '4'}. AI推奨レシピに沿って施術を進行")
    plan_parts.append(f"  {'6' if damage >= 3 else '5'}. 後処理トリートメントの実施およびホームケアのご案内")

    plan_parts.append("\n【次回のご提案・アフターケア】")
    plan_parts.append("  ・次回目安: 4〜6週間後のカラーメンテナンス")
    if damage >= 3:
        plan_parts.append("  ・2週間以内のサロントリートメントによるケアを推奨")
    plan_parts.append("  ・ホームケア: アミノ酸系シャンプー、週1回のヘアマスク使用")

    return {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "stylist_id": stylist_id,
        "subjective": "\n".join(subjective_parts),
        "objective": "\n".join(objective_parts),
        "assessment": "\n".join(assessment_parts),
        "plan": "\n".join(plan_parts),
        "is_ai_generated": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
