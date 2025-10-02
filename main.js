let currentVideoFilename = null; // 選択中の動画ファイル名
let currentVideoBlob = null; // 選択中の動画データ
let currentVideoURL = null; // 選択中の動画URL

// Firebaseの初期化
const firebaseConfig = {
  apiKey: "AIzaSyB1wvxKFWYbQJiPRXsbbhZJXtyfcL3HcEY",
  authDomain: "basketball-ansys.firebaseapp.com",
  projectId: "basketball-ansys",
  storageBucket: "basketball-ansys.firebasestorage.app",
  messagingSenderId: "940330605654",
  appId: "1:940330605654:web:30b7443ba196cef5b72ff7",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
// コメント一覧ul要素を取得
const list = document.getElementById("commentList");

// GoogleログインUI（index.html側のloginAreaを利用）
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginInfo = document.getElementById("loginInfo");
let currentUser = null;

const sendBtn = document.getElementById("sendComment");
const input = document.getElementById("commentInput");
sendBtn.disabled = true;
input.disabled = true;

loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "";
    loginInfo.textContent = `${user.displayName} がログイン中です。`;
    sendBtn.disabled = false;
    input.disabled = false;
  } else {
    currentUser = null;
    loginBtn.style.display = "";
    logoutBtn.style.display = "none";
    loginInfo.textContent = "未ログイン";
    sendBtn.disabled = true;
    input.disabled = true;
  }
});

// コメント送信
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!currentUser) {
    alert("Googleでログインしてください");
    return;
  }
  if (!currentVideoFilename) {
    alert("動画を選択してください");
    return;
  }
  if (text) {
    await db.collection("comments").add({
      text: text,
      user: currentUser.displayName,
      timestamp: new Date(),
      video: currentVideoFilename,
    });
    input.value = "";
    loadComments();
  }
});

// コメント一覧取得
async function loadComments() {
  list.innerHTML = "";
  if (!currentVideoFilename) return;
  console.log("currentVideoFilename:", currentVideoFilename); // 追加
  const snapshot = await db
    .collection("comments")
    .where("video", "==", currentVideoFilename)
    .orderBy("timestamp", "desc")
    .get();
  console.log("comments count:", snapshot.size); // 追加
  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log("comment data:", data); // 追加
    const li = document.createElement("li");
    // mm:ss形式のタイムスタンプ検出＆リンク化
    const match = data.text.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
    if (match) {
      const timeStr = match[1];
      const commentText = match[2];
      const [min, sec] = timeStr.split(":").map(Number);
      const seconds = min * 60 + sec;
      const timeLink = document.createElement("a");
      timeLink.href = "#";
      timeLink.textContent = timeStr;
      timeLink.style.color = "#2196f3";
      timeLink.style.textDecoration = "underline";
      timeLink.addEventListener("click", (e) => {
        e.preventDefault();
        videoPlayer.currentTime = seconds;
        videoPlayer.play();
      });
      // 表示形式：ユーザー名: タイムスタンプ コメント
      li.appendChild(document.createTextNode(`${data.user || "匿名"}: `));
      li.appendChild(timeLink);
      li.appendChild(document.createTextNode(" " + (commentText || "")));
    } else {
      li.textContent = `${data.user || "匿名"}: ${data.text}`;
    }
    list.appendChild(li);
  });
}

// 初回ロード
loadComments();

// 動画再生処理
const videoInput = document.getElementById("videoInput");
const videoPlayer = document.getElementById("videoPlayer");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

videoInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file && currentUser) {
    // 動画データを保存
    currentVideoBlob = file;
    currentVideoFilename = file.name;

    // Storageへアップロード
    const storageRef = storage.ref(`videos/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    currentVideoURL = url; // URLを保存

    // Firestoreに動画情報保存
    await db.collection("videos").add({
      url: url,
      user: currentUser.displayName,
      filename: file.name,
      timestamp: new Date(),
    });
    // 動画再生
    videoPlayer.src = url;
    videoPlayer.style.display = "";
    playBtn.style.display = "";
    pauseBtn.style.display = "";
    analysisBtn.style.display = ""; // 解析ボタンを表示
    videoPlayer.play();
    loadVideoList();
  } else if (!currentUser) {
    alert("Googleでログインしてください");
  }
});

// 動画一覧表示
// ダウンロードした動画一覧ul要素を取得
const videoList = document.getElementById("downloadedVideoList");

async function loadVideoList() {
  videoList.innerHTML = "";
  const snapshot = await db
    .collection("videos")
    .orderBy("timestamp", "desc")
    .get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    // 日時表示（Firestoreのtimestamp型をDateに変換）
    let dateStr = "";
    if (data.timestamp) {
      let d;
      if (
        typeof data.timestamp === "object" &&
        typeof data.timestamp.toDate === "function"
      ) {
        d = data.timestamp.toDate();
      } else if (
        typeof data.timestamp === "string" ||
        typeof data.timestamp === "number"
      ) {
        d = new Date(data.timestamp);
      }
      if (d) {
        dateStr = `${d.getFullYear()}/${
          d.getMonth() + 1
        }/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(
          2,
          "0"
        )}`;
      }
    }
    li.innerHTML = `<b>${data.user}</b>: <a href="#" data-url="${data.url}">${data.filename}</a> <span style="color:#888;font-size:0.95em;margin-left:8px;">${dateStr}</span>`;
    li.querySelector("a").addEventListener("click", async (e) => {
      e.preventDefault();
      
      try {
        console.log("動画選択開始 - URL:", data.url);
        
        // 動画プレイヤーにURLを設定（プレビュー用）
        videoPlayer.src = data.url;
        videoPlayer.style.display = "";
        playBtn.style.display = "";
        pauseBtn.style.display = "";
        analysisBtn.style.display = ""; // 解析ボタンを表示
        
        // 動画情報を保存
        currentVideoFilename = data.filename;
        currentVideoURL = data.url;
        currentVideoBlob = null; // Blobは使用しない

        console.log("動画選択完了 - ファイル名:", currentVideoFilename);
        console.log("動画選択完了 - URL:", currentVideoURL);

        // プレビューを開始
        videoPlayer.play();
        
        loadComments();
      } catch (error) {
        console.error("動画選択エラー:", error);
        alert("動画の読み込みに失敗しました: " + error.message);
      }
    });
    videoList.appendChild(li);
  });
}

// ページロード時に一覧表示
loadVideoList();

// 骨格推定・canvas関連の処理を無効化（元動画のみ再生）

function drawPoses(poses) {
  poses.forEach((pose) => {
    pose.keypoints.forEach((kp) => {
      if (kp.score > 0.3) {
        poseCtx.beginPath();
        poseCtx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        poseCtx.fillStyle = "red";
        poseCtx.fill();
      }
    });
    // 簡易的に主要部位を線で結ぶ例
    const adjacentPairs = [
      [5, 7],
      [7, 9],
      [6, 8],
      [8, 10], // arms
      [5, 6],
      [11, 12], // shoulders/hips
      [5, 11],
      [6, 12], // torso
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16], // legs
    ];
    adjacentPairs.forEach(([a, b]) => {
      const kpA = pose.keypoints[a],
        kpB = pose.keypoints[b];
      if (kpA.score > 0.3 && kpB.score > 0.3) {
        poseCtx.beginPath();
        poseCtx.moveTo(kpA.x, kpA.y);
        poseCtx.lineTo(kpB.x, kpB.y);
        poseCtx.strokeStyle = "blue";
        poseCtx.lineWidth = 2;
        poseCtx.stroke();
      }
    });
  });
}

// 動画プレイヤー操作
playBtn.addEventListener("click", () => {
  videoPlayer.play();
});
pauseBtn.addEventListener("click", () => {
  videoPlayer.pause();
});

function estimatePoseLoop() {
  // ここに骨格推定処理を記述
  // 例: poseCanvasに推定結果を描画するなど
  // 実装例がなければ何もせず return でもOK
  return;
}

videoPlayer.addEventListener("loadeddata", () => {
  // 動画の実サイズでcanvasを設定
  poseCanvas.width = videoPlayer.videoWidth || 480;
  poseCanvas.height = videoPlayer.videoHeight || 360;
});

videoPlayer.addEventListener("play", () => {
  poseEstimateActive = true;
  estimatePoseLoop();
});

videoPlayer.addEventListener("pause", () => {
  poseEstimateActive = false;
});
videoPlayer.addEventListener("ended", () => {
  poseEstimateActive = false;
});

// 骨格推定解析ボタンの機能
const analysisBtn = document.getElementById("analysisBtn");
analysisBtn.addEventListener("click", async () => {
  if (currentVideoURL && currentVideoFilename) {
    try {
      console.log("骨格推定ボタンクリック - 動画URL:", currentVideoURL);
      
      // 処理中の表示
      analysisBtn.disabled = true;
      analysisBtn.textContent = "処理中...";

      // CORS問題を回避するため、Firebase URLから動画データを取得してBase64に変換
      await convertFirebaseVideoToBase64(currentVideoURL, currentVideoFilename);

      console.log("LocalStorageに保存完了");

      // 解析ページに遷移
      window.location.href = `analysis.html?video=${encodeURIComponent(
        currentVideoFilename
      )}`;
    } catch (error) {
      console.error("骨格推定ボタンエラー:", error);
      alert("データの準備中にエラーが発生しました: " + error.message);
      
      // ボタンを元に戻す
      analysisBtn.disabled = false;
      analysisBtn.textContent = "骨格推定解析";
    }
  } else if (currentVideoBlob && currentVideoFilename) {
    // Blobしかない場合の処理（ローカルファイル選択時）
    try {
      console.log("Blobからの処理開始");
      
      // 処理中の表示
      analysisBtn.disabled = true;
      analysisBtn.textContent = "処理中...";

      // BlobをData URLに変換
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e.target.result;
        localStorage.setItem(`video_${currentVideoFilename}`, dataUrl);

        // 解析ページに遷移
        window.location.href = `analysis.html?video=${encodeURIComponent(
          currentVideoFilename
        )}`;
      };
      reader.onerror = function(error) {
        console.error("FileReader エラー:", error);
        alert("動画データの変換中にエラーが発生しました");
        
        // ボタンを元に戻す
        analysisBtn.disabled = false;
        analysisBtn.textContent = "骨格推定解析";
      };
      reader.readAsDataURL(currentVideoBlob);
    } catch (error) {
      console.error("Blob処理エラー:", error);
      alert("動画データの変換中にエラーが発生しました");
      
      // ボタンを元に戻す
      analysisBtn.disabled = false;
      analysisBtn.textContent = "骨格推定解析";
    }
  } else {
    alert("解析する動画を選択してください");
  }
});

// Firebase StorageのURLから動画データを取得してBase64に変換する関数
async function convertFirebaseVideoToBase64(url, filename) {
  try {
    console.log("Firebase URLから動画データを取得中...");
    
    // まずFirebase Storage SDKを試行
    try {
      const storageRef = storage.refFromURL(url);
      const blob = await storageRef.getBlob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const dataUrl = e.target.result;
          localStorage.setItem(`video_${filename}`, dataUrl);
          console.log("Firebase SDK経由でBase64変換完了、LocalStorageに保存");
          resolve(dataUrl);
        };
        reader.onerror = function(error) {
          console.error("FileReader エラー:", error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (sdkError) {
      console.log("Firebase SDK経由失敗、代替手段を試行:", sdkError);
      
      // 代替手段: プロキシ経由またはfetch with no-cors
      try {
        // GitHub Pages用の代替手段
        const response = await fetch(url, {
          mode: 'no-cors',  // CORSを回避
          credentials: 'omit'
        });
        
        if (!response.ok && response.type !== 'opaque') {
          throw new Error('フェッチに失敗しました');
        }
        
        // no-corsモードでは直接Blobを取得できないため、
        // video要素経由でキャンバスに描画してデータを取得
        return await captureVideoAsDataURL(url, filename);
        
      } catch (fetchError) {
        console.error("Fetch代替手段も失敗:", fetchError);
        
        // 最終手段: URLをそのまま保存（ローカルでのみ動作）
        console.log("最終手段: URLを直接保存");
        localStorage.setItem(`video_${filename}`, url);
        return url;
      }
    }
  } catch (error) {
    console.error("Firebase動画取得エラー:", error);
    throw new Error("動画データの取得に失敗しました。ネットワーク接続を確認してください。");
  }
}

// ビデオ要素とキャンバスを使用してデータURLを取得
async function captureVideoAsDataURL(videoUrl, filename) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';  // CORS設定
    video.preload = 'metadata';
    
    video.onloadeddata = function() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // 最初のフレームをキャプチャ
        ctx.drawImage(video, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        
        // 簡易的なデータとして保存（実際の動画ではないが、分析には使用可能）
        localStorage.setItem(`video_${filename}`, dataURL);
        console.log("キャンバス経由でデータURL作成完了");
        resolve(dataURL);
      } catch (canvasError) {
        console.error("キャンバス処理エラー:", canvasError);
        // それでも失敗した場合はURLを保存
        localStorage.setItem(`video_${filename}`, videoUrl);
        resolve(videoUrl);
      }
    };
    
    video.onerror = function(error) {
      console.error("ビデオ読み込みエラー:", error);
      // エラーでもURLを保存して続行
      localStorage.setItem(`video_${filename}`, videoUrl);
      resolve(videoUrl);
    };
    
    video.src = videoUrl;
  });
}
