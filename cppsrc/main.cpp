#include <napi.h>
#include "Samples/functionexample.h"
#ifndef __ENVIRONMENT__
#include "TSP/environment.h"
#endif

#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <vector>
#include <string>

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    // InitURandom();
    // int maxNumOfTrial;
    // TEnvironment *gEnv = new TEnvironment();
    // gEnv->fFileNameTSP = (char *)malloc(100);
    // vector<string> exampleTspMaps{
    //     "tc/eil101.tsp",
    //     "tc/att532.tsp",
    //     "tc/rat575.tsp",
    //     "tc/fnl4461.tsp",
    //     "tc/ja9847.tsp"};

    // int id = -1;
    // /*
    // do
    // {
    //     std::cout << "Please type in 0-4 to choose a dataset: " << endl;
    //     for (int i = 0; i < exampleTspMaps.size(); i++)
    //     {
    //         cout << i << ": " << exampleTspMaps[i] << endl;
    //     }
    //     std::scanf("%d", &id);
    // } while (id < 0 || id > 4);
    // */

    // std::strcpy(gEnv->fFileNameTSP, "tsp-project.tsp");

    // maxNumOfTrial = 5;
    // gEnv->Npop = 100;
    // gEnv->Nch = 30;

    // std::cout << "Initialzing..." << endl;
    // gEnv->define();
    // std::cout << "Building solution..." << endl;

    // for (int n = 0; n < maxNumOfTrial; n++)
    // {
    //     gEnv->doIt();
    //     gEnv->printOn(n);
    //     gEnv->writeBest();
    // }

    return functionexample::Init(env, exports);
}

NODE_API_MODULE(testaddon, InitAll)