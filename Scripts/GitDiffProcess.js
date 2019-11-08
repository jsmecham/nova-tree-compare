// 
// Tree Compare for Nova
// GitDiffProcess.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

class GitDiffProcess {

    constructor() {
        this.isExecuting = false;
    }

    get process() {
        if (this._process) { return this._process }

        const process = new Process("/usr/bin/env", {
            // TODO: Make branch name configurable
            args: ["git", "diff", "-z", "--name-status", "master..."],
            cwd: nova.workspace.path
        });

        process.onStdout(this.handleOutput.bind(this));
        process.onStderr(this.handleError.bind(this));

        return (this._process = process);
    }

    execute() {
        if (this.isExecuting) return;

        this.isExecuting = true;
        this.process.start();

        const channel = this.process.stdin;
        const writer = channel.getWriter();

        writer.ready.then(() => {
            writer.write(this.content);
            writer.close();
        }).then(() => {
            this.isExecuting = false;
        });
    }

    handleError(error) {
        console.error(error);
    }
  
    handleOutput(output) {
        this.changedFiles = output.match(/([A-Z]{1})\0([^\0]+\0)/g).map((match) => {
            const file = match.split("\0");
            const mode = file[0];
            const path = file[1];

            return [mode, path];
        })

        console.info("Changed Files:", JSON.stringify(this.changedFiles, null, "  "));

        if (this._onCompleteCallback) {
            this._onCompleteCallback(this.changedFiles);
        }
    }

    onComplete(callback) {
        this._onCompleteCallback = callback;
    }

}

module.exports = GitDiffProcess;