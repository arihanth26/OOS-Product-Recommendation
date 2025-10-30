# gmm_elbow_internal_eval.py
# -----------------------------------------------------------
# What this script does
#  - Loads data (CSV or synthetic)
#  - Standardizes features (and optionally reduces dimensionality)
#  - Sweeps k for GMM and records:
#       * BIC / AIC  (lower is better)  --> "elbow" proxy for GMM
#       * Silhouette (higher better)
#       * Davies–Bouldin (lower better)
#       * Calinski–Harabasz (higher better)
#  - Plots the curves and prints a heuristic suggested k
#
# How to run
#   python gmm_elbow_internal_eval.py --csv data.csv --use_all_numeric
#   # or specify columns:
#   python gmm_elbow_internal_eval.py --csv data.csv --features col1 col2 col3
#
# Notes
#  - For high-dimensional sparse text (e.g., TF-IDF), first export a dense
#    reduction (e.g., TruncatedSVD to 50–100 dims) before running this,
#    or adapt the "dim_reduce" block below.
# -----------------------------------------------------------

import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.preprocessing import StandardScaler
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.decomposition import PCA

def load_data(args):
    if args.csv:
        df = pd.read_csv(args.csv)
        if args.use_all_numeric:
            X = df.select_dtypes(include=[np.number]).to_numpy()
            cols = list(df.select_dtypes(include=[np.number]).columns)
        else:
            if not args.features:
                raise ValueError("Provide --features or use --use_all_numeric.")
            cols = args.features
            X = df[cols].to_numpy()
        return X, cols
    else:
        # Synthetic fallback (3 true clusters)
        from sklearn.datasets import make_blobs
        X, _ = make_blobs(n_samples=1200, centers=3, cluster_std=1.2, random_state=42)
        return X, [f"f{i}" for i in range(X.shape[1])]

def dim_reduce_if_needed(X, target_dim=50):
    """
    Optional dimensionality reduction to help GMM stability when dims are high.
    Uses PCA here (works fine on dense data). If you're starting from sparse
    TF-IDF, replace with TruncatedSVD.
    """
    if X.shape[1] <= target_dim:
        return X, None
    pca = PCA(n_components=target_dim, random_state=42)
    Xr = pca.fit_transform(X)
    return Xr, pca

def gmm_k_sweep(X, k_min=2, k_max=20, covariance_type="full", n_init=3, random_state=42):
    """
    Fit GMM for k in [k_min, k_max] and collect internal metrics.
    Returns a list of dicts with metrics and models.
    """
    out = []
    for k in range(k_min, k_max + 1):
        gm = GaussianMixture(
            n_components=k,
            covariance_type=covariance_type,
            random_state=random_state,
            n_init=n_init,
            reg_covar=1e-6
        ).fit(X)
        labels = gm.predict(X)

        bic = gm.bic(X)   # lower is better
        aic = gm.aic(X)   # lower is better

        # For silhouette, labels must have at least 2 unique values; otherwise skip
        uniq = np.unique(labels)
        if len(uniq) > 1 and len(uniq) < len(X):
            sil = silhouette_score(X, labels)
            db  = davies_bouldin_score(X, labels)
            ch  = calinski_harabasz_score(X, labels)
        else:
            sil, db, ch = np.nan, np.nan, np.nan

        out.append({
            "k": k, "model": gm, "labels": labels,
            "bic": bic, "aic": aic, "silhouette": sil,
            "davies_bouldin": db, "calinski_harabasz": ch
        })
    return out

def suggest_k(results):
    """
    Simple combined heuristic:
      - Normalize metrics (z-score)
      - Flip signs so 'higher is better' for all:
          +BIC -> use -BIC
          +AIC -> use -AIC
          +DB  -> use -DB
          +Sil, +CH kept as is
      - Sum available z-scores to get a meta score.
    """
    from scipy.stats import zscore

    df = pd.DataFrame([{
        "k": r["k"],
        "bic": r["bic"],
        "aic": r["aic"],
        "sil": r["silhouette"],
        "db":  r["davies_bouldin"],
        "ch":  r["calinski_harabasz"]
    } for r in results])

    # Some runs can yield NaNs for silhouette/DB/CH (degenerate labels).
    # We fill with column medians to keep the heuristic stable.
    df_f = df.copy()
    for col in ["sil", "db", "ch"]:
        if df_f[col].isna().any():
            df_f[col].fillna(df_f[col].median(), inplace=True)

    # z-score and flip where lower is better
    z = pd.DataFrame({
        "k": df_f["k"],
        "z_neg_bic":  zscore(-df_f["bic"]),  # flip
        "z_neg_aic":  zscore(-df_f["aic"]),  # flip
        "z_sil":      zscore(df_f["sil"]),
        "z_neg_db":   zscore(-df_f["db"]),   # flip
        "z_ch":       zscore(df_f["ch"])
    })

    z["meta"] = z[["z_neg_bic", "z_neg_aic", "z_sil", "z_neg_db", "z_ch"]].sum(axis=1)
    k_best = int(z.loc[z["meta"].idxmax(), "k"])

    return k_best, df.set_index("k"), z.set_index("k")

def plot_metrics(df_by_k, k_best=None):
    ks = df_by_k.index.values

    plt.figure(figsize=(12, 8))

    # BIC / AIC (lower is better) --> elbow-like curve for GMM
    plt.subplot(2, 2, 1)
    plt.plot(ks, df_by_k["bic"], marker='o', label="BIC")
    plt.plot(ks, df_by_k["aic"], marker='o', label="AIC", alpha=0.7)
    if k_best: plt.axvline(k_best, linestyle='--', color='gray')
    plt.title("GMM: BIC/AIC vs k (lower is better)")
    plt.xlabel("k"); plt.ylabel("Score"); plt.legend()

    # Silhouette (higher better)
    plt.subplot(2, 2, 2)
    plt.plot(ks, df_by_k["silhouette"], marker='o')
    if k_best: plt.axvline(k_best, linestyle='--', color='gray')
    plt.title("Silhouette vs k"); plt.xlabel("k"); plt.ylabel("Silhouette")

    # Davies–Bouldin (lower better)
    plt.subplot(2, 2, 3)
    plt.plot(ks, df_by_k["davies_bouldin"], marker='o')
    if k_best: plt.axvline(k_best, linestyle='--', color='gray')
    plt.title("Davies–Bouldin vs k"); plt.xlabel("k"); plt.ylabel("DB (lower better)")

    # Calinski–Harabasz (higher better)
    plt.subplot(2, 2, 4)
    plt.plot(ks, df_by_k["calinski_harabasz"], marker='o')
    if k_best: plt.axvline(k_best, linestyle='--', color='gray')
    plt.title("Calinski–Harabasz vs k"); plt.xlabel("k"); plt.ylabel("CH (higher better)")

    plt.tight_layout()
    plt.show()

def pca_scatter(X, labels, title):
    pca = PCA(n_components=2, random_state=42)
    X2 = pca.fit_transform(X)
    plt.figure(figsize=(7,6))
    for c in np.unique(labels):
        idx = labels == c
        plt.scatter(X2[idx,0], X2[idx,1], s=14, label=f"Cluster {c}")
    plt.title(title); plt.xlabel("PC1"); plt.ylabel("PC2"); plt.legend(frameon=False)
    plt.tight_layout(); plt.show()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", type=str, default=None, help="Path to CSV (optional; else synthetic)")
    ap.add_argument("--features", nargs="+", help="Columns to use (if not using all numeric)")
    ap.add_argument("--use_all_numeric", action="store_true", help="Use all numeric columns")
    ap.add_argument("--k_min", type=int, default=2)
    ap.add_argument("--k_max", type=int, default=100)
    ap.add_argument("--covariance_type", type=str, default="full", choices=["full","tied","diag","spherical"])
    ap.add_argument("--random_state", type=int, default=42)
    ap.add_argument("--n_init", type=int, default=3)
    ap.add_argument("--reduce_dim", action="store_true", help="Apply PCA to reduce dims if > 50")
    args = ap.parse_args()

    # 1) Load
    X_raw, cols = load_data(args)

    # 2) Scale (GMM assumes roughly spherical clusters in feature space; scaling helps)
    Xs = StandardScaler().fit_transform(X_raw)

    # 3) Optional dimensionality reduction (stability + speed on high-dim)
    if args.reduce_dim:
        X, reducer = dim_reduce_if_needed(Xs, target_dim=50)
    else:
        X, reducer = Xs, None

    # 4) Sweep k and collect metrics
    results = gmm_k_sweep(
        X,
        k_min=args.k_min,
        k_max=args.k_max,
        covariance_type=args.covariance_type,
        n_init=args.n_init,
        random_state=args.random_state
    )

    # 5) Summaries + suggested k
    df_by_k = pd.DataFrame({
        "k": [r["k"] for r in results],
        "bic": [r["bic"] for r in results],
        "aic": [r["aic"] for r in results],
        "silhouette": [r["silhouette"] for r in results],
        "davies_bouldin": [r["davies_bouldin"] for r in results],
        "calinski_harabasz": [r["calinski_harabasz"] for r in results],
    }).set_index("k")

    k_best, raw_table, z_table = suggest_k(results)
    print("\n=== Metrics by k ===")
    print(raw_table.round(4).to_string())
    print("\n=== Z-scored (combined) meta-scores ===")
    print(z_table.round(3).to_string())
    print(f"\nHeuristic suggested k: {k_best}")

    # 6) Plots
    plot_metrics(df_by_k, k_best=k_best)

    # 7) Fit final model at suggested k and quick PCA scatter
    best_model = next(r["model"] for r in results if r["k"] == k_best)
    labels = best_model.predict(X)
    print(f"\nFinal GMM: k={k_best}, covariance_type={args.covariance_type}")
    unique, counts = np.unique(labels, return_counts=True)
    print("Cluster sizes:", dict(zip(unique, counts)))
    pca_scatter(X, labels, title=f"GMM (k={k_best}) — PCA 2D view")

if __name__ == "__main__":
    main()