// evaluation-process.js - 評価プロセス確立のためのガイダンス

// 評価プロセスのガイドライン
const evaluationGuidelines = {
  preparation: {
    title: "評価準備",
    steps: [
      "動画を3回以上視聴して全体の流れを把握する",
      "評価対象となる技術要素を特定する", 
      "スローモーション再生で細部を確認する",
      "異なる角度から動作を分析する"
    ]
  },
  technical: {
    title: "技術面評価",
    criteria: {
      footwork: {
        excellent: "9-10点: 完璧なフットワーク、バランス抜群",
        good: "7-8点: 良いフットワーク、小さな改善点あり",
        average: "5-6点: 基本的なフットワーク、明確な改善点あり",
        poor: "3-4点: 不安定なフットワーク、大幅な改善必要",
        bad: "1-2点: 非常に悪いフットワーク、基礎から見直し必要"
      },
      handPosition: {
        excellent: "9-10点: 理想的な手の位置、完璧なグリップ",
        good: "7-8点: 良い手の位置、軽微な調整で改善可能",
        average: "5-6点: 標準的な手の位置、改善の余地あり", 
        poor: "3-4点: 不適切な手の位置、指導が必要",
        bad: "1-2点: 非常に悪い手の位置、基本から学び直し"
      },
      bodyAlignment: {
        excellent: "9-10点: 完璧な身体のアライメント",
        good: "7-8点: 良いアライメント、軽微な修正で向上",
        average: "5-6点: 一般的なアライメント、改善点明確",
        poor: "3-4点: 悪いアライメント、重点的な指導必要",
        bad: "1-2点: 非常に悪いアライメント、基礎から再構築"
      },
      followThrough: {
        excellent: "9-10点: 完璧なフォロースルー、理想的なリリース",
        good: "7-8点: 良いフォロースルー、細かい改善で完璧に",
        average: "5-6点: 標準的なフォロースルー、改善の余地あり",
        poor: "3-4点: 不十分なフォロースルー、技術指導必要",
        bad: "1-2点: 非常に悪いフォロースルー、基本から指導"
      }
    }
  },
  consistency: {
    title: "評価の一貫性",
    tips: [
      "同じ基準で全ての動画を評価する",
      "個人的な偏見を排除し客観的に判断する",
      "疑問がある場合は他の評価者と相談する",
      "評価理由を明確にコメントで記録する"
    ]
  }
};

// 評価プロセスガイドの表示
function showEvaluationGuide() {
  const guide = document.createElement('div');
  guide.id = 'evaluationGuide';
  guide.className = 'evaluation-guide';
  
  guide.innerHTML = `
    <div class="guide-content">
      <h3>📚 専門家評価ガイドライン</h3>
      
      <div class="guide-section">
        <h4>🎯 評価準備プロセス</h4>
        <ul>
          ${evaluationGuidelines.preparation.steps.map(step => `<li>${step}</li>`).join('')}
        </ul>
      </div>
      
      <div class="guide-section">
        <h4>⚖️ 技術面評価基準</h4>
        <div class="criteria-grid">
          ${Object.entries(evaluationGuidelines.technical.criteria).map(([key, criteria]) => `
            <div class="criteria-item">
              <h5>${getJapaneseName(key)}</h5>
              <div class="score-ranges">
                <div class="score-range excellent">優秀 (9-10点): ${criteria.excellent.split(': ')[1]}</div>
                <div class="score-range good">良好 (7-8点): ${criteria.good.split(': ')[1]}</div>
                <div class="score-range average">平均 (5-6点): ${criteria.average.split(': ')[1]}</div>
                <div class="score-range poor">要改善 (3-4点): ${criteria.poor.split(': ')[1]}</div>
                <div class="score-range bad">不良 (1-2点): ${criteria.bad.split(': ')[1]}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="guide-section">
        <h4>🎯 評価一貫性のポイント</h4>
        <ul>
          ${evaluationGuidelines.consistency.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
      
      <div class="guide-actions">
        <button onclick="startEvaluationProcess()" class="start-evaluation-btn">評価を開始</button>
        <button onclick="closeEvaluationGuide()" class="close-guide-btn">閉じる</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(guide);
}

// 日本語名の取得
function getJapaneseName(key) {
  const names = {
    footwork: '足さばき',
    handPosition: '手の位置', 
    bodyAlignment: '身体アライメント',
    followThrough: 'フォロースルー'
  };
  return names[key] || key;
}

// 評価プロセスの開始
function startEvaluationProcess() {
  closeEvaluationGuide();
  showExpertEvaluationPanel();
  
  // 評価のステップバイステップガイドを表示
  setTimeout(() => {
    showEvaluationStepGuide();
  }, 500);
}

// ステップバイステップガイドの表示
function showEvaluationStepGuide() {
  const stepGuide = document.createElement('div');
  stepGuide.id = 'stepGuide';
  stepGuide.className = 'step-guide';
  
  stepGuide.innerHTML = `
    <div class="step-guide-content">
      <h4>📋 評価ステップ</h4>
      <div class="current-step" id="currentStep">
        <span class="step-number">1</span>
        <span class="step-text">評価者情報を入力してください</span>
      </div>
      <div class="progress-bar">
        <div class="progress" id="stepProgress" style="width: 16.6%"></div>
      </div>
      <div class="step-tips" id="stepTips">
        氏名、指導歴、専門分野を正確に入力することで、評価の信頼性が向上します。
      </div>
    </div>
  `;
  
  // 専門家評価パネルに追加
  const panel = document.getElementById('expertEvaluationPanel');
  if (panel) {
    panel.querySelector('.expert-panel-content').appendChild(stepGuide);
  }
  
  // 入力監視を開始
  startInputMonitoring();
}

// 入力監視とガイド更新
function startInputMonitoring() {
  const steps = [
    { 
      elements: ['evaluatorName', 'coachingExperience', 'specialty'],
      text: '評価者情報を入力してください',
      tips: '氏名、指導歴、専門分野を正確に入力することで、評価の信頼性が向上します。'
    },
    {
      elements: ['footwork', 'handPosition', 'bodyAlignment', 'followThrough'],
      text: '技術面（Technical）を評価してください',
      tips: '足さばき、手の位置、身体アライメント、フォロースルーを慎重に評価しましょう。'
    },
    {
      elements: ['timing', 'positioning', 'decisionMaking'],
      text: '戦術面（Tactical）を評価してください', 
      tips: 'タイミング、ポジショニング、判断力の観点から分析しましょう。'
    },
    {
      elements: ['balance', 'power', 'flexibility', 'coordination'],
      text: '身体面（Physical）を評価してください',
      tips: 'バランス、パワー、柔軟性、協調性を総合的に判断しましょう。'
    },
    {
      elements: ['concentration', 'confidence', 'consistency'],
      text: 'メンタル面（Mental）を評価してください',
      tips: '集中力、自信、一貫性の観点から選手の精神面を評価しましょう。'
    },
    {
      elements: ['overallScore', 'comments', 'outcome'],
      text: '総合評価とコメントを入力してください',
      tips: '全体的な印象と具体的な改善点を詳細にコメントしてください。'
    }
  ];
  
  let currentStepIndex = 0;
  
  function updateStepGuide() {
    const currentStep = steps[currentStepIndex];
    const completedElements = currentStep.elements.filter(elementId => {
      const element = document.getElementById(elementId);
      return element && element.value && element.value.trim() !== '';
    });
    
    if (completedElements.length === currentStep.elements.length && currentStepIndex < steps.length - 1) {
      currentStepIndex++;
      const nextStep = steps[currentStepIndex];
      
      document.getElementById('currentStep').innerHTML = `
        <span class="step-number">${currentStepIndex + 1}</span>
        <span class="step-text">${nextStep.text}</span>
      `;
      
      document.getElementById('stepTips').textContent = nextStep.tips;
      
      const progress = ((currentStepIndex + 1) / steps.length) * 100;
      document.getElementById('stepProgress').style.width = `${progress}%`;
    }
  }
  
  // 定期的に進行状況をチェック
  const monitor = setInterval(() => {
    if (!document.getElementById('stepGuide')) {
      clearInterval(monitor);
      return;
    }
    updateStepGuide();
  }, 1000);
}

// ガイドを閉じる
function closeEvaluationGuide() {
  const guide = document.getElementById('evaluationGuide');
  if (guide) {
    guide.remove();
  }
}

// 評価品質チェック
function checkEvaluationQuality(evaluation) {
  const issues = [];
  
  // スコアの妥当性チェック
  const allScores = [
    ...Object.values(evaluation.scores.technical),
    ...Object.values(evaluation.scores.tactical),
    ...Object.values(evaluation.scores.physical), 
    ...Object.values(evaluation.scores.mental)
  ];
  
  // 極端なスコアの検出
  const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const overallDiff = Math.abs(evaluation.overallScore - avgScore);
  
  if (overallDiff > 2) {
    issues.push('総合評価と個別評価の差が大きすぎます');
  }
  
  // コメントの充実度チェック
  if (!evaluation.comments || evaluation.comments.length < 20) {
    issues.push('コメントが不十分です。より詳細な評価をお願いします');
  }
  
  // 改善点の数チェック
  const validImprovements = evaluation.improvements.filter(imp => imp && imp.trim() !== '');
  if (validImprovements.length === 0) {
    issues.push('改善点を最低1つは記入してください');
  }
  
  return issues;
}

console.log('📚 評価プロセスガイダンス機能が読み込まれました');
console.log('📋 ガイド表示: showEvaluationGuide()');