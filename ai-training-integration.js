// ai-training-integration.js - AI学習データ統合システム

/**
 * バスケットボールシュートフォームAI学習統合クラス
 */
class ShootFormAITrainer {
  constructor() {
    this.baselineData = null; // 基準動作データ
    this.model = null; // 学習済みモデル
    this.evaluationCriteria = {
      // プロ選手基準の評価項目
      armAngle: { ideal: 90, tolerance: 15 }, // 腕の角度
      kneeFlexion: { ideal: 145, tolerance: 20 }, // 膝の屈曲
      bodyAlignment: { ideal: 0, tolerance: 5 }, // 体軸
      releasePoint: { ideal: 2.1, tolerance: 0.3 }, // リリースポイント高さ(m)
      followThrough: { duration: 0.5, tolerance: 0.2 }, // フォロースルー時間
    };
  }

  /**
   * Qlean Datasetからベースライン動作を読み込み
   */
  async loadBaselineData() {
    try {
      // 実際の実装では外部APIまたはローカルファイルから読み込み
      const response = await fetch("/data/qlean-baseline-shoots.json");
      this.baselineData = await response.json();

      console.log(
        "基準動作データを読み込みました:",
        this.baselineData.length + "件"
      );
      return true;
    } catch (error) {
      console.error("基準データ読み込みエラー:", error);
      return false;
    }
  }

  /**
   * 学術論文ベースの評価基準を統合
   */
  integrateAcademicCriteria() {
    // 近畿大学研究データ統合
    this.evaluationCriteria = {
      ...this.evaluationCriteria,
      // 熟練者vs初心者の差分データから導出
      shootingArc: { ideal: 45, tolerance: 10 }, // シュート弧度
      footPosition: { shoulderWidth: 1.0, tolerance: 0.2 }, // 足幅
      eyeContact: { duration: 0.3, tolerance: 0.1 }, // アイコンタクト時間
    };
  }

  /**
   * TensorFlow.jsでLSTMモデルを学習
   */
  async trainLSTMModel(trainingData) {
    // シーケンス長: 30フレーム（1秒間のシュート動作）
    const sequenceLength = 30;
    const featureCount = 34; // PoseNet 17ポイント × 2座標

    // モデル構築
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 64,
          returnSequences: true,
          inputShape: [sequenceLength, featureCount],
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.lstm({ units: 32, returnSequences: false }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 16, activation: "relu" }),
        tf.layers.dense({ units: 5, activation: "softmax" }), // 5段階評価
      ],
    });

    // コンパイル
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    // 学習実行
    console.log("LSTM モデル学習開始...");
    const history = await this.model.fit(
      trainingData.sequences,
      trainingData.labels,
      {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: accuracy=${logs.acc.toFixed(4)}`);
          },
        },
      }
    );

    console.log("モデル学習完了");
    return history;
  }

  /**
   * リアルタイム評価エンジン
   */
  async evaluateShootForm(poseSequence) {
    if (!this.model || !this.baselineData) {
      console.error("モデルまたはベースラインデータが未読み込み");
      return this.fallbackEvaluation(poseSequence);
    }

    try {
      // 座標系正規化
      const normalizedSequence = this.normalizePoseSequence(poseSequence);

      // AI予測
      const prediction = this.model.predict(tf.tensor3d([normalizedSequence]));
      const scores = await prediction.data();

      // 詳細分析
      const detailedAnalysis = this.analyzeFormDetails(poseSequence);

      return {
        overallScore: this.calculateOverallScore(scores),
        aiConfidence: Math.max(...scores),
        detailedScores: detailedAnalysis,
        improvements: this.generateImprovements(detailedAnalysis),
        comparisonToElite: this.compareToEliteForm(normalizedSequence),
      };
    } catch (error) {
      console.error("AI評価エラー:", error);
      return this.fallbackEvaluation(poseSequence);
    }
  }

  /**
   * 座標系正規化（異なるデータソース統合用）
   */
  normalizePoseSequence(sequence) {
    return sequence.map((frame) => {
      // 肩幅基準で正規化
      const leftShoulder = frame.keypoints[5];
      const rightShoulder = frame.keypoints[6];
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

      return frame.keypoints.map((point) => ({
        x: (point.x - leftShoulder.x) / shoulderWidth,
        y: (point.y - leftShoulder.y) / shoulderWidth,
        score: point.score,
      }));
    });
  }

  /**
   * エリート選手との比較分析
   */
  compareToEliteForm(userSequence) {
    if (!this.baselineData) return null;

    const eliteAverage = this.calculateEliteAverage();
    const userMetrics = this.extractMetrics(userSequence);

    return {
      armAngleDiff: Math.abs(userMetrics.armAngle - eliteAverage.armAngle),
      timingDiff: Math.abs(userMetrics.timing - eliteAverage.timing),
      balanceDiff: Math.abs(userMetrics.balance - eliteAverage.balance),
      similarityScore: this.calculateSimilarity(userSequence, eliteAverage),
    };
  }

  /**
   * 改善提案生成
   */
  generateImprovements(analysis) {
    const improvements = [];

    if (analysis.armAngle < this.evaluationCriteria.armAngle.ideal - 10) {
      improvements.push({
        category: "腕の角度",
        issue: "肘の角度が浅すぎます",
        suggestion: "リリース時の肘を90度により近づけてください",
        priority: "high",
      });
    }

    if (analysis.bodyAlignment > 5) {
      improvements.push({
        category: "体軸",
        issue: "体軸が傾いています",
        suggestion: "ゴールに対して真っ直ぐ向いてシュートしてください",
        priority: "medium",
      });
    }

    // 他の改善項目...

    return improvements;
  }

  /**
   * フォールバック評価（AI失敗時）
   */
  fallbackEvaluation(poseSequence) {
    console.log("フォールバック評価を実行");
    // 現在のルールベース評価を使用
    return window.generateEvaluation(poseSequence[poseSequence.length - 1]);
  }
}

// グローバルインスタンス
const aiTrainer = new ShootFormAITrainer();

/**
 * 既存システムへの統合関数
 */
async function initializeAITraining() {
  console.log("AI学習システム初期化開始...");

  // 基準データ読み込み
  const baselineLoaded = await aiTrainer.loadBaselineData();
  if (!baselineLoaded) {
    console.warn("基準データ読み込み失敗 - ルールベース評価を継続");
    return false;
  }

  // 学術基準統合
  aiTrainer.integrateAcademicCriteria();

  // 既存の評価関数を拡張
  const originalEvaluate = window.generateEvaluation;
  window.generateEvaluation = async function (poses) {
    // AIシーケンス評価が可能な場合
    if (poses.length >= 30) {
      return await aiTrainer.evaluateShootForm(poses.slice(-30));
    }
    // 従来評価
    return originalEvaluate(poses);
  };

  console.log("AI学習システム初期化完了");
  return true;
}

// DOM読み込み完了後に初期化
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initializeAITraining);
}

// エクスポート
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ShootFormAITrainer, aiTrainer };
}
