import pandas as pd
import json
import numpy as np
import os

def generate_d3_json_data(neighbors_file, gmm_details_file, output_filename="../data/processed/graph.json"):
    
    # 1. Load Data
    df_neighbors = pd.read_csv(neighbors_file)
    df_details = pd.read_csv(gmm_details_file)

    # Clean the cluster details to get product names and aisle names
    df_details_clean = df_details[['P1_Bucket_ID', 'Aisle_Name', 'product_name', 'GMM_Cluster_ID']].drop_duplicates()
    
    # Create the P1 -> Name mapping (using product_name as the bucket representative)
    df_p1_names = df_details_clean[['P1_Bucket_ID', 'product_name']].drop_duplicates(subset=['P1_Bucket_ID'])
    
    # Create the P2 -> P3 (Cluster -> Aisle) mapping
    df_p2_p3_map = df_details_clean[['GMM_Cluster_ID', 'Aisle_Name']].drop_duplicates()
    
    # --- 2. Define Nodes (P1, P2, P3) ---
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
        nodes.append({
            'id': f'P2_{cluster_id}',
            'name': f'Cluster {cluster_id}',
            'type': 'P2_Cluster',
            'group': 2
        })

    # P1 Nodes (Buckets)
    # P1 nodes need product names. We use the P1_Bucket_ID as the unique identifier.
    for index, row in df_p1_names.iterrows():
        nodes.append({
            'id': f'P1_{row["P1_Bucket_ID"]}',
            'name': row['product_name'],
            'type': 'P1_Bucket',
            'group': 1
        })
    
    # --- 3. Define Links (P1->P2, P2->P3, P2->P2) ---
    links = []

    # P2 -> P3 Links (Cluster to Aisle)
    for index, row in df_p2_p3_map.iterrows():
        links.append({
            'source': f'P2_{row["GMM_Cluster_ID"]}',
            'target': f'P3_{row["Aisle_Name"]}',
            'type': 'P2_P3',
            'weight': 1.0 # Uniform weight for hierarchical links
        })

    # P1 -> P2 Links (Bucket to Cluster)
    # Use the neighbor file to find which P1 belongs to which P2
    df_p1_p2 = df_neighbors[['Source_P1_Bucket_ID', 'GMM_Cluster_ID']].drop_duplicates()
    for index, row in df_p1_p2.iterrows():
        links.append({
            'source': f'P1_{row["Source_P1_Bucket_ID"]}',
            'target': f'P2_{row["GMM_Cluster_ID"]}',
            'type': 'P1_P2',
            'weight': 1.0
        })

    # P2 -> P2 Links (Inter-Cluster Similarity)
    # Find similarity by grouping all P1-to-P1 links from the neighbor file 
    # and determining which P2 clusters are most frequently neighbors.
    
    # Get all neighbor pairs and their distances/weights
    p1_p1_pairs = []
    for i in range(1, 11):
        # We need the source P2 and target P2 for the P2-P2 link
        df_temp = df_neighbors[['Source_P1_Bucket_ID', f'Closest_{i}_P1_ID', 'GMM_Cluster_ID', f'Distance_{i}']].copy()
        df_temp = df_temp.rename(columns={f'Closest_{i}_P1_ID': 'Target_P1_ID', 
                                          f'Distance_{i}': 'Distance'})
        df_temp['Source_P2'] = df_temp['GMM_Cluster_ID']
        df_temp = df_temp.drop(columns=['GMM_Cluster_ID'])
        p1_p1_pairs.append(df_temp)

    df_p1_p1_all = pd.concat(p1_p1_pairs)
    
    # Map the target P1_ID to its P2 cluster
    df_p1_p2_map = df_p1_p2.rename(columns={'P1_Bucket_ID': 'Target_P1_ID', 'GMM_Cluster_ID': 'Target_P2'})
    df_p1_p1_all = pd.merge(df_p1_p1_all, df_p1_p2_map, on='Target_P1_ID', how='left')

    # Aggregate distances/counts to get P2 -> P2 link strength
    df_p2_p2_links = df_p1_p1_all.groupby(['Source_P2', 'Target_P2']).agg(
        link_strength=('Distance', 'count')
    ).reset_index()
    
    # Filter out self-loops (P2->P2 where clusters are the same)
    df_p2_p2_links = df_p2_p2_links[df_p2_p2_links['Source_P2'] != df_p2_p2_links['Target_P2']]

    # Normalize strength for visual weight (D3 uses weights/values)
    max_strength = df_p2_p2_links['link_strength'].max()
    df_p2_p2_links['weight'] = df_p2_p2_links['link_strength'] / max_strength

    for index, row in df_p2_p2_links.iterrows():
        links.append({
            'source': f'P2_{row["Source_P2"]}',
            'target': f'P2_{row["Target_P2"]}',
            'type': 'P2_P2',
            'weight': row['weight'] # Represents substitution strength
        })

    # --- 4. Final JSON Output ---
    final_data = {
        'nodes': nodes,
        'links': links,
        # Include P1 product details for the drill-down functionality in D3
        'p1_details': df_p1_names.to_dict('records')
    }

    with open(output_filename, 'w') as f:
        json.dump(final_data, f, indent=4)
    
    return output_filename

neighbors_data = os.path.abspath("../data/processed/product_substitution_neighbors_with_p0.csv")
gmm_data = os.path.abspath("../data/processed/gmm_cluster_product_details_for_analysis.csv")
# Execute the data generation
d3_json_file = generate_d3_json_data(neighbors_data, gmm_data)

print(f"Successfully generated D3-compatible JSON file: {d3_json_file}")