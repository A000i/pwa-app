# 卒論用データ収集ガイド

## 1. NBA Stats API 利用方法

### API エンドポイント

```
https://stats.nba.com/stats/leaguedashplayerstats
```

### 取得データ例

```json
{
  "player_name": "Stephen Curry",
  "fg_pct": 0.427,
  "fg3_pct": 0.365,
  "ft_pct": 0.915,
  "games_played": 74,
  "minutes": 32.8
}
```

### Python 取得コード例

```python
import requests
import pandas as pd

url = "https://stats.nba.com/stats/leaguedashplayerstats"
headers = {
    'User-Agent': 'Mozilla/5.0'
}
params = {
    'MeasureType': 'Base',
    'PerMode': 'PerGame',
    'Season': '2023-24'
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
```

## 2. Basketball-Reference データ

### スクレイピング例

```python
import pandas as pd

# 選手統計取得
url = "https://www.basketball-reference.com/leagues/NBA_2024_per_game.html"
df = pd.read_html(url)[0]
```

### 注意点

- robots.txt 確認
- リクエスト間隔調整
- 利用規約遵守

## 3. 学術論文データ

### J-STAGE 検索方法

1. J-STAGE (https://www.jstage.jst.go.jp/) アクセス
2. キーワード: "バスケットボール シュートフォーム"
3. 論文 PDF 無料ダウンロード
4. 参考文献・データ表を抽出

### 引用データ例

```
熟練者平均肘角度: 87.3° ± 4.2°
初心者平均肘角度: 76.1° ± 8.7°
有意差: p < 0.01
```

## 4. 卒論での利用方針

### 研究倫理

- 各データソースの利用規約確認
- 適切な引用・出典明記
- 研究目的での利用宣言

### データ処理

- 生データ → 正規化 → 学習用データ変換
- 統計的検定による有意性確認
- バイアス除去・品質管理

### 評価指標

- 既存研究との比較検証
- 統計的妥当性の確保
- 実用性の定量評価
