import sys
import json
import copy
import random

def graph_layout(in_json):
    out_json = copy.deepcopy(in_json)

    communities = set()

    for node in out_json["nodes"]:
        node["x"] = random.random()
        node["y"] = random.random()
        node["z"] = random.random()
        node["color"] = "rgb(130,51,3)"
        node["size"] = 1
        node["communityNode"] = False
        node["id"] = node["label"]

        if "community" in node:
                    communities.add(node["community"])

        node["community"] = "comm_" + node["community"]

    for community in communities:
        out_json["nodes"].append({
            "x": random.random(),
            "y": random.random(),
            "z": random.random(),
            "color": "rgb(130,51,3)",
            "size": 1,
            "communityNode": True,
            "community": "comm_" + community,
            "label": community,
            "id": "comm_" + community,
            "hidden": True
        })

    for edge in out_json["edges"]:
        edge["id"] = edge["source"] + "-" + edge["target"]

    return out_json

if __name__ == "__main__":
    in_json = json.load(open(sys.argv[1]))
    out_json = graph_layout(in_json)
    json.dump(out_json, sys.stdout, indent=4, sort_keys=True)
