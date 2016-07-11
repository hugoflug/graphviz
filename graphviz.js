
sigma.classes.graph.addMethod('getEdgeId', function(from, to) {
    var allEdges = this.allNeighborsIndex[from][to];
    if (allEdges === undefined) {
        return undefined;
    } else {
        return Object.keys(allEdges)[0];
    }
});

var defaultColor = "#ddd"

function viz(s, jsonPath, config) {
    // convert json at jsonPath to sigma json format?
    // OR add custom sigma parser

    if (config === undefined) {
        config = {};
    }

    sigma.parsers.json(
        jsonPath,
        s,
        function(s) {
            //s.startForceAtlas2({worker: true, barnesHutOptimize: false});
            //setTimeout(function() { s.stopForceAtlas2();  }, 15000);


            clickCollapse(s);
            colorEdges(s);

            s.settings({
                'labelThreshold': config["labelThreshold"] !== undefined ? config["labelThreshold"] : 6
            });
        }
    );

    function getCommunityInfo(s) {
        var communities = {}

        function addToCommunityInfo(source, target) {
            var sourceNode = s.graph.nodes(source);
            var targetNode = s.graph.nodes(target);

            if (sourceNode.community !== targetNode.community) {
                if (sourceNode.community !== undefined) {
                    if (communities[sourceNode.community] === undefined) {
                        communities[sourceNode.community] = {};
                    }

                    var targets;

                    if (communities[sourceNode.community][source] === undefined) {
                        communities[sourceNode.community][source] = [];
                    }

                    targets = communities[sourceNode.community][source];

                    targets.push({'target': target, 'community': targetNode.community})
                }
            }            
        }

        s.graph.edges().forEach(function(e) {
            addToCommunityInfo(e.source, e.target);
            addToCommunityInfo(e.target, e.source);          
        });

        return communities;
    }

    function colorEdges(s) {
        s.graph.edges().forEach(function(edge) {
            var sourceNode = s.graph.nodes(edge.source);
            var targetNode = s.graph.nodes(edge.target);

            if (sourceNode.community !== targetNode.community) {
                edge.color = defaultColor;
            }
        });

        s.refresh();
    }

    function collapse(s, communityInfo, clickedNode) {
        // handle nodes 
        s.graph.nodes().forEach(function(n) {
            // show community node and move to clicked node position
            if (n.communityNode && n.id == clickedNode.community) {
                n.x = clickedNode.x;
                n.y = clickedNode.y;

                n.hidden = false;
            }
            // hide non-community nodes
            if (!n.communityNode && n.community == clickedNode.community) {
                n.hidden = true;
            }
        });


        // handle edges
        var community = communityInfo[clickedNode.community]

        for (var fromNode in community) {
            for (var i = 0; i < community[fromNode].length; i++) {
                var toNode = community[fromNode][i];

                if (s.graph.nodes(toNode.target).hidden) {
                    var targetCommunity = s.graph.nodes(toNode.target).community;

                    if (s.graph.getEdgeId(fromNode, targetCommunity) !== undefined) {
                        s.graph.dropEdge(s.graph.getEdgeId(fromNode, targetCommunity));
                    }

                    if (s.graph.getEdgeId(clickedNode.community, targetCommunity) === undefined) {
                        s.graph.addEdge({'source': clickedNode.community, 'target': targetCommunity, 'id': clickedNode.community + "-" + targetCommunity, 'color': defaultColor});
                    }
                } else {
                    if (s.graph.getEdgeId(fromNode, toNode.target) !== undefined) {
                        s.graph.dropEdge(s.graph.getEdgeId(fromNode, toNode.target));
                    }

                    if (s.graph.getEdgeId(clickedNode.community, toNode.target) === undefined) {
                        s.graph.addEdge({'source': clickedNode.community, 'target': toNode.target, 'id': clickedNode.community + "-" + toNode.target, 'color': defaultColor});
                    }
                }
            } 
        }
    }

    function uncollapse(s, communityInfo, clickedNode) {
        clickedNode.hidden = true;

        s.graph.nodes().forEach(function(n) {
            if (!n.communityNode && n.community == clickedNode.id) {
                n.hidden = false;
            }
        });

        var community = communityInfo[clickedNode.community]

        for (var fromNode in community) {
            for (var i = 0; i < community[fromNode].length; i++) {
                var toNode = community[fromNode][i];

                if (s.graph.nodes(toNode.target).hidden) {
                    var targetCommunity = s.graph.nodes(toNode.target).community;

                    if (s.graph.getEdgeId(clickedNode.community, targetCommunity) !== undefined) {
                        s.graph.dropEdge(s.graph.getEdgeId(clickedNode.community, targetCommunity));
                    }
                    if (s.graph.getEdgeId(fromNode, targetCommunity) === undefined) {
                        s.graph.addEdge({'source': fromNode, 'target': targetCommunity, 'id': fromNode + "-" + targetCommunity, 'color': defaultColor});
                    }
                } else {
                    if (s.graph.getEdgeId(clickedNode.community, toNode.target) === undefined) {
                        s.graph.dropEdge(s.graph.getEdgeId(clickedNode.community, toNode.target));
                    }

                    if (s.graph.getEdgeId(fromNode, toNode.target) === undefined) {
                        s.graph.addEdge({'source': fromNode, 'target': toNode.target, 'id': fromNode + "-" + toNode.target, 'color': defaultColor});
                    }
                }
            } 
        }        
    }

    function clickCollapse(s) {
        var info = getCommunityInfo(s)

        s.bind('clickNode', function(e) {
            //locate intra-community nodes, color them a different color
            //build datastructure containing all intra-community nodes

            clickedNode = e.data.node;

            if (clickedNode.communityNode === false) {
                collapse(s, info, clickedNode);   
            } else if (clickedNode.communityNode === true) {
                uncollapse(s, info, clickedNode);
            }

            s.refresh()
        });
    }
} 