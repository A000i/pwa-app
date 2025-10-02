// JavaScriptファイルが読み込まれたことを確認
console.log("analysis.js が読み込まれました");

// 即座に実行される関数でボタンの動作をテスト
(function () {
  console.log("即時実行関数が動作しています");

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

let poseModel = null;
let originalVideoFile = null;
let isAnalyzing = false;
let animationId = null;
let originalVideo = null;
let skeletonCanvas = null;
let skeletonCtx = null;

// URLパラメータから動画ファイル名を取得
function getVideoFromParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("video");
}

// BlobをDataURLに変換するヘルパー関数
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.onerror = function(error) {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}

// 戻るボタン
function goBack() {
  window.history.back();
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
    const videoFileName = getVideoFromParams();
    let videoData = localStorage.getItem(`video_${videoFileName}`);

    console.log("テスト - 動画ファイル名:", videoFileName);
    console.log("テスト - 動画データ:", videoData ? "存在" : "なし");

    if (!videoData) {
      showVideoError("動画データが見つかりません。メインページで動画を再選択してください。");
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
      preview: videoData.substring(0, 100)
    });
    
    // 画像データの場合の警告とクリア
    if (videoData.startsWith("data:image/")) {
      console.error("❌ 画像データが保存されています。動画分析には適していません。");
      
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
    if (videoData && videoData.startsWith("https://firebasestorage.googleapis.com")) {
      console.log("✅ Firebase Storage URLを検出、直接処理を試行");
      try {
        // Firebase Storage経由でBlobデータを取得を試行
        if (typeof firebase !== 'undefined' && firebase.storage) {
          console.log("Firebase経由でのBlob取得を試行中...");
          const storageRef = firebase.storage().refFromURL(videoData);
          const blob = await storageRef.getBlob();
          const dataUrl = await blobToDataURL(blob);
          
          // 取得したデータが動画か確認
          if (dataUrl.startsWith("data:video/")) {
            videoData = dataUrl;
            localStorage.setItem(`video_${videoFileName}`, dataUrl);
            console.log("✅ Firebase Storage経由でデータ取得成功（動画形式確認済み）");
          } else {
            console.warn("Firebase Storage経由で取得したデータが動画形式ではありません");
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
      console.error("エラーコード:", originalVideo.error ? originalVideo.error.code : "不明");
      console.error("エラーメッセージ:", originalVideo.error ? originalVideo.error.message : "不明");
      
      // エラーの種類を特定
      if (originalVideo.error) {
        switch(originalVideo.error.code) {
          case 1:
            console.error("MEDIA_ERR_ABORTED: ユーザーによる再生中止");
            break;
          case 2:
            console.error("MEDIA_ERR_NETWORK: ネットワークエラー");
            break;
          case 3:
            console.error("MEDIA_ERR_DECODE: デコードエラー（対応していない形式）");
            break;
          case 4:
            console.error("MEDIA_ERR_SRC_NOT_SUPPORTED: ソース形式がサポートされていない");
            break;
          default:
            console.error("不明なエラー");
        }
      }
      
      // ユーザーに分かりやすいエラー表示
      showVideoError("動画の読み込みに失敗しました。動画形式またはURLを確認してください。");
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
        poseModel = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, // リアルタイム用に高速モデル
          }
        );
        console.log("PoseDetectionモデル読み込み完了");
      } catch (modelError) {
        console.error("モデル読み込みエラー:", modelError);
        throw new Error(`PoseDetectionモデルの読み込みに失敗しました: ${modelError.message}`);
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
    
    // エラー時にメッセージを表示
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
      console.log("PoseDetectionモデル読み込み開始");
      try {
        poseModel = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
          }
        );
        console.log("PoseDetectionモデル読み込み完了");
      } catch (modelError) {
        console.error("モデル読み込みエラー:", modelError);
        throw new Error(`PoseDetectionモデルの読み込みに失敗しました: ${modelError.message}`);
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
        console.log(`静的キャンバスサイズ設定: ${canvas.width}x${canvas.height}`);

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
                    pose.keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) /
                    pose.keypoints.length;
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
    if (point && point.score && point.score > 0.2 && point.x !== undefined && point.y !== undefined) {
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

      if (pointA && pointB && 
          pointA.score && pointB.score &&
          pointA.score > 0.2 && pointB.score > 0.2 &&
          pointA.x !== undefined && pointA.y !== undefined &&
          pointB.x !== undefined && pointB.y !== undefined) {
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
    if (key && key.startsWith('video_')) {
      const value = localStorage.getItem(key);
      allVideoData.push({
        key: key,
        type: value.startsWith('data:image/') ? '画像データ（問題）' :
              value.startsWith('data:video/') ? '動画データ（正常）' :
              value.startsWith('https://') ? 'URL（正常）' : '不明',
        length: value.length,
        preview: value.substring(0, 50) + '...'
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
        typeof poseDetection !== "undefined" ? "✅ 読み込み済み" : "❌ 未読み込み"
      }</p>
      
      <h4>LocalStorage内の全動画データ</h4>
      <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
        ${allVideoData.length > 0 ? 
          allVideoData.map(item => 
            `<div style="margin-bottom: 8px; padding: 8px; background: ${item.type.includes('問題') ? '#ffe6e6' : '#e6f7e6'}; border-radius: 4px;">
              <strong>${item.key}:</strong> ${item.type}<br>
              <small>長さ: ${item.length} / プレビュー: ${item.preview}</small>
            </div>`
          ).join('') 
          : '<p>動画データなし</p>'
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
function generateEvaluation() {
  // 骨格データが存在する場合は実際の分析を実行
  let evaluations;

  if (window.currentPose && window.currentPose.keypoints) {
    evaluations = analyzeBasicPosture(window.currentPose.keypoints);
  } else {
    // デフォルト評価
    evaluations = [
      {
        part: "重心バランス",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
      },
      {
        part: "膝の角度",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
      },
      {
        part: "背筋の伸び",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
      },
      {
        part: "足幅",
        score: 3,
        rating: "普通",
        class: "normal",
        detail: "分析中...",
      },
    ];
  }

  const evaluationList = document.getElementById("evaluationList");
  if (evaluationList) {
    evaluationList.innerHTML = "";

    evaluations.forEach((evaluation) => {
      const li = document.createElement("li");
      li.className = "evaluation-item";
      li.innerHTML = `
        <span class="body-part">${evaluation.part}</span>
        <span class="score ${evaluation.class}">${evaluation.score} ${evaluation.rating}</span>
      `;
      evaluationList.appendChild(li);
    });
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

  localStorage.setItem("detailedAnalysis", JSON.stringify(detailedData));

  // 詳細分析ページに遷移
  window.location.href = `detailed-analysis.html?video=${videoFileName}`;
}

// ページロード時の初期化
document.addEventListener("DOMContentLoaded", async () => {
  console.log("ページロード開始");

  try {
    // 必要なライブラリの存在確認
    if (typeof tf === "undefined") {
      throw new Error("TensorFlow.jsが読み込まれていません");
    }

    if (typeof poseDetection === "undefined") {
      throw new Error("PoseDetectionライブラリが読み込まれていません");
    }

    console.log("ライブラリ確認完了");

    // ボタンが存在するか確認
    const testBtn = document.querySelector('button[onclick="showTestResult()"]');
    const debugBtn = document.querySelector('button[onclick="showDebugInfo()"]');
    const backBtn = document.querySelector('button[onclick="goBack()"]');

    console.log("テストボタン存在:", testBtn ? "あり" : "なし");
    console.log("デバッグボタン存在:", debugBtn ? "あり" : "なし");
    console.log("戻るボタン存在:", backBtn ? "あり" : "なし");

    const videoFileName = getVideoFromParams();
    console.log("動画ファイル名:", videoFileName);

    if (videoFileName) {
      const videoData = localStorage.getItem(`video_${videoFileName}`);
      console.log("取得した動画データ:", videoData ? "存在" : "なし");

      if (videoData) {
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
      showError("動画が指定されていません", "URLパラメータを確認してください");
    }
  } catch (error) {
    console.error("初期化エラー:", error);
    showError(
      "初期化エラー",
      `エラー詳細: ${error.message}`
    );
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
