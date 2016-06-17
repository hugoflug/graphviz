import sys
import json
import copy
import random
from networkx.drawing.nx_agraph import graphviz_layout

TREE_Y_DISTANCE = 50

def add_subtree(subtree, community, out_json, color, y, depth=0):
    for child in subtree["children"]:
        out_json["nodes"].append({
            "label": child["label"],
            "id": child["label"],
            "value": child["value"],
            "community": "comm_" + community
        })

        out_json["edges"].append({
            "source": subtree["label"],
            "target": child["label"],
            "id": subtree["label"] + "-" + child["label"]
        })
        add_subtree(child, community, out_json, color, y, depth+1)

def tree_layout(in_json):
    out_json = {
        'edges': [],
        'nodes': []
    }

    y_position = 0

    for tree in in_json["trees"]:
        community_color = "rgb(" + str(random.randint(0, 127)) + "," + str(random.randint(0, 127)) + "," + str(random.randint(0, 127)) + ")"

        add_subtree(tree, tree["label"], out_json, community_color, y)

        #todo: calculate position

        out_json["nodes"].append({
            "color": community_color,
            "size": 3,
            "communityNode": True,
            "community": "comm_" + tree["community"],
            "label": tree["community"],
            "id": "comm_" + tree["community"],
            "hidden": True
        })

        y_position += TREE_Y_DISTANCE

    return out_json

if __name__ == "__main__":
    in_json = json.load(open(sys.argv[1]))
    out_json = tree_layout(in_json)
    json.dump(out_json, sys.stdout, indent=4, sort_keys=True)