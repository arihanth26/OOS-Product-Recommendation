import networkx as nx
import pandas as pd
import json
import os

# Example usage: python export_networkx_with_pos_drilldown.py
# This script builds a NetworkX graph, assigns positions, and exports to JSON for D3 drill-down

def build_graph(neighbors_file, gmm_details_file):
    df_neighbors = pd.read_csv(neighbors_file)
    df_details = pd.read_csv(gmm_details_file)
    df_details_clean = df_details[['P1_Bucket_ID', 'Aisle_Name', 'product_name', 'GMM_Cluster_ID']].drop_duplicates()
    df_p1_names = df_details_clean[['P1_Bucket_ID', 'product_name', 'Aisle_Name', 'GMM_Cluster_ID']].drop_duplicates(subset=['P1_Bucket_ID'])
    df_p2_p3_map = df_details_clean[['GMM_Cluster_ID', 'Aisle_Name']].drop_duplicates()

    G = nx.Graph()
    # Add P3 nodes
    for aisle in df_p2_p3_map['Aisle_Name'].unique():
        G.add_node(f'P3_{aisle}', name=aisle, type='P3_Aisle', group=3)
    # Add P2 nodes
    for cluster_id in df_p2_p3_map['GMM_Cluster_ID'].unique():
        aisle = df_p2_p3_map[df_p2_p3_map['GMM_Cluster_ID'] == cluster_id]['Aisle_Name'].values[0]
        G.add_node(f'P2_{cluster_id}', name=f'Cluster {cluster_id}', aisle_name=aisle, type='P2_Cluster', group=2)
    # Add P1 nodes
    for _, row in df_p1_names.iterrows():
        G.add_node(f'P1_{row["P1_Bucket_ID"]}', name=row['product_name'], aisle_name=row['Aisle_Name'], cluster_id=row['GMM_Cluster_ID'], type='P1_Bucket', group=1)
    # Add edges
    for _, row in df_p2_p3_map.iterrows():
        G.add_edge(f'P2_{row["GMM_Cluster_ID"]}', f'P3_{row["Aisle_Name"]}', type='P2_P3', weight=1.0)
    df_p1_p2 = df_neighbors[['Source_P1_Bucket_ID', 'GMM_Cluster_ID']].drop_duplicates()
    for _, row in df_p1_p2.iterrows():
        G.add_edge(f'P1_{row["Source_P1_Bucket_ID"]}', f'P2_{row["GMM_Cluster_ID"]}', type='P1_P2', weight=1.0)
    # Optionally add P2-P2 similarity edges as needed
    return G

def export_graph_with_positions(G, output_filename, layout='spring'):
    # Choose layout
    if layout == 'spring':
        pos = nx.spring_layout(G, seed=42)
    elif layout == 'shell':
        pos = nx.shell_layout(G)
    elif layout == 'kamada_kawai':
        pos = nx.kamada_kawai_layout(G)
    else:
        pos = nx.spring_layout(G, seed=42)
    # Assign positions
    for node in G.nodes():
        G.nodes[node]['x'] = float(pos[node][0])
        G.nodes[node]['y'] = float(pos[node][1])
    # Build drilldown mappings
    nodes = [dict(id=n, **G.nodes[n]) for n in G.nodes()]
    links = [dict(source=u, target=v, **G.edges[u, v]) for u, v in G.edges()]
    cluster_to_products = {}
    aisle_to_clusters = {}
    for node in nodes:
        if node['type'] == 'P1_Bucket':
            cluster_id = node.get('cluster_id')
            cluster_to_products.setdefault(cluster_id, []).append(node)
        if node['type'] == 'P2_Cluster':
            aisle = node.get('aisle_name')
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
        json.dump(final_data, f, indent=2)
    print(f"Exported graph with positions to {output_filename}")

if __name__ == "__main__":
    neighbors_data = os.path.abspath("./data/processed/product_substitution_neighbors_with_p0.csv")
    gmm_data = os.path.abspath("./data/processed/gmm_cluster_product_details_for_analysis.csv")
    output_json = os.path.abspath("./data/processed/drilldown_graph_with_pos.json")
    G = build_graph(neighbors_data, gmm_data)
    export_graph_with_positions(G, output_json, layout='spring')
