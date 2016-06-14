sigma.classes.graph.addMethod('getEdgeId', function(from, to) {
    return this.allNeighborsIndex[from][to];
});

function viz(s, jsonPath) {

    // convert json at jsonPath to sigma json format?
    // OR add custom sigma parser

    sigma.parsers.json(
        jsonPath,
        s,
        function(s) {
            s.startForceAtlas2({worker: true, barnesHutOptimize: false});
            setTimeout(function() { s.stopForceAtlas2(); }, 1000);

            clickCollapse(s);
            colorEdges(s);
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
                        var community = communities[sourceNode.community] = {};
                    }

                    if (communities[sourceNode.community][source] === undefined) {
                        var targets = communities[sourceNode.community][source] = [];
                    }

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
                edge.color = '#0f0';
                s.refresh();
            }
        });
    }

    function collapse(s, communityInfo, clickedNode) {
        var community = communityInfo[clickedNode.community]

        for (var fromNode in community) {
            for (var toNode in community[fromNode]) {
                if (s.graph.nodes(toNode).hidden) {
                    var targetCommunity = s.graph.nodes(toNode).community;

                    s.graph.dropEdge(s.graph.getEdgeId(fromNode, targetCommunity));
                    s.graph.addEdge({'source': clickedNode.community, 'target': targetCommunity, 'id': communityNode + "-" + targetCommunity});
                } else {
                    s.graph.dropEdge(s.graph.getEdgeId(fromNode, toNode));
                    s.graph.addEdge({'source': fromNode, 'target': toNode, 'id': fromNode + "-" + toNode});
                }
            } 
        }
    }

    function uncollapse(s, communityInfo, clickedNode) {
        
    }

    function clickCollapse(s) {
        var info = getCommunityInfo(s)

        s.bind('clickNode', function(e) {
            //locate intra-community nodes, color them a different color
            //build datastructure containing all intra-community nodes

            clickedNode = e.data.node;

            if (clickedNode.communityNode === false) {
                s.graph.nodes().forEach(function(n) {
                    if (n.communityNode && n.label == clickedNode.community) {
                        console.log(n);

                        n.x = clickedNode.x;
                        n.y = clickedNode.y;

                        n.hidden = false;
                    }
                    if (!n.communityNode && n.community == clickedNode.community) {
                        n.hidden = true;
                    }
                });
            } else if (clickedNode.communityNode === true) {
                clickedNode.hidden = true;

                s.graph.nodes().forEach(function(n) {
                    if (!n.communityNode && n.community == clickedNode.label) {
                        n.hidden = false;
                    }
                });
            }

            //e.data.node.hidden = true;
            //console.log(e);

            s.refresh()
        });
    }
} 