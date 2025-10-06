// team-management.js - チーム管理機能

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

// グローバル変数
let currentUser = null;
let selectedRole = null;
let currentTeam = null;

// 役割の権限定義
const rolePermissions = {
  coach: {
    name: 'コーチ',
    canCreate: true,
    canDelete: true,
    canEdit: true,
    canView: true,
    canManageTeam: true
  },
  manager: {
    name: 'マネージャー',
    canCreate: true,
    canDelete: false,
    canEdit: true,
    canView: true,
    canManageTeam: false
  },
  player: {
    name: '選手',
    canCreate: false,
    canDelete: false,
    canEdit: false,
    canView: true,
    canManageTeam: false
  }
};

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  checkAuthState();
});

// イベントリスナーの設定
function setupEventListeners() {
  // ログインボタン
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  
  // 役割選択
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', function() {
      selectRole(this.dataset.role);
    });
  });
  
  // チーム作成
  document.getElementById('createTeamBtn').addEventListener('click', createTeam);
  
  // チーム参加
  document.getElementById('joinTeamBtn').addEventListener('click', joinTeam);
  
  // コードコピー
  document.getElementById('copyCodeBtn').addEventListener('click', copyTeamCode);
  
  // チーム退出
  document.getElementById('leaveTeamBtn').addEventListener('click', leaveTeam);
}

// 認証状態の確認
function checkAuthState() {
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    
    if (user) {
      console.log('ログイン中:', user.displayName || user.email);
      document.getElementById('loginPrompt').style.display = 'none';
      document.getElementById('teamSetup').style.display = 'block';
      
      // 既存のチーム参加状況を確認
      await checkExistingTeam();
    } else {
      console.log('未ログイン');
      document.getElementById('loginPrompt').style.display = 'block';
      document.getElementById('teamSetup').style.display = 'none';
      document.getElementById('teamInfo').style.display = 'none';
    }
  });
}

// 既存のチーム参加状況を確認
async function checkExistingTeam() {
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.teamId) {
        // 既にチームに参加している
        currentTeam = userData.teamId;
        selectedRole = userData.role;
        await loadTeamInfo();
        showTeamInfo();
      }
    }
  } catch (error) {
    console.error('チーム情報の取得エラー:', error);
  }
}

// ログイン処理
async function handleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    console.error('ログインエラー:', error);
    alert('ログインに失敗しました');
  }
}

// 役割選択
function selectRole(role) {
  selectedRole = role;
  
  // 選択状態の更新
  document.querySelectorAll('.role-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-role="${role}"]`).classList.add('selected');
  
  // コーチのみチーム作成可能
  const createSection = document.getElementById('createTeamSection');
  if (role === 'coach') {
    createSection.style.display = 'block';
  } else {
    createSection.style.display = 'none';
  }
}

// チーム作成
async function createTeam() {
  if (!selectedRole) {
    alert('役割を選択してください');
    return;
  }
  
  if (selectedRole !== 'coach') {
    alert('チームの作成はコーチのみ可能です');
    return;
  }
  
  const teamName = document.getElementById('teamNameInput').value.trim();
  if (!teamName) {
    alert('チーム名を入力してください');
    return;
  }
  
  try {
    // チームコードを生成
    const teamCode = generateTeamCode();
    
    // チームドキュメントを作成
    const teamData = {
      name: teamName,
      code: teamCode,
      createdBy: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      members: {
        [currentUser.uid]: {
          name: currentUser.displayName || currentUser.email,
          role: 'coach',
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      }
    };
    
    const teamRef = await db.collection('teams').add(teamData);
    currentTeam = teamRef.id;
    
    // ユーザーのチーム情報を更新
    await db.collection('users').doc(currentUser.uid).set({
      teamId: teamRef.id,
      role: 'coach',
      name: currentUser.displayName || currentUser.email,
      email: currentUser.email
    });
    
    // 既存データをチーム共有データに変換
    await migrateExistingData(teamRef.id);
    
    console.log('チーム作成完了:', teamRef.id);
    alert(`✅ チーム「${teamName}」が作成されました！\nチームコード: ${teamCode}`);
    
    await loadTeamInfo();
    showTeamInfo();
    
  } catch (error) {
    console.error('チーム作成エラー:', error);
    alert('チームの作成に失敗しました');
  }
}

// チーム参加
async function joinTeam() {
  if (!selectedRole) {
    alert('役割を選択してください');
    return;
  }
  
  const teamCode = document.getElementById('teamCodeInput').value.trim().toUpperCase();
  if (!teamCode) {
    alert('チームコードを入力してください');
    return;
  }
  
  try {
    // チームコードでチームを検索
    const teamsQuery = await db.collection('teams').where('code', '==', teamCode).get();
    
    if (teamsQuery.empty) {
      alert('無効なチームコードです');
      return;
    }
    
    const teamDoc = teamsQuery.docs[0];
    const teamData = teamDoc.data();
    currentTeam = teamDoc.id;
    
    // チームにメンバーを追加
    const memberData = {
      name: currentUser.displayName || currentUser.email,
      role: selectedRole,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('teams').doc(currentTeam).update({
      [`members.${currentUser.uid}`]: memberData
    });
    
    // ユーザーのチーム情報を更新
    await db.collection('users').doc(currentUser.uid).set({
      teamId: currentTeam,
      role: selectedRole,
      name: currentUser.displayName || currentUser.email,
      email: currentUser.email
    });
    
    console.log('チーム参加完了:', currentTeam);
    alert(`✅ チーム「${teamData.name}」に参加しました！`);
    
    await loadTeamInfo();
    showTeamInfo();
    
  } catch (error) {
    console.error('チーム参加エラー:', error);
    alert('チームへの参加に失敗しました');
  }
}

// チーム情報の読み込み
async function loadTeamInfo() {
  if (!currentTeam) return;
  
  try {
    const teamDoc = await db.collection('teams').doc(currentTeam).get();
    
    if (teamDoc.exists) {
      const teamData = teamDoc.data();
      
      // チーム名とコードを表示
      document.getElementById('currentTeamName').textContent = teamData.name;
      document.getElementById('currentTeamCode').textContent = teamData.code;
      
      // メンバー一覧を表示
      displayMembers(teamData.members);
    }
  } catch (error) {
    console.error('チーム情報の読み込みエラー:', error);
  }
}

// メンバー一覧の表示
function displayMembers(members) {
  const memberList = document.getElementById('memberList');
  memberList.innerHTML = '';
  
  Object.entries(members).forEach(([userId, memberData]) => {
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item';
    
    const avatar = memberData.name.charAt(0).toUpperCase();
    const roleName = rolePermissions[memberData.role]?.name || memberData.role;
    
    memberItem.innerHTML = `
      <div class="member-info">
        <div class="member-avatar">${avatar}</div>
        <div>
          <div style="font-weight: bold;">${memberData.name}</div>
          <div style="color: #666; font-size: 0.9rem;">
            ${memberData.joinedAt ? new Date(memberData.joinedAt.toDate()).toLocaleDateString('ja-JP') : ''}
          </div>
        </div>
      </div>
      <div class="role-badge role-${memberData.role}">${roleName}</div>
    `;
    
    memberList.appendChild(memberItem);
  });
}

// チーム情報セクションの表示
function showTeamInfo() {
  document.getElementById('teamSetup').style.display = 'none';
  document.getElementById('teamInfo').style.display = 'block';
}

// チームコードのコピー
async function copyTeamCode() {
  const code = document.getElementById('currentTeamCode').textContent;
  
  try {
    await navigator.clipboard.writeText(code);
    alert('チームコードをクリップボードにコピーしました！');
  } catch (error) {
    // フォールバック: テキストエリアを使用
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('チームコードをコピーしました！');
  }
}

// チーム退出
async function leaveTeam() {
  if (!confirm('本当にチームを退出しますか？\nチームから退出すると、チームのデータにアクセスできなくなります。')) {
    return;
  }
  
  try {
    // チームからメンバーを削除
    await db.collection('teams').doc(currentTeam).update({
      [`members.${currentUser.uid}`]: firebase.firestore.FieldValue.delete()
    });
    
    // ユーザーのチーム情報を削除
    await db.collection('users').doc(currentUser.uid).delete();
    
    // ローカル状態をリセット
    currentTeam = null;
    selectedRole = null;
    
    alert('✅ チームから退出しました');
    
    // セットアップ画面に戻る
    document.getElementById('teamInfo').style.display = 'none';
    document.getElementById('teamSetup').style.display = 'block';
    
  } catch (error) {
    console.error('チーム退出エラー:', error);
    alert('チームからの退出に失敗しました');
  }
}

// チームコード生成
function generateTeamCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 既存データのチーム共有データへの移行
async function migrateExistingData(teamId) {
  try {
    // 既存の選手データをチーム共有に移行
    const peopleSnapshot = await db.collection('people').get();
    
    const batch = db.batch();
    
    peopleSnapshot.docs.forEach(doc => {
      const peopleRef = db.collection('people').doc(doc.id);
      batch.update(peopleRef, {
        teamId: teamId,
        sharedData: true
      });
    });
    
    await batch.commit();
    console.log('既存データの移行完了');
    
  } catch (error) {
    console.error('データ移行エラー:', error);
  }
}

// ユーザーの権限チェック関数（他のページで使用）
window.checkUserPermission = function(permission) {
  if (!selectedRole) return false;
  const role = rolePermissions[selectedRole];
  return role && role[permission];
};

// ユーザーの役割を取得（他のページで使用）
window.getUserRole = function() {
  return selectedRole;
};

// チーム情報を取得（他のページで使用）
window.getCurrentTeam = function() {
  return currentTeam;
};