//parent and current node array for all data
// integrating uncertainity in the tree based on posterior propability in the tree. 
// show the probabiliy distribution over the branch as the heatmap or barchart
// https://stackoverflow.com/questions/15138742/how-to-prune-d3-tree-of-0-value-leaves-and-of-the-branches-that-lead-to-them
//https://bl.ocks.org/mph006/7e7d7f629de75ada9af5
//https://codepen.io/anon/pen/RggVPO?editors=0010

function parseTree(a) {
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

function nexusTree() {

  d3.text("data/mrbayes_nexus.nex", function (error, reftree) {

    var nexus_array = reftree.split("\n");
    var tree_data = [];

    for (var i = 0; i < nexus_array.length; i++) {

      if (nexus_array[i].match("TREES") || nexus_array[i].match("tree")) {

        var treeString = nexus_array[i].toString();
        tree_data.push(treeString.substr(treeString.lastIndexOf("=") + 7))

      }
    }

    //console.log(tree_data)

    var dendroChart = dendroGram();

    var chartContainer = d3.select("#dendogram")
      .datum(tree_data)
      .call(dendroChart);

  })
} //end of nexustree()d




//check the tree with different tree drw to check the animation
// calculate minimum index of tip nodes and left right odering such that min index (tl) < minindex(tr)
// sorting the tree 

//index ordering: rotate such that mintree(tl)<  mintree(tr)
// clade ordering :  

//postoder traversal
//bi <- bileft | biright 

//   ----- 1000
// |
//bi --|
//    -----0100
