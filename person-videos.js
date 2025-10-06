// person-videos.js - 個人動画管理ページのJavaScript

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyB1wvxKFWYbQJiPRXsbbhZJXtyfcL3HcEY",
  authDomain: "basketball-ansys.firebaseapp.com",
  projectId: "basketball-ansys",
  storageBucket: "basketball-ansys.firebasestorage.app",
  messagingSenderId: "940330605654",
  appId: "1:940330605654:web:30b7443ba196cef5b72ff7",
};

// Firebase初期化
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

let currentPerson = null;
let currentUser = null;

// URLから選手情報を取得
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

// 選手情報を設定
currentPerson = getCurrentPersonFromUrl();

// 選手情報がない場合はホームページにリダイレクト
if (!currentPerson) {
  window.location.href = "home.html";
}

// 認証状態の監視
auth.onAuthStateChanged((user) => {
  const loginInfo = document.getElementById("loginInfo");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    currentUser = user;
    loginInfo.textContent = `${
      user.displayName || user.email
    } がログイン中です。`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    // 選手名を表示
    updatePersonNameDisplay();
    // 動画一覧を読み込み
    loadVideoList();
  } else {
    currentUser = null;
    loginInfo.textContent = "未ログイン";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    showEmptyState();
  }
});

// ログインボタンのイベント
document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    console.error("ログインエラー:", error);
    alert("ログインに失敗しました");
  }
});

// ログアウトボタンのイベント
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("ログアウトエラー:", error);
  }
});

// 選手名表示を更新
async function updatePersonNameDisplay() {
  const nameElement = document.getElementById("personName");
  if (currentPerson && currentPerson.name) {
    nameElement.textContent = currentPerson.name;
  } else if (currentPerson && currentPerson.id) {
    try {
      const doc = await db.collection("people").doc(currentPerson.id).get();
      if (doc.exists) {
        const personData = doc.data();
        currentPerson.name = personData.name;
        nameElement.textContent = personData.name;
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

// ファイル選択のイベントリスナー
document
  .getElementById("videoInput")
  .addEventListener("change", handleFileSelect);

// ドラッグ&ドロップのイベントリスナー
const uploadArea = document.getElementById("uploadArea");

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("video/")) {
      uploadVideo(file);
    } else {
      alert("動画ファイルを選択してください");
    }
  }
});

// ファイル選択処理
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    uploadVideo(file);
  }
}

// 動画アップロード処理
async function uploadVideo(file) {
  if (!currentUser) {
    alert("ログインしてください");
    return;
  }

  if (!currentPerson) {
    alert("選手情報が見つかりません");
    return;
  }

  try {
    // プログレス表示
    showUploadProgress();

    // Firebase Storageに動画をアップロード（選手別フォルダ）
    const storageRef = storage.ref(`videos/${currentPerson.id}/${file.name}`);

    const uploadTask = storageRef.put(file);

    // アップロード進捗の監視
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        updateUploadProgress(progress);
      },
      (error) => {
        console.error("アップロードエラー:", error);
        alert("動画のアップロードに失敗しました");
        hideUploadProgress();
      },
      async () => {
        // アップロード完了
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

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
              currentPerson.name = personName;
              localStorage.setItem(
                "currentPerson",
                JSON.stringify(currentPerson)
              );
            }
          } catch (error) {
            console.error("選手名取得エラー:", error);
            personName = "不明";
          }
        }

        // Firestoreに動画情報を保存
        await db.collection("videos").add({
          url: downloadURL,
          user: currentUser.displayName || currentUser.email,
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

        hideUploadProgress();
        alert("動画がアップロードされました！");

        // 動画一覧を再読み込み
        loadVideoList();

        // ファイル選択をリセット
        document.getElementById("videoInput").value = "";
      }
    );
  } catch (error) {
    console.error("アップロードエラー:", error);
    alert("動画のアップロードに失敗しました");
    hideUploadProgress();
  }
}

// アップロード進捗表示
function showUploadProgress() {
  document.getElementById("uploadProgress").style.display = "block";
  document.getElementById("progressFill").style.width = "0%";
  document.getElementById("progressText").textContent = "アップロード中...";
}

// アップロード進捗更新
function updateUploadProgress(progress) {
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById(
    "progressText"
  ).textContent = `アップロード中... ${Math.round(progress)}%`;
}

// アップロード進捗非表示
function hideUploadProgress() {
  document.getElementById("uploadProgress").style.display = "none";
}

// 動画一覧の読み込み
async function loadVideoList() {
  if (!currentUser || !currentPerson) {
    showEmptyState();
    return;
  }

  try {
    const snapshot = await db
      .collection("videos")
      .where("personId", "==", currentPerson.id)
      .get();

    const videoGrid = document.getElementById("videoGrid");
    const emptyState = document.getElementById("emptyState");

    if (snapshot.empty) {
      showEmptyState();
      return;
    }

    // 空の状態を隠す
    emptyState.style.display = "none";
    videoGrid.style.display = "grid";

    // 動画をクライアントサイドでソート
    const videos = [];
    snapshot.forEach((doc) => {
      videos.push({ id: doc.id, data: doc.data() });
    });

    videos.sort((a, b) => {
      const aTime = a.data.timestamp ? a.data.timestamp.toMillis() : 0;
      const bTime = b.data.timestamp ? b.data.timestamp.toMillis() : 0;
      return bTime - aTime;
    });

    // 動画カードを生成
    videoGrid.innerHTML = "";

    videos.forEach(({ id, data }) => {
      const videoCard = createVideoCard(id, data);
      videoGrid.appendChild(videoCard);
    });
  } catch (error) {
    console.error("動画一覧の読み込みエラー:", error);
    showEmptyState();
  }
}

// 動画カードの作成
function createVideoCard(videoId, videoData) {
  const card = document.createElement("div");
  card.className = "video-card";

  // 日時表示
  let dateStr = "";
  if (videoData.timestamp) {
    let d;
    if (typeof videoData.timestamp === "object" && videoData.timestamp.toDate) {
      d = videoData.timestamp.toDate();
    } else {
      d = new Date(videoData.timestamp);
    }
    dateStr =
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  card.innerHTML = `
    <div class="delete-btn-top" onclick="event.stopPropagation(); deleteVideo('${videoId}', '${
    videoData.filename
  }')" title="動画を削除">
      ×
    </div>
    <div class="video-thumbnail">🎬</div>
    <div class="video-title">${videoData.filename}</div>
    <div class="video-date">${dateStr}</div>
    <div class="video-actions">
      <button class="action-btn watch-btn" onclick="watchVideo('${videoId}', '${
    videoData.filename
  }')">
        視聴・解析
      </button>
      <button class="action-btn ${getAnalysisButtonClass(
        videoData.filename
      )}" onclick="viewDetailedAnalysis('${videoId}', '${videoData.filename}')">
        ${getAnalysisButtonText(videoData.filename)}
      </button>
    </div>
  `;

  return card;
}

// 分析データの存在チェック
function getAnalysisButtonClass(filename) {
  const analysisData = localStorage.getItem(`analysisData_${filename}`);
  return analysisData ? "success-btn" : "secondary-btn";
}

function getAnalysisButtonText(filename) {
  const analysisData = localStorage.getItem(`analysisData_${filename}`);
  return analysisData ? "評価" : "分析実行";
}

// 動画視聴（詳細画面に遷移）
function watchVideo(videoId, filename) {
  // 動画情報をlocalStorageに保存
  localStorage.setItem(
    "selectedVideo",
    JSON.stringify({
      id: videoId,
      filename: filename,
      mode: "watch",
    })
  );

  // 詳細画面に遷移
  window.location.href = `video-detail.html?person=${currentPerson.id}&video=${videoId}&mode=watch`;
}

// 詳細分析表示（detailed-analysis.htmlに遷移）
function viewDetailedAnalysis(videoId, filename) {
  // まず分析データが存在するかチェック
  const analysisData = localStorage.getItem(`analysisData_${filename}`);

  if (analysisData) {
    console.log(`分析データが存在します: ${filename}`);
    // 動画情報をlocalStorageに保存
    localStorage.setItem(
      "selectedVideo",
      JSON.stringify({
        id: videoId,
        filename: filename,
        mode: "detailed",
      })
    );

    // 詳細分析ページに遷移
    window.location.href = `detailed-analysis.html?video=${encodeURIComponent(
      filename
    )}&person=${currentPerson.id}`;
  } else {
    console.log(`分析データが見つかりません: ${filename}`);
    // 分析データがない場合は確認ダイアログを表示
    const result = confirm(
      `「${filename}」の詳細分析データが見つかりません。\n\n先に骨格推定解析を実行しますか？`
    );

    if (result) {
      // 動画詳細ページで分析を開始
      watchVideo(videoId, filename);
    }
  }
}

// 動画削除
async function deleteVideo(videoId, filename) {
  // より詳細な確認ダイアログ
  const analysisData = localStorage.getItem(`analysisData_${filename}`);
  const hasAnalysis = analysisData ? "分析データも" : "";

  const confirmed = confirm(
    `🗑️ 動画削除の確認\n\n` +
      `削除対象: 「${filename}」\n\n` +
      `以下のデータが完全に削除されます：\n` +
      `• 動画ファイル\n` +
      `• コメントデータ\n` +
      `${hasAnalysis ? "• 分析データ\n" : ""}` +
      `\n⚠️ この操作は取り消せません。\n\n本当に削除しますか？`
  );

  if (!confirmed) {
    return;
  }

  // 二段階確認（重要なファイルの場合）
  if (hasAnalysis) {
    const secondConfirmed = confirm(
      `⚠️ 最終確認\n\n` +
        `「${filename}」には分析データが保存されています。\n` +
        `削除すると分析結果も失われます。\n\n` +
        `本当に削除を実行しますか？`
    );

    if (!secondConfirmed) {
      return;
    }
  }

  try {
    // Firestoreから動画データを削除
    await db.collection("videos").doc(videoId).delete();

    // 関連するコメントも削除
    const commentsSnapshot = await db
      .collection("comments")
      .where("video", "==", filename)
      .get();

    const batch = db.batch();
    commentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Firebase Storageから動画ファイルも削除
    try {
      const storageRef = storage.ref(`videos/${currentPerson.id}/${filename}`);
      await storageRef.delete();
    } catch (storageError) {
      console.error("ストレージ削除エラー:", storageError);
    }

    // 選手の動画数を更新
    if (currentPerson.id) {
      try {
        await db
          .collection("people")
          .doc(currentPerson.id)
          .update({
            videoCount: firebase.firestore.FieldValue.increment(-1),
          });
      } catch (error) {
        console.error("動画数更新エラー:", error);
      }
    }

    // ローカルストレージから分析データも削除
    localStorage.removeItem(`analysisData_${filename}`);
    localStorage.removeItem(`video_${filename}`);

    console.log(`削除完了: ${filename} (関連データもクリーンアップ)`);

    alert("✅ 動画とすべての関連データが削除されました");

    // 動画一覧を再読み込み
    loadVideoList();
  } catch (error) {
    console.error("動画削除エラー:", error);
    alert("動画の削除に失敗しました");
  }
}

// 空の状態を表示
function showEmptyState() {
  const videoGrid = document.getElementById("videoGrid");
  const emptyState = document.getElementById("emptyState");

  videoGrid.style.display = "none";
  emptyState.style.display = "block";
}

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", () => {
  console.log("個人動画管理ページが読み込まれました");
});
