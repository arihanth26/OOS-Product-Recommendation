import networkx as nx
import json
import sys
import csv

# Usage: python export_networkx_to_json_with_attrs.py <edge_csv> <output_json>
# Example: python export_networkx_to_json_with_attrs.py notebooks/artifacts/graph/edges_p2_p3.csv data/processed/graph.json

def main():
    if len(sys.argv) < 3:
        print("Usage: python export_networkx_to_json_with_attrs.py <edge_csv> <output_json>")
        sys.exit(1)
    edge_csv = sys.argv[1]
    output_json = sys.argv[2]

    # Read only first two columns (source, target) from CSV
    edges = []
    nodes = set()
    with open(edge_csv, 'r', newline='') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 2:
                edges.append((row[0], row[1]))
                nodes.add(row[0])
                nodes.add(row[1])

    G = nx.Graph()
    G.add_edges_from(edges)

    # Example: assign color, label, product_name, aisle_name attributes
    # You can customize this logic as needed
    color_map = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]

    # --- USER: Provide your product and aisle name mappings here ---
    # Example: node_to_product = {'node_id': 'Product Name', ...}
    #          node_to_aisle = {'node_id': 'Aisle Name', ...}
    node_to_product = {}  # Fill with your mapping
    node_to_aisle = {}    # Fill with your mapping

    for i, node in enumerate(G.nodes()):
        G.nodes[node]['label'] = str(node)  # Default label
        G.nodes[node]['color'] = color_map[i % len(color_map)]  # Cycle through colors
        # Add product and aisle names if available
        if node in node_to_product:
            G.nodes[node]['product_name'] = node_to_product[node]
        else:
            G.nodes[node]['product_name'] = str(node)
        if node in node_to_aisle:
            G.nodes[node]['aisle_name'] = node_to_aisle[node]
        else:
            G.nodes[node]['aisle_name'] = ""

    data = nx.node_link_data(G)
    with open(output_json, 'w') as f:
        json.dump(data, f)
    print(f"Exported graph with attributes to {output_json}")

if __name__ == "__main__":
    main()
