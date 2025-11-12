"""
build_dataset.py

ブラウザからエクスポートした JSONL/JSON ファイルを読み、学習用の .npz (X, y) を作成します。
期待入力フォーマット（JSONL も可）:
[
  {
    "keypoints": [{"x":..., "y":..., "score":...}, ... 17 items],
    "labels": {"balance":0.0..1.0, "knee":..., "spine":..., "stance":..., "shootForm":..., "defense":..., "dribble":..., "stability":...}
  },
  ...
]

出力: train.npz (X: N x 51, y: N x 8)

使い方:
 python build_dataset.py --in exported.json --out data/train.npz

"""
import argparse
import json
import numpy as np
from pathlib import Path

EXPECTED_KP = 17
LABEL_KEYS = ["balance","knee","spine","stance","shootForm","defense","dribble","stability"]


def kp_to_vector(kps):
    # Flatten x,y,score for 17 keypoints -> 51 dims
    v = []
    for i in range(EXPECTED_KP):
        if i < len(kps):
            kp = kps[i]
            v.extend([float(kp.get('x',0)), float(kp.get('y',0)), float(kp.get('score',0))])
        else:
            v.extend([0.0,0.0,0.0])
    return v


def normalize_xy(vec, width=None, height=None):
    # Optionally normalize by provided width/height if present in data
    # vec is flat [x,y,score,...]
    if width and height:
        out = []
        for i in range(0, len(vec), 3):
            x = vec[i]/width
            y = vec[i+1]/height
            s = vec[i+2]
            out.extend([x,y,s])
        return out
    return vec


def load_json_items(path):
    txt = Path(path).read_text(encoding='utf-8')
    txt = txt.strip()
    if txt.startswith('['):
        return json.loads(txt)
    else:
        # JSONL: one JSON per line
        items = []
        for line in txt.splitlines():
            line = line.strip()
            if not line: continue
            items.append(json.loads(line))
        return items


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--in', dest='input', required=True, help='input JSON or JSONL file')
    p.add_argument('--out', dest='out', required=True, help='output npz file')
    p.add_argument('--width', type=int, help='video width if you want to normalize x')
    p.add_argument('--height', type=int, help='video height if you want to normalize y')
    args = p.parse_args()

    items = load_json_items(args.input)
    X = []
    Y = []
    skipped = 0
    for it in items:
        kps = it.get('keypoints')
        labels = it.get('labels')
        if not kps or not labels:
            skipped += 1
            continue
        vec = kp_to_vector(kps)
        if args.width and args.height:
            vec = normalize_xy(vec, args.width, args.height)
        # build y in LABEL_KEYS order, expect 0..1 floats (if 1..5 scale, user should convert)
        y = [float(labels.get(k,0)) for k in LABEL_KEYS]
        X.append(vec)
        Y.append(y)

    X = np.array(X, dtype=np.float32)
    Y = np.array(Y, dtype=np.float32)
    outpath = Path(args.out)
    outpath.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(outpath, X=X, y=Y)
    print(f'Wrote {outpath} with {len(X)} samples, skipped {skipped}')


if __name__ == '__main__':
    main()
