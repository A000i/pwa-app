// 詳細分析ページのJavaScript

let analysisData = null;

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", () => {
  loadAnalysisData();
  generateDetailedAnalysis();
  drawScoreChart();
});

// 分析データの読み込み
function loadAnalysisData() {
  const storedData = localStorage.getItem("detailedAnalysis");
  console.log("保存された分析データ:", storedData);

  if (storedData) {
    try {
      analysisData = JSON.parse(storedData);
      console.log("分析データ読み込み成功:", analysisData);
    } catch (error) {
      console.error("分析データの解析エラー:", error);
      analysisData = null;
    }
  } else {
    console.log("分析データが見つかりません");
    analysisData = null;
  }
}

// 詳細分析の生成
function generateDetailedAnalysis() {
  generateBasicPostureAnalysis();
  generateActionAnalysis();
  generateRecommendations();
}

// 基本姿勢評価の詳細表示
function generateBasicPostureAnalysis() {
  const container = document.getElementById("basicPostureAnalysis");

  if (!analysisData || !analysisData.pose) {
    console.log("基本姿勢評価: 分析データが見つかりません");
    // フォールバックとしてサンプルデータを表示
    const sampleEvaluations = [
      {
        part: "重心バランス",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
      {
        part: "膝の角度",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
      {
        part: "背筋の伸び",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
      {
        part: "足幅",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
    ];

    let html =
      "<p style='color: orange; margin-bottom: 15px;'>⚠️ 分析データが見つかりません。分析ページから再度アクセスしてください。</p>";
    sampleEvaluations.forEach((eval) => {
      html += `
        <div class="evaluation-item">
          <div class="part-name">${eval.part}</div>
          <div class="score-info">
            <div class="score-value ${eval.class}">${eval.score}/5 ${eval.rating}</div>
            <div class="score-detail">${eval.detail}</div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    return;
  }

  const evaluations = analyzeBasicPosture(analysisData.pose.keypoints);

  let html = "";
  evaluations.forEach((eval) => {
    html += `
      <div class="evaluation-item">
        <div class="part-name">${eval.part}</div>
        <div class="score-info">
          <div class="score-value ${eval.class}">${eval.score}/5 ${eval.rating}</div>
          <div class="score-detail">${eval.detail}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 動作別評価の表示
function generateActionAnalysis() {
  const container = document.getElementById("actionAnalysis");

  if (!analysisData || !analysisData.pose) {
    console.log("動作別評価: 分析データが見つかりません");
    // フォールバックとしてサンプルデータを表示
    const sampleActionEvaluations = [
      {
        part: "シュートフォーム",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
      {
        part: "ディフェンススタンス",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
      {
        part: "ドリブル姿勢",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
      {
        part: "重心安定性",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "データ読み込み中...",
      },
    ];

    let html =
      "<p style='color: orange; margin-bottom: 15px;'>⚠️ 分析データが見つかりません。分析ページから再度アクセスしてください。</p>";
    sampleActionEvaluations.forEach((eval) => {
      html += `
        <div class="evaluation-item">
          <div class="part-name">${eval.part}</div>
          <div class="score-info">
            <div class="score-value ${eval.class}">${eval.score}/5 ${eval.rating}</div>
            <div class="score-detail">${eval.detail}</div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    return;
  }

  const actionEvaluations = analyzeActionSpecific(analysisData.pose.keypoints);

  let html = "";
  actionEvaluations.forEach((eval) => {
    html += `
      <div class="evaluation-item">
        <div class="part-name">${eval.part}</div>
        <div class="score-info">
          <div class="score-value ${eval.class}">${eval.score}/5 ${eval.rating}</div>
          <div class="score-detail">${eval.detail}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 動作別評価の分析
function analyzeActionSpecific(keypoints) {
  const evaluations = [];

  // シュートフォーム分析
  const shootingForm = analyzeShootingForm(keypoints);
  evaluations.push({
    part: "シュートフォーム",
    score: shootingForm.score,
    rating: shootingForm.rating,
    class: shootingForm.class,
    detail: shootingForm.detail,
  });

  // ディフェンススタンス分析
  const defenseStance = analyzeDefenseStance(keypoints);
  evaluations.push({
    part: "ディフェンススタンス",
    score: defenseStance.score,
    rating: defenseStance.rating,
    class: defenseStance.class,
    detail: defenseStance.detail,
  });

  // ドリブル姿勢分析
  const dribblePosture = analyzeDribblePosture(keypoints);
  evaluations.push({
    part: "ドリブル姿勢",
    score: dribblePosture.score,
    rating: dribblePosture.rating,
    class: dribblePosture.class,
    detail: dribblePosture.detail,
  });

  // 重心安定性分析
  const stability = analyzeStability(keypoints);
  evaluations.push({
    part: "重心安定性",
    score: stability.score,
    rating: stability.rating,
    class: stability.class,
    detail: stability.detail,
  });

  return evaluations;
}

// シュートフォーム分析
function analyzeShootingForm(keypoints) {
  try {
    const rightShoulder = keypoints[6];
    const rightElbow = keypoints[8];
    const rightWrist = keypoints[10];

    if (
      rightShoulder.score > 0.5 &&
      rightElbow.score > 0.5 &&
      rightWrist.score > 0.5
    ) {
      const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

      if (elbowAngle >= 85 && elbowAngle <= 95) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: `肘の角度: ${elbowAngle.toFixed(1)}° (理想的)`,
        };
      } else if (elbowAngle >= 75 && elbowAngle <= 105) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: `肘の角度: ${elbowAngle.toFixed(1)}° (良好)`,
        };
      } else if (elbowAngle >= 60 && elbowAngle <= 120) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: `肘の角度: ${elbowAngle.toFixed(1)}° (改善可能)`,
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: `肘の角度: ${elbowAngle.toFixed(1)}° (要修正)`,
        };
      }
    }
  } catch (error) {
    console.error("シュートフォーム分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

// ディフェンススタンス分析
function analyzeDefenseStance(keypoints) {
  try {
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    const leftKnee = keypoints[13];
    const rightKnee = keypoints[14];

    if (
      leftHip.score > 0.5 &&
      rightHip.score > 0.5 &&
      leftKnee.score > 0.5 &&
      rightKnee.score > 0.5
    ) {
      const hipCenter = { y: (leftHip.y + rightHip.y) / 2 };
      const kneeCenter = { y: (leftKnee.y + rightKnee.y) / 2 };
      const hipKneeDistance = Math.abs(hipCenter.y - kneeCenter.y);

      if (hipKneeDistance > 50) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: "腰を十分に落とした理想的なスタンス",
        };
      } else if (hipKneeDistance > 35) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: "良好なディフェンススタンス",
        };
      } else if (hipKneeDistance > 20) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: "もう少し腰を落とすとより良い",
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: "腰をもっと落として低いスタンスを",
        };
      }
    }
  } catch (error) {
    console.error("ディフェンススタンス分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

// ドリブル姿勢分析
function analyzeDribblePosture(keypoints) {
  try {
    const nose = keypoints[0];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (nose.score > 0.5 && leftHip.score > 0.5 && rightHip.score > 0.5) {
      const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
      };
      const forwardLean =
        (Math.atan2(nose.x - hipCenter.x, hipCenter.y - nose.y) * 180) /
        Math.PI;

      if (Math.abs(forwardLean) >= 5 && Math.abs(forwardLean) <= 15) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: `理想的な前傾姿勢: ${Math.abs(forwardLean).toFixed(1)}°`,
        };
      } else if (Math.abs(forwardLean) <= 25) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: `良好な前傾姿勢: ${Math.abs(forwardLean).toFixed(1)}°`,
        };
      } else if (Math.abs(forwardLean) <= 35) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: `前傾角度: ${Math.abs(forwardLean).toFixed(1)}°`,
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: `前傾角度調整が必要: ${Math.abs(forwardLean).toFixed(1)}°`,
        };
      }
    }
  } catch (error) {
    console.error("ドリブル姿勢分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

// 重心安定性分析
function analyzeStability(keypoints) {
  try {
    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (
      leftAnkle.score > 0.5 &&
      rightAnkle.score > 0.5 &&
      leftHip.score > 0.5 &&
      rightHip.score > 0.5
    ) {
      const ankleCenter = { x: (leftAnkle.x + rightAnkle.x) / 2 };
      const hipCenter = { x: (leftHip.x + rightHip.x) / 2 };
      const stabilityOffset = Math.abs(ankleCenter.x - hipCenter.x);

      if (stabilityOffset < 15) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: "非常に安定した重心",
        };
      } else if (stabilityOffset < 25) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: "安定した重心",
        };
      } else if (stabilityOffset < 40) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: "重心バランス普通",
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: "重心バランスの改善が必要",
        };
      }
    }
  } catch (error) {
    console.error("重心安定性分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

// 改善提案の生成
function generateRecommendations() {
  const container = document.getElementById("recommendationList");

  if (!analysisData || !analysisData.pose) {
    console.log("改善提案: 分析データが見つかりません");
    const defaultRecommendations = [
      "分析データが見つかりません。分析ページから「詳細分析へ」ボタンを使用してアクセスしてください。",
      "正しい姿勢で動画を撮影し、骨格推定を実行してから詳細分析を行ってください。",
      "バスケットボールの基本姿勢：膝を適度に曲げ、重心を安定させ、背筋を伸ばしましょう。",
    ];

    let html = "";
    defaultRecommendations.forEach((rec) => {
      html += `<li>${rec}</li>`;
    });
    container.innerHTML = html;
    return;
  }

  const evaluations = analyzeBasicPosture(analysisData.pose.keypoints);
  const actionEvaluations = analyzeActionSpecific(analysisData.pose.keypoints);

  const allEvaluations = [...evaluations, ...actionEvaluations];
  const recommendations = [];

  allEvaluations.forEach((eval) => {
    if (eval.score <= 3) {
      recommendations.push(getRecommendation(eval.part, eval.score));
    }
  });

  if (recommendations.length === 0) {
    recommendations.push(
      "素晴らしい姿勢です！現在のフォームを維持してください。"
    );
  }

  let html = "";
  recommendations.forEach((rec) => {
    html += `<li>${rec}</li>`;
  });

  container.innerHTML = html;
}

// 改善提案の取得
function getRecommendation(part, score) {
  const recommendations = {
    重心バランス:
      "体の中心軸を意識して、肩と腰のラインを揃えましょう。鏡を見ながら練習すると効果的です。",
    膝の角度:
      "膝をもう少し曲げて、より安定したスタンスを心がけましょう。スクワット練習が効果的です。",
    背筋の伸び:
      "背筋を伸ばし、胸を張った姿勢を意識しましょう。壁に背中をつけた姿勢練習をおすすめします。",
    足幅: "肩幅程度の足幅を保ち、安定したベースを作りましょう。",
    シュートフォーム:
      "肘の角度を90度に近づけ、一貫したシュートフォームを練習しましょう。",
    ディフェンススタンス:
      "腰をもっと落として、低い姿勢からのクイックな動きを練習しましょう。",
    ドリブル姿勢:
      "適度な前傾姿勢でボールをプロテクトし、視野を確保しましょう。",
    重心安定性: "体幹トレーニングで重心のコントロール能力を向上させましょう。",
  };

  return recommendations[part] || "継続的な練習で改善していきましょう。";
}

// スコアチャートの描画
function drawScoreChart() {
  const canvas = document.getElementById("scoreChart");
  const ctx = canvas.getContext("2d");

  if (!analysisData || !analysisData.pose) {
    console.log("スコアチャート: 分析データが見つかりません");
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景色
    ctx.fillStyle = "#f8f9ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // メッセージ表示
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "分析データが見つかりません",
      canvas.width / 2,
      canvas.height / 2 - 20
    );

    ctx.fillStyle = "#888";
    ctx.font = "12px Arial";
    ctx.fillText(
      "分析ページから「詳細分析へ」ボタンでアクセスしてください",
      canvas.width / 2,
      canvas.height / 2 + 10
    );
    return;
  }

  const evaluations = analyzeBasicPosture(analysisData.pose.keypoints);
  const actionEvaluations = analyzeActionSpecific(analysisData.pose.keypoints);
  const allEvaluations = [...evaluations, ...actionEvaluations];

  // キャンバスをクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // チャートの描画エリアを定義（最長ラベル対応のスペースを確保）
  const chartArea = {
    left: 50,
    top: 60, // タイトル用のスペース
    right: canvas.width - 25,
    bottom: canvas.height - 200, // 8文字ラベル「ディフェンススタンス」対応
  };

  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;

  // バーの幅と間隔を計算
  const totalBars = allEvaluations.length;
  const totalSpacing = chartWidth * 0.2; // 全体の20%をスペースに
  const totalBarWidth = chartWidth - totalSpacing;
  const barWidth = totalBarWidth / totalBars;
  const barSpacing = totalSpacing / (totalBars + 1);

  allEvaluations.forEach((eval, index) => {
    const x =
      chartArea.left + barSpacing + index * (barWidth + barSpacing / totalBars);
    const height = (eval.score / 5) * chartHeight;
    const y = chartArea.bottom - height;

    // バーの描画
    ctx.fillStyle = getColorForClass(eval.class);
    ctx.fillRect(x, y, barWidth, height);

    // バーの枠線
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, height);

    // スコアテキスト（バーの上、適切な間隔を保つ）
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(eval.score.toString(), x + barWidth / 2, y - 8);

    // ラベルをすべて縦書きで統一
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    const centerX = x + barWidth / 2;
    let startY = chartArea.bottom + 35; // 開始位置をさらに余裕を持って下に移動

    // すべてのラベルを縦書きで表示
    for (let i = 0; i < eval.part.length; i++) {
      ctx.fillText(eval.part[i], centerX, startY + i * 18); // 間隔を広げる
    }
  });

  // Y軸のスケール表示
  ctx.fillStyle = "#666";
  ctx.font = "12px Arial";
  ctx.textAlign = "right";

  for (let i = 0; i <= 5; i++) {
    const y = chartArea.bottom - (i / 5) * chartHeight;
    ctx.fillText(i.toString(), chartArea.left - 15, y + 4);

    // グリッドライン
    if (i > 0) {
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();
    }
  }

  // 軸の線
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Y軸
  ctx.moveTo(chartArea.left, chartArea.top);
  ctx.lineTo(chartArea.left, chartArea.bottom);
  // X軸
  ctx.moveTo(chartArea.left, chartArea.bottom);
  ctx.lineTo(chartArea.right, chartArea.bottom);
  ctx.stroke();

  // Y軸ラベル
  ctx.save();
  ctx.translate(20, chartArea.top + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#333";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("スコア", 0, 0);
  ctx.restore();

  // タイトル（チャートエリアから適切な間隔を保つ）
  ctx.fillStyle = "#333";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("各項目の評価スコア", canvas.width / 2, 30);
}

// クラスに応じた色の取得
function getColorForClass(className) {
  const colors = {
    excellent: "#28a745",
    good: "#17a2b8",
    normal: "#ffc107",
    poor: "#dc3545",
  };
  return colors[className] || "#6c757d";
}

// 角度計算関数（analysis.jsから複製）
function calculateAngle(point1, point2, point3) {
  const radians =
    Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

// 基本姿勢評価関数（analysis.jsから複製）
function analyzeBasicPosture(keypoints) {
  const evaluations = [];

  // 1. 重心バランス評価
  const balanceScore = analyzeBalance(keypoints);
  evaluations.push({
    part: "重心バランス",
    score: balanceScore.score,
    rating: balanceScore.rating,
    class: balanceScore.class,
    detail: balanceScore.detail,
  });

  // 2. 膝の角度評価
  const kneeScore = analyzeKneeAngle(keypoints);
  evaluations.push({
    part: "膝の角度",
    score: kneeScore.score,
    rating: kneeScore.rating,
    class: kneeScore.class,
    detail: kneeScore.detail,
  });

  // 3. 背筋の伸び評価
  const spineScore = analyzeSpineAlignment(keypoints);
  evaluations.push({
    part: "背筋の伸び",
    score: spineScore.score,
    rating: spineScore.rating,
    class: spineScore.class,
    detail: spineScore.detail,
  });

  // 4. 足幅評価
  const stanceScore = analyzeStanceWidth(keypoints);
  evaluations.push({
    part: "足幅",
    score: stanceScore.score,
    rating: stanceScore.rating,
    class: stanceScore.class,
    detail: stanceScore.detail,
  });

  return evaluations;
}

// 分析関数（analysis.jsから複製）
function analyzeBalance(keypoints) {
  try {
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (
      leftShoulder.score > 0.5 &&
      rightShoulder.score > 0.5 &&
      leftHip.score > 0.5 &&
      rightHip.score > 0.5
    ) {
      const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
      const hipCenter = (leftHip.x + rightHip.x) / 2;
      const deviation = Math.abs(shoulderCenter - hipCenter);

      if (deviation < 10) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: `軸のズレ: ${deviation.toFixed(1)}px`,
        };
      } else if (deviation < 20) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: `軸のズレ: ${deviation.toFixed(1)}px`,
        };
      } else if (deviation < 30) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: `軸のズレ: ${deviation.toFixed(1)}px`,
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: `軸のズレ: ${deviation.toFixed(1)}px`,
        };
      }
    }
  } catch (error) {
    console.error("重心バランス分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

function analyzeKneeAngle(keypoints) {
  try {
    const leftHip = keypoints[11];
    const leftKnee = keypoints[13];
    const leftAnkle = keypoints[15];

    if (leftHip.score > 0.5 && leftKnee.score > 0.5 && leftAnkle.score > 0.5) {
      const angle = calculateAngle(leftHip, leftKnee, leftAnkle);

      if (angle >= 140 && angle <= 160) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: `膝の角度: ${angle.toFixed(1)}°`,
        };
      } else if (angle >= 120 && angle <= 170) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: `膝の角度: ${angle.toFixed(1)}°`,
        };
      } else if (angle >= 100 && angle <= 180) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: `膝の角度: ${angle.toFixed(1)}°`,
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: `膝の角度: ${angle.toFixed(1)}°`,
        };
      }
    }
  } catch (error) {
    console.error("膝角度分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

function analyzeSpineAlignment(keypoints) {
  try {
    const nose = keypoints[0];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (
      nose.score > 0.5 &&
      leftShoulder.score > 0.5 &&
      rightShoulder.score > 0.5 &&
      leftHip.score > 0.5 &&
      rightHip.score > 0.5
    ) {
      const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };
      const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
      };

      const spineAngle =
        (Math.atan2(
          shoulderCenter.x - hipCenter.x,
          hipCenter.y - shoulderCenter.y
        ) *
          180) /
        Math.PI;
      const deviation = Math.abs(spineAngle);

      if (deviation < 5) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: `背筋の傾き: ${deviation.toFixed(1)}°`,
        };
      } else if (deviation < 10) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: `背筋の傾き: ${deviation.toFixed(1)}°`,
        };
      } else if (deviation < 15) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: `背筋の傾き: ${deviation.toFixed(1)}°`,
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: `背筋の傾き: ${deviation.toFixed(1)}°`,
        };
      }
    }
  } catch (error) {
    console.error("背筋分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

function analyzeStanceWidth(keypoints) {
  try {
    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];

    if (
      leftAnkle.score > 0.5 &&
      rightAnkle.score > 0.5 &&
      leftShoulder.score > 0.5 &&
      rightShoulder.score > 0.5
    ) {
      const ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
      const ratio = ankleWidth / shoulderWidth;

      if (ratio >= 0.8 && ratio <= 1.2) {
        return {
          score: 5,
          rating: "優秀",
          class: "excellent",
          detail: `足幅/肩幅比: ${ratio.toFixed(2)}`,
        };
      } else if (ratio >= 0.6 && ratio <= 1.4) {
        return {
          score: 4,
          rating: "良好",
          class: "good",
          detail: `足幅/肩幅比: ${ratio.toFixed(2)}`,
        };
      } else if (ratio >= 0.4 && ratio <= 1.6) {
        return {
          score: 3,
          rating: "普通",
          class: "normal",
          detail: `足幅/肩幅比: ${ratio.toFixed(2)}`,
        };
      } else {
        return {
          score: 2,
          rating: "要改善",
          class: "poor",
          detail: `足幅/肩幅比: ${ratio.toFixed(2)}`,
        };
      }
    }
  } catch (error) {
    console.error("足幅分析エラー:", error);
  }

  return { score: 3, rating: "普通", class: "normal", detail: "分析中..." };
}

// 戻るボタン
function goBack() {
  window.history.back();
}

// レポート出力
function downloadReport() {
  if (!analysisData) {
    alert("分析データが見つかりません");
    return;
  }

  const evaluations = analyzeBasicPosture(analysisData.pose.keypoints);
  const actionEvaluations = analyzeActionSpecific(analysisData.pose.keypoints);

  let reportText = `バスケットボール姿勢分析レポート\n`;
  reportText += `分析日時: ${new Date(
    analysisData.timestamp
  ).toLocaleString()}\n\n`;

  reportText += `基本姿勢評価:\n`;
  evaluations.forEach((eval) => {
    reportText += `${eval.part}: ${eval.score}/5 ${eval.rating} (${eval.detail})\n`;
  });

  reportText += `\n動作別評価:\n`;
  actionEvaluations.forEach((eval) => {
    reportText += `${eval.part}: ${eval.score}/5 ${eval.rating} (${eval.detail})\n`;
  });

  const blob = new Blob([reportText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `basketball-analysis-${
    new Date().toISOString().split("T")[0]
  }.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
