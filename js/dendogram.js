/**
 * inspiration from
 * http://bl.ocks.org/mbostock/4339083
 */

dendroGram = function module() {

  var cluster = d3.layout.cluster()
    .children(function (d) {
      return d.branchset;
    })
    .value(function (d) {
      return d.length;
    })
    .sort(function (a, b) {
      console.log(a)
      return b.height - a.height || b.value - a.value;
    })
    .separation(function (a, b) {
      console.log(a)
      return (a.parent == b.parent ? 1 : 1);
    });

  var margin = {
      top: 30,
      right: 20,
      bottom: 30,
      left: 20
    },
    width = 700 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom,
    barHeight = 50,
    barWidth = width * .8;

  var i = 0,
    duration = 5000,
    root, svg, svgGroup, height, addTree = [];

  // This makes the layout more consistent.
  var levelWidth = [1];

  // Calculate total nodes, max label length
  var totalNodes = 0;
  var nodeEnter;
  var maxLabelLength = 0;

  // panning variables
  var panSpeed = 200;
  var panBoundary = 20; // Within 20px from edges will pan when dragging.
  // Misc. variables
  var i = 0;


  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

  function exports(_selection) {
    _selection.each(function (_data) {

      //root = parseNewick(_data[]);

      svg = d3.select(this)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      multiNexusTree(_data)

    }) //end of selections
  } //end of exports

  function multiNexusTree(tree_data) {

    childCount(0, parseNewick(tree_data[3]));

    var newHeight = d3.max(levelWidth) * 100; // 25 pixels per line
    cluster = cluster.size([newHeight, width - 350]);

    for (var i = 10; i < 20; i++) {
      var parseTree = parseNewick(tree_data[i])
      //console.log(parseTree)
      updateTree(parseTree);

    }
  }

  function updateTree(data) {

    nodes = cluster.nodes(data);
    links = cluster.links(nodes);

    // Update the links…
    var link = svg.selectAll("path.link")
      .data(links);

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", function (d) {
        return stepLinear(d.source.x, d.source.y, d.target.x, d.target.y);
      })
      .transition()
      .duration(duration)
      .style("fill", "none")
      .style("stroke", "grey")
      .style("stroke-width", "2px");


    // Transition links to their new position.

    link
      .transition()
      .duration(duration)
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", function (d) {
        //if (!d.target.children)
        return stepLinear(d.source.x, d.source.y, d.target.x, d.target.y);
      })
      .style("fill", "none")
      .style("stroke", "grey")
      .style("stroke-width", "2px");

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", function (d) {
        // if (!d.target.children)
        return stepLinear(d.source.x, d.source.y, d.target.x, d.target.y);
      })
      .remove();

    // Update the nodes…
    var node = svg.selectAll(".node")
      .data(nodes);

    nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        console.log(d)
        return "translate(" + d.y + "," + d.x + ")";
      });

    //append circle
    nodeEnter.append("circle")
      .attr('class', 'nodeCircle')
      .attr("r", 0)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

    nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .style("font-size", "22px")
      //.style("font-weight", "bold")
      .text(function (d) {
        //if (!d._children)
        return d.name;
      });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function (d) {
        //if (!d.children)
        return "translate(" + d.y + "," + d.x + ")";
      });

    /*
    nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function (d) {
        return d.children ? "lightsteelblue" : "#fff";
      });
*/
    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit()
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      })
      //.style("opacity", 1e-6)
      .remove();

    //nodeExit.select("circle")
    //.attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

    /*// Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
*/
  } //end of update

  function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }


  function elbow(d, i) {
    return "M" + d.source.y + "," + d.source.x +
      "V" + d.target.x + "H" + d.target.y;
  }

  // Like d3.svg.diagonal but with square corners
  function stepLinear(sourceX, sourceY, targetX, targetY) {
    return "M" + sourceY + ',' + sourceX +
      "V" + targetX + "H" + targetY;
  } // end of stepLinear	

  // Compute the new height, function counts total children of root node and sets tree height accordingly.
  // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
  var childCount = function (level, n) {

    if (n.branchset && n.branchset.length > 0) {
      if (levelWidth.length <= level + 1) levelWidth.push(0);

      levelWidth[level + 1] += n.branchset.length;
      n.branchset.forEach(function (d) {
        childCount(level + 1, d);
      });
    }
  };

  // Compute the maximum cumulative length of any node in the tree.
  function maxLength(d) {
    return d.length + (d.children ? d3.max(d.children, maxLength) : 0);
  }

  function zoom() {
    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  // Function to parse tree data to object
  function parseNewick(a) {
    for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
      var n = s[t];
      switch (n) {
        case "(":
          var c = {};
          r.branchset = [c], e.push(r), r = c;
          break;
        case ",":
          var c = {};
          e[e.length - 1].branchset.push(c), r = c;
          break;
        case ")":
          r = e.pop();
          break;
        case ":":
          break;
        default:
          var h = s[t - 1];
          ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n))
      }
    }
    return r;
  }

  //export function to modules
  exports.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return exports;
  }

  exports.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return exports;
  }

  exports.addTree = function (_) {
    if (!arguments.length) return addTree;
    addTree.push(_);
    return this;
  }
  //d3.rebind(exports, dispatch, "on");
  return exports;

} //end of module
