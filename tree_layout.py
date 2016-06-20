import sys
import json
import copy
import random
from networkx.drawing.nx_agraph import graphviz_layout

TREE_X_DISTANCE = 1.0

def add_subtree(subtree, community, out_json, color, x, depth=0):
    for i, child in enumerate(subtree["children"], 1):
        out_json["nodes"].append({
            "x": x,
            "y": child["value"],
            "z": random.random(),
            "label": child["label"],
            "id": child["label"],
            "community": "comm_" + community,
            "communityNode": False,
            "color": "rgb(100, 0, 0)",
            "size": 1,
            "hidden": False
        })

        out_json["edges"].append({
            "source": subtree["label"],
            "target": child["label"],
            "id": subtree["label"] + "-" + child["label"]
        })
        add_subtree(child, community, out_json, color, x + (TREE_X_DISTANCE/(len(subtree["children"]) + 1))*i, depth+1)

def tree_layout(in_json):
    out_json = {
        'edges': [],
        'nodes': []
    }

    x_position = TREE_X_DISTANCE/2

    for tree in in_json["trees"]:
        community_color = "rgb(" + str(random.randint(0, 127)) + "," + str(random.randint(0, 127)) + "," + str(random.randint(0, 127)) + ")"

        out_json["nodes"].append({
            "x": x_position,
            "y": tree["root"]["value"],
            "z": random.random(),
            "label": tree["root"]["label"],
            "id": tree["root"]["label"],
            "community": "comm_" + tree["label"],
            "communityNode": False,
            "color": "rgb(100, 0, 0)",
            "size": 1,
            "hidden": False
        })
        add_subtree(tree["root"], tree["label"], out_json, community_color, x_position)

        #todo: calculate position

        out_json["nodes"].append({
            "x": random.random(),
            "y": random.random(),
            "z": random.random(),
            "color": community_color,
            "size": 3,
            "communityNode": True,
            "community": "comm_" + tree["label"],
            "label": tree["label"],
            "id": "comm_" + tree["label"],
            "hidden": True
        })

        x_position += TREE_X_DISTANCE

    return out_json

if __name__ == "__main__":
    in_json = json.load(open(sys.argv[1]))
    out_json = tree_layout(in_json)
    json.dump(out_json, sys.stdout, indent=4, sort_keys=True)