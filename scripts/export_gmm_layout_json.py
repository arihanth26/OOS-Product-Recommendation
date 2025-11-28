import json
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

"""
Usage:
    python export_gmm_layout_json.py 

Generates: ../data/processed/drilldown_graph_gmm.json

Adds GMM-informed 2D layout info (centroid_x, centroid_y scaled 0..1) and ellipse parameters
(eig1, eig2, angle_deg) for each cluster node based on PCA bucket features.

Input files (relative to scripts/ directory):
  - ../data/processed/drilldown_graph.json  (existing base graph)
  - ../data/processed/gmm_cluster_product_details_for_analysis.csv (mapping P1_Bucket_ID -> GMM_Cluster_ID, Aisle_Name)
  - ../notebooks/artifacts/features/bucket_index.parquet (row index -> P1_Bucket_ID)
  - ../notebooks/artifacts/features/X_bucket_pca.npy (PCA features for buckets, rows align with bucket_index.parquet)
  - Optional: ../notebooks/artifacts/gmm/model.joblib (sklearn GaussianMixture). If present, we will use its means/covariances; otherwise we compute empirical mean/cov per cluster from bucket PCA points.
"""

BASE_GRAPH = Path("../data/processed/drilldown_graph.json")
DETAILS_CSV = Path("../data/processed/gmm_cluster_product_details_for_analysis.csv")
BUCKET_INDEX = Path("../notebooks/artifacts/features/bucket_index.parquet")
BUCKET_PCA = Path("../notebooks/artifacts/features/X_bucket_pca.npy")
GMM_MODEL = Path("../notebooks/artifacts/gmm/model.joblib")
OUTPUT = Path("../data/processed/drilldown_graph_gmm.json")

def load_base_graph():
    with open(BASE_GRAPH, 'r') as f:
        return json.load(f)

def normalize_coords(coords: np.ndarray):
    # Min-max normalize to 0..1 for both axes, avoid zero division
    mins = coords.min(axis=0)
    maxs = coords.max(axis=0)
    span = np.where(maxs - mins == 0, 1.0, maxs - mins)
    return (coords - mins) / span, mins, maxs

def ellipse_from_cov(cov: np.ndarray):
    # Eigen decomposition for 2x2 covariance
    vals, vecs = np.linalg.eigh(cov)
    # Sort descending
    order = np.argsort(vals)[::-1]
    vals = vals[order]
    vecs = vecs[:, order]
    # Eigenvalues correspond to variance; radii ~ sqrt(var) * scale_factor
    # We'll store sqrt(var); scaling applied client-side.
    eig1 = float(np.sqrt(max(vals[0], 1e-9)))
    eig2 = float(np.sqrt(max(vals[1], 1e-9)))
    # Angle from first eigenvector
    angle = float(np.degrees(np.arctan2(vecs[1,0], vecs[0,0])))
    return eig1, eig2, angle

def build_gmm_layout():
    base = load_base_graph()
    details = pd.read_csv(DETAILS_CSV)
    bucket_index = pd.read_parquet(BUCKET_INDEX)
    X_pca = np.load(BUCKET_PCA)

    # Ensure we have at least 2 components
    if X_pca.shape[1] < 2:
        raise ValueError("X_bucket_pca.npy must have at least 2 PCA components for 2D layout.")

    # Determine bucket id column flexibly.
    candidate_cols = [c for c in ['P1_Bucket_ID','bucket_id','bucket','bucketID','id'] if c in bucket_index.columns]
    if candidate_cols:
        chosen_col = candidate_cols[0]
        row_to_bucket = bucket_index[chosen_col].values
    else:
        # Fallback: if index looks non-trivial, use it; otherwise raise with diagnostic.
        if not isinstance(bucket_index.index, pd.RangeIndex):
            row_to_bucket = bucket_index.index.values
            chosen_col = '<index>'
        else:
            raise KeyError(f"bucket_index.parquet must contain one of ['P1_Bucket_ID','bucket_id','bucket','bucketID','id'] or have a meaningful index. Found columns: {list(bucket_index.columns)}")

    if len(row_to_bucket) != X_pca.shape[0]:
        raise ValueError(f"Row count mismatch: bucket_index has {len(row_to_bucket)} rows, X_bucket_pca.npy has {X_pca.shape[0]} rows. Cannot align.")

    print(f"Using bucket identifier column: {chosen_col}")
    pca_df = pd.DataFrame(X_pca[:, :2], columns=['pc1', 'pc2'])
    pca_df['P1_Bucket_ID'] = row_to_bucket

    # Merge to get cluster for each bucket
    # Align details with chosen bucket id column. The details CSV is expected to have 'P1_Bucket_ID'.
    details_bucket_col = 'P1_Bucket_ID'
    if details_bucket_col not in details.columns:
        raise KeyError(f"Details file missing '{details_bucket_col}' column. Columns: {list(details.columns)}")
    cluster_map = details[[details_bucket_col,'GMM_Cluster_ID']].drop_duplicates()
    # Rename pca_df join key to match details if necessary
    if chosen_col != details_bucket_col:
        # create a normalized temp copy for join (cast both to string for safety)
        pca_df['__join_bucket'] = pca_df['P1_Bucket_ID'] if 'P1_Bucket_ID' in pca_df.columns else pca_df['P1_Bucket_ID'] if chosen_col=='P1_Bucket_ID' else pca_df['P1_Bucket_ID']
    # For simplicity we kept column name 'P1_Bucket_ID' in pca_df creation; if chosen_col differed we still have row_to_bucket used.
    # Guarantee a column named 'P1_Bucket_ID'
    if 'P1_Bucket_ID' not in pca_df.columns:
        pca_df['P1_Bucket_ID'] = row_to_bucket
    pca_df = pca_df.merge(cluster_map, on='P1_Bucket_ID', how='inner')

    # Compute centroids & covariance per cluster empirically unless GMM model available
    has_model = GMM_MODEL.exists()
    if has_model:
        try:
            gmm = joblib.load(GMM_MODEL)
            # Assume gmm.means_ in same PCA space; if not, fallback
            means = gmm.means_[:, :2] if gmm.means_.shape[1] >= 2 else gmm.means_
            covs = gmm.covariances_
            use_model = True
        except Exception:
            use_model = False
    else:
        use_model = False

    cluster_stats = {}
    if use_model and (covs.ndim == 3):
        for cid in range(means.shape[0]):
            eig1, eig2, angle = ellipse_from_cov(covs[cid][:2,:2])
            cluster_stats[cid] = {
                'centroid_raw': means[cid].tolist(),
                'eig1': eig1,
                'eig2': eig2,
                'angle_deg': angle
            }
    else:
        # Empirical
        for cid, group in pca_df.groupby('GMM_Cluster_ID'):
            arr = group[['pc1','pc2']].to_numpy()
            centroid = arr.mean(axis=0)
            if arr.shape[0] > 1:
                cov = np.cov(arr.T)
            else:
                cov = np.diag(np.array([1e-3, 1e-3]))
            eig1, eig2, angle = ellipse_from_cov(cov)
            cluster_stats[int(cid)] = {
                'centroid_raw': centroid.tolist(),
                'eig1': eig1,
                'eig2': eig2,
                'angle_deg': angle
            }

    # Normalize centroid coordinates
    all_centroids = np.array([v['centroid_raw'] for v in cluster_stats.values()])
    norm_centroids, mins, maxs = normalize_coords(all_centroids)
    # Assign normalized back
    for i, (cid, stats) in enumerate(cluster_stats.items()):
        stats['centroid_x'] = float(norm_centroids[i,0])
        stats['centroid_y'] = float(norm_centroids[i,1])
        stats['raw_min'] = mins.tolist()
        stats['raw_max'] = maxs.tolist()

    # Augment cluster nodes in base graph
    for node in base['nodes']:
        if node.get('type') == 'P2_Cluster':
            # Cluster name "Cluster N" -> id number
            cid = node.get('cluster_id')
            if cid is None:
                # derive from name
                parts = str(node.get('name','')).split()
                if len(parts) >= 2 and parts[0].lower() == 'cluster':
                    try:
                        cid = int(parts[1])
                    except ValueError:
                        cid = None
            if cid is not None and cid in cluster_stats:
                stats = cluster_stats[cid]
                node.update({
                    'centroid_x': stats['centroid_x'],
                    'centroid_y': stats['centroid_y'],
                    'eig1': stats['eig1'],
                    'eig2': stats['eig2'],
                    'angle_deg': stats['angle_deg']
                })

    # Store metadata
    base['layout_metadata'] = {
        'normalized_min': cluster_stats[next(iter(cluster_stats))]['raw_min'],
        'normalized_max': cluster_stats[next(iter(cluster_stats))]['raw_max'],
        'description': 'GMM / PCA derived centroids and covariance ellipse parameters for clusters',
        'source': 'export_gmm_layout_json.py'
    }

    with open(OUTPUT, 'w') as f:
        json.dump(base, f, indent=2)
    print(f"Wrote GMM layout JSON: {OUTPUT}")

if __name__ == '__main__':
    missing = [p for p in [BASE_GRAPH, DETAILS_CSV, BUCKET_INDEX, BUCKET_PCA] if not p.exists()]
    if missing:
        raise FileNotFoundError(f"Missing required input files: {missing}")
    build_gmm_layout()
