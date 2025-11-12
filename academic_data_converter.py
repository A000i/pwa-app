"""
academic_data_converter.py

学術論文由来の関節角度データを機械学習用データセットに変換するスクリプト
4つの研究論文（Okubo & Hubbard, 近畿大学今泉, 安松谷ら, 東京大学院）のデータを
既存のbuild_dataset.py/train_model.pyパイプラインで使用可能な形式に変換

使用方法:
python academic_data_converter.py --input data/academic-joint-angles.json --output data/academic_training.json

出力形式: 既存システムと互換性のあるJSONL
[
  {
    "keypoints": [...],  # 関節角度から逆算したkeypoints
    "labels": {"balance": 0.9, "shootForm": 0.95, ...},
    "academic_source": "okubo_hubbard_2015",
    "metadata": {...}
  }
]
"""

import argparse
import json
import numpy as np
import math
from pathlib import Path
from typing import Dict, List, Any, Tuple


class AcademicDataConverter:
    def __init__(self):
        # 関節インデックス（MediaPipe Pose形式に準拠）
        self.joint_indices = {
            'left_shoulder': 11,
            'right_shoulder': 12,
            'left_elbow': 13,
            'right_elbow': 14,
            'left_wrist': 15,
            'right_wrist': 16,
            'left_hip': 23,
            'right_hip': 24,
            'left_knee': 25,
            'right_knee': 26,
            'left_ankle': 27,
            'right_ankle': 28
        }
        
        # 学術データから生成されたサンプルの品質スコア
        self.quality_thresholds = {
            'okubo_hubbard': {'excellent': 0.9, 'good': 0.8, 'average': 0.7},
            'kinki_imaizumi_experienced': {'excellent': 0.85, 'good': 0.75, 'average': 0.65},
            'kinki_imaizumi_beginners': {'excellent': 0.6, 'good': 0.5, 'average': 0.4},
            'anmatsuya_experts': {'excellent': 0.9, 'good': 0.8, 'average': 0.7},
            'anmatsuya_novices': {'excellent': 0.55, 'good': 0.45, 'average': 0.35},
            'tokyo_university': {'excellent': 0.85, 'good': 0.75, 'average': 0.65}
        }

    def load_academic_data(self, json_path: str) -> Dict[str, Any]:
        """学術論文データJSONを読み込み"""
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def generate_synthetic_keypoints(self, joint_angles: Dict[str, float], study_metadata: Dict) -> List[Dict]:
        """
        関節角度から合成的なkeypointsを生成
        実際のモーションキャプチャデータの代替として使用
        """
        keypoints = []
        
        # 基本の身体構造（正規化座標）
        base_pose = {
            'nose': {'x': 0.5, 'y': 0.1, 'score': 0.9},
            'left_eye': {'x': 0.48, 'y': 0.08, 'score': 0.9},
            'right_eye': {'x': 0.52, 'y': 0.08, 'score': 0.9},
            'left_ear': {'x': 0.46, 'y': 0.09, 'score': 0.9},
            'right_ear': {'x': 0.54, 'y': 0.09, 'score': 0.9},
            'left_shoulder': {'x': 0.4, 'y': 0.25, 'score': 0.95},
            'right_shoulder': {'x': 0.6, 'y': 0.25, 'score': 0.95},
            'left_elbow': {'x': 0.35, 'y': 0.4, 'score': 0.9},
            'right_elbow': {'x': 0.65, 'y': 0.4, 'score': 0.9},
            'left_wrist': {'x': 0.3, 'y': 0.55, 'score': 0.9},
            'right_wrist': {'x': 0.7, 'y': 0.55, 'score': 0.9},
            'left_hip': {'x': 0.45, 'y': 0.65, 'score': 0.9},
            'right_hip': {'x': 0.55, 'y': 0.65, 'score': 0.9},
            'left_knee': {'x': 0.43, 'y': 0.8, 'score': 0.9},
            'right_knee': {'x': 0.57, 'y': 0.8, 'score': 0.9},
            'left_ankle': {'x': 0.41, 'y': 0.95, 'score': 0.9},
            'right_ankle': {'x': 0.59, 'y': 0.95, 'score': 0.9},
            'mouth': {'x': 0.5, 'y': 0.12, 'score': 0.8}
        }

        # 関節角度に基づいてkeypointsを調整
        adjusted_pose = self.adjust_pose_by_angles(base_pose, joint_angles, study_metadata)
        
        # MediaPipe Pose形式の17点に変換
        keypoint_order = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]
        
        for joint_name in keypoint_order:
            if joint_name in adjusted_pose:
                keypoints.append(adjusted_pose[joint_name])
            else:
                # 欠損データのデフォルト値
                keypoints.append({'x': 0.5, 'y': 0.5, 'score': 0.0})

        return keypoints

    def adjust_pose_by_angles(self, base_pose: Dict, joint_angles: Dict, metadata: Dict) -> Dict:
        """関節角度に基づいてposeを調整"""
        adjusted = base_pose.copy()
        
        # 肘角度の調整
        if 'elbow' in joint_angles or 'left_elbow' in joint_angles or 'right_elbow' in joint_angles:
            # 左肘
            if 'left_elbow' in joint_angles:
                elbow_angle = joint_angles['left_elbow']
            elif 'elbow' in joint_angles:
                elbow_angle = joint_angles['elbow']
            else:
                elbow_angle = 90
                
            # 肘角度に基づいて手首位置を調整
            angle_rad = math.radians(elbow_angle)
            adjusted['left_wrist']['x'] = adjusted['left_elbow']['x'] - 0.1 * math.cos(angle_rad)
            adjusted['left_wrist']['y'] = adjusted['left_elbow']['y'] + 0.1 * math.sin(angle_rad)
            
            # 右肘も同様
            if 'right_elbow' in joint_angles:
                elbow_angle = joint_angles['right_elbow']
            elif 'elbow' in joint_angles:
                elbow_angle = joint_angles['elbow']
            else:
                elbow_angle = 90
                
            angle_rad = math.radians(elbow_angle)
            adjusted['right_wrist']['x'] = adjusted['right_elbow']['x'] + 0.1 * math.cos(angle_rad)
            adjusted['right_wrist']['y'] = adjusted['right_elbow']['y'] + 0.1 * math.sin(angle_rad)

        # 肩角度の調整
        if 'shoulder' in joint_angles or 'left_shoulder' in joint_angles:
            # シュート時の肩の位置調整
            if 'left_shoulder' in joint_angles:
                shoulder_angle = joint_angles['left_shoulder']
            else:
                shoulder_angle = joint_angles.get('shoulder', 30)
                
            angle_rad = math.radians(shoulder_angle)
            adjusted['left_elbow']['x'] = adjusted['left_shoulder']['x'] - 0.08 * math.cos(angle_rad)
            adjusted['left_elbow']['y'] = adjusted['left_shoulder']['y'] + 0.12 * math.sin(angle_rad)

        # 膝角度の調整（下肢の安定性）
        if 'knee_angle' in joint_angles or 'thigh_leg_angle' in joint_angles:
            knee_angle = joint_angles.get('knee_angle', joint_angles.get('thigh_leg_angle', 90))
            if isinstance(knee_angle, list):
                knee_angle = knee_angle[0]  # 範囲の場合は最小値を使用
                
            # 膝の屈曲度に応じて調整
            if knee_angle < 100:  # 深く曲げている（熟練者パターン）
                adjusted['left_knee']['y'] += 0.05
                adjusted['right_knee']['y'] += 0.05

        return adjusted

    def calculate_labels_from_study(self, study_name: str, joint_angles: Dict, metadata: Dict) -> Dict[str, float]:
        """研究データから学習用ラベルを算出"""
        labels = {
            'balance': 0.5,
            'knee': 0.5,
            'spine': 0.5,
            'stance': 0.5,
            'shootForm': 0.5,
            'defense': 0.5,
            'dribble': 0.5,
            'stability': 0.5
        }

        if study_name == 'okubo_hubbard_2015':
            # Okubo & Hubbard基準: 最適範囲内かどうか
            shoulder_score = self.evaluate_range(joint_angles.get('shoulder', 30), 25, 35)
            elbow_score = self.evaluate_range(joint_angles.get('elbow', 90), 90, 110)
            wrist_score = self.evaluate_range(joint_angles.get('wrist', 50), 40, 60)
            
            overall_score = (shoulder_score + elbow_score + wrist_score) / 3
            labels.update({
                'shootForm': overall_score,
                'balance': overall_score * 0.9,
                'stability': overall_score * 0.95
            })

        elif study_name == 'kinki_imaizumi_2024':
            # 近畿大学データ: 経験者vs初心者の分散に基づく
            if 'skill_level' in metadata and metadata['skill_level'] == 'experienced':
                base_score = 0.8
                # 経験者は分散が小さい → 高い一貫性
                labels.update({
                    'shootForm': base_score + np.random.normal(0, 0.1),
                    'balance': base_score + np.random.normal(0, 0.08),
                    'stability': base_score + np.random.normal(0, 0.05)
                })
            else:  # beginner
                base_score = 0.4
                # 初心者は分散が大きい → 低い一貫性
                labels.update({
                    'shootForm': base_score + np.random.normal(0, 0.2),
                    'balance': base_score + np.random.normal(0, 0.15),
                    'stability': base_score + np.random.normal(0, 0.25)
                })

        elif study_name == 'anmatsuya_2011':
            # 安松谷データ: エキスパートvs初心者の角度差
            if 'skill_level' in metadata and metadata['skill_level'] == 'expert':
                # 熟練者: 角度変動が小さい
                labels.update({
                    'shootForm': 0.85 + np.random.normal(0, 0.05),
                    'balance': 0.8 + np.random.normal(0, 0.06),
                    'stability': 0.88 + np.random.normal(0, 0.04),
                    'stance': 0.9 + np.random.normal(0, 0.03)  # 下肢安定性
                })
            else:  # novice
                labels.update({
                    'shootForm': 0.45 + np.random.normal(0, 0.15),
                    'balance': 0.4 + np.random.normal(0, 0.18),
                    'stability': 0.35 + np.random.normal(0, 0.2),
                    'stance': 0.5 + np.random.normal(0, 0.12)
                })

        elif study_name == 'tokyo_university_throwing':
            # 東京大学データ: 関節協調性
            coordination_score = 0.75  # 時系列協調の品質
            labels.update({
                'shootForm': coordination_score + np.random.normal(0, 0.08),
                'balance': coordination_score + np.random.normal(0, 0.1),
                'stability': coordination_score + np.random.normal(0, 0.06)
            })

        # ラベル値を0-1に正規化
        for key in labels:
            labels[key] = max(0.0, min(1.0, labels[key]))

        return labels

    def evaluate_range(self, value: float, min_val: float, max_val: float) -> float:
        """値が最適範囲内にあるかのスコア（0-1）"""
        if min_val <= value <= max_val:
            return 1.0
        elif value < min_val:
            deviation = min_val - value
        else:
            deviation = value - max_val
            
        # 偏差に基づいてスコア減算
        score = max(0.0, 1.0 - (deviation / (max_val - min_val)))
        return score

    def generate_training_samples(self, academic_data: Dict) -> List[Dict]:
        """学術データから学習用サンプルを生成"""
        samples = []

        for study_id, study_data in academic_data['studies'].items():
            print(f"📊 {study_id} からサンプル生成中...")
            
            if study_id == 'okubo_hubbard_2015':
                # 最適範囲の中央値とばらつきでサンプル生成
                for i in range(20):  # 20サンプル生成
                    joint_angles = {
                        'shoulder': np.random.uniform(25, 35),
                        'elbow': np.random.uniform(90, 110),
                        'wrist': np.random.uniform(40, 60)
                    }
                    
                    keypoints = self.generate_synthetic_keypoints(
                        joint_angles, {'study': study_id}
                    )
                    labels = self.calculate_labels_from_study(study_id, joint_angles, {'study': study_id})
                    
                    sample = {
                        'keypoints': keypoints,
                        'labels': labels,
                        'academic_source': study_id,
                        'metadata': {
                            'citation': study_data['citation'],
                            'methodology': study_data['methodology'],
                            'joint_angles': joint_angles,
                            'generated': True
                        }
                    }
                    samples.append(sample)

            elif study_id == 'kinki_imaizumi_2024':
                # 経験者と初心者のデータを別々に生成
                skill_levels = ['experienced', 'beginners']
                
                for skill_level in skill_levels:
                    skill_data = study_data['joint_angles']
                    sample_count = 25 if skill_level == 'experienced' else 30
                    
                    for i in range(sample_count):
                        joint_angles = {}
                        
                        # 各関節の統計から正規分布でサンプリング
                        for joint, stats in skill_data.items():
                            if skill_level in stats:
                                mean = stats[skill_level]['mean']
                                std = stats[skill_level]['std']
                                joint_angles[joint] = np.random.normal(mean, std)
                        
                        keypoints = self.generate_synthetic_keypoints(
                            joint_angles, {'study': study_id, 'skill_level': skill_level}
                        )
                        labels = self.calculate_labels_from_study(
                            study_id, joint_angles, {'skill_level': skill_level}
                        )
                        
                        sample = {
                            'keypoints': keypoints,
                            'labels': labels,
                            'academic_source': f"{study_id}_{skill_level}",
                            'metadata': {
                                'citation': study_data['citation'],
                                'skill_level': skill_level,
                                'joint_angles': joint_angles,
                                'generated': True
                            }
                        }
                        samples.append(sample)

            elif study_id == 'anmatsuya_2011':
                # エキスパートと初心者のサンプル
                for skill_level in ['experts', 'novices']:
                    sample_count = 15
                    
                    for i in range(sample_count):
                        joint_angles = {}
                        
                        # 研究で報告されている平均値の周辺でサンプリング
                        if skill_level == 'experts':
                            joint_angles = {
                                'right_elbow': 88 + np.random.normal(0, 2),  # 変動小
                                'left_shoulder': 114 + np.random.normal(0, 3),
                                'knee_angle': np.random.uniform(92, 95)
                            }
                        else:  # novices
                            joint_angles = {
                                'right_elbow': 91 + np.random.normal(0, 8),  # 変動大
                                'left_shoulder': 83 + np.random.normal(0, 12),
                                'knee_angle': np.random.uniform(108, 115)
                            }
                        
                        keypoints = self.generate_synthetic_keypoints(
                            joint_angles, {'study': study_id, 'skill_level': skill_level}
                        )
                        labels = self.calculate_labels_from_study(
                            study_id, joint_angles, {'skill_level': skill_level}
                        )
                        
                        sample = {
                            'keypoints': keypoints,
                            'labels': labels,
                            'academic_source': f"{study_id}_{skill_level}",
                            'metadata': {
                                'citation': study_data['citation'],
                                'skill_level': skill_level,
                                'joint_angles': joint_angles,
                                'generated': True
                            }
                        }
                        samples.append(sample)

        print(f"✅ 総計 {len(samples)} サンプルを生成しました")
        return samples

    def save_training_data(self, samples: List[Dict], output_path: str):
        """学習データをJSONL形式で保存"""
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            for sample in samples:
                f.write(json.dumps(sample, ensure_ascii=False) + '\n')
        
        print(f"📁 学習データを保存しました: {output_path}")
        print(f"📊 サンプル数: {len(samples)}")

    def create_academic_npz(self, jsonl_path: str, npz_path: str):
        """JSONLからnpz形式に変換（既存build_dataset.pyとの互換性）"""
        samples = []
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                samples.append(json.loads(line))
        
        X = []
        y = []
        
        label_keys = ["balance", "knee", "spine", "stance", "shootForm", "defense", "dribble", "stability"]
        
        for sample in samples:
            # keypoints を flat vector に変換
            kp_vector = []
            for kp in sample['keypoints']:
                kp_vector.extend([kp['x'], kp['y'], kp['score']])
            
            # ラベルを配列に変換
            label_vector = [sample['labels'].get(key, 0.0) for key in label_keys]
            
            X.append(kp_vector)
            y.append(label_vector)
        
        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=np.float32)
        
        np.savez_compressed(npz_path, X=X, y=y)
        print(f"💾 NPZファイルを作成しました: {npz_path}")
        print(f"📊 Shape: X={X.shape}, y={y.shape}")


def main():
    parser = argparse.ArgumentParser(description='学術論文データを学習用データセットに変換')
    parser.add_argument('--input', required=True, help='academic-joint-angles.json のパス')
    parser.add_argument('--output', default='data/academic_training.jsonl', help='出力JSONLファイル')
    parser.add_argument('--npz', default='data/academic_training.npz', help='出力NPZファイル')
    
    args = parser.parse_args()
    
    converter = AcademicDataConverter()
    
    print("🔬 学術論文データ変換開始...")
    
    # 1. 学術データ読み込み
    academic_data = converter.load_academic_data(args.input)
    
    # 2. 学習用サンプル生成
    samples = converter.generate_training_samples(academic_data)
    
    # 3. JSONL保存
    converter.save_training_data(samples, args.output)
    
    # 4. NPZ変換
    converter.create_academic_npz(args.output, args.npz)
    
    print("🎉 変換完了!")
    print(f"📚 参照論文数: {academic_data['metadata']['total_studies']}")
    print(f"📊 生成サンプル数: {len(samples)}")
    print(f"📁 出力ファイル: {args.output}, {args.npz}")


if __name__ == '__main__':
    main()
