/**
 * 学術論文ベース評価システム
 * 4つの研究論文から得られた関節角度データを活用したAI評価
 */

class AcademicBasedEvaluator {
  constructor() {
    this.academicData = null;
    this.loadedStudies = new Map();
    this.evaluationHistory = [];
    this.initialized = false;
  }

  /**
   * 学術データの初期化読み込み
   */
  async initialize() {
    try {
      console.log("📚 学術論文データベース初期化中...");

      // academic-joint-angles.json を読み込み
      const response = await fetch("/data/academic-joint-angles.json");
      this.academicData = await response.json();

      // 各研究データを個別に処理
      await this.processStudyData();

      this.initialized = true;
      console.log("✅ 学術データベース初期化完了");
      console.log(
        `📊 読み込み完了: ${this.academicData.metadata.total_studies}件の研究, ${this.academicData.metadata.total_participants}名の参加者`
      );
    } catch (error) {
      console.error("❌ 学術データ読み込みエラー:", error);
      await this.loadFallbackData();
    }
  }

  /**
   * 各研究データの個別処理
   */
  async processStudyData() {
    const studies = this.academicData.studies;

    // Okubo & Hubbard (2015) データ処理
    this.loadedStudies.set("okubo_hubbard", {
      citation: studies.okubo_hubbard_2015.citation,
      optimalRanges: studies.okubo_hubbard_2015.joint_angles,
      participants: studies.okubo_hubbard_2015.participants.total,
      methodology: studies.okubo_hubbard_2015.methodology,
      keyFindings: studies.okubo_hubbard_2015.key_findings,
    });

    // 近畿大学 今泉 (2024) データ処理
    this.loadedStudies.set("kinki_imaizumi", {
      citation: studies.kinki_imaizumi_2024.citation,
      skillComparison: studies.kinki_imaizumi_2024.joint_angles,
      participants: studies.kinki_imaizumi_2024.participants,
      methodology: studies.kinki_imaizumi_2024.methodology,
      significance: studies.kinki_imaizumi_2024.statistical_significance,
    });

    // 安松谷ら (2011) データ処理
    this.loadedStudies.set("anmatsuya", {
      citation: studies.anmatsuya_2011.citation,
      expertNoviceComparison: studies.anmatsuya_2011.joint_angles,
      participants: studies.anmatsuya_2011.participants,
      methodology: studies.anmatsuya_2011.methodology,
      keyFindings: studies.anmatsuya_2011.key_findings,
    });

    // 東京大学院データ処理
    this.loadedStudies.set("tokyo_university", {
      citation: studies.tokyo_university_throwing.citation,
      kinematicSequence: studies.tokyo_university_throwing.kinematic_sequence,
      accuracyAnalysis: studies.tokyo_university_throwing.accuracy_analysis,
      participants: studies.tokyo_university_throwing.participants,
    });

    console.log(
      "📊 研究データ処理完了:",
      Array.from(this.loadedStudies.keys())
    );
  }

  /**
   * ユーザーの動作を学術データベースと比較評価
   */
  async evaluateWithAcademicEvidence(
    userPoseData,
    analysisType = "comprehensive"
  ) {
    if (!this.initialized) {
      await this.initialize();
    }

    const evaluation = {
      timestamp: new Date().toISOString(),
      overall_assessment: "",
      academic_evidence: {},
      skill_level_prediction: "",
      recommendations: [],
      cited_studies: [],
      confidence_score: 0,
      detailed_analysis: {},
    };

    try {
      console.log("🔬 学術的根拠に基づく評価開始...");

      // 1. Okubo & Hubbard基準での評価
      const okuboEval = await this.evaluateAgainstOkubo(userPoseData);
      evaluation.academic_evidence.okubo_hubbard = okuboEval;

      // 2. 近畿大学データとの比較
      const kinkiEval = await this.evaluateAgainstKinki(userPoseData);
      evaluation.academic_evidence.kinki_university = kinkiEval;

      // 3. 安松谷データとの比較
      const anmatsuyaEval = await this.evaluateAgainstAnmatsuya(userPoseData);
      evaluation.academic_evidence.anmatsuya_study = anmatsuyaEval;

      // 4. 東京大学運動連鎖解析
      const tokyoEval = await this.evaluateKinematicSequence(userPoseData);
      evaluation.academic_evidence.tokyo_university = tokyoEval;

      // 5. 総合評価の算出
      evaluation = await this.synthesizeAcademicEvaluation(evaluation);

      // 6. 評価履歴に記録
      this.evaluationHistory.push(evaluation);

      console.log("✅ 学術的評価完了");
      return evaluation;
    } catch (error) {
      console.error("❌ 学術評価エラー:", error);
      throw error;
    }
  }

  /**
   * Okubo & Hubbard (2015) 基準での評価
   */
  async evaluateAgainstOkubo(userPoseData) {
    const okuboData = this.loadedStudies.get("okubo_hubbard");
    const userAngles = this.extractUserJointAngles(userPoseData);

    const evaluation = {
      study_citation: okuboData.citation,
      methodology: okuboData.methodology,
      participants: okuboData.participants,
      angle_analysis: {},
      overall_fit: 0,
      recommendations: [],
    };

    // 肩関節評価
    if (userAngles.shoulder) {
      const shoulderRange = okuboData.optimalRanges.shoulder.optimal_range;
      evaluation.angle_analysis.shoulder = {
        user_angle: userAngles.shoulder,
        optimal_range: [shoulderRange.min, shoulderRange.max],
        within_optimal:
          userAngles.shoulder >= shoulderRange.min &&
          userAngles.shoulder <= shoulderRange.max,
        deviation: this.calculateDeviation(
          userAngles.shoulder,
          shoulderRange.min,
          shoulderRange.max
        ),
        biomechanical_significance:
          okuboData.optimalRanges.shoulder.biomechanical_significance,
      };
    }

    // 肘関節評価
    if (userAngles.elbow) {
      const elbowRange = okuboData.optimalRanges.elbow.optimal_range;
      evaluation.angle_analysis.elbow = {
        user_angle: userAngles.elbow,
        optimal_range: [elbowRange.min, elbowRange.max],
        within_optimal:
          userAngles.elbow >= elbowRange.min &&
          userAngles.elbow <= elbowRange.max,
        deviation: this.calculateDeviation(
          userAngles.elbow,
          elbowRange.min,
          elbowRange.max
        ),
        biomechanical_significance:
          okuboData.optimalRanges.elbow.biomechanical_significance,
      };
    }

    // 手首関節評価
    if (userAngles.wrist) {
      const wristRange = okuboData.optimalRanges.wrist.optimal_range;
      evaluation.angle_analysis.wrist = {
        user_angle: userAngles.wrist,
        optimal_range: [wristRange.min, wristRange.max],
        within_optimal:
          userAngles.wrist >= wristRange.min &&
          userAngles.wrist <= wristRange.max,
        deviation: this.calculateDeviation(
          userAngles.wrist,
          wristRange.min,
          wristRange.max
        ),
        biomechanical_significance:
          okuboData.optimalRanges.wrist.biomechanical_significance,
      };
    }

    // 総合適合度計算
    const withinOptimalCount = Object.values(evaluation.angle_analysis).filter(
      (a) => a.within_optimal
    ).length;
    evaluation.overall_fit =
      withinOptimalCount / Object.keys(evaluation.angle_analysis).length;

    // 推奨事項生成
    evaluation.recommendations = this.generateOkuboRecommendations(
      evaluation.angle_analysis
    );

    return evaluation;
  }

  /**
   * 近畿大学 今泉 (2024) データとの比較
   */
  async evaluateAgainstKinki(userPoseData) {
    const kinkiData = this.loadedStudies.get("kinki_imaizumi");
    const userAngles = this.extractUserJointAngles(userPoseData);

    const evaluation = {
      study_citation: kinkiData.citation,
      methodology: kinkiData.methodology,
      participants: kinkiData.participants,
      skill_prediction: "",
      bilateral_analysis: {},
      consistency_score: 0,
      statistical_significance: kinkiData.significance,
    };

    // 技能レベル予測（左右の角度を総合的に評価）
    const skillScores = {
      beginner_similarity: 0,
      experienced_similarity: 0,
    };

    const joints = [
      "left_shoulder",
      "left_elbow",
      "left_wrist",
      "right_shoulder",
      "right_elbow",
      "right_wrist",
    ];

    for (const joint of joints) {
      if (userAngles[joint] && kinkiData.skillComparison[joint]) {
        const beginnerData = kinkiData.skillComparison[joint].beginners;
        const experiencedData = kinkiData.skillComparison[joint].experienced;

        // 各技能レベルとの類似度計算
        skillScores.beginner_similarity += this.calculateGaussianSimilarity(
          userAngles[joint],
          beginnerData.mean,
          beginnerData.std
        );
        skillScores.experienced_similarity += this.calculateGaussianSimilarity(
          userAngles[joint],
          experiencedData.mean,
          experiencedData.std
        );

        // 個別関節解析
        evaluation.bilateral_analysis[joint] = {
          user_angle: userAngles[joint],
          beginner_stats: beginnerData,
          experienced_stats: experiencedData,
          closer_to:
            skillScores.experienced_similarity > skillScores.beginner_similarity
              ? "experienced"
              : "beginner",
        };
      }
    }

    // 技能レベル判定
    evaluation.skill_prediction =
      skillScores.experienced_similarity > skillScores.beginner_similarity
        ? "experienced_level"
        : "beginner_level";
    evaluation.confidence_score =
      Math.abs(
        skillScores.experienced_similarity - skillScores.beginner_similarity
      ) / joints.length;

    return evaluation;
  }

  /**
   * 安松谷ら (2011) データとの比較
   */
  async evaluateAgainstAnmatsuya(userPoseData) {
    const anmatsuyaData = this.loadedStudies.get("anmatsuya");
    const userAngles = this.extractUserJointAngles(userPoseData);

    const evaluation = {
      study_citation: anmatsuyaData.citation,
      methodology: anmatsuyaData.methodology,
      participants: anmatsuyaData.participants,
      expertise_assessment: {},
      variability_analysis: {},
      key_findings_match: [],
    };

    // 右肘角度評価
    if (userAngles.right_elbow) {
      const expertMean =
        anmatsuyaData.expertNoviceComparison.right_elbow.experts.mean;
      const noviceMean =
        anmatsuyaData.expertNoviceComparison.right_elbow.novices.mean;

      evaluation.expertise_assessment.right_elbow = {
        user_angle: userAngles.right_elbow,
        expert_reference: expertMean,
        novice_reference: noviceMean,
        closer_to_expert:
          Math.abs(userAngles.right_elbow - expertMean) <
          Math.abs(userAngles.right_elbow - noviceMean),
        deviation_from_expert: Math.abs(userAngles.right_elbow - expertMean),
      };
    }

    // 左肩角度評価
    if (userAngles.left_shoulder) {
      const expertMean =
        anmatsuyaData.expertNoviceComparison.left_shoulder.experts.mean;
      const noviceMean =
        anmatsuyaData.expertNoviceComparison.left_shoulder.novices.mean;

      evaluation.expertise_assessment.left_shoulder = {
        user_angle: userAngles.left_shoulder,
        expert_reference: expertMean,
        novice_reference: noviceMean,
        closer_to_expert:
          Math.abs(userAngles.left_shoulder - expertMean) <
          Math.abs(userAngles.left_shoulder - noviceMean),
        deviation_from_expert: Math.abs(userAngles.left_shoulder - expertMean),
      };
    }

    // 下肢（大腿・下腿角度）評価
    if (userAngles.knee_angle) {
      const expertRange =
        anmatsuyaData.expertNoviceComparison.thigh_leg_angle.experts.range;
      const noviceRange =
        anmatsuyaData.expertNoviceComparison.thigh_leg_angle.novices.range;

      evaluation.expertise_assessment.knee_angle = {
        user_angle: userAngles.knee_angle,
        expert_range: expertRange,
        novice_range: noviceRange,
        within_expert_range:
          userAngles.knee_angle >= expertRange[0] &&
          userAngles.knee_angle <= expertRange[1],
        within_novice_range:
          userAngles.knee_angle >= noviceRange[0] &&
          userAngles.knee_angle <= noviceRange[1],
      };
    }

    return evaluation;
  }

  /**
   * 東京大学院 運動連鎖解析
   */
  async evaluateKinematicSequence(userPoseData) {
    const tokyoData = this.loadedStudies.get("tokyo_university");

    const evaluation = {
      study_citation: tokyoData.citation,
      kinematic_sequence_analysis: {},
      coordination_assessment: "",
      temporal_pattern: {},
    };

    // 関節の時系列協調動作評価（簡易版）
    const expectedSequence = tokyoData.kinematicSequence.joint_order; // ["shoulder", "elbow", "wrist"]

    evaluation.kinematic_sequence_analysis = {
      expected_sequence: expectedSequence,
      coordination_pattern: tokyoData.kinematicSequence.coordination_pattern,
      description: tokyoData.kinematicSequence.description,
      user_sequence_quality: this.assessSequentialActivation(
        userPoseData,
        expectedSequence
      ),
    };

    // 精度分析
    evaluation.coordination_assessment =
      this.assessCoordinationQuality(userPoseData);

    return evaluation;
  }

  /**
   * 学術的評価の総合化
   */
  async synthesizeAcademicEvaluation(evaluation) {
    const evidenceSources = evaluation.academic_evidence;
    let totalScore = 0;
    let sourceCount = 0;
    const citedStudies = [];

    // 各研究からのスコア統合
    if (evidenceSources.okubo_hubbard) {
      totalScore += evidenceSources.okubo_hubbard.overall_fit * 100;
      sourceCount++;
      citedStudies.push(evidenceSources.okubo_hubbard.study_citation);
    }

    if (evidenceSources.kinki_university) {
      const kinkiScore =
        evidenceSources.kinki_university.skill_prediction ===
        "experienced_level"
          ? 80
          : 60;
      totalScore += kinkiScore;
      sourceCount++;
      citedStudies.push(evidenceSources.kinki_university.study_citation);
    }

    if (evidenceSources.anmatsuya_study) {
      const anmatsuyaScore = this.calculateAnmatsuyaScore(
        evidenceSources.anmatsuya_study
      );
      totalScore += anmatsuyaScore;
      sourceCount++;
      citedStudies.push(evidenceSources.anmatsuya_study.study_citation);
    }

    if (evidenceSources.tokyo_university) {
      const tokyoScore =
        evidenceSources.tokyo_university.user_sequence_quality * 100;
      totalScore += tokyoScore;
      sourceCount++;
      citedStudies.push(evidenceSources.tokyo_university.study_citation);
    }

    // 総合評価
    const averageScore = sourceCount > 0 ? totalScore / sourceCount : 0;
    evaluation.confidence_score = averageScore;
    evaluation.cited_studies = citedStudies;

    if (averageScore >= 80) {
      evaluation.overall_assessment = "優秀（熟練者レベル）";
      evaluation.skill_level_prediction = "expert";
    } else if (averageScore >= 65) {
      evaluation.overall_assessment = "良好（経験者レベル）";
      evaluation.skill_level_prediction = "experienced";
    } else if (averageScore >= 50) {
      evaluation.overall_assessment = "平均的（中級者レベル）";
      evaluation.skill_level_prediction = "intermediate";
    } else {
      evaluation.overall_assessment = "要改善（初心者レベル）";
      evaluation.skill_level_prediction = "beginner";
    }

    // 学術的根拠に基づく推奨事項
    evaluation.recommendations =
      this.generateAcademicRecommendations(evaluation);

    return evaluation;
  }

  /**
   * ユーザーの関節角度抽出（簡易版）
   */
  extractUserJointAngles(poseData) {
    // 実際の実装では、poseDataからkeypoints角度を計算
    // ここでは簡易的な例を示す
    if (!poseData || !poseData.keypoints) {
      return {};
    }

    // keypoints から関節角度を計算するロジック
    return {
      shoulder: this.calculateShoulderAngle(poseData.keypoints),
      elbow: this.calculateElbowAngle(poseData.keypoints),
      wrist: this.calculateWristAngle(poseData.keypoints),
      left_shoulder: this.calculateLeftShoulderAngle(poseData.keypoints),
      left_elbow: this.calculateLeftElbowAngle(poseData.keypoints),
      left_wrist: this.calculateLeftWristAngle(poseData.keypoints),
      right_shoulder: this.calculateRightShoulderAngle(poseData.keypoints),
      right_elbow: this.calculateRightElbowAngle(poseData.keypoints),
      right_wrist: this.calculateRightWristAngle(poseData.keypoints),
      knee_angle: this.calculateKneeAngle(poseData.keypoints),
    };
  }

  /**
   * ヘルパーメソッド群
   */
  calculateDeviation(userAngle, minOptimal, maxOptimal) {
    if (userAngle >= minOptimal && userAngle <= maxOptimal) {
      return 0;
    } else if (userAngle < minOptimal) {
      return minOptimal - userAngle;
    } else {
      return userAngle - maxOptimal;
    }
  }

  calculateGaussianSimilarity(userValue, mean, std) {
    const z = Math.abs(userValue - mean) / std;
    return Math.exp(-0.5 * z * z);
  }

  generateAcademicRecommendations(evaluation) {
    const recommendations = [];

    recommendations.push({
      category: "学術的根拠",
      message: `評価は${evaluation.cited_studies.length}件の査読済み研究に基づいています`,
      studies: evaluation.cited_studies,
    });

    if (evaluation.confidence_score < 70) {
      recommendations.push({
        category: "改善提案",
        message: "複数の研究で報告されている最適角度範囲への調整を推奨します",
        specific_actions: [
          "肩関節角度の調整",
          "肘関節の安定化",
          "手首のスナップ動作改善",
        ],
      });
    }

    return recommendations;
  }

  // 実際の角度計算メソッド（簡易実装例）
  calculateShoulderAngle(keypoints) {
    // 実装例：肩-肘-手首の角度計算
    return 30 + Math.random() * 20; // サンプル値
  }

  calculateElbowAngle(keypoints) {
    return 90 + Math.random() * 30; // サンプル値
  }

  calculateWristAngle(keypoints) {
    return 45 + Math.random() * 25; // サンプル値
  }

  calculateLeftShoulderAngle(keypoints) {
    return 28 + Math.random() * 15; // サンプル値
  }

  calculateLeftElbowAngle(keypoints) {
    return 120 + Math.random() * 25; // サンプル値
  }

  calculateLeftWristAngle(keypoints) {
    return 27 + Math.random() * 10; // サンプル値
  }

  calculateRightShoulderAngle(keypoints) {
    return 43 + Math.random() * 15; // サンプル値
  }

  calculateRightElbowAngle(keypoints) {
    return 118 + Math.random() * 25; // サンプル値
  }

  calculateRightWristAngle(keypoints) {
    return 35 + Math.random() * 20; // サンプル値
  }

  calculateKneeAngle(keypoints) {
    return 95 + Math.random() * 20; // サンプル値
  }

  assessSequentialActivation(poseData, expectedSequence) {
    // 簡易的な運動連鎖評価
    return 0.7 + Math.random() * 0.3; // サンプル値
  }

  assessCoordinationQuality(poseData) {
    return "good"; // サンプル値
  }

  calculateAnmatsuyaScore(anmatsuyaEvaluation) {
    let score = 0;
    let count = 0;

    Object.values(anmatsuyaEvaluation.expertise_assessment).forEach(
      (assessment) => {
        if (assessment.closer_to_expert !== undefined) {
          score += assessment.closer_to_expert ? 80 : 40;
          count++;
        }
      }
    );

    return count > 0 ? score / count : 50;
  }

  generateOkuboRecommendations(angleAnalysis) {
    const recommendations = [];

    Object.entries(angleAnalysis).forEach(([joint, analysis]) => {
      if (!analysis.within_optimal) {
        recommendations.push({
          joint: joint,
          message: `${joint}関節を${analysis.optimal_range[0]}-${analysis.optimal_range[1]}度の範囲に調整してください`,
          current_angle: analysis.user_angle,
          optimal_range: analysis.optimal_range,
          biomechanical_reason: analysis.biomechanical_significance,
        });
      }
    });

    return recommendations;
  }

  async loadFallbackData() {
    console.warn("フォールバックデータを使用します");
    this.academicData = {
      metadata: { total_studies: 0, total_participants: 0 },
      studies: {},
    };
  }

  /**
   * 評価履歴の取得
   */
  getEvaluationHistory() {
    return this.evaluationHistory;
  }

  /**
   * 引用可能な研究リストの取得
   */
  getCitableStudies() {
    if (!this.academicData) return [];

    return Object.entries(this.academicData.studies).map(([key, study]) => ({
      id: key,
      citation: study.citation,
      methodology: study.methodology || study.title,
      participants: study.participants,
    }));
  }
}

// グローバルインスタンス作成
const academicEvaluator = new AcademicBasedEvaluator();

// 既存システムとの統合用関数
async function evaluateWithAcademicEvidence(poseData) {
  return await academicEvaluator.evaluateWithAcademicEvidence(poseData);
}

// 卒研発表用の評価情報取得
function getAcademicEvaluationSummary() {
  return {
    available_studies: academicEvaluator.getCitableStudies(),
    evaluation_history: academicEvaluator.getEvaluationHistory(),
    system_status: academicEvaluator.initialized ? "ready" : "not_initialized",
  };
}
