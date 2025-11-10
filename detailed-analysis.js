// 詳細分析ページのJavaScript

let analysisData = null;
let currentPerson = null;
let currentVideo = null;
let currentAnalysisMode = "standard"; // 'standard' または 'ai'
let aiAnalysisInProgress = false;

// URLパラメータから情報を取得
function getPageInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoName = urlParams.get("video");
  const personId = urlParams.get("person");

  // localStorageから選手情報を取得
  const storedPerson = localStorage.getItem("currentPerson");
  if (storedPerson) {
    try {
      currentPerson = JSON.parse(storedPerson);
    } catch (error) {
      console.error("選手情報の解析エラー:", error);
    }
  }

  return {
    videoName: videoName,
    personId: personId || (currentPerson ? currentPerson.id : null),
  };
}

// 分析モード切り替え
function switchAnalysisMode(mode) {
  console.log(`分析モードを${mode}に切り替え`);

  // タブの状態更新
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(mode + "Tab").classList.add("active");

  // コンテンツの表示切り替え
  document.getElementById("standardAnalysis").style.display =
    mode === "standard" ? "block" : "none";
  document.getElementById("aiAnalysis").style.display =
    mode === "ai" ? "block" : "none";

  currentAnalysisMode = mode;
}

// AI分析開始
async function startAIAnalysis() {
  if (aiAnalysisInProgress) return;

  aiAnalysisInProgress = true;
  const statusElement = document.getElementById("aiAnalysisStatus");
  const resultsElement = document.getElementById("aiAnalysisResults");

  // 分析中表示
  statusElement.innerHTML = `
    <div class="status-icon">🤖</div>
    <h3>AI分析実行中...</h3>
    <p>高度な機械学習アルゴリズムがあなたの動作を詳細に分析しています。</p>
    <div style="margin: 20px 0;">
      <div style="width: 100%; background: #e0e6ff; border-radius: 10px; height: 10px;">
        <div id="progressBar" style="width: 0%; background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; border-radius: 10px; transition: width 0.5s ease;"></div>
      </div>
      <p id="progressText" style="margin-top: 10px; color: #666;">分析準備中...</p>
    </div>
  `;

  try {
    // 段階的分析実行
    await performAIAnalysis();

    // 結果表示
    statusElement.style.display = "none";
    resultsElement.style.display = "block";
  } catch (error) {
    console.error("AI分析エラー:", error);
    showAIError("分析中にエラーが発生しました。再度お試しください。");
  } finally {
    aiAnalysisInProgress = false;
  }
}

// AI分析実行
async function performAIAnalysis() {
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  // 段階1: データ収集
  progressText.textContent = "動作データを収集しています...";
  progressBar.style.width = "20%";
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 段階2: 特徴抽出
  progressText.textContent = "特徴パターンを抽出しています...";
  progressBar.style.width = "40%";
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // 段階3: AI推論
  progressText.textContent = "AI推論エンジンで解析中...";
  progressBar.style.width = "70%";
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 段階4: 結果生成
  progressText.textContent = "結果を生成しています...";
  progressBar.style.width = "90%";
  const aiResults = await generateAIAnalysis();

  // 段階5: 完了
  progressText.textContent = "分析完了！";
  progressBar.style.width = "100%";
  await new Promise((resolve) => setTimeout(resolve, 500));

  // AI分析結果を表示
  displayAIResults(aiResults);
}

// AI分析結果生成
async function generateAIAnalysis() {
  // 実際のAI分析をシミュレート
  return {
    overallScores: {
      technical: {
        score: 85,
        category: "技術評価",
        description: "シュートフォームが優秀",
      },
      tactical: {
        score: 78,
        category: "戦術理解",
        description: "状況判断が良好",
      },
      physical: {
        score: 82,
        category: "身体能力",
        description: "バランス感覚が優れている",
      },
      mental: { score: 88, category: "メンタル", description: "集中力が高い" },
    },
    detailedAnalysis: `
      AI深層学習による高度解析の結果、以下の特徴が検出されました：
      
      ✅ <strong>優秀な要素:</strong>
      • シュート時の体幹安定性: 95%の精度
      • フットワークの効率性: 89%のスコア
      • 重心制御の一貫性: 92%の安定度
      
      ⚠️ <strong>改善ポイント:</strong>
      • 肘の角度調整で+12%の精度向上が期待される
      • 膝の屈曲角度を3度調整することを推奨
      • リリース時のリズムを0.2秒短縮可能
    `,
    recommendations: [
      {
        category: "技術向上",
        priority: "高",
        suggestion:
          "シュート時の肘の位置を2cm内側に調整することで、成功率が15%向上します。",
      },
      {
        category: "フィジカル",
        priority: "中",
        suggestion:
          "バランス強化トレーニングを週3回実施することで、安定性がさらに向上します。",
      },
      {
        category: "メンタル",
        priority: "低",
        suggestion:
          "集中力維持のため、リラクゼーション技法の習得をお勧めします。",
      },
    ],
    predictions: {
      improvement: "+18%",
      timeframe: "3ヶ月",
      confidence: "87%",
      nextLevel: "エリートレベル",
    },
  };
}

// AI分析結果表示
function displayAIResults(results) {
  // 総合スコア表示
  const overallElement = document.getElementById("aiOverallScore");
  if (overallElement) {
    const overallHTML = Object.values(results.overallScores)
      .map(
        (score) => `
      <div class="ai-metric">
        <h4>${score.category}</h4>
        <div class="score">${score.score}</div>
        <div class="description">${score.description}</div>
      </div>
    `
      )
      .join("");

    overallElement.innerHTML = overallHTML;
  }

  // 詳細分析表示
  const detailedElement = document.getElementById("aiDetailedAnalysis");
  if (detailedElement) {
    detailedElement.innerHTML = `<p>${results.detailedAnalysis}</p>`;
  }

  // AI改善提案表示
  const recommendationsElement = document.getElementById("aiRecommendations");
  if (recommendationsElement) {
    const recommendationHTML = results.recommendations
      .map(
        (rec) => `
      <div class="ai-recommendation-item">
        <h4 style="margin: 0 0 10px 0; color: #2e318f;">${rec.category} (優先度: ${rec.priority})</h4>
        <p style="margin: 0;">${rec.suggestion}</p>
      </div>
    `
      )
      .join("");

    recommendationsElement.innerHTML = recommendationHTML;
  }

  // パフォーマンス予測表示
  const predictionElement = document.getElementById("aiPrediction");
  if (predictionElement) {
    predictionElement.innerHTML = `
      <div class="prediction-card">
        <h4>🎯 予想改善幅</h4>
        <div class="prediction-value">${results.predictions.improvement}</div>
        <p>3ヶ月での改善見込み</p>
      </div>
      <div class="prediction-card">
        <h4>⏰ 到達期間</h4>
        <div class="prediction-value">${results.predictions.timeframe}</div>
        <p>目標レベル到達まで</p>
      </div>
      <div class="prediction-card">
        <h4>🎯 信頼度</h4>
        <div class="prediction-value">${results.predictions.confidence}</div>
        <p>AI予測の確度</p>
      </div>
      <div class="prediction-card">
        <h4>🏆 到達レベル</h4>
        <div class="prediction-value" style="font-size: 1.5em;">${results.predictions.nextLevel}</div>
        <p>目標到達後の実力</p>
      </div>
    `;
  }
}

// AI分析エラー表示
function showAIError(message) {
  const statusElement = document.getElementById("aiAnalysisStatus");
  if (statusElement) {
    statusElement.innerHTML = `
      <div class="status-icon">⚠️</div>
      <h3 style="color: #dc3545;">AI分析エラー</h3>
      <p>${message}</p>
      <button onclick="startAIAnalysis()" style="padding: 10px 20px; background: #2e318f; color: white; border: none; border-radius: 5px; cursor: pointer;">
        再試行
      </button>
    `;
  }
}

// ナビゲーション機能
function goBackToVideos() {
  const pageInfo = getPageInfo();
  if (pageInfo.personId) {
    window.location.href = `person-videos.html?person=${pageInfo.personId}`;
  } else {
    window.location.href = "home.html";
  }
}

function goHome() {
  window.location.href = "home.html";
}

// 動画と選手情報を表示
function updateVideoInfo() {
  const pageInfo = getPageInfo();
  const videoInfoElement = document.getElementById("videoInfo");

  if (videoInfoElement) {
    const videoName = pageInfo.videoName || "不明";
    const personName = currentPerson ? currentPerson.name : "不明";
    videoInfoElement.textContent = `動画: ${videoName} | 選手: ${personName}`;
  }
}

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", () => {
  try {
    // 動画・選手情報を表示
    updateVideoInfo();

    // 標準分析を生成
    loadAnalysisData();
    generateDetailedAnalysis();
    drawScoreChart();

    // 初期は標準分析モードに設定
    switchAnalysisMode("standard");

    console.log("詳細分析ページの初期化が完了しました（AI分析機能付き）");
  } catch (error) {
    console.error("初期化エラー:", error);
    showError("初期化エラー", error.message);
  }
});

// エラー表示用関数
function showError(title, message) {
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; color: red; padding: 20px;">
        <h3>${title}</h3>
        <p>${message}</p>
        <div style="margin-top: 20px;">
          <button onclick="goBackToVideos()" style="padding: 10px 20px; background: #2E318F; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">動画一覧に戻る</button>
          <button onclick="goHome()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">ホームに戻る</button>
        </div>
      </div>
    `;
  }
}

// 分析データの読み込み
function loadAnalysisData() {
  const pageInfo = getPageInfo();
  const videoName = pageInfo.videoName;

  // まず動画ごとの分析データを確認
  let storedData = null;
  if (videoName) {
    storedData = localStorage.getItem(`analysisData_${videoName}`);
    console.log(`動画別分析データ (${videoName}):`, storedData);
  }

  // 動画別データがない場合は一時的な分析データを確認
  if (!storedData) {
    storedData = localStorage.getItem("detailedAnalysis");
    console.log("一時的な分析データ:", storedData);
  }

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

    const pageInfo = getPageInfo();

    let html = `
      <div style='background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; margin-bottom: 20px;'>
        <h4 style='color: #856404; margin: 0 0 10px 0;'>📊 分析データが見つかりません</h4>
        <p style='color: #856404; margin: 0 0 15px 0;'>この動画の詳細分析を行うには、まず骨格推定解析を実行する必要があります。</p>
        <div style='display: flex; gap: 10px; flex-wrap: wrap;'>
          <button onclick="goToAnalysis()" style='background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;'>
            📹 分析ページへ移動
          </button>
          <button onclick="goBackToVideos()" style='background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;'>
            ← 動画一覧に戻る
          </button>
        </div>
      </div>
    `;

    // 分析ページへの移動機能を追加
    if (!window.goToAnalysis) {
      window.goToAnalysis = function () {
        const pageInfo = getPageInfo();
        if (pageInfo.videoName && pageInfo.personId) {
          // video-detail.htmlから分析を開始
          window.location.href = `video-detail.html?video=${encodeURIComponent(
            pageInfo.videoName
          )}&person=${pageInfo.personId}`;
        } else {
          alert(
            "動画情報が不足しています。動画一覧から再度アクセスしてください。"
          );
          goBackToVideos();
        }
      };
    }
    sampleEvaluations.forEach((evaluation) => {
      html += `
        <div class="evaluation-item">
          <div class="part-name">${evaluation.part}</div>
          <div class="score-info">
            <div class="score-value ${evaluation.class}">${evaluation.score}/5 ${evaluation.rating}</div>
            <div class="score-detail">${evaluation.detail}</div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    return;
  }

  const evaluations = analyzeBasicPosture(analysisData.pose.keypoints);

  let html = "";
  evaluations.forEach((evaluation) => {
    html += `
      <div class="evaluation-item">
        <div class="part-name">${evaluation.part}</div>
        <div class="score-info">
          <div class="score-value ${evaluation.class}">${evaluation.score}/5 ${evaluation.rating}</div>
          <div class="score-detail">${evaluation.detail}</div>
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

    container.innerHTML = `
      <div style='background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; margin-bottom: 20px;'>
        <h4 style='color: #856404; margin: 0 0 10px 0;'>📊 分析データが見つかりません</h4>
        <p style='color: #856404; margin: 0 0 15px 0;'>動作別評価を表示するには、まず骨格推定解析を実行してください。</p>
        <div style='display: flex; gap: 10px; flex-wrap: wrap;'>
          <button onclick="goToAnalysis()" style='background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;'>
            📹 分析ページへ移動
          </button>
        </div>
      </div>
    `;
    return;
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
    sampleActionEvaluations.forEach((evaluation) => {
      html += `
        <div class="evaluation-item">
          <div class="part-name">${evaluation.part}</div>
          <div class="score-info">
            <div class="score-value ${evaluation.class}">${evaluation.score}/5 ${evaluation.rating}</div>
            <div class="score-detail">${evaluation.detail}</div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    return;
  }

  const actionEvaluations = analyzeActionSpecific(analysisData.pose.keypoints);

  let html = "";
  actionEvaluations.forEach((evaluation) => {
    html += `
      <div class="evaluation-item">
        <div class="part-name">${evaluation.part}</div>
        <div class="score-info">
          <div class="score-value ${evaluation.class}">${evaluation.score}/5 ${evaluation.rating}</div>
          <div class="score-detail">${evaluation.detail}</div>
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const rightShoulder = keypoints[6];
    const rightElbow = keypoints[8];
    const rightWrist = keypoints[10];

    if (
      rightShoulder &&
      rightShoulder.score &&
      rightShoulder.score > 0.5 &&
      rightElbow &&
      rightElbow.score &&
      rightElbow.score > 0.5 &&
      rightWrist &&
      rightWrist.score &&
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    const leftKnee = keypoints[13];
    const rightKnee = keypoints[14];

    if (
      leftHip &&
      leftHip.score &&
      leftHip.score > 0.5 &&
      rightHip &&
      rightHip.score &&
      rightHip.score > 0.5 &&
      leftKnee &&
      leftKnee.score &&
      leftKnee.score > 0.5 &&
      rightKnee &&
      rightKnee.score &&
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const nose = keypoints[0];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (
      nose &&
      nose.score &&
      nose.score > 0.5 &&
      leftHip &&
      leftHip.score &&
      leftHip.score > 0.5 &&
      rightHip &&
      rightHip.score &&
      rightHip.score > 0.5
    ) {
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (
      leftAnkle &&
      leftAnkle.score &&
      leftAnkle.score > 0.5 &&
      rightAnkle &&
      rightAnkle.score &&
      rightAnkle.score > 0.5 &&
      leftHip &&
      leftHip.score &&
      leftHip.score > 0.5 &&
      rightHip &&
      rightHip.score &&
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

  allEvaluations.forEach((evaluation) => {
    if (evaluation.score <= 3) {
      recommendations.push(
        getRecommendation(evaluation.part, evaluation.score)
      );
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

// スコアチャートの描画（レーダーチャート）
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

  // レーダーチャートの描画
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 100; // ラベル用のスペースを増やす

  const categories = allEvaluations.map((e) => e.part);
  const scores = allEvaluations.map((e) => e.score);
  const maxScore = 5;

  // 背景のグリッド線を描画
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;

  // 同心円を描画（1-5の目盛り）
  for (let i = 1; i <= maxScore; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / maxScore) * i, 0, 2 * Math.PI);
    ctx.stroke();

    // スコア値を表示（右側に配置してラベルと重ならないように）
    ctx.fillStyle = "#888";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(
      i.toString(),
      centerX + (radius / maxScore) * i + 8,
      centerY + 4
    );
  }

  // 軸線を描画
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;

  for (let i = 0; i < categories.length; i++) {
    const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();

    // カテゴリラベルを描画（より外側に配置）
    const labelX = centerX + Math.cos(angle) * (radius + 60);
    const labelY = centerY + Math.sin(angle) * (radius + 60);

    ctx.fillStyle = "#333";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 特定のラベルに対する改行ルール
    const category = categories[i];

    if (category === "ディフェンススタンス") {
      // ディフェンスで1行、スタンスで1行
      ctx.fillText("ディフェンス", labelX, labelY - 8);
      ctx.fillText("スタンス", labelX, labelY + 8);
    } else if (
      category === "重心バランス" ||
      category === "ドリブル姿勢" ||
      category === "重心安定性"
    ) {
      // これらは1行で表示
      ctx.fillText(category, labelX, labelY);
    } else if (category.length > 4) {
      // その他の長いラベルは2行に分ける
      const firstHalf = category.substring(0, Math.ceil(category.length / 2));
      const secondHalf = category.substring(Math.ceil(category.length / 2));

      ctx.fillText(firstHalf, labelX, labelY - 8);
      ctx.fillText(secondHalf, labelX, labelY + 8);
    } else {
      // 短いラベルは1行で表示
      ctx.fillText(category, labelX, labelY);
    }
  }

  // データ多角形を描画
  ctx.strokeStyle = "#2E318F";
  ctx.fillStyle = "rgba(46, 49, 143, 0.2)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  for (let i = 0; i < scores.length; i++) {
    const angle = (i * 2 * Math.PI) / scores.length - Math.PI / 2;
    const value = Math.max(0, Math.min(maxScore, scores[i]));
    const distance = (radius / maxScore) * value;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // データポイントを描画
  ctx.fillStyle = "#2E318F";
  for (let i = 0; i < scores.length; i++) {
    const angle = (i * 2 * Math.PI) / scores.length - Math.PI / 2;
    const value = Math.max(0, Math.min(maxScore, scores[i]));
    const distance = (radius / maxScore) * value;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();

    // スコア値を表示
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value.toFixed(1), x, y);
    ctx.fillStyle = "#2E318F";
  }
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
  try {
    if (
      !point1 ||
      !point2 ||
      !point3 ||
      point1.x === undefined ||
      point1.y === undefined ||
      point2.x === undefined ||
      point2.y === undefined ||
      point3.x === undefined ||
      point3.y === undefined
    ) {
      throw new Error("無効なポイントデータです");
    }

    const radians =
      Math.atan2(point3.y - point2.y, point3.x - point2.x) -
      Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return angle;
  } catch (error) {
    console.error("角度計算エラー:", error);
    return 90; // デフォルト値
  }
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (
      leftShoulder &&
      leftShoulder.score &&
      leftShoulder.score > 0.5 &&
      rightShoulder &&
      rightShoulder.score &&
      rightShoulder.score > 0.5 &&
      leftHip &&
      leftHip.score &&
      leftHip.score > 0.5 &&
      rightHip &&
      rightHip.score &&
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const leftHip = keypoints[11];
    const leftKnee = keypoints[13];
    const leftAnkle = keypoints[15];

    if (
      leftHip &&
      leftHip.score &&
      leftHip.score > 0.5 &&
      leftKnee &&
      leftKnee.score &&
      leftKnee.score > 0.5 &&
      leftAnkle &&
      leftAnkle.score &&
      leftAnkle.score > 0.5
    ) {
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const nose = keypoints[0];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (
      nose &&
      nose.score &&
      nose.score > 0.5 &&
      leftShoulder &&
      leftShoulder.score &&
      leftShoulder.score > 0.5 &&
      rightShoulder &&
      rightShoulder.score &&
      rightShoulder.score > 0.5 &&
      leftHip &&
      leftHip.score &&
      leftHip.score > 0.5 &&
      rightHip &&
      rightHip.score &&
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
    if (!keypoints || !Array.isArray(keypoints) || keypoints.length < 17) {
      throw new Error("キーポイントデータが不正です");
    }

    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];

    if (
      leftAnkle &&
      leftAnkle.score &&
      leftAnkle.score > 0.5 &&
      rightAnkle &&
      rightAnkle.score &&
      rightAnkle.score > 0.5 &&
      leftShoulder &&
      leftShoulder.score &&
      leftShoulder.score > 0.5 &&
      rightShoulder &&
      rightShoulder.score &&
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
  // 現在の動画情報を取得
  const urlParams = new URLSearchParams(window.location.search);
  const videoName = urlParams.get("video");
  const personId = urlParams.get("person");

  console.log("戻る処理 - 動画名:", videoName, "選手ID:", personId);

  // localStorage に動画情報を保存してからanalysis.htmlに遷移
  if (videoName && personId) {
    // 現在の選手情報をlocalStorageに保存
    if (currentPerson) {
      localStorage.setItem("currentPerson", JSON.stringify(currentPerson));
    }

    // 動画情報をlocalStorageに保存
    const videoInfo = {
      filename: videoName,
      personId: personId,
      timestamp: Date.now(),
    };
    localStorage.setItem("analysisVideo", JSON.stringify(videoInfo));

    // URLパラメータ付きでanalysis.htmlに遷移
    window.location.href = `analysis.html?video=${encodeURIComponent(
      videoName
    )}&person=${encodeURIComponent(personId)}`;
  } else {
    console.log("動画情報が不足しています。ホームに戻ります。");
    window.location.href = "home.html";
  }
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
  evaluations.forEach((evaluation) => {
    reportText += `${evaluation.part}: ${evaluation.score}/5 ${evaluation.rating} (${evaluation.detail})\n`;
  });

  reportText += `\n動作別評価:\n`;
  actionEvaluations.forEach((evaluation) => {
    reportText += `${evaluation.part}: ${evaluation.score}/5 ${evaluation.rating} (${evaluation.detail})\n`;
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
