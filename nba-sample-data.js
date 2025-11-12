// nba-sample-data.js - NBA選手サンプルデータ

/**
 * NBA選手のシュート統計と評価データ（サンプル）
 * 実際のデータは各種APIから取得
 */
const NBA_SHOOTING_DATA = {
  // エリート選手（高評価サンプル）
  elite_shooters: [
    {
      name: "Stephen Curry",
      position: "PG",
      stats: {
        fg_pct: 0.427,
        fg3_pct: 0.365,
        ft_pct: 0.915,
        consistency: 4.8,
      },
      form_rating: 5,
      characteristics: {
        release_speed: "快速",
        arc: "高弧道",
        balance: "優秀",
        follow_through: "完璧",
      },
    },
    {
      name: "Klay Thompson",
      position: "SG",
      stats: {
        fg_pct: 0.436,
        fg3_pct: 0.385,
        ft_pct: 0.879,
        consistency: 4.6,
      },
      form_rating: 5,
      characteristics: {
        release_speed: "快速",
        arc: "理想的",
        balance: "安定",
        follow_through: "優秀",
      },
    },
    {
      name: "Ray Allen",
      position: "SG",
      stats: {
        fg_pct: 0.452,
        fg3_pct: 0.4,
        ft_pct: 0.894,
        consistency: 4.9,
      },
      form_rating: 5,
      characteristics: {
        release_speed: "一定",
        arc: "完璧",
        balance: "優秀",
        follow_through: "教科書的",
      },
    },
  ],

  // 良好選手
  good_shooters: [
    {
      name: "Damian Lillard",
      position: "PG",
      stats: {
        fg_pct: 0.375,
        fg3_pct: 0.33,
        ft_pct: 0.885,
        consistency: 4.2,
      },
      form_rating: 4,
      characteristics: {
        release_speed: "快速",
        arc: "良好",
        balance: "良い",
        follow_through: "安定",
      },
    },
    {
      name: "Bradley Beal",
      position: "SG",
      stats: {
        fg_pct: 0.385,
        fg3_pct: 0.315,
        ft_pct: 0.842,
        consistency: 3.8,
      },
      form_rating: 4,
      characteristics: {
        release_speed: "適切",
        arc: "標準",
        balance: "良い",
        follow_through: "良好",
      },
    },
  ],

  // 平均的選手
  average_shooters: [
    {
      name: "Russell Westbrook",
      position: "PG",
      stats: {
        fg_pct: 0.348,
        fg3_pct: 0.298,
        ft_pct: 0.751,
        consistency: 3.2,
      },
      form_rating: 3,
      characteristics: {
        release_speed: "不安定",
        arc: "低め",
        balance: "普通",
        follow_through: "改善必要",
      },
    },
    {
      name: "Josh Smith",
      position: "PF",
      stats: {
        fg_pct: 0.336,
        fg3_pct: 0.287,
        ft_pct: 0.695,
        consistency: 2.8,
      },
      form_rating: 2,
      characteristics: {
        release_speed: "遅い",
        arc: "平坦",
        balance: "不安定",
        follow_through: "短い",
      },
    },
  ],
};

/**
 * フォーム特徴と成功率の相関データ
 */
const FORM_SUCCESS_CORRELATION = {
  release_speed: {
    快速: { fg_pct: 0.42, success_factor: 1.2 },
    適切: { fg_pct: 0.38, success_factor: 1.0 },
    遅い: { fg_pct: 0.34, success_factor: 0.8 },
    不安定: { fg_pct: 0.31, success_factor: 0.7 },
  },

  arc: {
    完璧: { fg_pct: 0.44, success_factor: 1.3 },
    高弧道: { fg_pct: 0.41, success_factor: 1.2 },
    理想的: { fg_pct: 0.39, success_factor: 1.1 },
    良好: { fg_pct: 0.37, success_factor: 1.0 },
    標準: { fg_pct: 0.35, success_factor: 0.9 },
    低め: { fg_pct: 0.32, success_factor: 0.8 },
    平坦: { fg_pct: 0.29, success_factor: 0.7 },
  },

  balance: {
    優秀: { fg_pct: 0.43, success_factor: 1.25 },
    安定: { fg_pct: 0.4, success_factor: 1.15 },
    良い: { fg_pct: 0.37, success_factor: 1.0 },
    普通: { fg_pct: 0.34, success_factor: 0.85 },
    不安定: { fg_pct: 0.31, success_factor: 0.75 },
  },

  follow_through: {
    完璧: { fg_pct: 0.42, success_factor: 1.2 },
    教科書的: { fg_pct: 0.41, success_factor: 1.18 },
    優秀: { fg_pct: 0.39, success_factor: 1.1 },
    安定: { fg_pct: 0.37, success_factor: 1.05 },
    良好: { fg_pct: 0.35, success_factor: 1.0 },
    改善必要: { fg_pct: 0.32, success_factor: 0.85 },
    短い: { fg_pct: 0.29, success_factor: 0.75 },
  },
};

/**
 * 学習用評価マッピング
 */
const EVALUATION_MAPPING = {
  pose_to_characteristics: {
    // PoseNetキーポイントから特徴抽出
    release_speed: (poses) => {
      // 腕の動作速度を計算
      const armMovement = calculateArmMovementSpeed(poses);
      if (armMovement > 0.8) return "快速";
      if (armMovement > 0.6) return "適切";
      if (armMovement > 0.4) return "遅い";
      return "不安定";
    },

    arc: (poses) => {
      // シュート弧度を計算
      const shootingArc = calculateShootingArc(poses);
      if (shootingArc > 50) return "高弧道";
      if (shootingArc > 45) return "理想的";
      if (shootingArc > 40) return "良好";
      if (shootingArc > 35) return "標準";
      if (shootingArc > 30) return "低め";
      return "平坦";
    },

    balance: (poses) => {
      // 体重心の安定性
      const balanceScore = calculateBalanceStability(poses);
      if (balanceScore > 4.5) return "優秀";
      if (balanceScore > 4.0) return "安定";
      if (balanceScore > 3.5) return "良い";
      if (balanceScore > 3.0) return "普通";
      return "不安定";
    },

    follow_through: (poses) => {
      // フォロースルーの質
      const followThroughQuality = calculateFollowThroughQuality(poses);
      if (followThroughQuality > 4.8) return "完璧";
      if (followThroughQuality > 4.5) return "優秀";
      if (followThroughQuality > 4.0) return "安定";
      if (followThroughQuality > 3.5) return "良好";
      if (followThroughQuality > 3.0) return "改善必要";
      return "短い";
    },
  },
};

// ヘルパー関数
function calculateArmMovementSpeed(poses) {
  // 腕の動作速度計算ロジック
  if (poses.length < 2) return 0.5;

  const wrist = poses[poses.length - 1].keypoints[10]; // 右手首
  const prevWrist = poses[poses.length - 2].keypoints[10];

  const speed = Math.sqrt(
    Math.pow(wrist.x - prevWrist.x, 2) + Math.pow(wrist.y - prevWrist.y, 2)
  );

  return Math.min(speed / 50, 1.0); // 正規化
}

function calculateShootingArc(poses) {
  // シュート弧度計算
  if (poses.length < 3) return 40;

  const shoulder = poses[0].keypoints[6]; // 右肩
  const elbow = poses[Math.floor(poses.length / 2)].keypoints[8]; // 右肘
  const wrist = poses[poses.length - 1].keypoints[10]; // 右手首

  // 3点から角度を計算
  const angle1 = Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x);
  const angle2 = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);

  return Math.abs(angle2 - angle1) * (180 / Math.PI);
}

function calculateBalanceStability(poses) {
  // 体重心の安定性
  const centerPoints = poses.map((pose) => {
    const leftHip = pose.keypoints[11];
    const rightHip = pose.keypoints[12];
    return {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };
  });

  // 重心の移動量を計算
  let totalMovement = 0;
  for (let i = 1; i < centerPoints.length; i++) {
    const movement = Math.sqrt(
      Math.pow(centerPoints[i].x - centerPoints[i - 1].x, 2) +
        Math.pow(centerPoints[i].y - centerPoints[i - 1].y, 2)
    );
    totalMovement += movement;
  }

  const avgMovement = totalMovement / (centerPoints.length - 1);
  return Math.max(5 - avgMovement / 10, 1); // 動きが少ないほど高スコア
}

function calculateFollowThroughQuality(poses) {
  // フォロースルーの質
  if (poses.length < 5) return 3.0;

  const lastPoses = poses.slice(-5);
  const wrists = lastPoses.map((pose) => pose.keypoints[10]);

  // 手首の下向き動作をチェック
  let downwardMotion = 0;
  for (let i = 1; i < wrists.length; i++) {
    if (wrists[i].y > wrists[i - 1].y) downwardMotion++;
  }

  return 2 + (downwardMotion / (wrists.length - 1)) * 3; // 2-5点
}

// エクスポート
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NBA_SHOOTING_DATA,
    FORM_SUCCESS_CORRELATION,
    EVALUATION_MAPPING,
  };
}
