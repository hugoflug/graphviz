function viz(s, jsonPath) {
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
            e.data.node.hidden = true;

            s.refresh()
        });
    }
} 