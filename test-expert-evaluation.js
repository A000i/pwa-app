// test-expert-evaluation.js - 専門家評価機能のテスト

// テスト用のサンプルデータ
const testEvaluationData = {
  sampleEvaluations: [
    {
      videoId: "test_video_001",
      evaluatorName: "田中コーチ",
      coachingExperience: 15,
      specialty: "shooting",
      scores: {
        technical: { footwork: 8.5, handPosition: 9.0, bodyAlignment: 8.8, followThrough: 9.2 },
        tactical: { timing: 8.0, positioning: 8.5, decisionMaking: 7.8 },
        physical: { balance: 9.0, power: 8.2, flexibility: 7.5, coordination: 8.8 },
        mental: { concentration: 8.5, confidence: 8.0, consistency: 8.3 }
      },
      overallScore: 8.5,
      comments: "全体的に良いフォーム。フォロースルーが特に優秀。タイミングの判断でやや改善の余地あり。",
      improvements: ["シュートタイミングの判断", "リリースポイントの一貫性", "ディフェンスプレッシャー下での対応"],
      outcome: "made"
    },
    {
      videoId: "test_video_002", 
      evaluatorName: "佐藤元選手",
      coachingExperience: 8,
      specialty: "overall",
      scores: {
        technical: { footwork: 6.5, handPosition: 7.0, bodyAlignment: 6.8, followThrough: 6.2 },
        tactical: { timing: 7.0, positioning: 6.5, decisionMaking: 7.2 },
        physical: { balance: 6.8, power: 7.5, flexibility: 6.0, coordination: 6.5 },
        mental: { concentration: 7.0, confidence: 6.5, consistency: 6.8 }
      },
      overallScore: 6.8,
      comments: "基本的なフォームは身についているが、細かい技術面で改善が必要。特にフォロースルーとバランスを重点的に練習すべき。",
      improvements: ["フォロースルーの改善", "シューティングスタンスの安定", "上半身のバランス"],
      outcome: "missed_short"
    }
  ]
};

// テスト実行機能
class ExpertEvaluationTester {
  constructor() {
    this.testResults = [];
    this.currentTestPhase = 0;
  }

  // 総合テストの実行
  async runCompleteTest() {
    console.log('🧪 専門家評価機能の総合テスト開始');
    
    const testPhases = [
      { name: 'UI表示テスト', func: this.testUIDisplay },
      { name: 'データ入力テスト', func: this.testDataInput },
      { name: '保存機能テスト', func: this.testSaveFunction },
      { name: '比較機能テスト', func: this.testCompareFunction },
      { name: 'データ整合性テスト', func: this.testDataIntegrity }
    ];

    for (let i = 0; i < testPhases.length; i++) {
      this.currentTestPhase = i + 1;
      console.log(`📋 Phase ${this.currentTestPhase}: ${testPhases[i].name}`);
      
      try {
        await testPhases[i].func.call(this);
        this.logTestResult(testPhases[i].name, 'PASS', '');
      } catch (error) {
        this.logTestResult(testPhases[i].name, 'FAIL', error.message);
        console.error(`❌ ${testPhases[i].name} 失敗:`, error);
      }
      
      // 各フェーズ間で少し待機
      await this.sleep(1000);
    }

    this.generateTestReport();
  }

  // UI表示テスト
  async testUIDisplay() {
    console.log('  🎨 UI表示をテスト中...');
    
    // 専門家評価パネルを表示
    showExpertEvaluationPanel();
    
    // 必要な要素が存在するかチェック
    const requiredElements = [
      'expertEvaluationPanel',
      'evaluatorName',
      'coachingExperience', 
      'specialty',
      'footwork',
      'saveEvaluation',
      'compareWithAI',
      'closePanel'
    ];

    for (const elementId of requiredElements) {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`必須要素が見つかりません: ${elementId}`);
      }
    }

    console.log('  ✅ UI表示テスト完了');
  }

  // データ入力テスト
  async testDataInput() {
    console.log('  📝 データ入力をテスト中...');
    
    const testData = testEvaluationData.sampleEvaluations[0];
    
    // 基本情報の入力
    document.getElementById('evaluatorName').value = testData.evaluatorName;
    document.getElementById('coachingExperience').value = testData.coachingExperience;
    document.getElementById('specialty').value = testData.specialty;

    // スコアの入力
    document.getElementById('footwork').value = testData.scores.technical.footwork;
    document.getElementById('handPosition').value = testData.scores.technical.handPosition;
    document.getElementById('overallScore').value = testData.overallScore;
    
    // コメントの入力
    document.getElementById('comments').value = testData.comments;
    document.getElementById('outcome').value = testData.outcome;

    // 入力値の確認
    const inputName = document.getElementById('evaluatorName').value;
    if (inputName !== testData.evaluatorName) {
      throw new Error('入力値が正しく設定されていません');
    }

    console.log('  ✅ データ入力テスト完了');
  }

  // 保存機能テスト
  async testSaveFunction() {
    console.log('  💾 保存機能をテスト中...');
    
    // テスト用の保存機能（実際のFirebaseには保存しない）
    const originalSave = window.saveExpertEvaluation;
    let saveCalled = false;
    
    window.saveExpertEvaluation = async function() {
      saveCalled = true;
      console.log('  📊 保存機能が呼び出されました');
      
      // データ収集のテスト
      const evaluation = collectEvaluationData();
      
      if (!evaluation.evaluatorName || !evaluation.overallScore) {
        throw new Error('必須データが不足しています');
      }
      
      console.log('  📋 評価データ:', evaluation);
    };

    // 保存ボタンをクリック
    document.getElementById('saveEvaluation').click();
    
    if (!saveCalled) {
      throw new Error('保存機能が呼び出されませんでした');
    }

    // 元の関数を復元
    window.saveExpertEvaluation = originalSave;
    
    console.log('  ✅ 保存機能テスト完了');
  }

  // 比較機能テスト
  async testCompareFunction() {
    console.log('  🔍 比較機能をテスト中...');
    
    // モックAIスコアを設定
    window.getCurrentAIScore = function() {
      return {
        technical: 7.8,
        tactical: 7.2,
        physical: 8.1,
        mental: 7.5,
        overall: 7.7
      };
    };

    // 比較機能の実行（UIは表示しない）
    const originalCompare = window.compareWithAI;
    let compareCalled = false;
    
    window.compareWithAI = async function() {
      compareCalled = true;
      const aiScore = getCurrentAIScore();
      const expertScore = collectEvaluationData();
      
      console.log('  🤖 AI評価:', aiScore);
      console.log('  👨‍🏫 専門家評価:', expertScore.overallScore);
      
      const difference = Math.abs(aiScore.overall - expertScore.overallScore);
      console.log('  📊 評価差:', difference.toFixed(2));
    };

    document.getElementById('compareWithAI').click();
    
    if (!compareCalled) {
      throw new Error('比較機能が呼び出されませんでした');
    }

    window.compareWithAI = originalCompare;
    
    console.log('  ✅ 比較機能テスト完了');
  }

  // データ整合性テスト
  async testDataIntegrity() {
    console.log('  🔐 データ整合性をテスト中...');
    
    const evaluation = collectEvaluationData();
    
    // スコア範囲のチェック
    const allScores = [
      ...Object.values(evaluation.scores.technical),
      ...Object.values(evaluation.scores.tactical),
      ...Object.values(evaluation.scores.physical),
      ...Object.values(evaluation.scores.mental),
      evaluation.overallScore
    ];

    for (const score of allScores) {
      if (score < 0 || score > 10) {
        throw new Error(`スコアが範囲外です: ${score}`);
      }
    }

    // 必須フィールドのチェック
    if (!evaluation.evaluatorName.trim()) {
      throw new Error('評価者名が入力されていません');
    }

    console.log('  ✅ データ整合性テスト完了');
  }

  // テスト結果のログ
  logTestResult(testName, status, error) {
    this.testResults.push({
      test: testName,
      status: status,
      error: error,
      timestamp: new Date()
    });
  }

  // テストレポートの生成
  generateTestReport() {
    console.log('\n📋 専門家評価機能テストレポート');
    console.log('==========================================');
    
    let passCount = 0;
    let failCount = 0;

    this.testResults.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${statusIcon} ${result.test}: ${result.status}`);
      
      if (result.error) {
        console.log(`   エラー: ${result.error}`);
      }

      if (result.status === 'PASS') passCount++;
      else failCount++;
    });

    console.log('==========================================');
    console.log(`📊 テスト結果: ${passCount}成功 / ${failCount}失敗`);
    
    if (failCount === 0) {
      console.log('🎉 すべてのテストが成功しました！');
      this.showSuccessMessage();
    } else {
      console.log('⚠️ 一部のテストが失敗しました。修正が必要です。');
      this.showFailureMessage();
    }
  }

  // 成功メッセージの表示
  showSuccessMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 16px; border-radius: 8px; z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <h4 style="margin: 0 0 8px 0;">🎉 テスト完了！</h4>
        <p style="margin: 0;">専門家評価機能は正常に動作しています</p>
      </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 5000);
  }

  // 失敗メッセージの表示
  showFailureMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #dc3545; color: white; padding: 16px; border-radius: 8px; z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <h4 style="margin: 0 0 8px 0;">⚠️ テスト失敗</h4>
        <p style="margin: 0;">コンソールでエラー詳細を確認してください</p>
      </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 8000);
  }

  // 待機用ヘルパー関数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// テスト実行用のグローバル関数
window.runExpertEvaluationTest = function() {
  const tester = new ExpertEvaluationTester();
  tester.runCompleteTest();
};

// デモデータ投入用の関数
window.fillDemoData = function(index = 0) {
  const testData = testEvaluationData.sampleEvaluations[index];
  
  if (!document.getElementById('expertEvaluationPanel')) {
    showExpertEvaluationPanel();
    setTimeout(() => fillDemoData(index), 500);
    return;
  }

  // デモデータを入力
  document.getElementById('evaluatorName').value = testData.evaluatorName;
  document.getElementById('coachingExperience').value = testData.coachingExperience;
  document.getElementById('specialty').value = testData.specialty;

  // 技術面スコア
  document.getElementById('footwork').value = testData.scores.technical.footwork;
  document.getElementById('handPosition').value = testData.scores.technical.handPosition;
  document.getElementById('bodyAlignment').value = testData.scores.technical.bodyAlignment;
  document.getElementById('followThrough').value = testData.scores.technical.followThrough;

  // 戦術面スコア
  document.getElementById('timing').value = testData.scores.tactical.timing;
  document.getElementById('positioning').value = testData.scores.tactical.positioning;
  document.getElementById('decisionMaking').value = testData.scores.tactical.decisionMaking;

  // 身体面スコア
  document.getElementById('balance').value = testData.scores.physical.balance;
  document.getElementById('power').value = testData.scores.physical.power;
  document.getElementById('flexibility').value = testData.scores.physical.flexibility;
  document.getElementById('coordination').value = testData.scores.physical.coordination;

  // メンタル面スコア
  document.getElementById('concentration').value = testData.scores.mental.concentration;
  document.getElementById('confidence').value = testData.scores.mental.confidence;
  document.getElementById('consistency').value = testData.scores.mental.consistency;

  // 総合評価とコメント
  document.getElementById('overallScore').value = testData.overallScore;
  document.getElementById('comments').value = testData.comments;
  document.getElementById('outcome').value = testData.outcome;

  // 改善点
  document.getElementById('improvement1').value = testData.improvements[0] || '';
  document.getElementById('improvement2').value = testData.improvements[1] || '';
  document.getElementById('improvement3').value = testData.improvements[2] || '';

  // スライダー値表示を更新
  setupSliderValueUpdates();

  console.log(`📝 デモデータ${index + 1}を入力しました:`, testData.evaluatorName);
};

console.log('🧪 専門家評価テスト機能が読み込まれました');
console.log('📋 テスト実行: runExpertEvaluationTest()');
console.log('📝 デモデータ: fillDemoData(0) または fillDemoData(1)');