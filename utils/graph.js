class Graph {
  constructor(graph_struct = {}) {
    this.graph = graph_struct;
  }
  setVertex(vertex) {
    if (
      Object.keys(this.graph).find((element) => element === vertex) ===
      undefined
    ) {
      this.graph[vertex] = {};
    }
    return this;
  }
  setAdjacent(vertex, adj, weight = 0) {
    if (
      Object.keys(this.graph).find((element) => element === vertex) ===
      undefined
    ) {
      this.graph[vertex] = {};
    }
    if (
      Object.keys(this.graph).find((element) => element === adj) === undefined
    ) {
      this.graph[adj] = {};
    }
    this.graph[vertex][adj] = weight;
    this.graph[adj][vertex] = weight;
    return this;
  }

  getVertices() {
    return Object.keys(this.graph);
  }

  getAdjacent(vertex) {
    if (
      Object.keys(this.graph).find((element) => element === vertex) != undefined
    ) {
      return this.graph[vertex];
    }
  }

  getPathCost(path) {
    let pathcost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      pathcost += this.graph[path.charAt(i)][path.charAt(i + 1)];
    }
    return pathcost;
  }

  str() {
    let grh = "";
    for (let vrt of this.getVertices()) {
      for (let adj of Object.keys(this.getAdjacent(vrt))) {
        grh += `(${vrt}, ${adj}, ${this.graph[vrt][adj]}) \t`;
      }
    }
    return grh;
  }
}

// graph = new Graph();
// graph.setAdjacent("a", "b", 4);
// graph.setAdjacent("a", "c", 4);
// graph.setAdjacent("a", "d", 7);
// graph.setAdjacent("a", "e", 3);
// graph.setAdjacent("b", "c", 2);
// graph.setAdjacent("b", "d", 3);
// graph.setAdjacent("b", "e", 5);
// graph.setAdjacent("c", "d", 2);
// graph.setAdjacent("c", "e", 3);
// graph.setAdjacent("d", "e", 6);
// console.log(graph.getVertices());
// console.log(graph);
// path = "abcde";
// console.log(graph.getPathCost(path));

module.exports = { Graph };
