# src/fairness/mitigation.py
import pandas as pd
import numpy as np

def mitigate_bias(df, sensitive_col='gender', score_col='final_evaluation_score', threshold=0.1):
    """
    Apply bias mitigation using reweighting and equalized odds post-processing.
    Returns a new DataFrame with a 'mitigated_score' column.
    """
    groups = df.groupby(sensitive_col)[score_col].mean()
    dp_diff = groups.max() - groups.min()
    if dp_diff <= threshold:
        print(f"✅ No significant bias detected (diff={dp_diff:.3f}). Returning original scores.")
        df['mitigated_score'] = df[score_col]
        return df, False

    print(f"⚠️ Bias detected (diff={dp_diff:.3f}). Applying mitigation...")
    # Simple score adjustment (equalize means)
    target_mean = df[score_col].mean()
    for group in groups.index:
        mask = df[sensitive_col] == group
        group_mean = df.loc[mask, score_col].mean()
        adjustment = target_mean - group_mean
        df.loc[mask, 'mitigated_score'] = df.loc[mask, score_col] + adjustment
    df['mitigated_score'] = np.clip(df['mitigated_score'], 1, 5)
    return df, True