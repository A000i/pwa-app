// 骨格推定結果集計グラフのJavaScript（選手別対応版）

// 選手別サンプルデータ（実際の実装では Firebase から取得）
const sampleDataByPerson = {
  'person1': {
    name: '田中選手',
    balance: [
      { date: '7/28', value: 3.8, videoId: 'video1' },
      { date: '8/02', value: 4.0, videoId: 'video2' },
      { date: '8/05', value: 3.9, videoId: 'video3' },
      { date: '8/10', value: 4.2, videoId: 'video4' },
      { date: '8/15', value: 4.1, videoId: 'video5' },
      { date: '8/20', value: 4.3, videoId: 'video6' },
      { date: '8/25', value: 4.0, videoId: 'video7' },
      { date: '9/01', value: 4.4, videoId: 'video8' },
      { date: '9/06', value: 4.2, videoId: 'video9' },
      { date: '9/12', value: 4.5, videoId: 'video10' },
      { date: '9/18', value: 4.3, videoId: 'video11' },
      { date: '9/26', value: 4.2, videoId: 'video12' }
    ],
    knee: [
      { date: '7/28', value: 3.5, videoId: 'video1' },
      { date: '8/02', value: 3.7, videoId: 'video2' },
      { date: '8/05', value: 3.6, videoId: 'video3' },
      { date: '8/10', value: 3.8, videoId: 'video4' },
      { date: '8/15', value: 3.9, videoId: 'video5' },
      { date: '8/20', value: 4.0, videoId: 'video6' },
      { date: '8/25', value: 3.8, videoId: 'video7' },
      { date: '9/01', value: 4.1, videoId: 'video8' },
      { date: '9/06', value: 3.9, videoId: 'video9' },
      { date: '9/12', value: 4.2, videoId: 'video10' },
      { date: '9/18', value: 4.0, videoId: 'video11' },
      { date: '9/26', value: 3.8, videoId: 'video12' }
    ],
    spine: [
      { date: '7/28', value: 4.2, videoId: 'video1' },
      { date: '8/02', value: 4.3, videoId: 'video2' },
      { date: '8/05', value: 4.1, videoId: 'video3' },
      { date: '8/10', value: 4.5, videoId: 'video4' },
      { date: '8/15', value: 4.4, videoId: 'video5' },
      { date: '8/20', value: 4.6, videoId: 'video6' },
      { date: '8/25', value: 4.3, videoId: 'video7' },
      { date: '9/01', value: 4.7, videoId: 'video8' },
      { date: '9/06', value: 4.5, videoId: 'video9' },
      { date: '9/12', value: 4.8, videoId: 'video10' },
      { date: '9/18', value: 4.6, videoId: 'video11' },
      { date: '9/26', value: 4.5, videoId: 'video12' }
    ],
    stance: [
      { date: '7/28', value: 3.8, videoId: 'video1' },
      { date: '8/02', value: 4.0, videoId: 'video2' },
      { date: '8/05', value: 3.9, videoId: 'video3' },
      { date: '8/10', value: 4.1, videoId: 'video4' },
      { date: '8/15', value: 4.0, videoId: 'video5' },
      { date: '8/20', value: 4.2, videoId: 'video6' },
      { date: '8/25', value: 3.9, videoId: 'video7' },
      { date: '9/01', value: 4.3, videoId: 'video8' },
      { date: '9/06', value: 4.1, videoId: 'video9' },
      { date: '9/12', value: 4.4, videoId: 'video10' },
      { date: '9/18', value: 4.2, videoId: 'video11' },
      { date: '9/26', value: 4.0, videoId: 'video12' }
    ],
    shootForm: [
      { date: '7/28', value: 3.9, videoId: 'video1' },
      { date: '8/02', value: 4.1, videoId: 'video2' },
      { date: '8/05', value: 4.0, videoId: 'video3' },
      { date: '8/10', value: 4.2, videoId: 'video4' },
      { date: '8/15', value: 4.1, videoId: 'video5' },
      { date: '8/20', value: 4.3, videoId: 'video6' },
      { date: '8/25', value: 4.0, videoId: 'video7' },
      { date: '9/01', value: 4.4, videoId: 'video8' },
      { date: '9/06', value: 4.2, videoId: 'video9' },
      { date: '9/12', value: 4.5, videoId: 'video10' },
      { date: '9/18', value: 4.3, videoId: 'video11' },
      { date: '9/26', value: 4.1, videoId: 'video12' }
    ],
    defense: [
      { date: '7/28', value: 3.7, videoId: 'video1' },
      { date: '8/02', value: 3.9, videoId: 'video2' },
      { date: '8/05', value: 3.8, videoId: 'video3' },
      { date: '8/10', value: 4.0, videoId: 'video4' },
      { date: '8/15', value: 3.9, videoId: 'video5' },
      { date: '8/20', value: 4.1, videoId: 'video6' },
      { date: '8/25', value: 3.8, videoId: 'video7' },
      { date: '9/01', value: 4.2, videoId: 'video8' },
      { date: '9/06', value: 4.0, videoId: 'video9' },
      { date: '9/12', value: 4.3, videoId: 'video10' },
      { date: '9/18', value: 4.1, videoId: 'video11' },
      { date: '9/26', value: 3.9, videoId: 'video12' }
    ],
    dribble: [
      { date: '7/28', value: 4.1, videoId: 'video1' },
      { date: '8/02', value: 4.3, videoId: 'video2' },
      { date: '8/05', value: 4.2, videoId: 'video3' },
      { date: '8/10', value: 4.4, videoId: 'video4' },
      { date: '8/15', value: 4.3, videoId: 'video5' },
      { date: '8/20', value: 4.5, videoId: 'video6' },
      { date: '8/25', value: 4.2, videoId: 'video7' },
      { date: '9/01', value: 4.6, videoId: 'video8' },
      { date: '9/06', value: 4.4, videoId: 'video9' },
      { date: '9/12', value: 4.7, videoId: 'video10' },
      { date: '9/18', value: 4.5, videoId: 'video11' },
      { date: '9/26', value: 4.3, videoId: 'video12' }
    ],
    stability: [
      { date: '7/28', value: 3.8, videoId: 'video1' },
      { date: '8/02', value: 4.0, videoId: 'video2' },
      { date: '8/05', value: 3.9, videoId: 'video3' },
      { date: '8/10', value: 4.1, videoId: 'video4' },
      { date: '8/15', value: 4.0, videoId: 'video5' },
      { date: '8/20', value: 4.2, videoId: 'video6' },
      { date: '8/25', value: 3.9, videoId: 'video7' },
      { date: '9/01', value: 4.3, videoId: 'video8' },
      { date: '9/06', value: 4.1, videoId: 'video9' },
      { date: '9/12', value: 4.4, videoId: 'video10' },
      { date: '9/18', value: 4.2, videoId: 'video11' },
      { date: '9/26', value: 4.0, videoId: 'video12' }
    ]
  }
};

// メトリクス名のマッピング
const metricNames = {
    balance: '重心バランス',
    knee: '膝角度',
    spine: '背筋の伸び',
    stance: '足幅',
    shootForm: 'シュートフォーム',
    defense: 'ディフェンススタンス',
    dribble: 'ドリブル姿勢',
    stability: '重心安定性'
};

// グローバル変数
let currentChart = null;
let currentMetric = 'balance';
let currentPeriod = '1week';
let selectedPersonId = null;
let selectedPersonName = null;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializePersonData();
    initializeUI();
    setupEventListeners();
    updateChart();
});

// URLパラメータから選手情報を取得
function initializePersonData() {
    const urlParams = new URLSearchParams(window.location.search);
    selectedPersonId = urlParams.get('personId');
    selectedPersonName = urlParams.get('personName');
    
    // localStorageからも取得を試行
    if (!selectedPersonId || !selectedPersonName) {
        const storedPerson = localStorage.getItem('selectedPersonForAnalysis');
        if (storedPerson) {
            const personData = JSON.parse(storedPerson);
            selectedPersonId = personData.id;
            selectedPersonName = personData.name;
        }
    }
    
    // 選手名を表示（選手が指定されている場合のみ）
    if (selectedPersonName) {
        document.getElementById('selectedPerson').textContent = `${selectedPersonName} の結果`;
        document.getElementById('pageTitle').textContent = `${selectedPersonName} - 骨格推定結果集計`;
    } else {
        // 全体の集計の場合
        document.getElementById('selectedPerson').textContent = '全選手の結果';
        document.getElementById('pageTitle').textContent = '骨格推定結果集計 - 全体';
        selectedPersonId = 'person1'; // デフォルトのデータを使用
    }
}

// UI初期化
function initializeUI() {
    // 現在の日付を設定
    const today = new Date();
    const dateStr = today.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = dateStr;
}

// イベントリスナーの設定
function setupEventListeners() {
    // メイン指標ボタン
    document.getElementById('basicPostureBtn').addEventListener('click', function() {
        switchMainMetric('basic');
    });
    
    document.getElementById('motionEvalBtn').addEventListener('click', function() {
        switchMainMetric('motion');
    });

    // 詳細メトリクスの選択
    document.querySelectorAll('.detailed-metric').forEach(metric => {
        metric.addEventListener('click', function() {
            const metricType = this.dataset.metric;
            selectDetailedMetric(metricType);
        });
    });

    // 期間選択ボタン
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectPeriod(this.dataset.period);
        });
    });
}

// メイン指標の切り替え
function switchMainMetric(type) {
    // ボタンの状態更新
    document.querySelectorAll('.metric-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 詳細メトリクスの表示切り替え
    document.querySelectorAll('.detailed-metrics').forEach(detail => {
        detail.classList.remove('show');
    });

    if (type === 'basic') {
        document.getElementById('basicPostureBtn').classList.add('active');
        document.getElementById('basicPostureDetails').classList.add('show');
        // デフォルトで重心バランスを選択
        selectDetailedMetric('balance');
    } else {
        document.getElementById('motionEvalBtn').classList.add('active');
        document.getElementById('motionEvalDetails').classList.add('show');
        // デフォルトでシュートフォームを選択
        selectDetailedMetric('shootForm');
    }
}

// 詳細メトリクスの選択
function selectDetailedMetric(metricType) {
    // 全ての詳細メトリクスの選択を解除
    document.querySelectorAll('.detailed-metric').forEach(metric => {
        metric.classList.remove('active');
    });
    
    // 選択されたメトリクスをアクティブに
    document.querySelector(`[data-metric="${metricType}"]`).classList.add('active');
    
    // 現在のメトリクスを更新
    currentMetric = metricType;
    
    // チャートタイトルを更新
    document.getElementById('chartTitle').textContent = metricNames[metricType];
    
    // グラフを更新
    updateChart();
}

// 期間選択
function selectPeriod(period) {
    // ボタンの状態更新
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    
    currentPeriod = period;
    updateChart();
}

// グラフの更新
function updateChart() {
    const ctx = document.getElementById('metricsChart').getContext('2d');
    
    // 既存のチャートを破棄
    if (currentChart) {
        currentChart.destroy();
    }
    
    // データの準備
    const data = getFilteredData();
    
    if (!data || data.length === 0) {
        // データがない場合の表示
        showNoDataMessage();
        return;
    }
    
    // グラフの設定
    const config = {
        type: 'line',
        data: {
            labels: data.map(item => item.date),
            datasets: [{
                label: metricNames[currentMetric],
                data: data.map(item => item.value),
                borderColor: '#2e318f',
                backgroundColor: 'rgba(46, 49, 143, 0.1)',
                pointBackgroundColor: '#2e318f',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(46, 49, 143, 0.9)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#2e318f',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return `${context[0].label}`;
                        },
                        label: function(context) {
                            return `${metricNames[currentMetric]}: ${context.parsed.y}/5.0`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    min: 0,
                    max: 5,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        stepSize: 1
                    }
                }
            },
            onClick: function(event, elements) {
                // ダブルクリック検出のための処理
                const now = Date.now();
                if (!this.lastClick) this.lastClick = 0;
                
                if (now - this.lastClick < 300 && elements.length > 0) {
                    // ダブルクリック
                    const dataIndex = elements[0].index;
                    const clickedData = data[dataIndex];
                    handleChartDoubleClick(clickedData);
                } else if (elements.length > 0) {
                    // シングルクリック - データポイントの詳細表示
                    const dataIndex = elements[0].index;
                    const clickedData = data[dataIndex];
                    showDataPointInfo(clickedData);
                }
                
                this.lastClick = now;
            }
        }
    };
    
    // チャートを作成
    currentChart = new Chart(ctx, config);
}

// データのフィルタリング（期間に基づく）
function getFilteredData() {
    // 選手のデータを取得
    const personData = sampleDataByPerson[selectedPersonId] || sampleDataByPerson['person1'];
    const data = personData[currentMetric] || [];
    
    // 期間に応じてデータをフィルタリング
    const now = new Date();
    let startDate;
    
    switch (currentPeriod) {
        case '1week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '1month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '3months':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case '6months':
            startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            break;
        default:
            return data;
    }
    
    // 実際の実装では、日付文字列を正しく解析してフィルタリング
    // ここではサンプルとして全データを返す
    return data;
}

// データなしメッセージの表示
function showNoDataMessage() {
    const chartWrapper = document.querySelector('.chart-wrapper');
    chartWrapper.innerHTML = `
        <div class="no-data">
            <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
            <p>${selectedPersonName || '選手'}の${metricNames[currentMetric]}データがありません</p>
            <p>動画解析を実行してデータを蓄積してください</p>
        </div>
    `;
}

// グラフポイントダブルクリック時の処理
function handleChartDoubleClick(dataPoint) {
    const { videoId, date, value } = dataPoint;
    
    // 確認ダイアログを表示
    const message = `${selectedPersonName} - ${date}の${metricNames[currentMetric]}データ（評価: ${value}/5.0）\n\n元の動画を確認しますか？`;
    
    if (confirm(message)) {
        // 動画詳細ページに遷移
        const url = `video-detail.html?personId=${selectedPersonId}&videoId=${videoId}&metric=${currentMetric}&date=${date}`;
        window.location.href = url;
    }
}

// グラフポイント単一クリック時の処理（詳細情報表示）
function showDataPointInfo(dataPoint) {
    const { date, value } = dataPoint;
    
    // ツールチップのような情報表示
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(46, 49, 143, 0.95);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        text-align: center;
        backdrop-filter: blur(10px);
    `;
    
    tooltip.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">${selectedPersonName} - ${metricNames[currentMetric]}</h3>
        <p style="margin: 0 0 5px 0;">日付: ${date}</p>
        <p style="margin: 0 0 15px 0;">評価: ${value}/5.0</p>
        <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">ダブルクリックで動画詳細に移動</p>
    `;
    
    document.body.appendChild(tooltip);
    
    // 3秒後に自動で非表示
    setTimeout(() => {
        tooltip.style.transition = 'opacity 0.3s ease';
        tooltip.style.opacity = '0';
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 300);
    }, 3000);
    
    // クリックで閉じる
    tooltip.addEventListener('click', () => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    });
}

// 現在の値を更新（サンプルデータの最新値を表示）
function updateCurrentValues() {
    const personData = sampleDataByPerson[selectedPersonId] || sampleDataByPerson['person1'];
    const metrics = ['balance', 'knee', 'spine', 'stance', 'shootForm', 'defense', 'dribble', 'stability'];
    
    metrics.forEach(metric => {
        const data = personData[metric];
        if (data && data.length > 0) {
            const latestValue = data[data.length - 1].value;
            const element = document.getElementById(`${metric}Value`);
            if (element) {
                element.textContent = latestValue.toFixed(1);
            }
        }
    });
}

// 値の更新を初期化時に実行
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentValues();
});