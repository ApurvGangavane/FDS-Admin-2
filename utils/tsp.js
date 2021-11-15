let { Graph } = require("../utils/graph");

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

class GeneticAlgorithm {
  constructor(
    generations = 100,
    populationSize = 10,
    tournamentSize = 4,
    mutationRate = 0.1,
    elitismRate = 0.1
  ) {
    this.generations = generations;
    this.populationSize = populationSize;
    this.tournamentSize = tournamentSize;
    this.mutationRate = mutationRate;
    this.elitismRate = elitismRate;
  }
  optimise(grph) {
    let fittest = 0;
    let population = this.makePopulation(grph.getVertices());
    let elitismOffset = Math.ceil(this.populationSize * this.elitismRate);

    if (elitismOffset > this.populationSize) {
      console.log("elitism Rate must be between 0 and 1");
    }
    console.log(`Optimising TSP Route for  Graph: ${grph} \n`);

    for (let generation = 1; generation <= this.generations; generation++) {
      console.log(`\nGeneration: ${generation}`);
      console.log(`Population: ${population}`);

      let newPopulation = [];
      let fitness = this.computeFitness(grph, population);
      console.log(`Fitness: ${fitness}`);
      fittest = fitness.indexOf(Math.min(...fitness));
      console.log(`Fittest Route: ${population[fittest]}, ${fitness[fittest]}`);

      if (elitismOffset > 0) {
        let fitIndices = [...fitness];
        fitIndices.sort();
        let elites = [];
        for (let i = 0; i < elitismOffset; i++) {
          elites.push(fitness.indexOf(fitIndices[0]));
          fitIndices.shift();
        }
        for (let i = 0; i < elitismOffset; i++) {
          elites.push(fitness.indexOf(fitIndices[fitIndices.length - 1]));
          fitIndices.pop();
        }
        for (let i of elites) {
          newPopulation.push(population[i]);
        }
      }
      for (let gen = 2 * elitismOffset; gen < this.populationSize; gen++) {
        let parent1 = this.tournamentSelection(grph, population);
        let parent2 = this.tournamentSelection(grph, population);
        let offSpring = this.crossover(parent1, parent2);
        newPopulation.push(offSpring);
      }
      for (let gen = 2 * elitismOffset; gen < this.populationSize; gen++) {
        newPopulation[gen] = this.mutate(newPopulation[gen], grph);
      }

      population = newPopulation;

      if (this.converged(population) === true) {
        console.log(`\nConverged to a local Minima. `);
        break;
      }
    }
    return population[fittest];
  }
  makePopulation(graph_nodes) {
    let pop = [];
    let str = graph_nodes[0];
    for (let i = 0; i < this.populationSize; i++) {
      let arr = shuffle(graph_nodes.slice(1));
      arr.unshift(str);
      pop.push(arr.join(""));
    }
    return pop;
  }
  computeFitness(grph, population) {
    let fit = [];
    for (let individual of population) {
      fit.push(grph.getPathCost(individual));
    }
    return fit;
  }
  tournamentSelection(grph, population) {
    let tournamentContestants = getRandom(population, this.tournamentSize);
    let tournamentContenstantFitness = this.computeFitness(
      grph,
      tournamentContestants
    );
    return tournamentContestants[
      tournamentContenstantFitness.indexOf(
        Math.min(...tournamentContenstantFitness)
      )
    ];
  }
  crossover(parent1, parent2) {
    let offspring = new Array(parent1.length);
    for (let i = 0; i < parent1.length; i++) {
      offspring[i] = "";
    }
    let { indexLow, indexHigh } = this.computeLowHighIndexes(parent1);

    for (let i = indexLow; i <= indexHigh; i++) {
      offspring[i] = parent1[i];
    }
    let offspringAvailableIndex = [];
    for (let i = 0; i < indexLow; i++) {
      offspringAvailableIndex.push(i);
    }
    for (let i = indexHigh + 1; i < parent1.length; i++) {
      offspringAvailableIndex.push(i);
    }
    for (let allele of parent2) {
      if (offspring.find((element) => element === "") === undefined) {
        break;
      }
      if (offspring.find((element) => element === allele) === undefined) {
        offspring[offspringAvailableIndex.shift()] = allele;
      }
    }
    return offspring.join("");
  }
  mutate(genome, grph) {
    if (Math.random() < this.mutationRate) {
      let { indexLow, indexHigh } = this.computeLowHighIndexes(genome);
      if (indexLow === 0) {
        indexLow++;
      }
      //return this.swap(indexLow, indexHigh, genome);
      return this.use2Opt(genome, grph);
    } else {
      return genome;
    }
  }
  computeLowHighIndexes(parent) {
    let indexLow = getRandomInt(0, parent.length - 1);
    let indexHigh = getRandomInt(indexLow + 1, parent.length);
    while (indexHigh - indexLow > Math.ceil(~~(parent.length / 2))) {
      try {
        indexLow = getRandomInt(0, parent.length);
        indexHigh = getRandomInt(indexLow + 1, parent.length);
      } catch (error) {
        console.log(error);
      }
    }
    return { indexLow, indexHigh };
  }
  swap(indexLow, indexHigh, str) {
    str = str.split("");
    [str[indexLow], str[indexHigh]] = [str[indexHigh], str[indexLow]];
    return str.join("");
  }
  converged(population) {
    return population.every((element) => element === population[0]);
  }
  use2Opt(genome, grph, rept = 100) {
    let nCities = genome.length;
    // console.log(grph.getAdjacent("a")["b"]);
    let genomeToRet = [...genome];
    for (let _ = 0; _ < rept; _++) {
      let isChanged = false;
      for (let i = 1; i < nCities - 2; i++) {
        for (let j = i + 2; j < nCities; j++) {
          let currentCost =
            grph.getAdjacent(genomeToRet[i])[genomeToRet[i + 1]] +
            grph.getAdjacent(genomeToRet[j])[genomeToRet[j + 1]];
          let newCost =
            grph.getAdjacent(genomeToRet[i])[genomeToRet[j]] +
            grph.getAdjacent(genomeToRet[i + 1])[genomeToRet[j + 1]];
          let difference = newCost - currentCost;
          if (difference < 0) {
            let reversed = [...genomeToRet].slice(i + 1, j + 1);
            for (let k = i + 1; k < j + 1; k++) {
              genomeToRet[k] = reversed.pop();
            }
            isChanged = true;
          }
        }
      }
      if (!isChanged) {
        break;
      }
    }
    return genomeToRet.join("");
  }
}

// let graph = new Graph();
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

// let ga_tsp = new GeneticAlgorithm(
//   (generations = 20),
//   (populationSize = 15),
//   (tournamentSize = 4),
//   (mutationRate = 0.2),
//   (elitismRate = 0.1)
// );

// optimal_path = 0;
// path_cost = ga_tsp.optimise(graph);
// console.log(`\nPath: {0}, Cost: {1}`);

module.exports = { GeneticAlgorithm };
