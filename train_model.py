"""
train_model.py

シンプルな Keras モデルを学習して TF SavedModel と TFJS 変換を行うスクリプト。
出力:
 - saved-model/ (SavedModel)
 - tfjs_model/ (tfjs converted model.json + weights)

使い方例:
 python train_model.py --train data/train.npz --out saved-model --epochs 50

"""
import argparse
import numpy as np
from pathlib import Path
import tensorflow as tf
from tensorflow import keras

LABELS = ["balance","knee","spine","stance","shootForm","defense","dribble","stability"]

def build_model(input_dim, output_dim):
    model = keras.Sequential([
        keras.layers.Input(shape=(input_dim,)),
        keras.layers.Dense(128, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dense(output_dim, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--train', required=True, help='train npz produced by build_dataset.py')
    p.add_argument('--out', required=True, help='output folder for saved-model')
    p.add_argument('--epochs', type=int, default=50)
    args = p.parse_args()

    data = np.load(args.train)
    X = data['X']
    y = data['y']
    print('Loaded', X.shape, y.shape)

    model = build_model(X.shape[1], y.shape[1])
    model.summary()

    model.fit(X, y, epochs=args.epochs, batch_size=32, validation_split=0.1)

    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)
    saved_path = str(outdir / 'saved-model')
    model.save(saved_path)
    print('Saved model to', saved_path)

    # tfjs conversion if tfjs-converter installed
    try:
        import subprocess
        tfjs_out = str(outdir / 'tfjs_model')
        cmd = ["tensorflowjs_converter", "--input_format=tf_saved_model", "--output_format=tfjs_graph_model", saved_path, tfjs_out]
        print('Running tfjs converter:', ' '.join(cmd))
        subprocess.check_call(cmd)
        print('TFJS model written to', tfjs_out)
    except Exception as e:
        print('tfjs conversion skipped or failed:', e)

if __name__ == '__main__':
    main()
