import sys
import json
import copy
import random
from networkx.drawing.nx_agraph import graphviz_layout

TREE_X_DISTANCE = 0.5

def add_subtree(subtree, community, out_json, color, x, tree_x_distance, depth=0):
    if len(subtree["children"]) > 0:
        new_tree_x_distance = tree_x_distance/len(subtree["children"])

    for i, child in enumerate(subtree["children"], 0):
        child_x = x + new_tree_x_distance*i - new_tree_x_distance/2

        out_json["nodes"].append({
            "x": child_x,
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

        add_subtree(child, community, out_json, color, child_x, new_tree_x_distance, depth+1)

def tree_layout(in_json):
    out_json = {
        'edges': [],
        'nodes': []
    }

    x_position = 1.0

    for tree in in_json["trees"]:
        x_position += TREE_X_DISTANCE

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
        new_tree_x_distance = TREE_X_DISTANCE/len(tree["root"]["children"])
        add_subtree(tree["root"], tree["label"], out_json, community_color, x_position, new_tree_x_distance)

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