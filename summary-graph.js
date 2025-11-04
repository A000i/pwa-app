// 骨格推定結果集計グラフのJavaScript（選手別対応版）

// 選手別サンプルデータ（実際の実装では Firebase から取得）
const sampleDataByPerson = {
  person1: {
    name: "田中選手",
    balance: [
      { date: "7/28", value: 3.8, videoId: "video1" },
      { date: "8/02", value: 4.0, videoId: "video2" },
      { date: "8/05", value: 3.9, videoId: "video3" },
      { date: "8/10", value: 4.2, videoId: "video4" },
      { date: "8/15", value: 4.1, videoId: "video5" },
      { date: "8/20", value: 4.3, videoId: "video6" },
      { date: "8/25", value: 4.0, videoId: "video7" },
      { date: "9/01", value: 4.4, videoId: "video8" },
      { date: "9/06", value: 4.2, videoId: "video9" },
      { date: "9/12", value: 4.5, videoId: "video10" },
      { date: "9/18", value: 4.3, videoId: "video11" },
      { date: "9/26", value: 4.2, videoId: "video12" },
    ],
    knee: [
      { date: "7/28", value: 3.5, videoId: "video1" },
      { date: "8/02", value: 3.7, videoId: "video2" },
      { date: "8/05", value: 3.6, videoId: "video3" },
      { date: "8/10", value: 3.8, videoId: "video4" },
      { date: "8/15", value: 3.9, videoId: "video5" },
      { date: "8/20", value: 4.0, videoId: "video6" },
      { date: "8/25", value: 3.8, videoId: "video7" },
      { date: "9/01", value: 4.1, videoId: "video8" },
      { date: "9/06", value: 3.9, videoId: "video9" },
      { date: "9/12", value: 4.2, videoId: "video10" },
      { date: "9/18", value: 4.0, videoId: "video11" },
      { date: "9/26", value: 3.8, videoId: "video12" },
    ],
    spine: [
      { date: "7/28", value: 4.2, videoId: "video1" },
      { date: "8/02", value: 4.3, videoId: "video2" },
      { date: "8/05", value: 4.1, videoId: "video3" },
      { date: "8/10", value: 4.5, videoId: "video4" },
      { date: "8/15", value: 4.4, videoId: "video5" },
      { date: "8/20", value: 4.6, videoId: "video6" },
      { date: "8/25", value: 4.3, videoId: "video7" },
      { date: "9/01", value: 4.7, videoId: "video8" },
      { date: "9/06", value: 4.5, videoId: "video9" },
      { date: "9/12", value: 4.8, videoId: "video10" },
      { date: "9/18", value: 4.6, videoId: "video11" },
      { date: "9/26", value: 4.5, videoId: "video12" },
    ],
    stance: [
      { date: "7/28", value: 3.8, videoId: "video1" },
      { date: "8/02", value: 4.0, videoId: "video2" },
      { date: "8/05", value: 3.9, videoId: "video3" },
      { date: "8/10", value: 4.1, videoId: "video4" },
      { date: "8/15", value: 4.0, videoId: "video5" },
      { date: "8/20", value: 4.2, videoId: "video6" },
      { date: "8/25", value: 3.9, videoId: "video7" },
      { date: "9/01", value: 4.3, videoId: "video8" },
      { date: "9/06", value: 4.1, videoId: "video9" },
      { date: "9/12", value: 4.4, videoId: "video10" },
      { date: "9/18", value: 4.2, videoId: "video11" },
      { date: "9/26", value: 4.0, videoId: "video12" },
    ],
    shootForm: [
      { date: "7/28", value: 3.9, videoId: "video1" },
      { date: "8/02", value: 4.1, videoId: "video2" },
      { date: "8/05", value: 4.0, videoId: "video3" },
      { date: "8/10", value: 4.2, videoId: "video4" },
      { date: "8/15", value: 4.1, videoId: "video5" },
      { date: "8/20", value: 4.3, videoId: "video6" },
      { date: "8/25", value: 4.0, videoId: "video7" },
      { date: "9/01", value: 4.4, videoId: "video8" },
      { date: "9/06", value: 4.2, videoId: "video9" },
      { date: "9/12", value: 4.5, videoId: "video10" },
      { date: "9/18", value: 4.3, videoId: "video11" },
      { date: "9/26", value: 4.1, videoId: "video12" },
    ],
    defense: [
      { date: "7/28", value: 3.7, videoId: "video1" },
      { date: "8/02", value: 3.9, videoId: "video2" },
      { date: "8/05", value: 3.8, videoId: "video3" },
      { date: "8/10", value: 4.0, videoId: "video4" },
      { date: "8/15", value: 3.9, videoId: "video5" },
      { date: "8/20", value: 4.1, videoId: "video6" },
      { date: "8/25", value: 3.8, videoId: "video7" },
      { date: "9/01", value: 4.2, videoId: "video8" },
      { date: "9/06", value: 4.0, videoId: "video9" },
      { date: "9/12", value: 4.3, videoId: "video10" },
      { date: "9/18", value: 4.1, videoId: "video11" },
      { date: "9/26", value: 3.9, videoId: "video12" },
    ],
    dribble: [
      { date: "7/28", value: 4.1, videoId: "video1" },
      { date: "8/02", value: 4.3, videoId: "video2" },
      { date: "8/05", value: 4.2, videoId: "video3" },
      { date: "8/10", value: 4.4, videoId: "video4" },
      { date: "8/15", value: 4.3, videoId: "video5" },
      { date: "8/20", value: 4.5, videoId: "video6" },
      { date: "8/25", value: 4.2, videoId: "video7" },
      { date: "9/01", value: 4.6, videoId: "video8" },
      { date: "9/06", value: 4.4, videoId: "video9" },
      { date: "9/12", value: 4.7, videoId: "video10" },
      { date: "9/18", value: 4.5, videoId: "video11" },
      { date: "9/26", value: 4.3, videoId: "video12" },
    ],
    stability: [
      { date: "7/28", value: 3.8, videoId: "video1" },
      { date: "8/02", value: 4.0, videoId: "video2" },
      { date: "8/05", value: 3.9, videoId: "video3" },
      { date: "8/10", value: 4.1, videoId: "video4" },
      { date: "8/15", value: 4.0, videoId: "video5" },
      { date: "8/20", value: 4.2, videoId: "video6" },
      { date: "8/25", value: 3.9, videoId: "video7" },
      { date: "9/01", value: 4.3, videoId: "video8" },
      { date: "9/06", value: 4.1, videoId: "video9" },
      { date: "9/12", value: 4.4, videoId: "video10" },
      { date: "9/18", value: 4.2, videoId: "video11" },
      { date: "9/26", value: 4.0, videoId: "video12" },
    ],
  },
};

// メトリクス名のマッピング
const metricNames = {
  balance: "重心バランス",
  knee: "膝角度",
  spine: "背筋の伸び",
  stance: "足幅",
  overall: "総合スコア",
  shootForm: "シュートフォーム",
  defense: "ディフェンススタンス",
  dribble: "ドリブル姿勢",
  stability: "重心安定性",
};

// グローバル変数
let currentChart = null;
// default to overall per-video score
let currentMetric = "overall";
let currentPeriod = "1week";
let selectedPersonId = null;
let selectedPersonName = null;
// Firebase config (matches other pages)
const firebaseConfig = {
  apiKey: "AIzaSyB1wvxKFWYbQJiPRXsbbhZJXtyfcL3HcEY",
  authDomain: "basketball-ansys.firebaseapp.com",
  projectId: "basketball-ansys",
  storageBucket: "basketball-ansys.firebasestorage.app",
  messagingSenderId: "940330605654",
  appId: "1:940330605654:web:30b7443ba196cef5b72ff7",
};

// Initialize firebase if available on the page
if (typeof firebase !== "undefined") {
  try {
    if (firebase.apps && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    window.__db = firebase.firestore();
  } catch (e) {
    console.warn("Firebase initialization skipped:", e);
  }
}

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", async function () {
  await initializePersonData();
  initializeUI();
  setupEventListeners();
  updateChart();
});

// URLパラメータから選手情報を取得
async function initializePersonData() {
  const urlParams = new URLSearchParams(window.location.search);
  // accept both personId / person and personName / name
  selectedPersonId = urlParams.get("personId") || urlParams.get("person");
  selectedPersonName =
    urlParams.get("personName") ||
    urlParams.get("name") ||
    urlParams.get("personName");

  // localStorageからも取得を試行
  if (!selectedPersonId || !selectedPersonName) {
    // try other localStorage keys used across app
    const storedPerson =
      localStorage.getItem("selectedPersonForAnalysis") ||
      localStorage.getItem("currentPerson");
    if (storedPerson) {
      try {
        const personData = JSON.parse(storedPerson);
        selectedPersonId = selectedPersonId || personData.id;
        selectedPersonName = selectedPersonName || personData.name;
      } catch (e) {
        // ignore parse errors
      }
    }
  }

  // 選手名を表示（選手が指定されている場合のみ）
  if (selectedPersonName) {
    document.getElementById(
      "selectedPerson"
    ).textContent = `${selectedPersonName} の結果`;
    document.getElementById(
      "pageTitle"
    ).textContent = `${selectedPersonName} - 骨格推定結果集計`;
  } else {
    // 全体の集計の場合
    document.getElementById("selectedPerson").textContent = "全選手の結果";
    document.getElementById("pageTitle").textContent =
      "骨格推定結果集計 - 全体";
    selectedPersonId = "person1"; // デフォルトのデータを使用
  }
  // try to populate real data from Firestore/videos -> localStorage analyses
  try {
    await fetchAndMergePersonVideos(selectedPersonId);
  } catch (e) {
    // ignore - will fall back to sample data
    console.warn("動画データの取得に失敗しました:", e);
  }
  // sync any localStorage analysisData metrics into the in-memory sampleDataByPerson
  try {
    synchronizeLocalMetricsToSampleData(selectedPersonId);
  } catch (e) {
    console.warn("synchronizeLocalMetricsToSampleData failed:", e);
  }
}

// localStorage に格納された analysisData_<filename>.metrics を
// sampleDataByPerson の対応する要素に同期する
function synchronizeLocalMetricsToSampleData(personId) {
  if (!personId) return;
  const personData = sampleDataByPerson[personId];
  if (!personData) return;

  const metrics = Object.keys(personData);
  metrics.forEach((metric) => {
    const arr = personData[metric];
    if (!Array.isArray(arr)) return;
    arr.forEach((item, idx) => {
      try {
        const filename = item.filename;
        if (!filename) return;
        const raw = localStorage.getItem(`analysisData_${filename}`);
        if (!raw) return;
        const analysis = JSON.parse(raw);
        if (!analysis) return;
        if (
          analysis.metrics &&
          typeof analysis.metrics[metric] !== "undefined"
        ) {
          const v = parseFloat(analysis.metrics[metric]);
          if (!isNaN(v)) {
            item.value = Math.round(v * 10) / 10;
          }
        } else if (analysis.pose) {
          const computed = computeMetricsFromPose(analysis.pose);
          if (computed && typeof computed[metric] !== "undefined") {
            const v = parseFloat(computed[metric]);
            if (!isNaN(v)) item.value = Math.round(v * 10) / 10;
          }
        }
      } catch (e) {
        console.warn(
          "synchronizeLocalMetricsToSampleData item failed for",
          item && item.filename,
          e
        );
      }
    });
  });
}

// デバッグ: 動作別評価の差分をコンソールに出力する
// 使い方: reportActionMetricDifferences(selectedPersonId) を Console で実行
function reportActionMetricDifferences(personId) {
  const pid = personId || selectedPersonId;
  const personData = sampleDataByPerson[pid];
  if (!personData) {
    console.log("no person data for", pid);
    return;
  }
  const metrics = ["shootForm", "defense", "dribble", "stability"];
  // build map filename -> values
  const byFilename = {};
  metrics.forEach((m) => {
    const arr = personData[m] || [];
    arr.forEach((item, idx) => {
      const fn = item.filename || `video_${idx}`;
      byFilename[fn] = byFilename[fn] || { filename: fn };
      byFilename[fn][m] = item.value;
    });
  });

  // inspect localStorage and computed pose for each filename
  Object.keys(byFilename).forEach((fn) => {
    const entry = byFilename[fn];
    const raw = localStorage.getItem(`analysisData_${fn}`);
    let analysis = null;
    if (raw) {
      try {
        analysis = JSON.parse(raw);
      } catch (e) {
        analysis = null;
      }
    }
    const computed =
      analysis && analysis.pose ? computeMetricsFromPose(analysis.pose) : null;
    console.group(`file: ${fn}`);
    console.log("graphValues:", {
      shootForm: entry.shootForm,
      defense: entry.defense,
      dribble: entry.dribble,
      stability: entry.stability,
    });
    console.log(
      "localStorage.metrics:",
      analysis && analysis.metrics ? analysis.metrics : "(none)"
    );
    console.log(
      "computed from pose:",
      computed
        ? {
            shootForm: computed.shootForm,
            defense: computed.defense,
            dribble: computed.dribble,
            stability: computed.stability,
          }
        : "(no pose)"
    );
    // quick equality checks
    if (analysis && analysis.metrics) {
      metrics.forEach((m) => {
        const g = entry[m];
        const a = analysis.metrics[m];
        if (
          typeof g !== "undefined" &&
          typeof a !== "undefined" &&
          String(g) === String(a)
        ) {
          console.log(`${m}: graph === stored (${g})`);
        } else if (typeof g !== "undefined" && typeof a !== "undefined") {
          console.log(`${m}: graph(${g}) != stored(${a})`);
        }
      });
    }
    console.groupEnd();
  });
}

// Fetch videos for the person from Firestore and merge with local analysisData
async function fetchAndMergePersonVideos(personId) {
  if (!personId) return;
  if (typeof window.__db === "undefined") return; // firestore not initialized

  try {
    const snapshot = await window.__db
      .collection("videos")
      .where("personId", "==", personId)
      .get();

    if (snapshot.empty) {
      return;
    }

    // collect videos and sort by timestamp ascending
    const videos = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({ id: doc.id, data });
    });

    videos.sort((a, b) => {
      const aTime = a.data.timestamp
        ? a.data.timestamp.toMillis
          ? a.data.timestamp.toMillis()
          : new Date(a.data.timestamp).getTime()
        : 0;
      const bTime = b.data.timestamp
        ? b.data.timestamp.toMillis
          ? b.data.timestamp.toMillis()
          : new Date(b.data.timestamp).getTime()
        : 0;
      return aTime - bTime;
    });

    // build metric arrays
    const metrics = {
      balance: [],
      knee: [],
      spine: [],
      stance: [],
      shootForm: [],
      defense: [],
      dribble: [],
      stability: [],
    };

    videos.forEach(({ id, data }) => {
      const filename = data.filename || data.url || id;
      const ts = data.timestamp
        ? data.timestamp.toDate
          ? data.timestamp.toDate()
          : new Date(data.timestamp)
        : new Date();
      const dateLabel = ts.toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
      });

      // try to find analysis data in localStorage
      const raw = localStorage.getItem(`analysisData_${filename}`);
      let analysis = null;
      if (raw) {
        try {
          analysis = JSON.parse(raw);
        } catch (e) {
          analysis = null;
        }
      }

      // helper to get metric value (fallbacks: metrics field -> compute from pose)
      function valueFor(key) {
        if (
          analysis &&
          analysis.metrics &&
          typeof analysis.metrics[key] !== "undefined"
        ) {
          const val = parseFloat(analysis.metrics[key]);
          return !isNaN(val) ? val : null;
        }
        // if overall requested from metrics
        if (
          analysis &&
          analysis.metrics &&
          typeof analysis.metrics.overall !== "undefined" &&
          key === "overall"
        ) {
          const val = parseFloat(analysis.metrics.overall);
          return !isNaN(val) ? val : null;
        }
        // fallback compute from pose if available
        if (analysis && analysis.pose) {
          const m = computeMetricsFromPose(analysis.pose);
          const val = m[key];
          return val !== null && val !== undefined && !isNaN(val)
            ? parseFloat(val)
            : null;
        }
        return null;
      }

      // Get all metric values and check if we have at least some valid data
      const balanceVal = valueFor("balance");
      const kneeVal = valueFor("knee");
      const spineVal = valueFor("spine");
      const stanceVal = valueFor("stance");
      const shootFormVal = valueFor("shootForm");
      const defenseVal = valueFor("defense");
      const dribbleVal = valueFor("dribble");
      const stabilityVal = valueFor("stability");

      // Skip this data point if ALL values are null (no analysis available)
      const hasAnyData = [
        balanceVal,
        kneeVal,
        spineVal,
        stanceVal,
        shootFormVal,
        defenseVal,
        dribbleVal,
        stabilityVal,
      ].some((val) => val !== null && val !== undefined && !isNaN(val));

      if (!hasAnyData) {
        console.warn(`動画 ${filename} のデータが不完全です - スキップします`);
        return; // Skip this video entirely
      }

      // push per metric (with fallback values for missing data)
      metrics.balance.push({
        date: dateLabel,
        value: balanceVal || 3.0, // デフォルト値でnullを回避
        videoId: id,
        filename,
      });
      metrics.knee.push({
        date: dateLabel,
        value: kneeVal || 3.0,
        videoId: id,
        filename,
      });
      metrics.spine.push({
        date: dateLabel,
        value: spineVal || 3.0,
        videoId: id,
        filename,
      });
      metrics.stance.push({
        date: dateLabel,
        value: stanceVal || 3.0,
        videoId: id,
        filename,
      });
      metrics.shootForm.push({
        date: dateLabel,
        value: shootFormVal || 3.0,
        videoId: id,
        filename,
      });
      metrics.defense.push({
        date: dateLabel,
        value: defenseVal || 3.0,
        videoId: id,
        filename,
      });
      metrics.dribble.push({
        date: dateLabel,
        value: dribbleVal || 3.0,
        videoId: id,
        filename,
      });
      metrics.stability.push({
        date: dateLabel,
        value: stabilityVal || 3.0,
        videoId: id,
        filename,
      });
    });

    // attach constructed data for use by getFilteredData
    sampleDataByPerson[personId] = Object.assign({}, metrics);
  } catch (e) {
    console.error("fetchAndMergePersonVideos error:", e);
  }
}

// Minimal pose->metrics fallback used when analysis.metrics missing
function computeMetricsFromPose(pose) {
  // A lightweight heuristic similar to other analysis code paths.
  // Returns basic posture metrics plus action-specific metrics so
  // summary-graph can plot motion evaluations even when stored
  // analysis.metrics is missing.
  try {
    if (!pose || !pose.keypoints) return {};

    // support both array-indexed keypoints (as in detailed-analysis) and
    // name/part keyed keypoints (some pose detectors use name/part)
    const kpArray = Array.isArray(pose.keypoints) ? pose.keypoints : [];
    const kpByName = {};
    kpArray.forEach((p) => {
      if (!p) return;
      const name = p.name || p.part;
      if (name) kpByName[name] = p;
    });

    const getKP = (nameOrIndex) => {
      if (typeof nameOrIndex === "number") return kpArray[nameOrIndex] || null;
      return kpByName[nameOrIndex] || null;
    };

    const calcAngle = (a, b, c) => {
      if (!a || !b || !c) return null;
      const abx = (a.x || 0) - (b.x || 0);
      const aby = (a.y || 0) - (b.y || 0);
      const cbx = (c.x || 0) - (b.x || 0);
      const cby = (c.y || 0) - (b.y || 0);
      const dot = abx * cbx + aby * cby;
      const mag1 = Math.sqrt(abx * abx + aby * aby);
      const mag2 = Math.sqrt(cbx * cbx + cby * cby);
      if (mag1 === 0 || mag2 === 0) return null;
      const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      return (Math.acos(cos) * 180) / Math.PI;
    };

    // basic posture heuristics
    const leftAnkle =
      getKP(15) ||
      getKP("left_ankle") ||
      getKP("leftAnkle") ||
      getKP("left_foot");
    const rightAnkle =
      getKP(16) ||
      getKP("right_ankle") ||
      getKP("rightAnkle") ||
      getKP("right_foot");
    const balance = (() => {
      if (!leftAnkle || !rightAnkle) return 3.5;
      const dx = Math.abs((leftAnkle.x || 0) - (rightAnkle.x || 0));
      const val = Math.max(1, 5 - dx / 100);
      return Math.round(val * 10) / 10;
    })();

    const leftKnee = getKP(13) || getKP("left_knee");
    const rightKnee = getKP(14) || getKP("right_knee");
    const knee = (() => {
      // approximate knee angle quality: use one side if available
      const sample = rightKnee && rightKnee.y ? rightKnee : leftKnee;
      if (!sample) return 3.5;
      // no reliable angle if neighbors missing; return neutral
      return 3.5;
    })();

    const spine = (() => {
      // estimate by shoulder-hip vertical alignment
      const leftShoulder = getKP(5) || getKP("left_shoulder");
      const rightShoulder = getKP(6) || getKP("right_shoulder");
      const leftHip = getKP(11) || getKP("left_hip");
      const rightHip = getKP(12) || getKP("right_hip");
      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 3.8;
      const shoulderX = ((leftShoulder.x || 0) + (rightShoulder.x || 0)) / 2;
      const hipX = ((leftHip.x || 0) + (rightHip.x || 0)) / 2;
      const offset = Math.abs(shoulderX - hipX);
      const val = Math.max(1, 5 - offset / 80);
      return Math.round(val * 10) / 10;
    })();

    const stance = (() => {
      // foot spacing relative to shoulder width
      const leftFoot = leftAnkle;
      const rightFoot = rightAnkle;
      const leftShoulder = getKP(5) || getKP("left_shoulder");
      const rightShoulder = getKP(6) || getKP("right_shoulder");
      if (!leftFoot || !rightFoot || !leftShoulder || !rightShoulder)
        return 3.9;
      const footDist = Math.abs((leftFoot.x || 0) - (rightFoot.x || 0));
      const shoulderDist =
        Math.abs((leftShoulder.x || 0) - (rightShoulder.x || 0)) || 1;
      const ratio = footDist / shoulderDist;
      // ideal ratio ~1.0 - map to 1-5
      const val = Math.max(1, Math.min(5, 5 - Math.abs(ratio - 1) * 2));
      return Math.round(val * 10) / 10;
    })();

    // action-specific heuristics (simple approximations using the same logic as detailed-analysis)
    const shootForm = (() => {
      // use right side shoulder-elbow-wrist angle if available
      const rightShoulder = getKP(6) || getKP("right_shoulder");
      const rightElbow = getKP(8) || getKP("right_elbow");
      const rightWrist = getKP(10) || getKP("right_wrist");
      const angle = calcAngle(rightShoulder, rightElbow, rightWrist);
      if (angle === null) return 3;
      if (angle >= 85 && angle <= 95) return 5;
      if (angle >= 75 && angle <= 105) return 4;
      if (angle >= 60 && angle <= 120) return 3;
      return 2;
    })();

    const defense = (() => {
      // hip-to-knee vertical distance (approx)
      const leftHip = getKP(11) || getKP("left_hip");
      const rightHip = getKP(12) || getKP("right_hip");
      const leftKnee = getKP(13) || getKP("left_knee");
      const rightKnee = getKP(14) || getKP("right_knee");
      if (!leftHip || !rightHip || !leftKnee || !rightKnee) return 3;
      const hipCenterY = ((leftHip.y || 0) + (rightHip.y || 0)) / 2;
      const kneeCenterY = ((leftKnee.y || 0) + (rightKnee.y || 0)) / 2;
      const dist = Math.abs(hipCenterY - kneeCenterY);
      if (dist > 50) return 5;
      if (dist > 35) return 4;
      if (dist > 20) return 3;
      return 2;
    })();

    const dribble = (() => {
      // forward lean estimated by nose vs hip center
      const nose = getKP(0) || getKP("nose");
      const leftHip = getKP(11) || getKP("left_hip");
      const rightHip = getKP(12) || getKP("right_hip");
      if (!nose || !leftHip || !rightHip) return 3;
      const hipCenter = {
        x: ((leftHip.x || 0) + (rightHip.x || 0)) / 2,
        y: ((leftHip.y || 0) + (rightHip.y || 0)) / 2,
      };
      const forwardLean =
        (Math.atan2((nose.x || 0) - hipCenter.x, hipCenter.y - (nose.y || 0)) *
          180) /
        Math.PI;
      const absLean = Math.abs(forwardLean);
      if (absLean >= 5 && absLean <= 15) return 5;
      if (absLean <= 25) return 4;
      if (absLean <= 35) return 3;
      return 2;
    })();

    const stability = (() => {
      const leftAnkle = getKP(15) || getKP("left_ankle");
      const rightAnkle = getKP(16) || getKP("right_ankle");
      const leftHip = getKP(11) || getKP("left_hip");
      const rightHip = getKP(12) || getKP("right_hip");
      if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) return 3;
      const ankleCenterX = ((leftAnkle.x || 0) + (rightAnkle.x || 0)) / 2;
      const hipCenterX = ((leftHip.x || 0) + (rightHip.x || 0)) / 2;
      const offset = Math.abs(ankleCenterX - hipCenterX);
      if (offset < 15) return 5;
      if (offset < 25) return 4;
      if (offset < 40) return 3;
      return 2;
    })();

    const overall =
      Math.round(((balance + knee + spine + stance) / 4) * 10) / 10;

    return {
      balance,
      knee,
      spine,
      stance,
      overall,
      shootForm,
      defense,
      dribble,
      stability,
    };
  } catch (e) {
    return {};
  }
}

// UI初期化
function initializeUI() {
  // 現在の日付を設定
  const today = new Date();
  const dateStr = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  document.getElementById("currentDate").textContent = dateStr;
}

// イベントリスナーの設定
function setupEventListeners() {
  // メイン指標ボタン
  document
    .getElementById("basicPostureBtn")
    .addEventListener("click", function () {
      switchMainMetric("basic");
    });

  document
    .getElementById("motionEvalBtn")
    .addEventListener("click", function () {
      switchMainMetric("motion");
    });

  // 詳細メトリクスの選択
  document.querySelectorAll(".detailed-metric").forEach((metric) => {
    metric.addEventListener("click", function () {
      const metricType = this.dataset.metric;
      selectDetailedMetric(metricType);
    });
  });

  // 期間選択ボタン
  document.querySelectorAll(".period-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      selectPeriod(this.dataset.period);
    });
  });

  // 編集ボタン / 保存 / キャンセルのイベントを設定
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const metric = this.dataset.metric;
      enterEditMode(metric);
    });
  });
  document.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const metric = this.dataset.metric;
      saveTileEdit(metric);
    });
  });
  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const metric = this.dataset.metric;
      exitEditMode(metric);
    });
  });
}

// 編集モードに入る
function enterEditMode(metric) {
  const container = document.getElementById(`${metric}Value`);
  if (!container) return;
  const display = container.querySelector(".value-display");
  const input = container.querySelector(".value-input");
  const editBtn = container.querySelector(".edit-btn");
  const saveBtn = container.querySelector(".save-btn");
  const cancelBtn = container.querySelector(".cancel-btn");
  if (!display || !input || !editBtn || !saveBtn || !cancelBtn) return;
  // set input value
  const cur = parseFloat(display.textContent) || 0;
  input.value = cur;
  display.style.display = "none";
  input.style.display = "inline-block";
  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
  cancelBtn.style.display = "inline-block";
}

// 編集モードを終了（キャンセル）
function exitEditMode(metric) {
  const container = document.getElementById(`${metric}Value`);
  if (!container) return;
  const display = container.querySelector(".value-display");
  const input = container.querySelector(".value-input");
  const editBtn = container.querySelector(".edit-btn");
  const saveBtn = container.querySelector(".save-btn");
  const cancelBtn = container.querySelector(".cancel-btn");
  if (!display || !input || !editBtn || !saveBtn || !cancelBtn) return;
  input.style.display = "none";
  display.style.display = "inline-block";
  editBtn.style.display = "inline-block";
  saveBtn.style.display = "none";
  cancelBtn.style.display = "none";
}

// 保存処理: sampleDataByPerson の最新データ点と localStorage の analysisData_<filename> を更新
function saveTileEdit(metric) {
  const container = document.getElementById(`${metric}Value`);
  if (!container) return;
  const display = container.querySelector(".value-display");
  const input = container.querySelector(".value-input");
  if (!display || !input) return;
  const v = parseFloat(input.value);
  if (isNaN(v) || v < 0 || v > 5) {
    alert("0〜5 の数値を入力してください");
    return;
  }

  // update display & exit edit mode
  display.textContent = v.toFixed(1);
  exitEditMode(metric);

  // update sampleDataByPerson latest point
  try {
    const personData =
      sampleDataByPerson[selectedPersonId] || sampleDataByPerson["person1"];
    if (!personData) return;
    const arr = personData[metric];
    if (arr && arr.length > 0) {
      arr[arr.length - 1].value = Math.round(v * 10) / 10;
    }

    // also update localStorage analysisData for the latest video if filename present
    const latestFilename =
      arr && arr.length > 0 && arr[arr.length - 1].filename
        ? arr[arr.length - 1].filename
        : null;
    const latestVideoId =
      arr && arr.length > 0 && arr[arr.length - 1].videoId
        ? arr[arr.length - 1].videoId
        : null;
    if (latestFilename) {
      try {
        const raw = localStorage.getItem(`analysisData_${latestFilename}`);
        let analysis = raw ? JSON.parse(raw) : null;
        if (!analysis) {
          // create minimal analysis object
          analysis = { pose: null, metrics: {} };
        }
        if (!analysis.metrics) analysis.metrics = {};
        analysis.metrics[metric] = Math.round(v * 10) / 10;
        // recompute overall if basic metrics changed
        if (["balance", "knee", "spine", "stance"].includes(metric)) {
          const b = parseFloat(analysis.metrics.balance || 0) || 0;
          const k = parseFloat(analysis.metrics.knee || 0) || 0;
          const s = parseFloat(analysis.metrics.spine || 0) || 0;
          const st = parseFloat(analysis.metrics.stance || 0) || 0;
          const overall = Math.round(((b + k + s + st) / 4) * 10) / 10;
          analysis.metrics.overall = overall;
        }
        localStorage.setItem(
          `analysisData_${latestFilename}`,
          JSON.stringify(analysis)
        );
      } catch (e) {
        console.warn("failed to save analysisData for", latestFilename, e);
      }
    }

    // redraw chart and update current values UI
    updateChart();
    updateCurrentValues();
  } catch (e) {
    console.error("saveTileEdit error:", e);
  }
}

// メイン指標の切り替え
function switchMainMetric(type) {
  // ボタンの状態更新
  document.querySelectorAll(".metric-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // 詳細メトリクスの表示切り替え
  document.querySelectorAll(".detailed-metrics").forEach((detail) => {
    detail.classList.remove("show");
  });

  if (type === "basic") {
    document.getElementById("basicPostureBtn").classList.add("active");
    document.getElementById("basicPostureDetails").classList.add("show");
    // デフォルトで重心バランスを選択
    selectDetailedMetric("balance");
  } else {
    document.getElementById("motionEvalBtn").classList.add("active");
    document.getElementById("motionEvalDetails").classList.add("show");
    // デフォルトでシュートフォームを選択
    selectDetailedMetric("shootForm");
  }
}

// 詳細メトリクスの選択
function selectDetailedMetric(metricType) {
  // 全ての詳細メトリクスの選択を解除
  document.querySelectorAll(".detailed-metric").forEach((metric) => {
    metric.classList.remove("active");
  });

  // 選択されたメトリクスをアクティブに
  document
    .querySelector(`[data-metric="${metricType}"]`)
    .classList.add("active");

  // 現在のメトリクスを更新
  currentMetric = metricType;

  // チャートタイトルを更新
  document.getElementById("chartTitle").textContent = metricNames[metricType];

  // グラフを更新
  updateChart();
}

// 期間選択
function selectPeriod(period) {
  // ボタンの状態更新
  document.querySelectorAll(".period-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-period="${period}"]`).classList.add("active");

  currentPeriod = period;
  updateChart();
}

// グラフの更新
function updateChart() {
  const ctx = document.getElementById("metricsChart").getContext("2d");

  // 既存のチャートを破棄
  if (currentChart) {
    currentChart.destroy();
  }

  // データの準備
  const data = getFilteredData();

  console.log(`📊 グラフ更新: ${data?.length || 0}件のデータポイント`);

  if (!data || data.length === 0) {
    // データがない場合の表示
    console.warn("📊 グラフに表示するデータがありません");
    showNoDataMessage();
    return;
  }

  // データの有効性を再確認
  const validPoints = data.filter(
    (item) =>
      item &&
      item.value !== null &&
      item.value !== undefined &&
      !isNaN(item.value) &&
      item.date
  );

  if (validPoints.length === 0) {
    console.warn("📊 有効なデータポイントがありません");
    showNoDataMessage();
    return;
  }

  if (validPoints.length !== data.length) {
    console.warn(
      `📊 ${
        data.length - validPoints.length
      }件の無効なデータポイントを除外しました`
    );
  }

  // グラフの設定
  const config = {
    type: "line",
    data: {
      labels: validPoints.map((item) => item.date),
      datasets: [
        {
          label: metricNames[currentMetric],
          data: validPoints.map((item) => item.value),
          borderColor: "#2e318f",
          backgroundColor: "rgba(46, 49, 143, 0.1)",
          pointBackgroundColor: "#2e318f",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(46, 49, 143, 0.9)",
          titleColor: "white",
          bodyColor: "white",
          borderColor: "#2e318f",
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            title: function (context) {
              return `${context[0].label}`;
            },
            label: function (context) {
              return `${metricNames[currentMetric]}: ${context.parsed.y}/5.0`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: "#666",
          },
        },
        y: {
          min: 0,
          max: 5,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: "#666",
            stepSize: 1,
          },
        },
      },
      onClick: function (event, elements) {
        // ダブルクリック検出のための処理
        const now = Date.now();
        if (!this.lastClick) this.lastClick = 0;

        if (now - this.lastClick < 300 && elements.length > 0) {
          // ダブルクリック
          const dataIndex = elements[0].index;
          const clickedData = validPoints[dataIndex];
          handleChartDoubleClick(clickedData);
        } else if (elements.length > 0) {
          // シングルクリック - データポイントの詳細表示
          const dataIndex = elements[0].index;
          const clickedData = data[dataIndex];
          showDataPointInfo(clickedData);
        }

        this.lastClick = now;
      },
    },
  };

  // チャートを作成
  currentChart = new Chart(ctx, config);
}

// データのフィルタリング（期間に基づく）
function getFilteredData() {
  // 選手のデータを取得
  const personData =
    sampleDataByPerson[selectedPersonId] || sampleDataByPerson["person1"];
  // if overall requested, compute average of basic posture metrics per index
  if (currentMetric === "overall") {
    const b = personData["balance"] || [];
    const k = personData["knee"] || [];
    const s = personData["spine"] || [];
    const st = personData["stance"] || [];
    const n = Math.min(b.length, k.length, s.length, st.length);
    const out = [];
    for (let i = 0; i < n; i++) {
      const date = b[i].date || k[i].date || s[i].date || st[i].date;
      const videoId =
        b[i].videoId || k[i].videoId || s[i].videoId || st[i].videoId;
      const filename =
        b[i].filename ||
        k[i].filename ||
        s[i].filename ||
        st[i].filename ||
        null;
      const val =
        ((b[i].value || 0) +
          (k[i].value || 0) +
          (s[i].value || 0) +
          (st[i].value || 0)) /
        4;
      out.push({
        date: date,
        value: Math.round(val * 10) / 10,
        videoId,
        filename,
      });
    }
    // If tile values are present, prefer them for the latest point (treat tiles as source-of-truth)
    try {
      const bEl = document.getElementById("balanceValue");
      const kEl = document.getElementById("kneeValue");
      const sEl = document.getElementById("spineValue");
      const stEl = document.getElementById("stanceValue");
      const bVal = bEl ? parseFloat(bEl.textContent) : NaN;
      const kVal = kEl ? parseFloat(kEl.textContent) : NaN;
      const sVal = sEl ? parseFloat(sEl.textContent) : NaN;
      const stVal = stEl ? parseFloat(stEl.textContent) : NaN;
      if (!isNaN(bVal) || !isNaN(kVal) || !isNaN(sVal) || !isNaN(stVal)) {
        // compute average using available tile values (fallback to existing computed values when missing)
        const n = out.length;
        if (n > 0) {
          const last = out[n - 1];
          const useB = !isNaN(bVal) ? bVal : (b[n - 1] && b[n - 1].value) || 0;
          const useK = !isNaN(kVal) ? kVal : (k[n - 1] && k[n - 1].value) || 0;
          const useS = !isNaN(sVal) ? sVal : (s[n - 1] && s[n - 1].value) || 0;
          const useSt = !isNaN(stVal)
            ? stVal
            : (st[n - 1] && st[n - 1].value) || 0;
          const avg = Math.round(((useB + useK + useS + useSt) / 4) * 10) / 10;
          last.value = avg;
        }
      }
    } catch (e) {
      console.warn("getFilteredData tile override (overall) failed:", e);
    }

    return out;
  }
  // データ配列（複製）を取得
  const rawData = personData[currentMetric] || [];

  // 各データ点について localStorage の最新の metrics を参照し、存在する場合は上書きする。
  // これにより、ユーザーがタイルを編集して保存した直後でもグラフは最新の localStorage 値と一致する。
  const data = rawData.map((dp, idx) => {
    const copy = Object.assign({}, dp);
    try {
      const filename = dp.filename || null;
      if (filename) {
        const raw = localStorage.getItem(`analysisData_${filename}`);
        if (raw) {
          const analysis = JSON.parse(raw);
          if (
            analysis &&
            analysis.metrics &&
            typeof analysis.metrics[currentMetric] !== "undefined"
          ) {
            const parsed = parseFloat(analysis.metrics[currentMetric]);
            if (!isNaN(parsed)) copy.value = Math.round(parsed * 10) / 10;
          } else if (
            analysis &&
            analysis.metrics &&
            currentMetric === "overall"
          ) {
            // overall は基本姿勢4項目の平均で再計算
            const b = parseFloat(analysis.metrics.balance || NaN);
            const k = parseFloat(analysis.metrics.knee || NaN);
            const s = parseFloat(analysis.metrics.spine || NaN);
            const st = parseFloat(analysis.metrics.stance || NaN);
            const vals = [b, k, s, st].filter((v) => !isNaN(v));
            if (vals.length) {
              const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
              copy.value = Math.round(avg * 10) / 10;
            }
          } else if (analysis && analysis.pose) {
            // metrics が無くても pose があればフォールバック計算
            const computed = computeMetricsFromPose(analysis.pose);
            if (computed && typeof computed[currentMetric] !== "undefined") {
              const parsed = parseFloat(computed[currentMetric]);
              if (!isNaN(parsed)) copy.value = Math.round(parsed * 10) / 10;
            }
          }
        }
      }
    } catch (e) {
      console.warn(
        "getFilteredData local override error for",
        dp && dp.filename,
        e
      );
    }
    return copy;
  });

  // null値や無効な値を持つデータポイントをフィルタリング
  const validData = data.filter((dp) => {
    return (
      dp &&
      dp.value !== null &&
      dp.value !== undefined &&
      !isNaN(dp.value) &&
      dp.date
    );
  });

  console.log(
    `🔍 データフィルタリング結果: ${data.length}件 → ${validData.length}件の有効データ`
  );
  if (validData.length !== data.length) {
    console.warn(
      "無効なデータポイントが除外されました:",
      data.filter((dp) => !validData.includes(dp))
    );
  }

  // 期間に応じてデータをフィルタリング（現状: フォールバックで全件返す実装を保持）
  const now = new Date();
  let startDate;
  switch (currentPeriod) {
    case "1week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "1month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "3months":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "6months":
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    default:
      // no-op: fall through to return all data
      break;
  }

  // タイル (入力) が存在する場合、既存の挙動を維持して最新点を上書きする（最優先）
  try {
    const el = document.getElementById(`${currentMetric}Value`);
    if (el && validData && validData.length > 0) {
      const v = parseFloat(
        el.querySelector && el.querySelector(".value-display")
          ? el.querySelector(".value-display").textContent
          : el.textContent
      );
      if (!isNaN(v)) {
        validData[validData.length - 1].value = Math.round(v * 10) / 10;
      }
    }
  } catch (e) {
    console.warn("getFilteredData tile override failed:", e);
  }

  return validData;
}

// データなしメッセージの表示
function showNoDataMessage() {
  const chartWrapper = document.querySelector(".chart-wrapper");
  chartWrapper.innerHTML = `
        <div class="no-data">
            <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
            <p>${selectedPersonName || "選手"}の${
    metricNames[currentMetric]
  }データがありません</p>
            <p>動画解析を実行してデータを蓄積してください</p>
        </div>
    `;
}

// グラフポイントダブルクリック時の処理
function handleChartDoubleClick(dataPoint) {
  const { videoId, date, value, filename } = dataPoint;

  // 確認ダイアログを表示
  const message = `${selectedPersonName} - ${date}の${metricNames[currentMetric]}データ（評価: ${value}/5.0）\n\n元の動画を確認しますか？`;

  if (!confirm(message)) return;

  // selectedVideo を localStorage に保存して video-detail でファイル名が使えるようにする
  try {
    localStorage.setItem(
      "selectedVideo",
      JSON.stringify({
        videoId: videoId,
        filename: filename || null,
        mode: "watch",
      })
    );
  } catch (e) {
    console.warn("localStorage set failed:", e);
  }

  // 動画詳細ページに遷移（video-detail.js は `person` と `video` を期待する）
  const url = `video-detail.html?person=${encodeURIComponent(
    selectedPersonId
  )}&video=${encodeURIComponent(videoId)}&mode=watch`;
  window.location.href = url;
}

// グラフポイント単一クリック時の処理（詳細情報表示）
function showDataPointInfo(dataPoint) {
  const { date, value } = dataPoint;

  // ツールチップのような情報表示
  const tooltip = document.createElement("div");
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
    tooltip.style.transition = "opacity 0.3s ease";
    tooltip.style.opacity = "0";
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 300);
  }, 3000);

  // クリックで閉じる
  tooltip.addEventListener("click", () => {
    if (tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
  });

  // クリック時に、右側の評価タイルの数値を更新する
  try {
    updateTilesForDataPoint(dataPoint);
  } catch (e) {
    console.warn("updateTilesForDataPoint error:", e);
  }
}

// データポイントに対応する評価タイルを更新する
function updateTilesForDataPoint(dataPoint) {
  if (!dataPoint) return;
  const filename = dataPoint.filename || null;

  // helper to set tile DOM element
  function setTileValue(metric, v) {
    const el = document.getElementById(`${metric}Value`);
    if (!el) return;
    if (v === null || typeof v === "undefined") {
      el.textContent = "-";
    } else {
      // ensure numeric display with one decimal when possible
      if (typeof v === "number") {
        el.textContent = v.toFixed(1);
      } else {
        el.textContent = String(v);
      }
    }
  }

  // Try to load stored analysis metrics first
  if (filename) {
    try {
      const raw = localStorage.getItem(`analysisData_${filename}`);
      if (raw) {
        const analysis = JSON.parse(raw);
        if (analysis && analysis.metrics) {
          // map expected metric keys to tiles
          const m = analysis.metrics;
          setTileValue("balance", m.balance);
          setTileValue("knee", m.knee);
          setTileValue("spine", m.spine);
          setTileValue("stance", m.stance);
          setTileValue("shootForm", m.shootForm);
          setTileValue("defense", m.defense);
          setTileValue("dribble", m.dribble);
          setTileValue("stability", m.stability);
          return; // done
        }
        // if no metrics but pose exists, fallthrough to compute
        if (analysis && analysis.pose) {
          const computed = computeMetricsFromPose(analysis.pose);
          setTileValue("balance", computed.balance);
          setTileValue("knee", computed.knee);
          setTileValue("spine", computed.spine);
          setTileValue("stance", computed.stance);
          setTileValue("shootForm", computed.shootForm);
          setTileValue("defense", computed.defense);
          setTileValue("dribble", computed.dribble);
          setTileValue("stability", computed.stability);
          return;
        }
      }
    } catch (e) {
      console.warn("failed to parse analysisData for", filename, e);
    }
  }

  // 最終手段: dataPoint 自体に値が含まれている場合はそれを使う
  // dataPoint は summary 配列の要素で、metric ごとの値しか持たないことが多い。
  // ここでは currentMetric に基づき、基本姿勢 or 動作評価の主要値を表示する。
  try {
    const key = currentMetric || "overall";
    if (key === "overall") {
      // overall が与えられている場合は基本4項目を同値で埋める（近似）
      const approx = dataPoint.value || null;
      ["balance", "knee", "spine", "stance"].forEach((k) =>
        setTileValue(k, approx)
      );
    } else if (
      [
        "balance",
        "knee",
        "spine",
        "stance",
        "shootForm",
        "defense",
        "dribble",
        "stability",
      ].includes(key)
    ) {
      // クリックしたメトリクスだけ更新、その他は - にする
      [
        "balance",
        "knee",
        "spine",
        "stance",
        "shootForm",
        "defense",
        "dribble",
        "stability",
      ].forEach((k) => {
        if (k === key) setTileValue(k, dataPoint.value);
        else setTileValue(k, "-");
      });
    } else {
      // fallback: clear
      [
        "balance",
        "knee",
        "spine",
        "stance",
        "shootForm",
        "defense",
        "dribble",
        "stability",
      ].forEach((k) => setTileValue(k, null));
    }
  } catch (e) {
    console.warn("updateTilesForDataPoint fallback error:", e);
  }
}

// 現在の値を更新（サンプルデータの最新値を表示）
function updateCurrentValues() {
  const personData =
    sampleDataByPerson[selectedPersonId] || sampleDataByPerson["person1"];
  const metrics = [
    "balance",
    "knee",
    "spine",
    "stance",
    "shootForm",
    "defense",
    "dribble",
    "stability",
  ];

  metrics.forEach((metric) => {
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
document.addEventListener("DOMContentLoaded", function () {
  updateCurrentValues();
});
