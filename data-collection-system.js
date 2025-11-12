// data-collection-system.js - データ収集・前処理システム

/**
 * マルチソースデータ統合システム
 */
class BasketballDataCollector {
  constructor() {
    this.dataSources = {
      qlean: new QleanDatasetAPI(),
      academic: new AcademicPaperData(),
      dataStadium: new DataStadiumAPI(),
      userGenerated: new UserDataCollector(),
    };

    this.preprocessors = {
      coordinate: new CoordinateNormalizer(),
      temporal: new TemporalAligner(),
      quality: new DataQualityFilter(),
    };
  }

  /**
   * Qlean Dataset API連携
   */
  async fetchQleanData() {
    try {
      // 実際の実装ではAPI キー認証が必要
      const response = await fetch(
        "https://api.qlean.com/basketball/shoot-forms",
        {
          headers: {
            Authorization: "Bearer YOUR_API_KEY",
            "Content-Type": "application/json",
          },
        }
      );

      const rawData = await response.json();

      // 3D座標データを2D PoseNet形式に変換
      const convertedData = rawData.map((sample) => ({
        id: sample.id,
        playerType: sample.playerType, // 'professional', 'amateur'
        shootSuccess: sample.result,
        poses: this.convert3DTo2D(sample.motionData),
        metadata: {
          frameRate: sample.frameRate,
          duration: sample.duration,
          court: sample.courtInfo,
        },
      }));

      console.log(
        `Qlean Dataset: ${convertedData.length}件のシュートデータを取得`
      );
      return convertedData;
    } catch (error) {
      console.error("Qlean Dataset取得エラー:", error);
      return [];
    }
  }

  /**
   * 学術論文データの構造化
   */
  async loadAcademicData() {
    // 近畿大学研究データ
    const kinki_data = await this.parseCSV(
      "/data/kinki-university-shoot-analysis.csv"
    );

    // J-STAGE論文データ
    const jstage_data = await this.parseJSON(
      "/data/jstage-lstm-shoot-model.json"
    );

    return {
      expertNoviceDifferences: kinki_data.map((row) => ({
        feature: row.feature,
        expertMean: parseFloat(row.expert_mean),
        noviceMean: parseFloat(row.novice_mean),
        significance: parseFloat(row.p_value),
      })),
      lstmModelWeights: jstage_data.modelWeights,
      evaluationCriteria: jstage_data.criteria,
    };
  }

  /**
   * データスタジアム連携
   */
  async fetchDataStadiumSamples() {
    const samples = await fetch("/data/data-stadium-samples.json");
    const data = await samples.json();

    return data.games.map((game) => ({
      gameId: game.id,
      players: game.players.map((player) => ({
        playerId: player.id,
        position: player.position,
        shootingStats: player.shooting,
        bodyMetrics: player.physicalData,
      })),
    }));
  }

  /**
   * 座標系統一・正規化
   */
  normalizeCoordinates(poseData, sourceType) {
    switch (sourceType) {
      case "qlean":
        return this.normalizeQleanCoords(poseData);
      case "academic":
        return this.normalizeAcademicCoords(poseData);
      case "user":
        return this.normalizeUserCoords(poseData);
      default:
        return poseData;
    }
  }

  normalizeQleanCoords(data) {
    // Qlean 3D → PoseNet 2D変換
    return data.map((frame) => ({
      keypoints: frame.joints.map((joint) => ({
        x: (joint.x / frame.imageWidth) * 640, // PoseNet標準サイズに正規化
        y: (joint.y / frame.imageHeight) * 480,
        score: joint.confidence,
      })),
    }));
  }

  /**
   * 時系列データ同期
   */
  alignTemporalData(sequences) {
    // 全シーケンスを標準フレーム数(30フレーム)に正規化
    const targetFrames = 30;

    return sequences.map((seq) => {
      if (seq.length === targetFrames) return seq;

      // リサンプリング
      const indices = Array.from({ length: targetFrames }, (_, i) =>
        Math.round((i / (targetFrames - 1)) * (seq.length - 1))
      );

      return indices.map((idx) => seq[idx]);
    });
  }

  /**
   * データ品質フィルタリング
   */
  filterHighQualityData(dataset) {
    return dataset.filter((sample) => {
      // 最小品質基準
      const minConfidence = 0.3;
      const minFrames = 20;

      // 全フレームでキーポイント信頼度チェック
      const avgConfidence = this.calculateAverageConfidence(sample.poses);

      return (
        sample.poses.length >= minFrames &&
        avgConfidence >= minConfidence &&
        this.hasRequiredKeypoints(sample.poses)
      );
    });
  }

  calculateAverageConfidence(poses) {
    const allScores = poses.flatMap((pose) =>
      pose.keypoints.map((kp) => kp.score)
    );
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }

  hasRequiredKeypoints(poses) {
    // シュート分析に必須のキーポイント
    const requiredPoints = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]; // 上半身+腕+脚

    return poses.every((pose) =>
      requiredPoints.every(
        (idx) => pose.keypoints[idx] && pose.keypoints[idx].score > 0.3
      )
    );
  }

  /**
   * 統合データセット生成
   */
  async buildUnifiedDataset() {
    console.log("統合データセット構築開始...");

    // 各ソースからデータ収集
    const [qleanData, academicData, stadiumData] = await Promise.all([
      this.fetchQleanData(),
      this.loadAcademicData(),
      this.fetchDataStadiumSamples(),
    ]);

    // 座標正規化
    const normalizedQlean = qleanData.map((d) => ({
      ...d,
      poses: this.normalizeCoordinates(d.poses, "qlean"),
    }));

    // 時系列同期
    const alignedData = this.alignTemporalData(
      normalizedQlean.map((d) => d.poses)
    );

    // 品質フィルタリング
    const filteredData = this.filterHighQualityData(
      alignedData.map((poses, idx) => ({
        poses,
        metadata: normalizedQlean[idx]?.metadata,
      }))
    );

    // ラベル付け（成功/失敗、品質スコア）
    const labeledData = filteredData.map((sample) => ({
      ...sample,
      label: this.generateQualityLabel(sample.poses),
      scores: this.calculateDetailedScores(sample.poses),
    }));

    console.log(`統合データセット完成: ${labeledData.length}件`);
    return {
      trainingData: labeledData,
      academicCriteria: academicData,
      metadata: {
        totalSamples: labeledData.length,
        qualityDistribution: this.analyzeQualityDistribution(labeledData),
        keyFeatures: this.extractKeyFeatures(labeledData),
      },
    };
  }

  /**
   * 品質ラベル生成
   */
  generateQualityLabel(poses) {
    const metrics = this.calculateDetailedScores(poses);
    const overallScore =
      Object.values(metrics).reduce((sum, score) => sum + score, 0) /
      Object.keys(metrics).length;

    if (overallScore >= 4.5) return "excellent";
    if (overallScore >= 3.5) return "good";
    if (overallScore >= 2.5) return "normal";
    if (overallScore >= 1.5) return "poor";
    return "bad";
  }

  /**
   * 詳細スコア計算
   */
  calculateDetailedScores(poses) {
    // 既存の分析関数を活用
    const lastPose = poses[poses.length - 1];

    return {
      balance: this.analyzeBalance(poses),
      armForm: this.analyzeArmAngle(lastPose),
      bodyAlignment: this.analyzeAlignment(poses),
      timing: this.analyzeTiming(poses),
      consistency: this.analyzeConsistency(poses),
    };
  }
}

// ユーティリティクラス
class QleanDatasetAPI {
  // Qlean Dataset API実装
}

class AcademicPaperData {
  // 学術論文データパーサー実装
}

class DataStadiumAPI {
  // データスタジアムAPI実装
}

class UserDataCollector {
  // ユーザー生成データ収集実装
}

// エクスポート
const dataCollector = new BasketballDataCollector();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { BasketballDataCollector, dataCollector };
}
