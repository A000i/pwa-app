// expert-evaluation.js - 専門家評価機能

// 専門家評価データの構造
const expertEvaluationTemplate = {
  videoId: null,
  evaluatorId: null,
  timestamp: null,
  scores: {
    technical: {
      footwork: 0,        // 足さばき (0-10)
      handPosition: 0,    // 手の位置 (0-10)
      bodyAlignment: 0,   // 身体のアライメント (0-10)
      followThrough: 0    // フォロースルー (0-10)
    },
    tactical: {
      timing: 0,          // タイミング (0-10)
      positioning: 0,     // ポジショニング (0-10)
      decisionMaking: 0   // 判断力 (0-10)
    },
    physical: {
      balance: 0,         // バランス (0-10)
      power: 0,          // パワー (0-10)
      flexibility: 0,     // 柔軟性 (0-10)
      coordination: 0     // 協調性 (0-10)
    },
    mental: {
      concentration: 0,   // 集中力 (0-10)
      confidence: 0,      // 自信 (0-10)
      consistency: 0      // 一貫性 (0-10)
    }
  },
  overallScore: 0,        // 総合点 (0-10)
  comments: "",           // コメント
  improvements: [],       // 改善点
  keyframes: [],         // 重要フレーム
  outcome: ""            // 結果（成功/失敗とその理由）
};

// 専門家評価UIを表示
function showExpertEvaluationPanel() {
  const panel = document.createElement('div');
  panel.id = 'expertEvaluationPanel';
  panel.className = 'expert-panel';
  
  panel.innerHTML = `
    <div class="expert-panel-content">
      <h3>🏀 専門家評価モード</h3>
      <div class="evaluator-info">
        <label>評価者名: <input type="text" id="evaluatorName" placeholder="氏名"></label>
        <label>指導歴: <input type="number" id="coachingExperience" placeholder="年数"></label>
        <label>専門分野: 
          <select id="specialty">
            <option value="shooting">シューティング</option>
            <option value="dribbling">ドリブリング</option>
            <option value="defense">ディフェンス</option>
            <option value="overall">総合</option>
          </select>
        </label>
      </div>
      
      <div class="evaluation-categories">
        <div class="category">
          <h4>技術面 (Technical)</h4>
          <div class="score-inputs">
            <label>足さばき: <input type="range" id="footwork" min="0" max="10" step="0.1" value="5"></label>
            <span id="footwork-value">5.0</span>
            <label>手の位置: <input type="range" id="handPosition" min="0" max="10" step="0.1" value="5"></label>
            <span id="handPosition-value">5.0</span>
            <label>身体のアライメント: <input type="range" id="bodyAlignment" min="0" max="10" step="0.1" value="5"></label>
            <span id="bodyAlignment-value">5.0</span>
            <label>フォロースルー: <input type="range" id="followThrough" min="0" max="10" step="0.1" value="5"></label>
            <span id="followThrough-value">5.0</span>
          </div>
        </div>
        
        <div class="category">
          <h4>戦術面 (Tactical)</h4>
          <div class="score-inputs">
            <label>タイミング: <input type="range" id="timing" min="0" max="10" step="0.1" value="5"></label>
            <span id="timing-value">5.0</span>
            <label>ポジショニング: <input type="range" id="positioning" min="0" max="10" step="0.1" value="5"></label>
            <span id="positioning-value">5.0</span>
            <label>判断力: <input type="range" id="decisionMaking" min="0" max="10" step="0.1" value="5"></label>
            <span id="decisionMaking-value">5.0</span>
          </div>
        </div>
        
        <div class="category">
          <h4>身体面 (Physical)</h4>
          <div class="score-inputs">
            <label>バランス: <input type="range" id="balance" min="0" max="10" step="0.1" value="5"></label>
            <span id="balance-value">5.0</span>
            <label>パワー: <input type="range" id="power" min="0" max="10" step="0.1" value="5"></label>
            <span id="power-value">5.0</span>
            <label>柔軟性: <input type="range" id="flexibility" min="0" max="10" step="0.1" value="5"></label>
            <span id="flexibility-value">5.0</span>
            <label>協調性: <input type="range" id="coordination" min="0" max="10" step="0.1" value="5"></label>
            <span id="coordination-value">5.0</span>
          </div>
        </div>
        
        <div class="category">
          <h4>メンタル面 (Mental)</h4>
          <div class="score-inputs">
            <label>集中力: <input type="range" id="concentration" min="0" max="10" step="0.1" value="5"></label>
            <span id="concentration-value">5.0</span>
            <label>自信: <input type="range" id="confidence" min="0" max="10" step="0.1" value="5"></label>
            <span id="confidence-value">5.0</span>
            <label>一貫性: <input type="range" id="consistency" min="0" max="10" step="0.1" value="5"></label>
            <span id="consistency-value">5.0</span>
          </div>
        </div>
      </div>
      
      <div class="overall-evaluation">
        <label>総合評価: <input type="range" id="overallScore" min="0" max="10" step="0.1" value="5"></label>
        <span id="overallScore-value">5.0</span>
      </div>
      
      <div class="comments-section">
        <h4>詳細評価</h4>
        <textarea id="comments" placeholder="フォームの特徴、改善点、良い点など詳細にコメント"></textarea>
        
        <h4>主な改善点</h4>
        <div class="improvements">
          <input type="text" id="improvement1" placeholder="改善点1">
          <input type="text" id="improvement2" placeholder="改善点2">
          <input type="text" id="improvement3" placeholder="改善点3">
        </div>
        
        <h4>結果</h4>
        <select id="outcome">
          <option value="">選択してください</option>
          <option value="made">成功</option>
          <option value="missed_short">ショート</option>
          <option value="missed_long">オーバー</option>
          <option value="missed_left">左に外れ</option>
          <option value="missed_right">右に外れ</option>
          <option value="blocked">ブロック</option>
          <option value="other">その他</option>
        </select>
      </div>
      
      <div class="action-buttons">
        <button id="saveEvaluation" class="save-btn">評価を保存</button>
        <button id="compareWithAI" class="compare-btn">AIと比較</button>
        <button id="closePanel" class="close-btn">閉じる</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // スライダーの値を表示更新
  setupSliderValueUpdates();
  
  // イベントリスナー設定
  setupExpertPanelEvents();
}

// スライダー値の表示更新
function setupSliderValueUpdates() {
  const sliders = document.querySelectorAll('#expertEvaluationPanel input[type="range"]');
  sliders.forEach(slider => {
    const valueSpan = document.getElementById(slider.id + '-value');
    
    slider.addEventListener('input', () => {
      valueSpan.textContent = parseFloat(slider.value).toFixed(1);
    });
  });
}

// 専門家パネルのイベント設定
function setupExpertPanelEvents() {
  document.getElementById('saveEvaluation').addEventListener('click', saveExpertEvaluation);
  document.getElementById('compareWithAI').addEventListener('click', compareWithAI);
  document.getElementById('closePanel').addEventListener('click', closeExpertPanel);
}

// 専門家評価を保存
async function saveExpertEvaluation() {
  const evaluation = collectEvaluationData();
  
  try {
    // Firestoreに保存
    await db.collection('expert_evaluations').add(evaluation);
    
    // 成功メッセージ
    alert('評価が保存されました！');
    
    // 統計更新
    updateEvaluationStats();
    
  } catch (error) {
    console.error('評価保存エラー:', error);
    alert('評価の保存に失敗しました');
  }
}

// 評価データを収集
function collectEvaluationData() {
  const evaluation = {
    videoId: currentVideoFilename,
    evaluatorId: currentUser?.uid,
    evaluatorName: document.getElementById('evaluatorName').value,
    coachingExperience: document.getElementById('coachingExperience').value,
    specialty: document.getElementById('specialty').value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    scores: {
      technical: {
        footwork: parseFloat(document.getElementById('footwork').value),
        handPosition: parseFloat(document.getElementById('handPosition').value),
        bodyAlignment: parseFloat(document.getElementById('bodyAlignment').value),
        followThrough: parseFloat(document.getElementById('followThrough').value)
      },
      tactical: {
        timing: parseFloat(document.getElementById('timing').value),
        positioning: parseFloat(document.getElementById('positioning').value),
        decisionMaking: parseFloat(document.getElementById('decisionMaking').value)
      },
      physical: {
        balance: parseFloat(document.getElementById('balance').value),
        power: parseFloat(document.getElementById('power').value),
        flexibility: parseFloat(document.getElementById('flexibility').value),
        coordination: parseFloat(document.getElementById('coordination').value)
      },
      mental: {
        concentration: parseFloat(document.getElementById('concentration').value),
        confidence: parseFloat(document.getElementById('confidence').value),
        consistency: parseFloat(document.getElementById('consistency').value)
      }
    },
    overallScore: parseFloat(document.getElementById('overallScore').value),
    comments: document.getElementById('comments').value,
    improvements: [
      document.getElementById('improvement1').value,
      document.getElementById('improvement2').value,
      document.getElementById('improvement3').value
    ].filter(imp => imp.trim() !== ''),
    outcome: document.getElementById('outcome').value
  };
  
  return evaluation;
}

// AIと比較
async function compareWithAI() {
  // 現在のAI評価を取得
  const aiScore = getCurrentAIScore();
  const expertScore = collectEvaluationData();
  
  // 比較結果を表示
  showComparisonResults(aiScore, expertScore);
}

// 専門家パネルを閉じる
function closeExpertPanel() {
  const panel = document.getElementById('expertEvaluationPanel');
  if (panel) {
    panel.remove();
  }
}

// 評価統計を更新
async function updateEvaluationStats() {
  try {
    const snapshot = await db.collection('expert_evaluations').get();
    const totalEvaluations = snapshot.size;
    
    console.log(`総評価数: ${totalEvaluations}`);
    
    // 統計情報を表示更新
    updateStatsDisplay(totalEvaluations);
    
  } catch (error) {
    console.error('統計更新エラー:', error);
  }
}