// Firebaseの初期化
const firebaseConfig = {
  apiKey: "AIzaSyB1wvxKFWYbQJiPRXsbbhZJXtyfcL3HcEY",
  authDomain: "basketball-ansys.firebaseapp.com",
  projectId: "basketball-ansys",
  storageBucket: "basketball-ansys.firebasestorage.app",
  messagingSenderId: "940330605654",
  appId: "1:940330605654:web:30b7443ba196cef5b72ff7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
// コメント一覧ul要素を取得
const list = document.getElementById('commentList');

// GoogleログインUI（index.html側のloginAreaを利用）
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginInfo = document.getElementById('loginInfo');
let currentUser = null;

const sendBtn = document.getElementById('sendComment');
const input = document.getElementById('commentInput');
sendBtn.disabled = true;
input.disabled = true;

loginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});

logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = '';
    loginInfo.textContent = `${user.displayName} がログイン中です。`;
    sendBtn.disabled = false;
    input.disabled = false;
  } else {
    currentUser = null;
    loginBtn.style.display = '';
    logoutBtn.style.display = 'none';
    loginInfo.textContent = '未ログイン';
    sendBtn.disabled = true;
    input.disabled = true;
  }
});

// コメント送信
sendBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!currentUser) {
    alert('Googleでログインしてください');
    return;
  }
  if (text) {
    await db.collection('comments').add({
      text: text,
      user: currentUser.displayName,
      timestamp: new Date()
    });
    input.value = '';
    loadComments();
  }
});

// コメント一覧取得
async function loadComments() {
  list.innerHTML = '';
  const snapshot = await db.collection('comments').orderBy('timestamp', 'desc').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${data.user || '匿名'}: ${data.text}`;
    list.appendChild(li);
  });
}

// 初回ロード
loadComments();

// 動画再生処理
const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('videoPlayer');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');

videoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file && currentUser) {
    // Storageへアップロード
    const storageRef = storage.ref(`videos/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    // Firestoreに動画情報保存
    await db.collection('videos').add({
      url: url,
      user: currentUser.displayName,
      filename: file.name,
      timestamp: new Date()
    });
    // 動画再生
    videoPlayer.src = url;
    videoPlayer.style.display = '';
    playBtn.style.display = '';
    pauseBtn.style.display = '';
    videoPlayer.play();
    loadVideoList();
  } else if (!currentUser) {
    alert('Googleでログインしてください');
  }
});

// 動画一覧表示
// ダウンロードした動画一覧ul要素を取得
const videoList = document.getElementById('downloadedVideoList');

async function loadVideoList() {
  videoList.innerHTML = '';
  const snapshot = await db.collection('videos').orderBy('timestamp', 'desc').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    // 日時表示（Firestoreのtimestamp型をDateに変換）
    let dateStr = '';
    if (data.timestamp) {
      let d;
      if (typeof data.timestamp === 'object' && typeof data.timestamp.toDate === 'function') {
        d = data.timestamp.toDate();
      } else if (typeof data.timestamp === 'string' || typeof data.timestamp === 'number') {
        d = new Date(data.timestamp);
      }
      if (d) {
        dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
      }
    }
    li.innerHTML = `<b>${data.user}</b>: <a href="#" data-url="${data.url}">${data.filename}</a> <span style="color:#888;font-size:0.95em;margin-left:8px;">${dateStr}</span>`;
    li.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      videoPlayer.src = data.url;
      videoPlayer.style.display = '';
      playBtn.style.display = '';
      pauseBtn.style.display = '';
      videoPlayer.play();
    });
    videoList.appendChild(li);
  });
}

// ページロード時に一覧表示
loadVideoList();


// 骨格推定・canvas関連の処理を無効化（元動画のみ再生）

function drawPoses(poses) {
  poses.forEach(pose => {
    pose.keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        poseCtx.beginPath();
        poseCtx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        poseCtx.fillStyle = 'red';
        poseCtx.fill();
      }
    });
    // 簡易的に主要部位を線で結ぶ例
    const adjacentPairs = [
      [5, 7], [7, 9], [6, 8], [8, 10], // arms
      [5, 6], [11, 12], // shoulders/hips
      [5, 11], [6, 12], // torso
      [11, 13], [13, 15], [12, 14], [14, 16] // legs
    ];
    adjacentPairs.forEach(([a, b]) => {
      const kpA = pose.keypoints[a], kpB = pose.keypoints[b];
      if (kpA.score > 0.3 && kpB.score > 0.3) {
        poseCtx.beginPath();
        poseCtx.moveTo(kpA.x, kpA.y);
        poseCtx.lineTo(kpB.x, kpB.y);
        poseCtx.strokeStyle = 'blue';
        poseCtx.lineWidth = 2;
        poseCtx.stroke();
      }
    });
  });
}

// 動画プレイヤー操作
playBtn.addEventListener('click', () => {
  videoPlayer.play();
});
pauseBtn.addEventListener('click', () => {
  videoPlayer.pause();
});

videoPlayer.addEventListener('loadeddata', () => {
  // 動画の実サイズでcanvasを設定
  poseCanvas.width = videoPlayer.videoWidth || 480;
  poseCanvas.height = videoPlayer.videoHeight || 360;
});

videoPlayer.addEventListener('play', () => {
  poseEstimateActive = true;
  estimatePoseLoop();
});
videoPlayer.addEventListener('pause', () => {
  poseEstimateActive = false;
});
videoPlayer.addEventListener('ended', () => {
  poseEstimateActive = false;
});
