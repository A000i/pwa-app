// home.js - ホームページのJavaScript

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
let app;
if (firebase.apps.length === 0) {
  console.log("Firebaseを初期化中...");
  app = firebase.initializeApp(firebaseConfig);
  console.log("Firebase初期化完了");
} else {
  app = firebase.apps[0];
  console.log("既存のFirebaseアプリを使用");
}

const db = firebase.firestore();
const auth = firebase.auth();

console.log("Firebase services initialized:", { db, auth });

// 認証状態の監視
auth.onAuthStateChanged((user) => {
  console.log("認証状態が変更されました:", user ? "ログイン" : "ログアウト");

  const loginInfo = document.getElementById("loginInfo");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    console.log(
      "ログイン中のユーザー:",
      user.uid,
      user.displayName || user.email
    );
    loginInfo.textContent = `${
      user.displayName || user.email
    } がログイン中です。`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    // 選手作成セクションを表示
    document.querySelector(".create-section").style.display = "block";
  } else {
    console.log("ユーザーはログアウト状態です");
    loginInfo.textContent = "未ログイン（閲覧のみ）";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";

    // 選手作成セクションを非表示
    document.querySelector(".create-section").style.display = "none";
  }

  // ログイン状態に関係なく選手一覧を読み込み
  loadPeopleList();
});

// 既存データを共有データに変換
async function convertExistingDataToShared() {
  try {
    console.log("既存データの共有化を開始...");

    const snapshot = await db.collection("people").get();
    const batch = db.batch();
    let updateCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.sharedData) {
        const docRef = db.collection("people").doc(doc.id);
        batch.update(docRef, { sharedData: true });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`${updateCount}件のデータを共有データに変換しました`);
    } else {
      console.log("すべてのデータは既に共有データです");
    }
  } catch (error) {
    console.error("データ変換エラー:", error);
  }
}

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

// 新規作成ボタンのイベント
document.getElementById("createBtn").addEventListener("click", createPerson);
document.getElementById("nameInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    createPerson();
  }
});

// 選手作成関数
async function createPerson() {
  console.log("createPerson関数が呼ばれました");

  const nameInput = document.getElementById("nameInput");
  const name = nameInput.value.trim();

  console.log("入力された名前:", name);

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  if (!auth.currentUser) {
    alert("ログインしてください");
    console.log("ユーザーがログインしていません");
    return;
  }

  console.log("ログイン中のユーザー:", auth.currentUser.uid);

  try {
    console.log("Firestoreに保存を開始します...");

    // Firestoreに選手情報を保存
    const personData = {
      name: name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      videoCount: 0,
      analysisCount: 0,
      // シンプルに共有データとしてマーク
      shared: true,
    };

    console.log("保存するデータ:", personData);

    const docRef = await db.collection("people").add(personData);
    console.log("Firestoreに保存完了。ドキュメントID:", docRef.id);

    // 入力フィールドをクリア
    nameInput.value = "";

    // 選手一覧を再読み込み
    console.log("選手一覧を再読み込みします...");
    await loadPeopleList();

    // 選手一覧を再読み込み
    console.log("選手一覧を再読み込みします...");
    await loadPeopleList();

    console.log("選手が正常に作成されました:", name);
    alert("選手が正常に作成されました！");
  } catch (error) {
    console.error("選手作成エラー:", error);
    console.error("エラーの詳細:", error.message);
    alert("選手の作成に失敗しました: " + error.message);
  }
}

// 選手一覧の読み込み
async function loadPeopleList() {
  console.log("loadPeopleList関数が呼ばれました");

  try {
    console.log("Firestoreから選手一覧を取得中...");

    // シンプルに全ての選手データを取得（フィルターなし）
    const querySnapshot = await db.collection("people").get();
    console.log("取得した選手数:", querySnapshot.size);

    const peopleGrid = document.getElementById("peopleGrid");
    const emptyState = document.getElementById("emptyState");

    if (querySnapshot.empty || querySnapshot.size === 0) {
      console.log("選手が見つかりませんでした");
      showEmptyState();
      return;
    }

    // 空の状態を隠す
    emptyState.style.display = "none";
    peopleGrid.style.display = "grid";

    // 選手カードを生成（クライアントサイドでソート）
    peopleGrid.innerHTML = "";

    const people = [];
    querySnapshot.forEach((doc) => {
      const person = doc.data();
      people.push({ id: doc.id, data: person });
    });

    // 作成日時でソート（新しいものが上に）
    people.sort((a, b) => {
      const aTime = a.data.createdAt ? a.data.createdAt.toMillis() : 0;
      const bTime = b.data.createdAt ? b.data.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    people.forEach(({ id, data }) => {
      console.log("選手データ:", id, data);
      const personCard = createPersonCard(id, data);
      peopleGrid.appendChild(personCard);
    });

    console.log("選手一覧の表示が完了しました");
  } catch (error) {
    console.error("選手一覧の読み込みエラー:", error);
    console.error("エラーの詳細:", error.message);
    showEmptyState();
  }
}

// 選手カードの作成
function createPersonCard(personId, person) {
  const card = document.createElement("div");
  card.className = "person-card";

  // アバターの初期文字（名前の最初の文字）
  const avatarText = person.name.charAt(0).toUpperCase();

  // ログイン状態に応じて削除ボタンの表示を決定
  const deleteButton = auth.currentUser
    ? `<button class="action-btn delete-btn" onclick="deletePerson('${personId}', '${person.name}')">
        削除
      </button>`
    : "";

  card.innerHTML = `
    <div class="person-avatar">${avatarText}</div>
    <div class="person-name">${person.name}</div>
    <div class="person-stats">
      動画: ${person.videoCount || 0}本
    </div>
    <div class="person-actions">
      <button class="action-btn enter-btn" onclick="enterPersonPage('${personId}', '${
    person.name
  }')">
        入る
      </button>
      ${deleteButton}
    </div>
    <div class="person-analysis" style="margin-top: 15px;">
      <button
        class="action-btn analysis-graph-btn"
        onclick="viewPersonAnalysis('${personId}', '${person.name}')"
        style="border: 2px solid rgba(255,255,255,0.9); border-radius: 10px; padding: 8px 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.08); background: linear-gradient(135deg,#ffffff,#f5f7ff); color:#1b2b4a;"
      >
        📊 骨格推定結果
      </button>
    </div>
  `;

  // デバッグ用のクリックイベントも追加
  const analysisBtn = card.querySelector(".analysis-graph-btn");
  if (analysisBtn) {
    analysisBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Analysis button clicked:", personId, person.name);
      viewPersonAnalysis(personId, person.name);
    });
  }

  return card;
}

// 選手ページに入る
function enterPersonPage(personId, personName) {
  // 選手情報をlocalStorageに保存
  localStorage.setItem(
    "currentPerson",
    JSON.stringify({
      id: personId,
      name: personName,
    })
  );

  // 個人動画管理ページに遷移
  window.location.href = `person-videos.html?person=${personId}`;
}

// 選手削除
async function deletePerson(personId, personName) {
  // 第一段階：基本確認
  const firstConfirmed = confirm(
    `🗑️ 選手削除の確認\n\n` +
      `削除対象: 「${personName}」\n\n` +
      `以下のデータが完全に削除されます：\n` +
      `• 選手情報\n` +
      `• アップロードした全動画\n` +
      `• 動画のコメント\n` +
      `• 分析データ\n\n` +
      `⚠️ この操作は取り消せません。\n\n削除しますか？`
  );

  if (!firstConfirmed) {
    return;
  }

  // 第二段階：最終確認
  const secondConfirmed = confirm(
    `⚠️ 最終確認\n\n` +
      `「${personName}」とすべての関連データを削除します。\n\n` +
      `本当に削除を実行しますか？\n\n` +
      `※この操作は元に戻せません`
  );

  if (!secondConfirmed) {
    return;
  }

  try {
    // Firestoreから選手データを削除
    await db.collection("people").doc(personId).delete();

    // 関連する動画データも削除（必要に応じて実装）
    // TODO: Storageから動画ファイルも削除する処理を追加

    console.log(`選手削除完了: ${personName} (ID: ${personId})`);

    alert(`✅ 「${personName}」とすべての関連データが削除されました`);

    // 選手一覧を再読み込み
    loadPeopleList();
  } catch (error) {
    console.error("選手削除エラー:", error);
    alert("選手の削除に失敗しました");
  }
}

// 空の状態を表示
function showEmptyState() {
  const peopleGrid = document.getElementById("peopleGrid");
  const emptyState = document.getElementById("emptyState");

  peopleGrid.style.display = "none";
  emptyState.style.display = "block";
}

// ページ読み込み時の初期化
// 選手別骨格推定結果を表示
function viewPersonAnalysis(personId, personName) {
  console.log("viewPersonAnalysis called:", personId, personName);

  // 選手情報をlocalStorageに保存
  localStorage.setItem(
    "selectedPersonForAnalysis",
    JSON.stringify({
      id: personId,
      name: personName,
    })
  );

  // 選手別骨格推定結果ページに遷移
  window.location.href = `summary-graph.html?personId=${personId}&personName=${encodeURIComponent(
    personName
  )}`;
}

// テストデータ作成関数（データが削除された場合の復旧用）
async function createTestData() {
  try {
    console.log("テストデータを作成中...");

    const testPlayers = [
      { name: "田中選手", videoCount: 3 },
      { name: "佐藤選手", videoCount: 2 },
      { name: "山田選手", videoCount: 1 },
    ];

    for (const player of testPlayers) {
      const personData = {
        name: player.name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        videoCount: player.videoCount,
        analysisCount: 0,
        shared: true,
      };

      await db.collection("people").add(personData);
      console.log(`${player.name}を作成しました`);
    }

    alert("テストデータを作成しました！\nページを更新してください。");
    window.location.reload();
  } catch (error) {
    console.error("テストデータ作成エラー:", error);
    alert("テストデータの作成に失敗しました");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("ホームページが読み込まれました");

  // データが空の場合、自動的にテストデータを作成するかユーザーに確認
  setTimeout(async () => {
    try {
      const snapshot = await db.collection("people").get();
      if (snapshot.empty) {
        const createTest = confirm(
          "選手データがありません。\nテスト用の選手データを作成しますか？"
        );
        if (createTest) {
          await createTestData();
        }
      }
    } catch (error) {
      console.error("データ確認エラー:", error);
    }
  }, 2000); // 2秒後にチェック
});
