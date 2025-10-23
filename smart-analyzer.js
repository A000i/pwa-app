// 実装可能なAI分析システム（段階的導入）

// Phase 1: 統計的機械学習アプローチ
class SmartAnalyzer {
  constructor() {
    this.learningData = this.loadLearningData();
    this.isAIMode = true;
  }

  // 学習データの初期化（実際の選手データから構築）
  loadLearningData() {
    return {
      // プロ選手の理想的なフォームデータ
      expertProfiles: {
        stephCurry: {
          shootingElbowAngle: 92,
          releaseHeight: 220,
          bodyBalance: 0.95,
          footStance: 45,
        },
        lebronJames: {
          defenseStance: 115,
          centerOfGravity: 0.88,
          armPosition: 85,
        },
      },

      // 分析パターンデータベース
      patterns: {
        excellentShoot: {
          elbowAngle: [85, 95],
          wristFlick: [15, 25],
          balance: [0.9, 1.0],
        },
        goodDefense: {
          kneeAngle: [110, 130],
          stance: [40, 50],
          stability: [0.8, 0.95],
        },
        improveNeeded: { elbowAngle: [60, 84], balance: [0.6, 0.8] },
      },
    };
  }

  // AI強化分析メイン関数
  analyzeWithAI(keypoints, historicalData = null) {
    const results = {};

    // 1. パターンマッチング分析
    const patternAnalysis = this.performPatternMatching(keypoints);

    // 2. 統計的異常検知
    const anomalies = this.detectAnomalies(keypoints, historicalData);

    // 3. 個人適応型評価
    const personalizedScore = this.getPersonalizedScore(
      keypoints,
      historicalData
    );

    // 4. 動的重み付け
    const adaptiveWeights = this.calculateAdaptiveWeights(keypoints);

    return {
      balance: this.analyzeBalanceAI(keypoints, adaptiveWeights),
      shootForm: this.analyzeShootFormAI(keypoints, patternAnalysis),
      defense: this.analyzeDefenseAI(keypoints, anomalies),
      stability: this.analyzeStabilityAI(keypoints, personalizedScore),
      aiInsights: this.generateAIInsights(
        keypoints,
        patternAnalysis,
        anomalies
      ),
    };
  }

  // パターンマッチング分析
  performPatternMatching(keypoints) {
    const currentPattern = this.extractFeatures(keypoints);
    const matches = {};

    Object.entries(this.learningData.patterns).forEach(
      ([pattern, criteria]) => {
        matches[pattern] = this.calculatePatternSimilarity(
          currentPattern,
          criteria
        );
      }
    );

    return matches;
  }

  // AI強化重心バランス分析
  analyzeBalanceAI(keypoints, weights) {
    const basic = this.analyzeBalanceBasic(keypoints);

    // AI拡張: 動的バランス評価
    const dynamicBalance = this.calculateDynamicBalance(keypoints);
    const stabilityTrend = this.analyzeStabilityTrend(keypoints);

    // 重み付け統合
    const aiScore =
      basic.score * weights.balance +
      dynamicBalance * weights.dynamic +
      stabilityTrend * weights.trend;

    return {
      score: Math.round(Math.min(5, Math.max(1, aiScore))),
      rating: this.scoreToRating(aiScore),
      class: this.scoreToClass(aiScore),
      detail: this.generateAIDetail("balance", aiScore, {
        basic: basic.score,
        dynamic: dynamicBalance,
        trend: stabilityTrend,
      }),
      confidence: this.calculateConfidence(keypoints),
      aiFactors: {
        staticBalance: basic.score,
        dynamicBalance: dynamicBalance,
        stabilityTrend: stabilityTrend,
      },
    };
  }

  // AI洞察生成
  generateAIInsights(keypoints, patterns, anomalies) {
    const insights = [];

    // パターン分析からの洞察
    if (patterns.excellentShoot > 0.8) {
      insights.push({
        type: "positive",
        message: "プロレベルのシュートフォームパターンを検出しました",
        confidence: patterns.excellentShoot,
      });
    }

    // 異常検知からの洞察
    anomalies.forEach((anomaly) => {
      insights.push({
        type: "warning",
        message: `${anomaly.joint}に通常と異なる動作パターンを検出`,
        severity: anomaly.severity,
      });
    });

    // 改善提案
    const improvements = this.generateImprovementSuggestions(
      keypoints,
      patterns
    );
    insights.push(...improvements);

    return insights;
  }

  // 個人適応型スコア計算
  getPersonalizedScore(keypoints, history) {
    if (!history || history.length < 3) {
      return this.getStandardScore(keypoints);
    }

    // 個人の進歩を考慮した評価
    const personalBaseline = this.calculatePersonalBaseline(history);
    const currentPerformance = this.extractFeatures(keypoints);
    const improvement = this.calculateImprovement(
      currentPerformance,
      personalBaseline
    );

    return {
      absoluteScore: this.getStandardScore(keypoints),
      relativeScore: this.adjustForPersonalProgress(improvement),
      progressRate: improvement.rate,
      strongPoints: improvement.strengths,
      improvementAreas: improvement.weaknesses,
    };
  }
}

// Phase 2: Web APIベースのAI分析
class WebAIAnalyzer {
  constructor() {
    this.apiEndpoint = "/api/ai-analysis"; // バックエンドAPIエンドポイント
    this.fallbackAnalyzer = new SmartAnalyzer();
  }

  async analyzeWithWebAI(keypoints, videoBlob, context) {
    try {
      const formData = new FormData();
      formData.append("keypoints", JSON.stringify(keypoints));
      formData.append("video", videoBlob);
      formData.append("context", JSON.stringify(context));

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const aiResults = await response.json();
        return this.processWebAIResults(aiResults);
      } else {
        throw new Error("AI API call failed");
      }
    } catch (error) {
      console.log("Web AI分析失敗、ローカルAIにフォールバック:", error);
      return this.fallbackAnalyzer.analyzeWithAI(keypoints);
    }
  }

  processWebAIResults(results) {
    return {
      ...results,
      analysisType: "Web AI分析",
      timestamp: new Date().toISOString(),
      version: "2.0",
    };
  }
}

export { SmartAnalyzer, WebAIAnalyzer };
