import sys
import json
import copy
import random
import networkx as nx
from networkx.drawing.nx_agraph import graphviz_layout
import force_atlas

def graph_layout(in_json):
    out_json = copy.deepcopy(in_json)

    communities = set()
    community_colors = {}

    positions = calculate_positions(in_json)

    for node in out_json["nodes"]:
        node["x"] = float(positions[node["label"]][0])
        node["y"] = float(positions[node["label"]][1])
        node["z"] = random.random()
        node["size"] = 1
        node["communityNode"] = False
        node["id"] = node["label"]
        node["hidden"] = True

        if "community" in node and node["community"] not in communities:
            community_colors[node["community"]] = "rgb(" + str(random.randint(0, 127)) + "," + str(random.randint(0, 127)) + "," + str(random.randint(0, 127)) + ")"
            communities.add(node["community"])

        node["color"] = community_colors[node["community"]]
        node["community"] = "comm_" + node["community"]

    for community in communities:
        out_json["nodes"].append({
            "x": random.random(),
            "y": random.random(),
            "z": random.random(),
            "color": community_colors[community],
            "size": 2,
            "communityNode": True,
            "community": "comm_" + community,
            "label": community,
            "id": "comm_" + community,
            "hidden": False
        })

    for edge in out_json["edges"]:
        edge["id"] = edge["source"] + "-" + edge["target"]

    return out_json

def calculate_positions(in_json):
    g = nx.Graph()

    for node in in_json["nodes"]:
        g.add_node(node["label"])

    for edge in in_json["edges"]:
        g.add_edge(edge["source"], edge["target"])

    return force_atlas.forceatlas2_layout(g, iterations=1000, nohubs=False) 

if __name__ == "__main__":
    in_json = json.load(open(sys.argv[1]))
    out_json = graph_layout(in_json)
    json.dump(out_json, sys.stdout, indent=4, sort_keys=True)
