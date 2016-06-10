function viz(s, jsonPath) {

	// convert json at jsonPath to sigma json format?
	// OR add custom sigma parser

    sigma.parsers.json(
        jsonPath,
        s,
        function(s) {
            s.startForceAtlas2({worker: true, barnesHutOptimize: false});
            setTimeout(function() { s.stopForceAtlas2(); }, 10000);

            clickCollapse(s);
        }
    );

    function clickCollapse(s) {
        s.bind('clickNode', function(e) {
        	// when click node in community, hide all nodes in community, show community node
        	// when click community node, hide community node, show all nodes in community

            e.data.node.hidden = true;

            s.refresh()
        });
    }
} 