// AI分析システムの概念実装

// 1. TensorFlow.jsを使用した機械学習アプローチ
class AIBasketballAnalyzer {
  constructor() {
    this.model = null;
    this.isLoaded = false;
  }

  // 事前学習済みモデルの読み込み
  async loadModel() {
    try {
      // 事前学習済みのバスケットボール姿勢評価モデル
      this.model = await tf.loadLayersModel(
        "/models/basketball-pose-analyzer/model.json"
      );
      this.isLoaded = true;
      console.log("AI分析モデル読み込み完了");
    } catch (error) {
      console.error("AIモデル読み込みエラー:", error);
      return false;
    }
  }

  // AI分析メイン関数
  async analyzeWithAI(keypoints) {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    try {
      // キーポイントデータの前処理
      const processedInput = this.preprocessKeypoints(keypoints);

      // AI推論実行
      const predictions = await this.model.predict(processedInput).data();

      // 結果の解釈
      return this.interpretPredictions(predictions, keypoints);
    } catch (error) {
      console.error("AI分析エラー:", error);
      return this.fallbackToRuleBase(keypoints);
    }
  }

  // キーポイントデータの前処理
  preprocessKeypoints(keypoints) {
    // 正規化、欠損値補完、特徴量抽出
    const features = [];

    // 関節角度の計算
    const angles = this.calculateAllAngles(keypoints);
    features.push(...angles);

    // 身体比率の計算
    const ratios = this.calculateBodyRatios(keypoints);
    features.push(...ratios);

    // 対称性の計算
    const symmetry = this.calculateSymmetry(keypoints);
    features.push(...symmetry);

    // TensorFlow.jsテンソルに変換
    return tf.tensor2d([features], [1, features.length]);
  }

  // AI予測結果の解釈
  interpretPredictions(predictions, keypoints) {
    const results = {
      balance: {
        score: Math.round(predictions[0] * 5),
        confidence: predictions[4],
        aiInsight: this.generateInsight("balance", predictions[0], keypoints),
      },
      shootForm: {
        score: Math.round(predictions[1] * 5),
        confidence: predictions[5],
        aiInsight: this.generateInsight("shootForm", predictions[1], keypoints),
      },
      defense: {
        score: Math.round(predictions[2] * 5),
        confidence: predictions[6],
        aiInsight: this.generateInsight("defense", predictions[2], keypoints),
      },
      stability: {
        score: Math.round(predictions[3] * 5),
        confidence: predictions[7],
        aiInsight: this.generateInsight("stability", predictions[3], keypoints),
      },
    };

    return results;
  }

  // AI洞察の生成
  generateInsight(category, score, keypoints) {
    const insights = {
      balance: [
        "重心が理想的な位置にあります",
        "左右のバランスが良好です",
        "重心がやや不安定です",
        "重心の改善が必要です",
      ],
      shootForm: [
        "完璧なシュートフォームです",
        "良好なシュート姿勢です",
        "フォームに改善の余地があります",
        "フォームの大幅な修正が必要です",
      ],
    };

    const index = Math.min(Math.floor(score * 4), 3);
    return insights[category][index];
  }
}

// 2. OpenAI APIを使用した自然言語分析
class OpenAIAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = "https://api.openai.com/v1/chat/completions";
  }

  async analyzeWithGPT(keypoints, videoContext) {
    const prompt = this.createAnalysisPrompt(keypoints, videoContext);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "あなたはバスケットボールのコーチング専門家です。姿勢分析の結果から詳細な評価とアドバイスを提供してください。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const result = await response.json();
      return this.parseGPTResponse(result.choices[0].message.content);
    } catch (error) {
      console.error("OpenAI API エラー:", error);
      return null;
    }
  }

  createAnalysisPrompt(keypoints, context) {
    return `
バスケットボール選手の姿勢分析を行ってください。

【キーポイントデータ】
${JSON.stringify(keypoints, null, 2)}

【コンテキスト】
- 動画: ${context.videoName}
- 動作: ${context.action || "フリースロー"}

【分析項目】
1. 重心バランス (1-5点)
2. シュートフォーム (1-5点) 
3. ディフェンススタンス (1-5点)
4. 全体的な安定性 (1-5点)

各項目について点数と具体的な改善アドバイスを日本語で提供してください。
    `;
  }
}

// 3. ハイブリッド分析システム
class HybridAnalyzer {
  constructor() {
    this.aiAnalyzer = new AIBasketballAnalyzer();
    this.openaiAnalyzer = new OpenAIAnalyzer(process.env.OPENAI_API_KEY);
    this.useAI = true;
  }

  async analyze(keypoints, context) {
    let aiResults = null;
    let gptResults = null;

    // AI分析の実行
    if (this.useAI) {
      try {
        aiResults = await this.aiAnalyzer.analyzeWithAI(keypoints);
        gptResults = await this.openaiAnalyzer.analyzeWithGPT(
          keypoints,
          context
        );
      } catch (error) {
        console.log("AI分析失敗、ルールベースにフォールバック");
      }
    }

    // ルールベース分析（フォールバック）
    const ruleBasedResults = this.ruleBasedAnalysis(keypoints);

    // 結果の統合
    return this.combineResults(aiResults, gptResults, ruleBasedResults);
  }

  combineResults(aiResults, gptResults, ruleResults) {
    const finalResults = {};

    // AI結果がある場合は優先、なければルールベース
    Object.keys(ruleResults).forEach((key) => {
      finalResults[key] = {
        score: aiResults?.[key]?.score || ruleResults[key].score,
        rating: this.scoreToRating(finalResults[key].score),
        class: this.scoreToClass(finalResults[key].score),
        detail: aiResults?.[key]?.aiInsight || ruleResults[key].detail,
        confidence: aiResults?.[key]?.confidence || 0.8,
        analysisType: aiResults ? "AI分析" : "ルールベース分析",
        gptAdvice: gptResults?.[key]?.advice || null,
      };
    });

    return finalResults;
  }
}

export { AIBasketballAnalyzer, OpenAIAnalyzer, HybridAnalyzer };
