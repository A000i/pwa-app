let currentVideoFilename = null; // 選択中の動画ファイル名
let currentVideoBlob = null; // 選択中の動画データ
let currentVideoURL = null; // 選択中の動画URL
let currentPerson = null; // 現在の選手情報

// Firebaseの初期化（最初に実行）
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

// URLパラメータから選手情報を取得
function getCurrentPersonFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const personId = urlParams.get("person");

  if (personId) {
    // URLパラメータから選手IDを取得した場合
    return { id: personId };
  }

  // localStorageから選手情報を取得
  const storedPerson = localStorage.getItem("currentPerson");
  if (storedPerson) {
    try {
      return JSON.parse(storedPerson);
    } catch (error) {
      console.error("選手情報の解析エラー:", error);
    }
  }

  return null;
}

// 選手情報を設定
currentPerson = getCurrentPersonFromUrl();

// 選手情報がない場合はホームページにリダイレクト
if (!currentPerson) {
  window.location.href = "home.html";
} else {
  // DOM読み込み完了後に選手名を表示
  document.addEventListener("DOMContentLoaded", () => {
    updatePersonNameDisplay();
  });
}

// 選手名表示を更新
async function updatePersonNameDisplay() {
  const nameElement = document.getElementById("currentPersonName");
  if (currentPerson && currentPerson.name) {
    nameElement.textContent = `${currentPerson.name}さんの動画`;
  } else if (currentPerson && currentPerson.id) {
    // IDはあるが名前がない場合、Firestoreから取得
    try {
      const doc = await db.collection("people").doc(currentPerson.id).get();
      if (doc.exists) {
        const personData = doc.data();
        currentPerson.name = personData.name;
        nameElement.textContent = `${personData.name}さんの動画`;
        // localStorageも更新
        localStorage.setItem("currentPerson", JSON.stringify(currentPerson));
      } else {
        nameElement.textContent = "選手情報が見つかりません";
      }
    } catch (error) {
      console.error("選手情報取得エラー:", error);
      nameElement.textContent = "選手情報読み込みエラー";
    }
  }
}

// ホームに戻る機能
function goHome() {
  window.location.href = "home.html";
}

// コメント一覧ul要素を取得（ページによっては存在しない）
const list = document.getElementById("commentList");

// GoogleログインUI（home.html側のloginAreaを利用）
const loginBtn = document.getElementById("loginBtn");
const switchAccountBtn = document.getElementById("switchAccountBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginInfo = document.getElementById("loginInfo");
let currentUser = null;

const sendBtn = document.getElementById("sendComment");
const input = document.getElementById("commentInput");
if (sendBtn) sendBtn.disabled = true;
if (input) input.disabled = true;

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // アカウント選択を強制
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    auth.signInWithPopup(provider);
  });
}

if (switchAccountBtn) {
  switchAccountBtn.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // 強制的にアカウント選択画面を表示
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // 現在のセッションを一旦終了してから新しいアカウントでログイン
      await auth.signOut();
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error("アカウント切り替えエラー:", error);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut();
  });
}

auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    if (loginBtn) loginBtn.style.display = "none";
    if (switchAccountBtn) switchAccountBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (loginInfo)
      loginInfo.textContent = `${user.displayName} がログイン中です。`;
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.disabled = false;
  } else {
    currentUser = null;
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (switchAccountBtn) switchAccountBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginInfo) loginInfo.textContent = "未ログイン";
    if (sendBtn) sendBtn.disabled = true;
    if (input) input.disabled = true;
  }
});

// コメント送信
if (sendBtn) {
  sendBtn.addEventListener("click", async () => {
    const text = (input && input.value ? input.value.trim() : "");
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
      if (input) input.value = "";
      loadComments();
    }
  });
}

// コメント一覧取得
async function loadComments() {
  list.innerHTML = "";
  if (!currentVideoFilename) return;
  console.log("currentVideoFilename:", currentVideoFilename); // 追加
  const snapshot = await db
    .collection("comments")
    .where("video", "==", currentVideoFilename)
    .get();
  console.log("comments count:", snapshot.size); // 追加

  // クライアントサイドでソート
  const comments = [];
  snapshot.forEach((doc) => {
    comments.push({ id: doc.id, data: doc.data() });
  });

  // タイムスタンプでソート（新しいものが上に）
  comments.sort((a, b) => {
    const aTime = a.data.timestamp ? a.data.timestamp.toMillis() : 0;
    const bTime = b.data.timestamp ? b.data.timestamp.toMillis() : 0;
    return bTime - aTime;
  });

  comments.forEach(({ data }) => {
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

// 動画再生処理（要素が存在するかチェック）
const videoInput = document.getElementById("videoInput");
const videoPlayer = document.getElementById("videoPlayer");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const analysisBtn = document.getElementById("analysisBtn");
const poseCanvas = document.getElementById("poseCanvas");
const poseCtx = poseCanvas ? poseCanvas.getContext("2d") : null;

if (videoInput) {
  videoInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file && currentUser && currentPerson) {
    // 動画データを保存
    currentVideoBlob = file;
    currentVideoFilename = file.name;

    // 選手別のStorageパスを作成
    const storageRef = storage.ref(
      `videos/${currentPerson.id}/${Date.now()}_${file.name}`
    );
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    currentVideoURL = url; // URLを保存

    // Firestoreに動画情報保存（選手別）
    // 選手名が未定義の場合は、Firestoreから取得
    let personName = currentPerson.name;
    if (!personName && currentPerson.id) {
      try {
        const personDoc = await db
          .collection("people")
          .doc(currentPerson.id)
          .get();
        if (personDoc.exists) {
          personName = personDoc.data().name;
          // currentPersonも更新
          currentPerson.name = personName;
          localStorage.setItem("currentPerson", JSON.stringify(currentPerson));
        }
      } catch (error) {
        console.error("選手名取得エラー:", error);
        personName = "不明";
      }
    }

    await db.collection("videos").add({
      url: url,
      user: currentUser.displayName,
      filename: file.name,
      timestamp: new Date(),
      personId: currentPerson.id,
      personName: personName || "不明",
    });

    // 選手の動画数を更新
    if (currentPerson.id) {
      try {
        await db
          .collection("people")
          .doc(currentPerson.id)
          .update({
            videoCount: firebase.firestore.FieldValue.increment(1),
          });
      } catch (error) {
        console.error("動画数更新エラー:", error);
      }
    }

    // 動画再生
    if (videoPlayer) {
      videoPlayer.src = url;
      videoPlayer.style.display = "";
      if (playBtn) playBtn.style.display = "";
      if (pauseBtn) pauseBtn.style.display = "";
      if (analysisBtn) analysisBtn.style.display = ""; // 解析ボタンを表示
      try { videoPlayer.play(); } catch(e){/* autoplay may be blocked */}
    }
    loadVideoList();
  } else if (!currentUser) {
    alert("Googleでログインしてください");
  }
  });
}

// 動画一覧表示
// ダウンロードした動画一覧ul要素を取得
const videoList = document.getElementById("downloadedVideoList");

async function loadVideoList() {
  videoList.innerHTML = "";

  if (!currentPerson) {
    console.error("選手情報がありません");
    return;
  }

  const snapshot = await db
    .collection("videos")
    .where("personId", "==", currentPerson.id)
    .get();

  // クライアントサイドでソート
  const videos = [];
  snapshot.forEach((doc) => {
    videos.push({ id: doc.id, data: doc.data() });
  });

  // タイムスタンプでソート（新しいものが上に）
  videos.sort((a, b) => {
    const aTime = a.data.timestamp ? a.data.timestamp.toMillis() : 0;
    const bTime = b.data.timestamp ? b.data.timestamp.toMillis() : 0;
    return bTime - aTime;
  });

  videos.forEach(({ data }) => {
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
    const link = li.querySelector("a");
    if (link) {
      link.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        console.log("動画選択開始 - URL:", data.url);

        // 動画プレイヤーにURLを設定（プレビュー用）
        if (videoPlayer) {
          videoPlayer.src = data.url;
          videoPlayer.style.display = "";
          if (playBtn) playBtn.style.display = "";
          if (pauseBtn) pauseBtn.style.display = "";
          if (analysisBtn) analysisBtn.style.display = ""; // 解析ボタンを表示
        }

        // 動画情報を保存
        currentVideoFilename = data.filename;
        currentVideoURL = data.url;
        currentVideoBlob = null; // Blobは使用しない

        console.log("動画選択完了 - ファイル名:", currentVideoFilename);
        console.log("動画選択完了 - URL:", currentVideoURL);

        // プレビューを開始
        if (videoPlayer) try { videoPlayer.play(); } catch(e){}

        if (typeof loadComments === 'function') loadComments();
      } catch (error) {
        console.error("動画選択エラー:", error);
        alert("動画の読み込みに失敗しました: " + error.message);
      }
      });
    }
    videoList.appendChild(li);
  });
}

// ページロード時に一覧表示
loadVideoList();

// LocalStorageの古いデータをクリーンアップする関数
function cleanupOldVideoData() {
  console.log("LocalStorageのクリーンアップを開始");
  let cleanedCount = 0;

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith("video_")) {
      const value = localStorage.getItem(key);
      // 画像データの場合は削除
      if (value && value.startsWith("data:image/")) {
        console.log(`古い画像データを削除: ${key}`);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }
  }

  if (cleanedCount > 0) {
    console.log(`${cleanedCount}個の古い画像データをクリーンアップしました`);
  }
}

// ページロード時にクリーンアップを実行
cleanupOldVideoData();

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

// 動画プレイヤー操作 (要素がある場合のみ)
if (playBtn && videoPlayer) {
  playBtn.addEventListener("click", () => {
    videoPlayer.play();
  });
}
if (pauseBtn && videoPlayer) {
  pauseBtn.addEventListener("click", () => {
    videoPlayer.pause();
  });
}

function estimatePoseLoop() {
  // ここに骨格推定処理を記述
  // 例: poseCanvasに推定結果を描画するなど
  // 実装例がなければ何もせず return でもOK
  return;
}

if (videoPlayer) {
  videoPlayer.addEventListener("loadeddata", () => {
    // 動画の実サイズでcanvasを設定
    if (poseCanvas) {
      poseCanvas.width = videoPlayer.videoWidth || 480;
      poseCanvas.height = videoPlayer.videoHeight || 360;
    }
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
}

// 骨格推定解析ボタンの機能
if (analysisBtn) {
  analysisBtn.addEventListener("click", async () => {
  if (currentVideoURL && currentVideoFilename) {
    try {
      console.log("骨格推定ボタンクリック - 動画URL:", currentVideoURL);

      // 処理中の表示
      analysisBtn.disabled = true;
      analysisBtn.textContent = "処理中...";

      // 古いデータをクリア（画像データが残っている場合）
      const oldData = localStorage.getItem(`video_${currentVideoFilename}`);
      if (oldData && oldData.startsWith("data:image/")) {
        console.log("古い画像データを検出、クリアします");
        localStorage.removeItem(`video_${currentVideoFilename}`);
      }

      // Firebase Storage URLを直接保存（Base64変換は行わない）
      console.log("Firebase URLを保存:", {
        key: `video_${currentVideoFilename}`,
        url: currentVideoURL,
        isFirebaseURL: currentVideoURL.includes(
          "firebasestorage.googleapis.com"
        ),
      });

      localStorage.setItem(`video_${currentVideoFilename}`, currentVideoURL);
      console.log("URLをLocalStorageに保存完了");

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
      reader.onerror = function (error) {
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
}

// ページロード時の初期化処理
document.addEventListener("DOMContentLoaded", function () {
  // 骨格推定解析ボタンの状態をリセット（存在チェックあり）
  if (analysisBtn) {
    analysisBtn.disabled = false;
    analysisBtn.textContent = "骨格推定解析";
  }
});
