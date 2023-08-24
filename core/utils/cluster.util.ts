import { Logger, Injectable } from "@nestjs/common";
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

@Injectable()
export class AppClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isMaster) {
      Logger.log(`Master server started on ${process.pid}`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on("exit", (worker, code, signal) => {
        Logger.log(`Worker ${worker.process.pid} died. Restarting`);
        cluster.fork();
      });
    } else {
      Logger.log(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
