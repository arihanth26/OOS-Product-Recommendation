import pandas as pd
import json
import numpy as np

# Usage: python export_drilldown_graph_json.py
# Output: ../data/processed/drilldown_graph.json

def generate_drilldown_json(neighbors_file, gmm_details_file, output_filename="../data/processed/drilldown_graph.json"):
    # 1. Load Data
    df_neighbors = pd.read_csv(neighbors_file)
    df_details = pd.read_csv(gmm_details_file)

    # Clean cluster details to get product and aisle names
    df_details_clean = df_details[['P1_Bucket_ID', 'Aisle_Name', 'product_name', 'GMM_Cluster_ID']].drop_duplicates()
    df_p1_names = df_details_clean[['P1_Bucket_ID', 'product_name', 'Aisle_Name', 'GMM_Cluster_ID']].drop_duplicates(subset=['P1_Bucket_ID'])
    df_p2_p3_map = df_details_clean[['GMM_Cluster_ID', 'Aisle_Name']].drop_duplicates()

    # --- 2. Define Nodes ---
    nodes = []
    # P3 Nodes (Aisles)
    p3_aisles = df_p2_p3_map['Aisle_Name'].unique()
    for aisle in p3_aisles:
        nodes.append({
            'id': f'P3_{aisle}',
            'name': aisle,
            'type': 'P3_Aisle',
            'group': 3
        })
    # P2 Nodes (Clusters)
    p2_clusters = df_p2_p3_map['GMM_Cluster_ID'].unique()
    for cluster_id in p2_clusters:
        aisle = df_p2_p3_map[df_p2_p3_map['GMM_Cluster_ID'] == cluster_id]['Aisle_Name'].values[0]
        nodes.append({
            'id': f'P2_{cluster_id}',
            'name': f'Cluster {cluster_id}',
            'aisle_name': aisle,
            'type': 'P2_Cluster',
            'group': 2
        })
    # P1 Nodes (Buckets/Products)
    for _, row in df_p1_names.iterrows():
        nodes.append({
            'id': f'P1_{row["P1_Bucket_ID"]}',
            'name': row['product_name'],
            'aisle_name': row['Aisle_Name'],
            'cluster_id': row['GMM_Cluster_ID'],
            'type': 'P1_Bucket',
            'group': 1
        })

    # --- 3. Define Links ---
    links = []
    # P2 -> P3 Links (Cluster to Aisle)
    for _, row in df_p2_p3_map.iterrows():
        links.append({
            'source': f'P2_{row["GMM_Cluster_ID"]}',
            'target': f'P3_{row["Aisle_Name"]}',
            'type': 'P2_P3',
            'weight': 1.0
        })
    # P1 -> P2 Links (Bucket to Cluster)
    df_p1_p2 = df_neighbors[['Source_P1_Bucket_ID', 'GMM_Cluster_ID']].drop_duplicates()
    for _, row in df_p1_p2.iterrows():
        links.append({
            'source': f'P1_{row["Source_P1_Bucket_ID"]}',
            'target': f'P2_{row["GMM_Cluster_ID"]}',
            'type': 'P1_P2',
            'weight': 1.0
        })
    # P2 -> P2 Links (Inter-Cluster Similarity)
    p1_p1_pairs = []
    for i in range(1, 11):
        df_temp = df_neighbors[['Source_P1_Bucket_ID', f'Closest_{i}_P1_ID', 'GMM_Cluster_ID', f'Distance_{i}']].copy()
        df_temp = df_temp.rename(columns={f'Closest_{i}_P1_ID': 'Target_P1_ID', f'Distance_{i}': 'Distance'})
        df_temp['Source_P2'] = df_temp['GMM_Cluster_ID']
        df_temp = df_temp.drop(columns=['GMM_Cluster_ID'])
        p1_p1_pairs.append(df_temp)
    df_p1_p1_all = pd.concat(p1_p1_pairs)
    df_p1_p2_map = df_p1_p2.rename(columns={'Source_P1_Bucket_ID': 'Target_P1_ID', 'GMM_Cluster_ID': 'Target_P2'})
    df_p1_p1_all = pd.merge(df_p1_p1_all, df_p1_p2_map, on='Target_P1_ID', how='left')
    df_p2_p2_links = df_p1_p1_all.groupby(['Source_P2', 'Target_P2']).agg(link_strength=('Distance', 'count')).reset_index()
    df_p2_p2_links = df_p2_p2_links[df_p2_p2_links['Source_P2'] != df_p2_p2_links['Target_P2']]
    max_strength = df_p2_p2_links['link_strength'].max()
    df_p2_p2_links['weight'] = df_p2_p2_links['link_strength'] / max_strength
    for _, row in df_p2_p2_links.iterrows():
        links.append({
            'source': f'P2_{row["Source_P2"]}',
            'target': f'P2_{row["Target_P2"]}',
            'type': 'P2_P2',
            'weight': row['weight']
        })

    # --- 4. Drill-down mapping ---
    # For each P2 cluster, list its P1 products
    cluster_to_products = {}
    for node in nodes:
        if node['type'] == 'P1_Bucket':
            cluster_id = node['cluster_id']
            cluster_to_products.setdefault(cluster_id, []).append(node)
    # For each P3 aisle, list its clusters
    aisle_to_clusters = {}
    for node in nodes:
        if node['type'] == 'P2_Cluster':
            aisle = node['aisle_name']
            aisle_to_clusters.setdefault(aisle, []).append(node)

    final_data = {
        'nodes': nodes,
        'links': links,
        'drilldown': {
            'cluster_to_products': cluster_to_products,
            'aisle_to_clusters': aisle_to_clusters
        }
    }
    with open(output_filename, 'w') as f:
        json.dump(final_data, f, indent=4)
    return output_filename

if __name__ == "__main__":
    neighbors_data = "../data/processed/product_substitution_neighbors_with_p0.csv"
    gmm_data = "../data/processed/gmm_cluster_product_details_for_analysis.csv"
    d3_json_file = generate_drilldown_json(neighbors_data, gmm_data)
    print(f"Successfully generated drilldown D3-compatible JSON file: {d3_json_file}")
