#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import * as path from "path";
import { format } from "date-fns";
import * as fs from "fs";
import readline from "readline";

const program = new Command();

program.version("1.0.0");

const formatFolderName = (name: string): string => {
  return name.split(" ").join("-").toLowerCase();
};

const isNodeModulesIgnored = (): boolean => {
  const gitIgnoreContent = fs.readFileSync(".gitignore", "utf-8");
  return gitIgnoreContent.includes("node_modules");
};

function commit(commitMessage: string) {
  try {
    execSync(`git add . && git commit -m "${commitMessage}"`);
  } catch (err: Error | any) {
    console.error("Error making Git commit:", err.message);
  }
}

program.command("commit <message>").action((message) => {
  const projectFolderName = path.basename(process.cwd());
  const date = format(new Date(), "yyyy-MM-dd HH:mm");
  const commitMessage = `${date} | ${formatFolderName(projectFolderName)} - ${message}`;
  // execSync(`git add .`, { stdio: "inherit" });

  console.log(!isNodeModulesIgnored());

  if (!isNodeModulesIgnored()) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      "missing \x1b[1mnode_modules\x1b[0m in .gitignore, Are you sure want to commit? (y/N): ",
      (answer) => {
        rl.close();
        if (answer.toLocaleLowerCase() === "y") {
          commit(commitMessage);
        } else if (answer.toLocaleLowerCase() === "n") {
          console.log("Go add node_modules to .gitignore");
          process.exit(0);
        } else {
          console.log("Please enter y or n");
        }
      }
    );
  } else {
    commit(commitMessage);
  }
});

program.command("push <branch-name>").action((branchName) => {
  try {
    execSync(`git push origin ${branchName}`);
  } catch (err: Error | any) {
    console.error("Error making Git push:", err.message);
  }
});

program.parse(process.argv);
