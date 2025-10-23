# AI 学習ワークフロー

このフォルダには、ブラウザからエクスポートした骨格データを学習して TFJS モデルに変換するための最小スクリプト群があります。

ワークフロー:

1. ブラウザで解析結果（keypoints とラベル）を JSON/JSONL でエクスポート。
2. build_dataset.py で学習用 npz を作成。
3. train_model.py で Keras モデルを学習し SavedModel を作成。tfjs に変換するには tensorflowjs_converter をインストールしてください。

必要環境（推奨）:

- Python 3.8+
- numpy
- tensorflow
- tensorflowjs (for conversion)

サンプルコマンド:

```powershell
python main/ml/build_dataset.py --in exported.json --out main/ml/data/train.npz --width 640 --height 360
python main/ml/train_model.py --train main/ml/data/train.npz --out main/ml/out --epochs 30
```

変換後の TFJS モデルを `main/models/ai/pose-eval/` に設置し、ブラウザで動作確認してください。
