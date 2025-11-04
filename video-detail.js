// video-detail.js - 動画詳細ページのJavaScript

let currentVideoFilename = null; // 選択中の動画ファイル名
let currentVideoBlob = null; // 選択中の動画データ
let currentVideoURL = null; // 選択中の動画URL
let currentPerson = null; // 現在の選手情報
let selectedVideo = null; // 選択された動画情報
let currentMode = "watch"; // 表示モード ('watch' または 'analyze')

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

// GoogleログインUI
const loginBtn = document.getElementById("loginBtn");
const switchAccountBtn = document.getElementById("switchAccountBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginInfo = document.getElementById("loginInfo");
let currentUser = null;

const sendBtn = document.getElementById("sendComment");
const input = document.getElementById("commentInput");
const voiceInputBtn = document.getElementById("voiceInputBtn");
const voiceStatus = document.getElementById("voiceStatus");
sendBtn.disabled = true;
input.disabled = true;
voiceInputBtn.disabled = true;

// 音声認識の設定
let recognition = null;
let isRecording = false;

// Web Speech API の初期化
function initializeSpeechRecognition() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.lang = "ja-JP"; // 日本語に設定
    recognition.continuous = false; // 一度の認識で終了
    recognition.interimResults = true; // 途中結果も表示
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      isRecording = true;
      voiceInputBtn.style.background = "#ff4444";
      voiceInputBtn.innerHTML = "🎤 停止";
      voiceStatus.style.display = "block";
      voiceStatus.innerHTML = "🎤 音声認識中... 話してください";
      console.log("音声認識開始");
    };

    recognition.onresult = function (event) {
      let transcript = "";
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      // 入力フィールドに音声認識結果を追加
      if (isFinal) {
        const currentText = input.value;
        const newText = currentText
          ? currentText + " " + transcript
          : transcript;
        input.value = newText;
        console.log("音声認識結果（確定）:", transcript);
      } else {
        // 暫定結果を表示
        voiceStatus.innerHTML = `🎤 認識中: "${transcript}"`;
      }
    };

    recognition.onerror = function (event) {
      console.error("音声認識エラー:", event.error);
      stopVoiceRecognition();

      let errorMessage = "音声認識でエラーが発生しました";
      switch (event.error) {
        case "no-speech":
          errorMessage = "音声が検出されませんでした";
          break;
        case "audio-capture":
          errorMessage = "マイクにアクセスできません";
          break;
        case "not-allowed":
          errorMessage = "マイクの使用が許可されていません";
          break;
        case "network":
          errorMessage = "ネットワークエラーが発生しました";
          break;
      }

      voiceStatus.style.display = "block";
      voiceStatus.style.background = "#ffebee";
      voiceStatus.style.color = "#c62828";
      voiceStatus.innerHTML = `❌ ${errorMessage}`;

      setTimeout(() => {
        voiceStatus.style.display = "none";
      }, 3000);
    };

    recognition.onend = function () {
      stopVoiceRecognition();
      console.log("音声認識終了");
    };

    console.log("音声認識機能が利用可能です");
    return true;
  } else {
    console.warn("音声認識機能はこのブラウザでサポートされていません");
    voiceInputBtn.style.display = "none";
    return false;
  }
}

// 音声認識開始
function startVoiceRecognition() {
  if (!recognition) return;

  try {
    recognition.start();
  } catch (error) {
    console.error("音声認識開始エラー:", error);
  }
}

// 音声認識停止
function stopVoiceRecognition() {
  isRecording = false;
  voiceInputBtn.style.background = "#ff6b6b";
  voiceInputBtn.innerHTML = "🎤 音声";
  voiceStatus.style.display = "none";

  if (recognition) {
    recognition.stop();
  }
}

// 音声入力ボタンのイベントリスナー
voiceInputBtn.addEventListener("click", function () {
  if (!currentUser) {
    alert("ログインしてから音声入力をご利用ください");
    return;
  }

  if (isRecording) {
    stopVoiceRecognition();
  } else {
    startVoiceRecognition();
  }
});

// URLパラメータと選択された動画情報を取得
function getCurrentVideoInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const personId = urlParams.get("person");
  const videoId = urlParams.get("video");
  const mode = urlParams.get("mode") || "watch";

  // localStorageから詳細情報を取得
  const storedVideo = localStorage.getItem("selectedVideo");
  if (storedVideo) {
    try {
      const videoInfo = JSON.parse(storedVideo);
      return {
        personId: personId,
        videoId: videoId,
        mode: mode,
        filename: videoInfo.filename,
      };
    } catch (error) {
      console.error("動画情報の解析エラー:", error);
    }
  }

  return {
    personId: personId,
    videoId: videoId,
    mode: mode,
  };
}

// 選手情報を取得
function getCurrentPersonFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const personId = urlParams.get("person");

  if (personId) {
    return { id: personId };
  }

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

// 初期化
selectedVideo = getCurrentVideoInfo();
currentPerson = getCurrentPersonFromUrl();
currentMode = selectedVideo.mode;

// 選手情報がない場合はホームページにリダイレクト
if (!currentPerson || !selectedVideo.videoId) {
  window.location.href = "home.html";
} else {
  // DOM読み込み完了後に初期化
  document.addEventListener("DOMContentLoaded", () => {
    initializePage();
  });
}

// ページ初期化
async function initializePage() {
  await updatePersonAndVideoInfo();

  // 音声認識機能を初期化
  initializeSpeechRecognition();

  // モードに応じてUIを調整
  if (currentMode === "analyze") {
    // 骨格推定モードの場合、解析ボタンを表示
    document.getElementById("analysisBtn").style.display = "inline-block";
  }
}

// 選手と動画情報の表示を更新
async function updatePersonAndVideoInfo() {
  const personInfoElement = document.getElementById("personInfo");
  const videoTitleElement = document.getElementById("currentVideoTitle");

  try {
    // 選手情報を取得
    if (currentPerson.id) {
      const personDoc = await db
        .collection("people")
        .doc(currentPerson.id)
        .get();
      if (personDoc.exists) {
        const personData = personDoc.data();
        currentPerson.name = personData.name;
        personInfoElement.textContent = `選手: ${personData.name}`;
      } else {
        personInfoElement.textContent = "選手: 情報が見つかりません";
      }
    }

    // 動画情報を取得
    if (selectedVideo.videoId) {
      const videoDoc = await db
        .collection("videos")
        .doc(selectedVideo.videoId)
        .get();
      if (videoDoc.exists) {
        const videoData = videoDoc.data();
        currentVideoFilename = videoData.filename;
        currentVideoURL = videoData.url;
        videoTitleElement.textContent = videoData.filename;

        // 動画をロード
        loadVideoFromURL(videoData.url);
      } else {
        videoTitleElement.textContent = "動画が見つかりません";
      }
    }
  } catch (error) {
    console.error("情報取得エラー:", error);
    personInfoElement.textContent = "選手: 読み込みエラー";
    videoTitleElement.textContent = "動画読み込みエラー";
  }
}

// URLから動画をロード
function loadVideoFromURL(url) {
  const video = document.getElementById("videoPlayer");
  video.src = url;
  video.style.display = "block";

  // 制御ボタンを表示
  document.getElementById("playBtn").style.display = "inline-block";
  document.getElementById("pauseBtn").style.display = "inline-block";

  // 骨格推定解析ボタンを常に表示
  document.getElementById("analysisBtn").style.display = "inline-block";

  // コメントを読み込み
  loadComments();
}

// ナビゲーション関数
function goBack() {
  window.location.href = `person-videos.html?person=${currentPerson.id}`;
}

function goHome() {
  window.location.href = "home.html";
}

// 認証処理
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  // アカウント選択を強制（複数アカウントがある場合）
  provider.setCustomParameters({
    prompt: "select_account",
  });
  auth.signInWithPopup(provider);
});

// アカウント切り替え機能
switchAccountBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  // 強制的にアカウント選択画面を表示
  provider.setCustomParameters({
    prompt: "select_account",
  });

  // 現在のセッションを一旦終了してから新しいアカウントでログイン
  auth.signOut().then(() => {
    auth.signInWithPopup(provider).catch((error) => {
      console.error("アカウント切り替えエラー:", error);
      // エラーが発生した場合は元のユーザー状態に戻る
      auth.signInWithPopup(provider);
    });
  });
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// 認証状態監視
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    loginInfo.textContent = `${
      user.displayName || user.email
    } がログイン中です。`;
    loginBtn.style.display = "none";
    switchAccountBtn.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
    sendBtn.disabled = false;
    input.disabled = false;
    voiceInputBtn.disabled = false;
  } else {
    currentUser = null;
    loginInfo.textContent = "未ログイン";
    loginBtn.style.display = "inline-block";
    switchAccountBtn.style.display = "none";
    logoutBtn.style.display = "none";
    sendBtn.disabled = true;
    input.disabled = true;
    voiceInputBtn.disabled = true;
  }
});

// 動画制御
document.getElementById("playBtn").addEventListener("click", () => {
  document.getElementById("videoPlayer").play();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  document.getElementById("videoPlayer").pause();
});

// コメント送信
sendBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("ログインしてください");
    return;
  }

  const text = input.value.trim();
  if (!text) {
    alert("コメントを入力してください");
    return;
  }

  if (!currentVideoFilename) {
    alert("動画が選択されていません");
    return;
  }

  try {
    await db.collection("comments").add({
      text: text,
      user: currentUser.displayName || currentUser.email,
      video: currentVideoFilename,
      timestamp: new Date(),
      personId: currentPerson.id,
    });

    input.value = "";
    loadComments();
  } catch (error) {
    console.error("コメント送信エラー:", error);
    alert("コメントの送信に失敗しました");
  }
});

// Enterキーでコメント送信
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// コメント一覧読み込み
async function loadComments() {
  list.innerHTML = "";
  if (!currentVideoFilename) return;

  try {
    const snapshot = await db
      .collection("comments")
      .where("video", "==", currentVideoFilename)
      .get();

    // クライアントサイドでソート
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, data: doc.data() });
    });

    comments.sort((a, b) => {
      const aTime = a.data.timestamp ? a.data.timestamp.toMillis() : 0;
      const bTime = b.data.timestamp ? b.data.timestamp.toMillis() : 0;
      return bTime - aTime;
    });

    comments.forEach(({ data }) => {
      const li = document.createElement("li");

      // タイムスタンプリンク化
      const match = data.text.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
      if (match) {
        const timeStr = match[1];
        const commentText = match[2];
        const [min, sec] = timeStr.split(":").map(Number);
        const seconds = min * 60 + sec;

        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>
              <strong>${data.user}:</strong> 
              <a href="#" onclick="seekTo(${seconds}); return false;" style="color: #2e318f; text-decoration: none;">
                ${timeStr}
              </a> ${commentText}
            </span>
            <small style="color: #666;">${formatTimestamp(
              data.timestamp
            )}</small>
          </div>
        `;
      } else {
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span><strong>${data.user}:</strong> ${data.text}</span>
            <small style="color: #666;">${formatTimestamp(
              data.timestamp
            )}</small>
          </div>
        `;
      }

      list.appendChild(li);
    });
  } catch (error) {
    console.error("コメント読み込みエラー:", error);
  }
}

// タイムスタンプフォーマット
function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  let date;
  if (typeof timestamp === "object" && timestamp.toDate) {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }

  // 日付と時刻を「2025/11/04 10:20」の形式で表示
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 動画の指定時間にシーク
function seekTo(seconds) {
  const video = document.getElementById("videoPlayer");
  video.currentTime = seconds;
  video.play();
}

// 骨格推定解析（既存のanalysis.jsの機能を統合する場合）
document.getElementById("analysisBtn").addEventListener("click", () => {
  if (!currentVideoURL) {
    alert("動画が読み込まれていません");
    return;
  }

  // analysis.htmlに遷移（骨格推定ページ）
  localStorage.setItem(
    "analysisVideo",
    JSON.stringify({
      url: currentVideoURL,
      filename: currentVideoFilename,
      personId: currentPerson.id,
      personName: currentPerson.name,
    })
  );

  window.location.href = "analysis.html";
});

console.log("動画詳細ページが読み込まれました");
