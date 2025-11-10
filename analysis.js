// JavaScriptファイルが読み込まれたことを確認
console.log("analysis.js が読み込まれました");

// 学術的根拠付きAI評価システム
let academicEvaluator = null;

// 即座に実行される関数でボタンの動作をテスト
(function () {
  console.log("即時実行関数が動作しています");

  // 学術評価システムの初期化
  initializeAcademicEvaluator();

  // DOM読み込み前でもテストメッセージを表示
  setTimeout(() => {
    const testMsg = document.getElementById("testMessage");
    if (testMsg) {
      testMsg.style.display = "block";
      testMsg.innerHTML =
        '<p style="color: green;">JavaScript読み込み成功！</p>';
    }
  }, 100);
})();

/**
 * 学術評価システムの初期化
 */
async function initializeAcademicEvaluator() {
  try {
    // academic-evaluator.js が読み込まれているかチェック
    if (typeof AcademicBasedEvaluator !== "undefined") {
      academicEvaluator = new AcademicBasedEvaluator();
      await academicEvaluator.initialize();
      console.log("✅ 学術的根拠付きAI評価システム初期化完了");
    } else {
      console.warn("⚠️ academic-evaluator.js が読み込まれていません");
    }
  } catch (error) {
    console.error("❌ 学術評価システム初期化エラー:", error);
  }
}

let poseModel = null;
let originalVideoFile = null;
let isAnalyzing = false;
let animationId = null;
let originalVideo = null;
let skeletonCanvas = null;
let skeletonCtx = null;

// Firebase Storageから動画を読み込む関数
async function loadVideoFromFirebase(filename, personInfo) {
  try {
    console.log("Firebase から動画を読み込み中:", filename);
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const videoRef = storageRef.child(`videos/${personInfo.id}/${filename}`);

    const downloadURL = await videoRef.getDownloadURL();
    console.log("動画URL取得成功:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Firebase 動画読み込みエラー:", error);
    return null;
  }
}

// 動画詳細ページから渡された動画情報を読み込み
function loadAnalysisVideo() {
  // まずURLパラメータをチェック
  const urlParams = new URLSearchParams(window.location.search);
  const urlVideo = urlParams.get("video");
  const urlPerson = urlParams.get("person");

  console.log("URLパラメータ - 動画:", urlVideo, "選手:", urlPerson);

  // URLパラメータがある場合は、それを優先してlocalStorageに保存
  if (urlVideo && urlPerson) {
    console.log("URLパラメータから動画を読み込み:", urlVideo);

    // 選手情報をlocalStorageから取得
    const storedPerson = localStorage.getItem("currentPerson");
    if (storedPerson) {
      try {
        const personInfo = JSON.parse(storedPerson);
        console.log("選手情報を復元:", personInfo);

        // Firebase Storageから動画URLを取得
        loadVideoFromFirebase(urlVideo, personInfo)
          .then((videoUrl) => {
            if (videoUrl) {
              const videoInfo = {
                filename: urlVideo,
                personId: urlPerson,
                url: videoUrl,
                timestamp: Date.now(),
              };
              localStorage.setItem("analysisVideo", JSON.stringify(videoInfo));
              console.log("URLパラメータから動画情報を設定:", videoInfo);

              // 動画を即座に読み込み
              const video =
                document.getElementById("originalVideo") ||
                document.getElementById("myVideo");
              if (video) {
                video.src = videoUrl;
                video.style.display = "block";
                video.crossOrigin = "anonymous";
                console.log("動画が読み込まれました:", urlVideo);
              }
            }
          })
          .catch((error) => {
            console.error("Firebase から動画読み込みエラー:", error);
          });
      } catch (error) {
        console.error("選手情報の解析エラー:", error);
      }
    }
  }

  const analysisVideo = localStorage.getItem("analysisVideo");
  if (analysisVideo) {
    try {
      const videoInfo = JSON.parse(analysisVideo);
      console.log("分析対象動画:", videoInfo);

      // 動画URLから動画を読み込み
      if (videoInfo.url) {
        // まず既存のmyVideo要素を探す
        let video = document.getElementById("myVideo");
        if (!video) {
          // 見つからない場合は、originalVideo要素を探す
          video = document.getElementById("originalVideo");
        }

        if (video) {
          video.src = videoInfo.url;
          video.style.display = "block";
          video.crossOrigin = "anonymous"; // CORS対応
          console.log("動画が読み込まれました:", videoInfo.filename);

          // 動画の読み込み完了を待つ
          video.addEventListener("loadeddata", () => {
            console.log("動画データの読み込み完了");
            // グローバル変数に設定
            originalVideo = video;
            originalVideoFile = videoInfo.filename;
          });

          video.addEventListener("error", (e) => {
            console.error("動画読み込みエラー:", e);
            showVideoError("動画の読み込みに失敗しました");
          });
        } else {
          console.error("動画要素が見つかりません");
        }
      }

      return videoInfo;
    } catch (error) {
      console.error("分析動画情報の解析エラー:", error);
    }
  }
  return null;
}

// URLパラメータまたはlocalStorageから動画ファイル名を取得
function getVideoFromParams() {
  // まずURLパラメータから取得を試す
  const urlParams = new URLSearchParams(window.location.search);
  const urlVideo = urlParams.get("video");
  if (urlVideo) {
    return urlVideo;
  }

  // URLパラメータがない場合はlocalStorageから取得
  const analysisVideo = localStorage.getItem("analysisVideo");
  if (analysisVideo) {
    try {
      const videoInfo = JSON.parse(analysisVideo);
      return videoInfo.filename;
    } catch (error) {
      console.error("analysisVideo解析エラー:", error);
    }
  }

  return null;
}

// BlobをDataURLに変換するヘルパー関数
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}

// ローカル優先でMoveNetモデルを読み込む安全なラッパー
async function createMoveNetDetectorSafe(modelType) {
  if (typeof poseDetection === "undefined") {
    throw new Error("poseDetection ライブラリが読み込まれていません");
  }

  console.log("=== ローカルモデル検索開始 ===");
  console.log("現在のページURL:", window.location.href);
  console.log("ベースURL:", window.location.origin);

  // 優先的に探すローカル候補パス（プロジェクトルートからの相対パス）
  const candidates = [
    "./models/movenet/singlepose/lightning/4/model.json",
    // GitHub Pages / raw URLs (A000i/pwa-app)
    "https://a000i.github.io/pwa-app/main/models/movenet/singlepose/lightning/4/model.json",
    "https://raw.githubusercontent.com/A000i/pwa-app/main/main/models/movenet/singlepose/lightning/4/model.json",
    "/main/models/movenet/singlepose/lightning/4/model.json",
    "models/movenet/singlepose/lightning/4/model.json",
    "./models/movenet/singlepose/thunder/4/model.json",
    "./models/movenet/singlepose/lightning/model.json",
  ];

  for (const candidate of candidates) {
    console.log("ローカルモデル候補をチェック中:", candidate);
    try {
      // 存在確認 (GET)。サーバーが同一オリジンであれば成功するはず
      const resp = await fetch(candidate, { method: "GET" });
      console.log(
        `候補 ${candidate} のレスポンス:`,
        resp.status,
        resp.statusText
      );
      if (resp.ok) {
        console.log("ローカルMoveNetモデルを発見:", candidate);
        try {
          // modelUrl を指定してローカルモデルを読み込む
          return await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: modelType, modelUrl: candidate }
          );
        } catch (err) {
          console.warn(
            "ローカルモデルでのcreateDetectorに失敗:",
            candidate,
            err
          );
          // 続けて他の候補を試す
        }
      } else {
        console.log(`候補 ${candidate} は利用不可 (${resp.status})`);
      }
    } catch (e) {
      // fetch が失敗する（404 等）場合は次の候補へ
      console.log(
        "ローカルモデル候補チェック失敗（存在しないかアクセス不可）:",
        candidate,
        e.message
      );
    }
  }

  // ローカル候補が見つからない/読み込めない場合は従来の方法にフォールバック
  try {
    console.log(
      "ローカルモデルが見つかりませんでした。tfhub 経由でモデルを読み込みます（403 が出る環境では失敗します）。"
    );
    return await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: modelType }
    );
  } catch (err) {
    // エラーを上位に伝搬
    console.error("モデル読み込み（フォールバック含む）に失敗:", err);
    throw err;
  }
}

// --- AI 評価モデル（オンデバイス TFJS） ---
let aiModel = null;
async function loadAIPoseModel() {
  if (aiModel) return aiModel;

  const candidates = [
    "./models/ai/pose-eval/model.json",
    "/main/models/ai/pose-eval/model.json",
    "models/ai/pose-eval/model.json",
    "https://a000i.github.io/pwa-app/main/models/ai/pose-eval/model.json",
    "https://raw.githubusercontent.com/A000i/pwa-app/main/main/models/ai/pose-eval/model.json",
  ];

  for (const c of candidates) {
    try {
      console.log("AIモデル候補チェック:", c);
      const resp = await fetch(c, { method: "GET" });
      console.log("AI候補レスポンス:", c, resp.status);
      if (!resp.ok) continue;

      try {
        // try load as graph model first
        aiModel = await tf.loadGraphModel(c);
        console.log("AIモデル読み込み成功 (graph):", c);
        return aiModel;
      } catch (e) {
        console.warn(
          "graph model load failed, trying layers model:",
          e.message
        );
        try {
          aiModel = await tf.loadLayersModel(c);
          console.log("AIモデル読み込み成功 (layers):", c);
          return aiModel;
        } catch (e2) {
          console.warn("layers model load failed:", e2.message);
        }
      }
    } catch (err) {
      console.log("AI候補チェックエラー:", c, err.message);
    }
  }

  console.log(
    "AIモデルが見つかりませんでした（ローカルまたはGitHubに配置してください）"
  );
  return null;
}

function preprocessPoseToVector(keypoints) {
  // normalize to [0,1] by video size and center by mid-hip
  const w = originalVideo ? originalVideo.videoWidth || 1 : 1;
  const h = originalVideo ? originalVideo.videoHeight || 1 : 1;

  // find hip center
  const leftHip = keypoints[11] || { x: 0, y: 0 };
  const rightHip = keypoints[12] || { x: 0, y: 0 };
  const hipCenterX = (leftHip.x + rightHip.x) / 2 || 0;
  const hipCenterY = (leftHip.y + rightHip.y) / 2 || 0;

  const vec = [];
  for (let i = 0; i < 17; i++) {
    const kp = keypoints[i] || { x: 0, y: 0, score: 0 };
    // normalized and center
    vec.push((kp.x - hipCenterX) / w);
    vec.push((kp.y - hipCenterY) / h);
    vec.push(kp.score || 0);
  }
  return vec;
}

function clamp01(v) {
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(1, Number(v)));
}

async function aiPredictFromKeypoints(keypoints) {
  try {
    if (!aiModel) {
      await loadAIPoseModel();
    }
    if (!aiModel) return null;

    const vec = preprocessPoseToVector(keypoints);
    const input = tf.tensor([vec]);
    let out = aiModel.predict(input);
    // handle different output shapes
    let arr = null;
    if (Array.isArray(out)) {
      arr = await out[0].array();
    } else {
      arr = await out.array();
    }
    input.dispose();
    if (out.dispose) out.dispose();

    // expect arr shape [1, M]
    const flat = arr[0] || arr;
    // map to metrics (if model returns fewer values, fallback handled)
    return {
      balance: clamp01(flat[0] ?? 0),
      knee: clamp01(flat[1] ?? 0),
      spine: clamp01(flat[2] ?? 0),
      stance: clamp01(flat[3] ?? 0),
      shootForm: clamp01(flat[4] ?? 0),
      defense: clamp01(flat[5] ?? 0),
      dribble: clamp01(flat[6] ?? 0),
      stability: clamp01(flat[7] ?? 0),
    };
  } catch (err) {
    console.warn("AI推論失敗:", err.message);
    return null;
  }
}

// 戻るボタン
function goBack() {
  // 現在の選手情報から動画一覧ページに戻る
  const currentPerson = localStorage.getItem("currentPerson");
  if (currentPerson) {
    try {
      const personInfo = JSON.parse(currentPerson);
      window.location.href = `person-videos.html?person=${encodeURIComponent(
        personInfo.id
      )}`;
      return;
    } catch (error) {
      console.error("選手情報の解析エラー:", error);
    }
  }

  // 選手情報がない場合はホームに戻る
  window.location.href = "home.html";
}

// 動画エラー表示用関数
function showVideoError(message) {
  const originalPlaceholder = document.getElementById("originalPlaceholder");
  const originalVideo = document.getElementById("originalVideo");

  if (originalVideo) {
    originalVideo.style.display = "none";
  }

  if (originalPlaceholder) {
    originalPlaceholder.style.display = "flex";
    originalPlaceholder.innerHTML = `
      <div style="text-align: center; color: #ff0000; padding: 20px;">
        <h3>❌ 動画読み込みエラー</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #2E318F; color: white; border: none; border-radius: 4px; cursor: pointer;">再読み込み</button>
      </div>
    `;
  }
}

// テスト表示機能
async function showTestResult() {
  console.log("テスト結果表示開始");

  try {
    // 新しい動画読み込み方法を最優先でチェック
    const analysisVideoInfo = localStorage.getItem("analysisVideo");
    let videoData = null;
    let videoFileName = null;

    if (analysisVideoInfo) {
      console.log("分析動画情報からデータ取得を試行");
      try {
        const videoInfo = JSON.parse(analysisVideoInfo);
        videoFileName = videoInfo.filename;

        // 動画要素を直接チェック
        const video =
          document.getElementById("originalVideo") ||
          document.getElementById("myVideo");
        if (video && video.src) {
          console.log(
            "✅ 動画要素から直接URL取得:",
            video.src.substring(0, 100)
          );
          videoData = video.src;
        } else {
          // localStorage から従来の方法で取得
          videoData = localStorage.getItem(`video_${videoFileName}`);
        }
      } catch (error) {
        console.error("分析動画情報解析エラー:", error);
      }
    }

    // 従来の方法にフォールバック
    if (!videoData) {
      videoFileName = getVideoFromParams();
      videoData = localStorage.getItem(`video_${videoFileName}`);
    }

    console.log("テスト - 動画ファイル名:", videoFileName);
    console.log("テスト - 動画データ:", videoData ? "存在" : "なし");

    if (!videoData) {
      showVideoError(
        "動画データが見つかりません。メインページで動画を再選択してください。"
      );
      return;
    }

    // データ形式の詳細チェック
    console.log("動画データの形式チェック:", {
      isDataURL: videoData.startsWith("data:"),
      isHTTPS: videoData.startsWith("https://"),
      isFirebaseURL: videoData.includes("firebasestorage.googleapis.com"),
      isVideo: videoData.startsWith("data:video/"),
      isImage: videoData.startsWith("data:image/"),
      length: videoData.length,
      preview: videoData.substring(0, 100),
    });

    // 画像データの場合の警告とクリア
    if (videoData.startsWith("data:image/")) {
      console.error(
        "❌ 画像データが保存されています。動画分析には適していません。"
      );

      // 古い画像データをクリア
      localStorage.removeItem(`video_${videoFileName}`);
      console.log("古い画像データをLocalStorageから削除しました");

      showVideoError(`
        <div style="color: #ff0000;">
          <h4>❌ 画像データが検出されました</h4>
          <p>動画として保存されるべきデータが画像形式で保存されています。</p>
          <p><strong>解決方法：</strong></p>
          <ol style="text-align: left; margin: 10px 0;">
            <li>メインページに戻る</li>
            <li>動画を再度選択する</li>
            <li>「骨格推定解析」ボタンをクリックする</li>
          </ol>
          <p style="font-size: 0.9em; color: #666;">
            （古いデータは自動的にクリアされました）
          </p>
        </div>
      `);
      return;
    }

    // Firebase Storage URLの場合の処理
    if (
      videoData &&
      videoData.startsWith("https://firebasestorage.googleapis.com")
    ) {
      console.log("✅ Firebase Storage URLを検出、直接処理を試行");
      try {
        // Firebase Storage経由でBlobデータを取得を試行
        if (typeof firebase !== "undefined" && firebase.storage) {
          console.log("Firebase経由でのBlob取得を試行中...");
          const storageRef = firebase.storage().refFromURL(videoData);
          const blob = await storageRef.getBlob();
          const dataUrl = await blobToDataURL(blob);

          // 取得したデータが動画か確認
          if (dataUrl.startsWith("data:video/")) {
            videoData = dataUrl;
            localStorage.setItem(`video_${videoFileName}`, dataUrl);
            console.log(
              "✅ Firebase Storage経由でデータ取得成功（動画形式確認済み）"
            );
          } else {
            console.warn(
              "Firebase Storage経由で取得したデータが動画形式ではありません"
            );
            // URLを直接使用
          }
        } else {
          console.log("Firebase Storage未初期化、URL直接使用");
        }
      } catch (firebaseError) {
        console.warn("Firebase Storage経由失敗、URL直接使用:", firebaseError);
      }
    }

    if (videoData) {
      // 元動画を設定
      setupOriginalVideo(videoData);

      // リアルタイム骨格推定を開始
      await initializeRealtimePoseEstimation(videoData);
    } else {
      showVideoError("有効な動画データが見つかりません。");
      return;
    }

    // 評価結果の表示
    generateEvaluation();

    // 結果を表示
    document.getElementById("loadingSection").style.display = "none";
    document.getElementById("resultSection").style.display = "block";
  } catch (error) {
    console.error("テスト表示エラー:", error);
    showVideoError(`エラーが発生しました: ${error.message}`);
  }
}

// 元動画の設定
function setupOriginalVideo(videoData) {
  console.log("元動画設定開始");

  originalVideo = document.getElementById("originalVideo");
  const placeholder = document.getElementById("originalPlaceholder");

  if (originalVideo) {
    originalVideo.crossOrigin = "anonymous"; // CORS設定を追加
    originalVideo.src = videoData;
    originalVideo.style.display = "block";
    originalVideo.controls = true; // コントロールを表示
    if (placeholder) placeholder.style.display = "none";

    originalVideo.onloadeddata = () => {
      console.log("元動画読み込み完了");
      console.log(
        "動画サイズ:",
        originalVideo.videoWidth,
        "x",
        originalVideo.videoHeight
      );
      console.log("動画時間:", originalVideo.duration, "秒");
    };

    originalVideo.onerror = (error) => {
      console.error("元動画読み込みエラー - 詳細:", error);
      console.error("動画src:", originalVideo.src);
      console.error(
        "エラーコード:",
        originalVideo.error ? originalVideo.error.code : "不明"
      );
      console.error(
        "エラーメッセージ:",
        originalVideo.error ? originalVideo.error.message : "不明"
      );

      // エラーの種類を特定
      if (originalVideo.error) {
        switch (originalVideo.error.code) {
          case 1:
            console.error("MEDIA_ERR_ABORTED: ユーザーによる再生中止");
            break;
          case 2:
            console.error("MEDIA_ERR_NETWORK: ネットワークエラー");
            break;
          case 3:
            console.error(
              "MEDIA_ERR_DECODE: デコードエラー（対応していない形式）"
            );
            break;
          case 4:
            console.error(
              "MEDIA_ERR_SRC_NOT_SUPPORTED: ソース形式がサポートされていない"
            );
            break;
          default:
            console.error("不明なエラー");
        }
      }

      // ユーザーに分かりやすいエラー表示
      showVideoError(
        "動画の読み込みに失敗しました。動画形式またはURLを確認してください。"
      );
    };

    // 同期イベントを追加
    originalVideo.addEventListener("play", onVideoPlay);
    originalVideo.addEventListener("pause", onVideoPause);
    originalVideo.addEventListener("seeked", onVideoSeeked);
  }
}

// リアルタイム骨格推定の初期化
async function initializeRealtimePoseEstimation(videoData) {
  console.log("リアルタイム骨格推定初期化開始");

  try {
    // キャンバス要素を取得
    skeletonCanvas = document.getElementById("skeletonCanvas");
    skeletonCtx = skeletonCanvas.getContext("2d");
    const skeletonPlaceholder = document.getElementById("skeletonPlaceholder");

    // プレースホルダーを隠す
    if (skeletonPlaceholder) {
      skeletonPlaceholder.style.display = "none";
    }
    skeletonCanvas.style.display = "block";

    // TensorFlow.jsとPoseDetectionの確認
    if (typeof tf === "undefined") {
      throw new Error("TensorFlow.jsが読み込まれていません");
    }

    if (typeof poseDetection === "undefined") {
      throw new Error("PoseDetectionライブラリが読み込まれていません");
    }

    console.log("ライブラリ確認完了");

    // TensorFlow.js初期化
    await tf.ready();
    console.log("TensorFlow.js初期化完了");

    // PoseDetectionモデルのロード
    if (!poseModel) {
      console.log("PoseDetectionモデル読み込み開始");
      try {
        poseModel = await createMoveNetDetectorSafe(
          poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        );
        console.log("PoseDetectionモデル読み込み完了 (safe loader)");
      } catch (modelError) {
        console.error("モデル読み込みエラー:", modelError);
        throw new Error(
          `PoseDetectionモデルの読み込みに失敗しました: ${modelError.message}`
        );
      }
    }

    // 元動画のサイズを取得してキャンバスサイズを設定
    await new Promise((resolve) => {
      if (originalVideo.readyState >= 1) {
        resolve();
      } else {
        originalVideo.addEventListener("loadedmetadata", resolve, {
          once: true,
        });
      }
    });

    skeletonCanvas.width = originalVideo.videoWidth;
    skeletonCanvas.height = originalVideo.videoHeight;
    console.log(
      `キャンバスサイズ設定: ${skeletonCanvas.width}x${skeletonCanvas.height}`
    );

    console.log("リアルタイム骨格推定初期化完了");
  } catch (error) {
    console.error("リアルタイム骨格推定初期化エラー:", error);

    // エラー表示
    if (skeletonCtx) {
      skeletonCtx.fillStyle = "#e0e0e0";
      skeletonCtx.fillRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
      skeletonCtx.fillStyle = "#ff0000";
      skeletonCtx.font = "14px Arial";
      skeletonCtx.textAlign = "center";
      skeletonCtx.fillText(
        "初期化エラー: " + error.message,
        skeletonCanvas.width / 2,
        skeletonCanvas.height / 2
      );
    }
  }
}

// 動画再生時のイベント
function onVideoPlay() {
  console.log("動画再生開始");
  startPoseEstimation();
}

// 動画一時停止時のイベント
function onVideoPause() {
  console.log("動画一時停止");
  stopPoseEstimation();
}

// 動画シーク時のイベント
function onVideoSeeked() {
  console.log("動画シーク");
  if (!originalVideo.paused) {
    // 再生中の場合は骨格推定を継続
    startPoseEstimation();
  } else {
    // 一時停止中の場合は現在フレームで骨格推定を1回実行
    performSingleFramePoseEstimation();
  }
}

// 骨格推定開始
function startPoseEstimation() {
  if (isAnalyzing) return; // 既に実行中の場合は何もしない

  isAnalyzing = true;
  console.log("リアルタイム骨格推定開始");
  requestAnimationFrame(poseEstimationLoop);
}

// 骨格推定停止
function stopPoseEstimation() {
  isAnalyzing = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  console.log("リアルタイム骨格推定停止");
}

// 骨格推定ループ
async function poseEstimationLoop() {
  if (
    !isAnalyzing ||
    !originalVideo ||
    originalVideo.paused ||
    originalVideo.ended
  ) {
    return;
  }

  try {
    await performSingleFramePoseEstimation();
  } catch (error) {
    console.error("骨格推定ループエラー:", error);
  }

  // 次のフレームをスケジュール（約30FPS）
  if (isAnalyzing) {
    animationId = requestAnimationFrame(poseEstimationLoop);
  }
}

// 単一フレームの骨格推定
async function performSingleFramePoseEstimation() {
  if (!poseModel || !originalVideo || !skeletonCtx) {
    console.warn("骨格推定の必要な要素が不足しています");
    return;
  }

  try {
    // 動画フレームをキャンバスに描画
    skeletonCtx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
    skeletonCtx.drawImage(
      originalVideo,
      0,
      0,
      skeletonCanvas.width,
      skeletonCanvas.height
    );

    // 骨格推定実行（キャンバスから推定）
    const poses = await poseModel.estimatePoses(skeletonCanvas);

    if (poses && poses.length > 0) {
      // 現在のポーズデータを保存（評価で使用）
      window.currentPose = poses[0];

      // AIによる評価が利用可能なら呼び出す（非同期）
      aiPredictFromKeypoints(poses[0].keypoints)
        .then((metrics) => {
          if (metrics) {
            window.currentPose.aiMetrics = metrics;
          }
        })
        .catch((e) => console.warn("aiPredict error:", e.message));

      // 骨格を描画
      drawSkeleton(
        skeletonCtx,
        poses[0].keypoints,
        skeletonCanvas.width / originalVideo.videoWidth,
        skeletonCanvas.height / originalVideo.videoHeight
      );

      // 評価を更新
      generateEvaluation();
    } else {
      console.log("ポーズが検出されませんでした");
    }
  } catch (error) {
    console.error("単一フレーム骨格推定エラー:", error);

    // ダミーモデルの場合、モックの骨格データを生成
    if (
      error.message &&
      error.message.includes("Input tensor count mismatch")
    ) {
      console.log(
        "ダミーモデルが検出されました。モック骨格データを表示します。"
      );

      // 動画の中央に人型の骨格を模擬生成
      const centerX = skeletonCanvas.width / 2;
      const centerY = skeletonCanvas.height / 2;
      const scale = Math.min(skeletonCanvas.width, skeletonCanvas.height) / 8;

      const mockKeypoints = [
        // 0: nose
        { x: centerX, y: centerY - scale * 2, score: 0.9 },
        // 1: left_eye
        { x: centerX - scale * 0.3, y: centerY - scale * 2.2, score: 0.8 },
        // 2: right_eye
        { x: centerX + scale * 0.3, y: centerY - scale * 2.2, score: 0.8 },
        // 3: left_ear
        { x: centerX - scale * 0.6, y: centerY - scale * 2, score: 0.7 },
        // 4: right_ear
        { x: centerX + scale * 0.6, y: centerY - scale * 2, score: 0.7 },
        // 5: left_shoulder
        { x: centerX - scale * 1, y: centerY - scale * 1, score: 0.9 },
        // 6: right_shoulder
        { x: centerX + scale * 1, y: centerY - scale * 1, score: 0.9 },
        // 7: left_elbow
        { x: centerX - scale * 1.5, y: centerY, score: 0.8 },
        // 8: right_elbow
        { x: centerX + scale * 1.5, y: centerY, score: 0.8 },
        // 9: left_wrist
        { x: centerX - scale * 2, y: centerY + scale * 0.5, score: 0.7 },
        // 10: right_wrist
        { x: centerX + scale * 2, y: centerY + scale * 0.5, score: 0.7 },
        // 11: left_hip
        { x: centerX - scale * 0.7, y: centerY + scale * 1, score: 0.9 },
        // 12: right_hip
        { x: centerX + scale * 0.7, y: centerY + scale * 1, score: 0.9 },
        // 13: left_knee
        { x: centerX - scale * 0.8, y: centerY + scale * 2, score: 0.8 },
        // 14: right_knee
        { x: centerX + scale * 0.8, y: centerY + scale * 2, score: 0.8 },
        // 15: left_ankle
        { x: centerX - scale * 0.9, y: centerY + scale * 3, score: 0.7 },
        // 16: right_ankle
        { x: centerX + scale * 0.9, y: centerY + scale * 3, score: 0.7 },
      ];

      // モック骨格データを保存
      window.currentPose = { keypoints: mockKeypoints };

      // 骨格を描画
      drawSkeleton(skeletonCtx, mockKeypoints, 1, 1);

      // 評価を更新
      generateEvaluation();

      // 情報メッセージを表示
      skeletonCtx.fillStyle = "rgba(0, 255, 0, 0.8)";
      skeletonCtx.fillRect(10, 10, 200, 30);
      skeletonCtx.fillStyle = "#000000";
      skeletonCtx.font = "12px Arial";
      skeletonCtx.textAlign = "left";
      skeletonCtx.fillText("モック骨格データ表示中", 15, 30);
    } else {
      // その他のエラー時にメッセージを表示
      if (skeletonCtx) {
        skeletonCtx.fillStyle = "rgba(255, 0, 0, 0.1)";
        skeletonCtx.fillRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
        skeletonCtx.fillStyle = "#ff0000";
        skeletonCtx.font = "14px Arial";
        skeletonCtx.textAlign = "center";
        skeletonCtx.fillText(
          "骨格推定エラー",
          skeletonCanvas.width / 2,
          skeletonCanvas.height / 2
        );
      }
    }
  }
}

// 骨格推定の実行
async function performPoseEstimation(videoData) {
  console.log("骨格推定開始");

  const canvas = document.getElementById("skeletonCanvas");
  const ctx = canvas.getContext("2d");
  const skeletonPlaceholder = document.getElementById("skeletonPlaceholder");

  try {
    // プレースホルダーを隠す
    if (skeletonPlaceholder) {
      skeletonPlaceholder.style.display = "none";
    }
    canvas.style.display = "block";

    // TensorFlow.jsとPoseDetectionの確認
    if (typeof tf === "undefined") {
      throw new Error("TensorFlow.jsが読み込まれていません");
    }

    if (typeof poseDetection === "undefined") {
      throw new Error("PoseDetectionライブラリが読み込まれていません");
    }

    console.log("ライブラリ確認完了");

    // TensorFlow.js初期化
    await tf.ready();
    console.log("TensorFlow.js初期化完了");

    // PoseDetectionモデルのロード
    if (!poseModel) {
      console.log("PoseDetectionモデル読み込み開始 (static) via safe loader");
      try {
        poseModel = await createMoveNetDetectorSafe(
          poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
        );
        console.log("PoseDetectionモデル読み込み完了 (safe loader)");
      } catch (modelError) {
        console.error("モデル読み込みエラー:", modelError);
        throw new Error(
          `PoseDetectionモデルの読み込みに失敗しました: ${modelError.message}`
        );
      }
    }

    // 動画要素を作成
    const video = document.createElement("video");
    video.src = videoData;
    video.muted = true;
    video.crossOrigin = "anonymous";

    // 動画読み込み完了イベント
    video.onloadeddata = async () => {
      try {
        console.log("骨格推定用動画読み込み完了");

        // 元動画と同じサイズでキャンバスサイズを設定
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(
          `静的キャンバスサイズ設定: ${canvas.width}x${canvas.height}`
        );

        // 動画サイズが有効か確認
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          throw new Error("動画サイズが無効です");
        }

        // 複数のフレームで骨格推定を試行
        const framesToTry = [
          video.duration * 0.1, // 10%地点
          video.duration * 0.3, // 30%地点
          video.duration * 0.5, // 50%地点
          video.duration * 0.7, // 70%地点
          video.duration * 0.9, // 90%地点
        ];

        let bestPose = null;
        let bestScore = 0;
        let bestFrame = video.duration * 0.5; // デフォルトは中間

        for (let i = 0; i < framesToTry.length; i++) {
          const timePoint = framesToTry[i];
          console.log(
            `フレーム ${i + 1}/${
              framesToTry.length
            } を試行中... (${timePoint.toFixed(2)}s)`
          );

          video.currentTime = timePoint;

          await new Promise((resolve) => {
            video.onseeked = async () => {
              try {
                // フレームをキャンバスに描画
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // 骨格推定実行（キャンバスから推定）
                const poses = await poseModel.estimatePoses(canvas);
                console.log(
                  `フレーム ${i + 1} - 検出されたポーズ数:`,
                  poses.length
                );

                if (poses && poses.length > 0) {
                  const pose = poses[0];
                  const avgScore =
                    pose.keypoints.reduce(
                      (sum, kp) => sum + (kp.score || 0),
                      0
                    ) / pose.keypoints.length;
                  console.log(
                    `フレーム ${i + 1} - 平均スコア:`,
                    avgScore.toFixed(3)
                  );

                  if (avgScore > bestScore) {
                    bestPose = pose;
                    bestScore = avgScore;
                    bestFrame = timePoint;
                    console.log(
                      `新しいベストポーズを発見! スコア: ${avgScore.toFixed(3)}`
                    );
                  }
                }

                resolve();
              } catch (error) {
                console.error(`フレーム ${i + 1} でエラー:`, error);
                resolve();
              }
            };
          });

          // 少し待機
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // 最良のフレームを表示
        video.currentTime = bestFrame;

        video.onseeked = async () => {
          try {
            console.log("最終フレーム表示中...");

            // 動画フレームをキャンバスに描画
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (bestPose) {
              // 現在のポーズデータを保存（評価で使用）
              window.currentPose = bestPose;

              // 骨格を描画
              drawSkeleton(
                ctx,
                bestPose.keypoints,
                canvas.width / video.videoWidth,
                canvas.height / video.videoHeight
              );

              // 評価を更新
              generateEvaluation();
            } else {
              console.log("全フレームでポーズが検出されませんでした");

              // メッセージを表示
              ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
              ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

              ctx.fillStyle = "#FFFFFF";
              ctx.font = "14px Arial";
              ctx.textAlign = "center";
              ctx.fillText(
                "ポーズが検出されませんでした",
                canvas.width / 2,
                canvas.height - 35
              );
              ctx.fillText(
                "人が明確に映っているか確認してください",
                canvas.width / 2,
                canvas.height - 15
              );
            }
          } catch (error) {
            console.error("骨格推定エラー:", error);
            ctx.fillStyle = "#ff0000";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("骨格推定エラー", canvas.width / 2, canvas.height / 2);
          }
        };
      } catch (error) {
        console.error("動画処理エラー:", error);
        ctx.fillStyle = "#ff0000";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `動画処理エラー: ${error.message}`,
          canvas.width / 2,
          canvas.height / 2
        );
      }
    };

    video.onerror = (error) => {
      console.error("動画読み込みエラー:", error);
      ctx.fillStyle = "#ff0000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("動画読み込みエラー", canvas.width / 2, canvas.height / 2);
    };
  } catch (error) {
    console.error("骨格推定準備エラー:", error);

    // エラー表示
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff0000";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "エラー: " + error.message,
      canvas.width / 2,
      canvas.height / 2 - 10
    );
    ctx.fillText(
      "TensorFlow.js未対応の可能性",
      canvas.width / 2,
      canvas.height / 2 + 10
    );
    canvas.style.display = "block";
  }
}

// 骨格の描画
function drawSkeleton(ctx, keypoints, scaleX = 1, scaleY = 1) {
  if (!ctx || !keypoints || !Array.isArray(keypoints)) {
    console.warn("骨格描画: 無効なパラメータです");
    return;
  }

  console.log("骨格描画開始", keypoints.length, "個のキーポイント");

  // 骨格のつながりを定義 (COCO format)
  const connections = [
    // 顔
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    // 胴体
    [5, 6],
    [5, 7],
    [6, 8],
    [7, 9],
    [8, 10],
    [5, 11],
    [6, 12],
    [11, 12],
    // 脚
    [11, 13],
    [12, 14],
    [13, 15],
    [14, 16],
  ];

  // 関節点を描画
  keypoints.forEach((point, index) => {
    if (
      point &&
      point.score &&
      point.score > 0.2 &&
      point.x !== undefined &&
      point.y !== undefined
    ) {
      // スコア閾値を下げる
      ctx.beginPath();
      ctx.arc(point.x * scaleX, point.y * scaleY, 5, 0, 2 * Math.PI); // 少し大きく
      ctx.fillStyle = "#FF0000";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  // 骨格線を描画
  connections.forEach(([i, j]) => {
    if (i < keypoints.length && j < keypoints.length) {
      const pointA = keypoints[i];
      const pointB = keypoints[j];

      if (
        pointA &&
        pointB &&
        pointA.score &&
        pointB.score &&
        pointA.score > 0.2 &&
        pointB.score > 0.2 &&
        pointA.x !== undefined &&
        pointA.y !== undefined &&
        pointB.x !== undefined &&
        pointB.y !== undefined
      ) {
        // スコア閾値を下げる
        ctx.beginPath();
        ctx.moveTo(pointA.x * scaleX, pointA.y * scaleY);
        ctx.lineTo(pointB.x * scaleX, pointB.y * scaleY);
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 4; // 少し太く
        ctx.stroke();
      }
    }
  });

  console.log("骨格描画完了");
}

// デバッグ情報を表示
function showDebugInfo() {
  const videoFileName = getVideoFromParams();
  const videoData = localStorage.getItem(`video_${videoFileName}`);

  // LocalStorageの全video_データをチェック
  const allVideoData = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("video_")) {
      const value = localStorage.getItem(key);
      allVideoData.push({
        key: key,
        type: value.startsWith("data:image/")
          ? "画像データ（問題）"
          : value.startsWith("data:video/")
          ? "動画データ（正常）"
          : value.startsWith("https://")
          ? "URL（正常）"
          : "不明",
        length: value.length,
        preview: value.substring(0, 50) + "...",
      });
    }
  }

  let debugHTML = `
    <div style="text-align: left; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3>デバッグ情報</h3>
      <p><strong>現在のURL:</strong> ${window.location.href}</p>
      <p><strong>動画ファイル名:</strong> ${videoFileName || "取得失敗"}</p>
      <p><strong>現在の動画データ:</strong> ${
        videoData ? "存在 (長さ: " + videoData.length + ")" : "なし"
      }</p>
      <p><strong>動画データタイプ:</strong> ${
        videoData
          ? videoData.startsWith("data:image/")
            ? "❌ 画像データ（問題あり）"
            : videoData.startsWith("data:video/")
            ? "✅ 動画データ（正常）"
            : videoData.startsWith("https://")
            ? "✅ URL（正常）"
            : "❓ 不明"
          : "なし"
      }</p>
      <p><strong>TensorFlow.js:</strong> ${
        typeof tf !== "undefined" ? "✅ 読み込み済み" : "❌ 未読み込み"
      }</p>
      <p><strong>PoseDetection:</strong> ${
        typeof poseDetection !== "undefined"
          ? "✅ 読み込み済み"
          : "❌ 未読み込み"
      }</p>
      
      <h4>LocalStorage内の全動画データ</h4>
      <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
        ${
          allVideoData.length > 0
            ? allVideoData
                .map(
                  (item) =>
                    `<div style="margin-bottom: 8px; padding: 8px; background: ${
                      item.type.includes("問題") ? "#ffe6e6" : "#e6f7e6"
                    }; border-radius: 4px;">
              <strong>${item.key}:</strong> ${item.type}<br>
              <small>長さ: ${item.length} / プレビュー: ${item.preview}</small>
            </div>`
                )
                .join("")
            : "<p>動画データなし</p>"
        }
      </div>
      
      <div style="margin-top: 15px;">
        <button onclick="location.reload()" style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; margin-right: 10px; cursor: pointer;">再読み込み</button>
        <button onclick="showTestResult()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; margin-right: 10px; cursor: pointer;">テスト表示</button>
        <button onclick="localStorage.clear(); alert('LocalStorageをクリアしました'); location.reload();" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; margin-right: 10px; cursor: pointer;">データクリア</button>
        <button onclick="goBack()" style="padding: 8px 16px; background: #2E318F; color: white; border: none; border-radius: 4px; cursor: pointer;">戻る</button>
      </div>
    </div>
  `;

  document.getElementById("loadingSection").innerHTML = debugHTML;
}

// 評価結果の生成
async function generateEvaluation() {
  // 骨格データが存在する場合は実際の分析を実行
  let evaluations;
  let academicEvidence = null;

  if (window.currentPose && window.currentPose.keypoints) {
    // 学術的根拠付き評価の実行
    if (academicEvaluator && academicEvaluator.initialized) {
      try {
        academicEvidence = await academicEvaluator.evaluateWithAcademicEvidence(
          window.currentPose
        );
        console.log("📚 学術的根拠付き評価完了:", academicEvidence);
      } catch (error) {
        console.error("学術的評価エラー:", error);
      }
    }

    // If AI metrics exist, use them (map 0..1 -> 1..5). Otherwise use rule-based.
    if (window.currentPose.aiMetrics) {
      const m = window.currentPose.aiMetrics;
      const mapScore = (v) => Math.round((v || 0) * 4) + 1; // 0->1, 1->5
      evaluations = [
        {
          part: "重心バランス",
          score: mapScore(m.balance),
          rating: "",
          class: "",
          detail: "",
          academic_basis: academicEvidence
            ? getAcademicBasisForBalance(academicEvidence)
            : null,
        },
        {
          part: "膝の角度",
          score: mapScore(m.knee),
          rating: "",
          class: "",
          detail: "",
          academic_basis: academicEvidence
            ? getAcademicBasisForKnee(academicEvidence)
            : null,
        },
        {
          part: "背筋の伸び",
          score: mapScore(m.spine),
          rating: "",
          class: "",
          detail: "",
          academic_basis: academicEvidence
            ? getAcademicBasisForSpine(academicEvidence)
            : null,
        },
        {
          part: "足幅",
          score: mapScore(m.stance),
          rating: "",
          class: "",
          detail: "",
          academic_basis: academicEvidence
            ? getAcademicBasisForStance(academicEvidence)
            : null,
        },
      ];
    } else {
      evaluations = analyzeBasicPosture(window.currentPose.keypoints);

      // 基本評価にも学術的根拠を追加
      if (academicEvidence) {
        evaluations = addAcademicBasisToEvaluations(
          evaluations,
          academicEvidence
        );
      }
    }

    // 学術的根拠の表示
    if (academicEvidence) {
      displayAcademicEvidence(academicEvidence);
    }
  } else {
    // デフォルト評価
    evaluations = [
      {
        part: "重心バランス",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
        academic_basis: null,
      },
      {
        part: "膝の角度",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
        academic_basis: null,
      },
      {
        part: "背筋の伸び",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
        academic_basis: null,
      },
      {
        part: "足幅",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
        academic_basis: null,
      },
    ];
  }

  const evaluationList = document.getElementById("evaluationList");
  if (evaluationList) {
    evaluationList.innerHTML = "";

    evaluations.forEach((evaluation) => {
      const li = document.createElement("li");
      li.className = "evaluation-item";

      // 学術的根拠があるかどうかでアイコンを表示
      const academicIcon = evaluation.academic_basis
        ? '<span class="academic-icon" title="学術的根拠あり">📚</span>'
        : "";

      li.innerHTML = `
        <span class="body-part">${evaluation.part} ${academicIcon}</span>
        <span class="score ${evaluation.class}">${evaluation.score} ${evaluation.rating}</span>
      `;

      // 学術的根拠のツールチップ
      if (evaluation.academic_basis) {
        li.addEventListener("click", () => {
          showAcademicBasisDetails(evaluation.part, evaluation.academic_basis);
        });
        li.style.cursor = "pointer";
        li.title = "クリックで学術的根拠を表示";
      }

      evaluationList.appendChild(li);
    });
  }

  // 評価の保存（卒研発表用）
  if (academicEvidence) {
    saveEvaluationForThesis(evaluations, academicEvidence);
  }
}

// 基本姿勢評価の分析
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

// 重心バランス分析
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

// 膝の角度分析
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

// 背筋の伸び分析
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

// 足幅分析
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

// 角度計算関数
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

// 詳細分析へ
function showDetailedAnalysis() {
  // 現在のポーズデータと動画情報を保存
  const videoFileName = getVideoFromParams();
  const detailedData = {
    pose: window.currentPose,
    videoFileName: videoFileName,
    timestamp: new Date().toISOString(),
  };

  // ----- ここで評価（metrics）を計算して保存に含める -----
  try {
    const metrics = {};

    // If AI metrics are available on the current pose, map them to 1..5 scale
    if (window.currentPose && window.currentPose.aiMetrics) {
      const m = window.currentPose.aiMetrics;
      const mapScore = (v) => Math.round(((v || 0) * 4 + 1) * 10) / 10; // 0..1 -> 1..5, 1 decimal
      metrics.balance = mapScore(m.balance);
      metrics.knee = mapScore(m.knee);
      metrics.spine = mapScore(m.spine);
      metrics.stance = mapScore(m.stance);
      metrics.shootForm = mapScore(m.shootForm);
      metrics.defense = mapScore(m.defense);
      metrics.dribble = mapScore(m.dribble);
      metrics.stability = mapScore(m.stability);
      // overall is average of basic posture metrics
      metrics.overall =
        Math.round(
          ((metrics.balance + metrics.knee + metrics.spine + metrics.stance) /
            4) *
            10
        ) / 10;
    } else if (window.currentPose && window.currentPose.keypoints) {
      // Use rule-based analyzers (same functions used by detailed display)
      try {
        const basic = analyzeBasicPosture(window.currentPose.keypoints);
        basic.forEach((b) => {
          const key = (b.part || "").toLowerCase();
          if (key.indexOf("重心") !== -1 || key.indexOf("balance") !== -1)
            metrics.balance = Number(b.score);
          if (key.indexOf("膝") !== -1 || key.indexOf("knee") !== -1)
            metrics.knee = Number(b.score);
          if (key.indexOf("背筋") !== -1 || key.indexOf("spine") !== -1)
            metrics.spine = Number(b.score);
          if (key.indexOf("足幅") !== -1 || key.indexOf("stance") !== -1)
            metrics.stance = Number(b.score);
        });

        const actions = analyzeActionSpecific(window.currentPose.keypoints);
        actions.forEach((a) => {
          const key = (a.part || "").toLowerCase();
          if (key.indexOf("シュート") !== -1 || key.indexOf("shoot") !== -1)
            metrics.shootForm = Number(a.score);
          if (
            key.indexOf("ディフェンス") !== -1 ||
            key.indexOf("defense") !== -1
          )
            metrics.defense = Number(a.score);
          if (key.indexOf("ドリブル") !== -1 || key.indexOf("dribble") !== -1)
            metrics.dribble = Number(a.score);
          if (
            key.indexOf("重心安定性") !== -1 ||
            key.indexOf("stability") !== -1
          )
            metrics.stability = Number(a.score);
        });

        // fill missing basics with computeMetricsFromPose fallback (to keep numbers present)
        const fallback = computeMetricsFromPose(window.currentPose);
        [
          "balance",
          "knee",
          "spine",
          "stance",
          "shootForm",
          "defense",
          "dribble",
          "stability",
        ].forEach((k) => {
          if (
            typeof metrics[k] === "undefined" &&
            fallback &&
            typeof fallback[k] !== "undefined"
          ) {
            metrics[k] = Math.round((fallback[k] || 3) * 10) / 10;
          }
        });

        // overall
        const b = parseFloat(metrics.balance || 0) || 0;
        const k = parseFloat(metrics.knee || 0) || 0;
        const s = parseFloat(metrics.spine || 0) || 0;
        const st = parseFloat(metrics.stance || 0) || 0;
        metrics.overall = Math.round(((b + k + s + st) / 4) * 10) / 10;
      } catch (e) {
        console.warn("metrics computation failed:", e);
      }
    }

    // attach metrics to detailedData for persistent storage
    if (Object.keys(metrics).length > 0) {
      detailedData.metrics = metrics;
    }
  } catch (e) {
    console.warn("failed to compute/save metrics:", e);
  }

  // 動画ごとの分析データを保存（永続化）
  localStorage.setItem(
    `analysisData_${videoFileName}`,
    JSON.stringify(detailedData)
  );

  // 最新の分析として一時保存（下位互換性のため）
  localStorage.setItem("detailedAnalysis", JSON.stringify(detailedData));

  console.log(`分析データを保存しました: analysisData_${videoFileName}`);

  // 詳細分析ページに遷移
  window.location.href = `detailed-analysis.html?video=${videoFileName}`;
}

// ページロード時の初期化
document.addEventListener("DOMContentLoaded", async () => {
  console.log("ページロード開始");

  // 動画詳細ページから渡された動画情報を読み込み
  const analysisVideo = loadAnalysisVideo();

  try {
    // 必要なライブラリの存在確認
    if (typeof tf === "undefined") {
      throw new Error("TensorFlow.jsが読み込まれていません");
    }

    if (typeof poseDetection === "undefined") {
      throw new Error("PoseDetectionライブラリが読み込まれていません");
    }

    console.log("ライブラリ確認完了");

    // 動画読み込み状況の詳細チェック
    console.log("=== 動画読み込み状況の詳細チェック ===");
    console.log(
      "- originalVideo要素:",
      document.getElementById("originalVideo") ? "存在" : "なし"
    );
    console.log(
      "- myVideo要素:",
      document.getElementById("myVideo") ? "存在" : "なし"
    );
    console.log(
      "- analysisVideo情報:",
      localStorage.getItem("analysisVideo") ? "存在" : "なし"
    );
    console.log("- URL パラメータ:", window.location.search);
    console.log(
      "- localStorage keys:",
      Object.keys(localStorage).filter((k) => k.includes("video"))
    );
    console.log("==========================================");

    // ボタンが存在するか確認
    const testBtn = document.querySelector(
      'button[onclick="showTestResult()"]'
    );
    const debugBtn = document.querySelector(
      'button[onclick="showDebugInfo()"]'
    );
    const backBtn = document.querySelector('button[onclick="goBack()"]');

    console.log("テストボタン存在:", testBtn ? "あり" : "なし");
    console.log("デバッグボタン存在:", debugBtn ? "あり" : "なし");
    console.log("戻るボタン存在:", backBtn ? "あり" : "なし");

    const videoFileName = getVideoFromParams();
    console.log("動画ファイル名:", videoFileName);

    // 新しい動画読み込み方法を優先
    const analysisVideoInfo = localStorage.getItem("analysisVideo");
    if (analysisVideoInfo) {
      console.log("分析動画情報が見つかりました");
      try {
        const videoInfo = JSON.parse(analysisVideoInfo);
        console.log("動画情報:", videoInfo);

        // 動画読み込み完了を待つ
        let checkCount = 0;
        const checkInterval = setInterval(() => {
          const video =
            document.getElementById("originalVideo") ||
            document.getElementById("myVideo");
          checkCount++;

          console.log(`動画チェック ${checkCount}: `, {
            videoElement: video ? "存在" : "なし",
            videoSrc: video?.src || "なし",
            videoReady: video?.readyState,
            analysisVideoInfo: !!analysisVideoInfo,
          });

          if (video && (video.src || video.readyState >= 1)) {
            console.log("動画読み込み完了、テスト開始");
            clearInterval(checkInterval);
            showTestResult();
          } else if (checkCount >= 10) {
            // 10秒でタイムアウト
            console.log("動画読み込みタイムアウト、テスト強制開始");
            clearInterval(checkInterval);
            showTestResult();
          }
        }, 1000);
      } catch (error) {
        console.error("動画情報解析エラー:", error);
        // 従来の方法にフォールバック
        proceedWithTraditionalMethod(videoFileName);
      }
    } else {
      // 従来の方法
      proceedWithTraditionalMethod(videoFileName);
    }

    function proceedWithTraditionalMethod(videoFileName) {
      if (videoFileName) {
        const videoData = localStorage.getItem(`video_${videoFileName}`);
        console.log("取得した動画データ:", videoData ? "存在" : "なし");

        if (videoData) {
          /**
           * 学術的根拠表示用ヘルパー関数群
           */

          /**
           * バランス評価の学術的根拠を抽出
           */
          function getAcademicBasisForBalance(academicEvidence) {
            const basis = {
              citations: [],
              findings: [],
              comparison: null,
            };

            if (academicEvidence.academic_evidence.okubo_hubbard) {
              const okubo = academicEvidence.academic_evidence.okubo_hubbard;
              if (okubo.angle_analysis.shoulder) {
                basis.citations.push(okubo.study_citation);
                basis.findings.push(
                  okubo.angle_analysis.shoulder.biomechanical_significance
                );
                basis.comparison = okubo.angle_analysis.shoulder;
              }
            }

            if (academicEvidence.academic_evidence.anmatsuya_study) {
              const anmatsuya =
                academicEvidence.academic_evidence.anmatsuya_study;
              basis.citations.push(anmatsuya.study_citation);
              basis.findings.push("下肢の安定性が上肢の動作精度に影響");
            }

            return basis;
          }

          /**
           * 膝角度評価の学術的根拠を抽出
           */
          function getAcademicBasisForKnee(academicEvidence) {
            const basis = {
              citations: [],
              findings: [],
              comparison: null,
            };

            if (academicEvidence.academic_evidence.anmatsuya_study) {
              const anmatsuya =
                academicEvidence.academic_evidence.anmatsuya_study;
              if (anmatsuya.expertise_assessment.knee_angle) {
                basis.citations.push(anmatsuya.study_citation);
                basis.findings.push("熟練者は膝を適切に曲げている（92-95度）");
                basis.findings.push(
                  "初心者は膝をあまり曲げていない（108-115度）"
                );
                basis.comparison = anmatsuya.expertise_assessment.knee_angle;
              }
            }

            return basis;
          }

          /**
           * 背筋評価の学術的根拠を抽出
           */
          function getAcademicBasisForSpine(academicEvidence) {
            const basis = {
              citations: [],
              findings: [],
              comparison: null,
            };

            if (academicEvidence.academic_evidence.tokyo_university) {
              const tokyo = academicEvidence.academic_evidence.tokyo_university;
              basis.citations.push(tokyo.study_citation);
              basis.findings.push("関節の時系列協調動作が精度を決定");
              basis.findings.push("近位から遠位への運動連鎖が重要");
            }

            return basis;
          }

          /**
           * 足幅評価の学術的根拠を抽出
           */
          function getAcademicBasisForStance(academicEvidence) {
            const basis = {
              citations: [],
              findings: [],
              comparison: null,
            };

            if (academicEvidence.academic_evidence.anmatsuya_study) {
              const anmatsuya =
                academicEvidence.academic_evidence.anmatsuya_study;
              basis.citations.push(anmatsuya.study_citation);
              basis.findings.push("下肢の安定性が上肢の動作精度に影響");
            }

            return basis;
          }

          /**
           * 基本評価に学術的根拠を追加
           */
          function addAcademicBasisToEvaluations(
            evaluations,
            academicEvidence
          ) {
            return evaluations.map((evaluation) => {
              let academic_basis = null;

              switch (evaluation.part) {
                case "重心バランス":
                  academic_basis = getAcademicBasisForBalance(academicEvidence);
                  break;
                case "膝の角度":
                  academic_basis = getAcademicBasisForKnee(academicEvidence);
                  break;
                case "背筋の伸び":
                  academic_basis = getAcademicBasisForSpine(academicEvidence);
                  break;
                case "足幅":
                  academic_basis = getAcademicBasisForStance(academicEvidence);
                  break;
              }

              return {
                ...evaluation,
                academic_basis,
              };
            });
          }

          /**
           * 学術的根拠の詳細表示
           */
          function showAcademicBasisDetails(part, academicBasis) {
            if (!academicBasis || academicBasis.citations.length === 0) {
              alert("この項目には学術的根拠データがありません。");
              return;
            }

            const modal = createAcademicModal(part, academicBasis);
            document.body.appendChild(modal);

            // モーダルを表示
            modal.style.display = "block";

            // 閉じるボタンのイベント
            modal
              .querySelector(".close-academic-modal")
              .addEventListener("click", () => {
                document.body.removeChild(modal);
              });

            // 背景クリックで閉じる
            modal.addEventListener("click", (e) => {
              if (e.target === modal) {
                document.body.removeChild(modal);
              }
            });
          }

          /**
           * 学術的根拠モーダル作成
           */
          function createAcademicModal(part, academicBasis) {
            const modal = document.createElement("div");
            modal.className = "academic-modal";
            modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); z-index: 1000; display: none;
  `;

            const modalContent = document.createElement("div");
            modalContent.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh;
    overflow-y: auto;
  `;

            const citationsList = academicBasis.citations
              .map((citation) => `<li>${citation}</li>`)
              .join("");
            const findingsList = academicBasis.findings
              .map((finding) => `<li>${finding}</li>`)
              .join("");

            modalContent.innerHTML = `
    <h3>📚 ${part} の学術的根拠</h3>
    
    <div class="academic-section">
      <h4>参照論文</h4>
      <ul class="citation-list">
        ${citationsList}
      </ul>
    </div>
    
    <div class="academic-section">
      <h4>主要な知見</h4>
      <ul class="findings-list">
        ${findingsList}
      </ul>
    </div>
    
    ${
      academicBasis.comparison
        ? `
      <div class="academic-section">
        <h4>比較データ</h4>
        <div class="comparison-data">
          <p>ユーザー値: ${academicBasis.comparison.user_angle || "N/A"}</p>
          <p>最適範囲: ${JSON.stringify(
            academicBasis.comparison.optimal_range ||
              academicBasis.comparison.expert_range
          )}</p>
          <p>最適範囲内: ${
            academicBasis.comparison.within_optimal ? "✅ はい" : "❌ いいえ"
          }</p>
        </div>
      </div>
    `
        : ""
    }
    
    <button class="close-academic-modal" style="
      background: #007bff; color: white; border: none; padding: 8px 16px;
      border-radius: 4px; cursor: pointer; margin-top: 15px;
    ">閉じる</button>
  `;

            modal.appendChild(modalContent);
            return modal;
          }

          /**
           * 学術的根拠の概要表示
           */
          function displayAcademicEvidence(academicEvidence) {
            // 既存の学術情報表示エリアを探すか作成
            let academicInfoDiv = document.getElementById("academicInfo");
            if (!academicInfoDiv) {
              academicInfoDiv = document.createElement("div");
              academicInfoDiv.id = "academicInfo";
              academicInfoDiv.style.cssText = `
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 15px; margin: 15px 0;
    `;

              // 評価結果の後に挿入
              const evaluationSection =
                document.querySelector("#evaluationList") ||
                document.querySelector(".evaluation-results");
              if (evaluationSection && evaluationSection.parentNode) {
                evaluationSection.parentNode.insertBefore(
                  academicInfoDiv,
                  evaluationSection.nextSibling
                );
              }
            }

            const citedStudies = academicEvidence.cited_studies || [];
            const overallAssessment =
              academicEvidence.overall_assessment || "評価中";
            const confidenceScore = Math.round(
              academicEvidence.confidence_score || 0
            );

            academicInfoDiv.innerHTML = `
    <h4>📚 学術的根拠に基づく総合評価</h4>
    <div class="academic-summary">
      <p><strong>総合評価:</strong> ${overallAssessment}</p>
      <p><strong>信頼度:</strong> ${confidenceScore}%</p>
      <p><strong>参照研究:</strong> ${citedStudies.length}件の査読済み論文</p>
    </div>
    <div class="cited-studies">
      <h5>参照論文一覧:</h5>
      <ul>
        ${citedStudies.map((study) => `<li>${study}</li>`).join("")}
      </ul>
    </div>
    <div style="margin-top: 10px;">
      <small>💡 各評価項目の📚アイコンをクリックすると詳細な学術的根拠が表示されます</small>
    </div>
  `;
          }

          /**
           * 卒研発表用の評価保存
           */
          function saveEvaluationForThesis(evaluations, academicEvidence) {
            const thesisData = {
              timestamp: new Date().toISOString(),
              evaluations: evaluations,
              academic_evidence: academicEvidence,
              cited_studies: academicEvidence.cited_studies,
              confidence_score: academicEvidence.confidence_score,
              methodology: "multi_paper_reference_analysis",
            };

            // ローカルストレージに保存
            const existingData = JSON.parse(
              localStorage.getItem("thesis_evaluations") || "[]"
            );
            existingData.push(thesisData);
            localStorage.setItem(
              "thesis_evaluations",
              JSON.stringify(existingData)
            );

            console.log("📝 卒研発表用データ保存完了:", thesisData);
          }
          if (videoData.startsWith("blob:")) {
            console.error("BlobURLが保存されています - 無効です");
            showError(
              "動画データが無効です",
              "動画データの形式が無効になっています。メインページに戻って動画を再選択してください。"
            );
            return;
          }

          // 自動的にテスト表示を実行
          setTimeout(() => {
            showTestResult();
          }, 1000);
        } else {
          console.error("動画データが見つかりません");
          showError(
            "動画データが見つかりません",
            `動画ファイル名: ${videoFileName}`
          );
        }
      } else {
        console.error("動画が指定されていません");
        showError(
          "動画が指定されていません",
          "URLパラメータを確認してください"
        );
      }
    }
  } catch (error) {
    console.error("初期化エラー:", error);
    showError("初期化エラー", `エラー詳細: ${error.message}`);
  }
});

// エラー表示用関数
function showError(title, message) {
  const loadingSection = document.getElementById("loadingSection");
  if (loadingSection) {
    loadingSection.innerHTML = `
      <div style="text-align: center; color: red; padding: 20px;">
        <h3>${title}</h3>
        <p>${message}</p>
        <div style="margin-top: 20px;">
          <button onclick="localStorage.clear(); goBack();" style="padding: 10px 20px; margin: 5px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">データをクリアして戻る</button>
          <button onclick="goBack()" style="padding: 10px 20px; margin: 5px; background: #2E318F; color: white; border: none; border-radius: 5px; cursor: pointer;">戻る</button>
        </div>
      </div>
    `;
  }
}
