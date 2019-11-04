//
// Tree Compare for Nova
// main.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
//

const GitBranchDataProvider = require("GitBranchDataProvider");
const GitDiffProcess = require("GitDiffProcess");
var treeView;

exports.activate = function() {

    // TreeView Data Provider
    const dataProvider = new GitBranchDataProvider();

    // TreeView
    // QUESTION: Wrap this in GitBranchTreeView?
    treeView = new TreeView("treeCompare", { dataProvider });
    nova.subscriptions.add(treeView);

    // Git "diff" Process Wrapper
    const diffProcess = new GitDiffProcess();
    diffProcess.onComplete((files) => {
        dataProvider.files = files;
        treeView.reload();
    });
    diffProcess.execute();
    nova.subscriptions.add(diffProcess);

    // File System Watcher
    const watcher = nova.fs.watch(null, diffProcess.execute);
    nova.subscriptions.add(watcher);

}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}

nova.commands.register("treeCompare.refresh", () => {
    return treeView.reload();
});

nova.commands.register("treeCompare.doubleClick", () => {
    const selection = treeView.selection;
    const openFilePromises = [];

    selection.map((element) => {
        const uri = encodeURI("file://" + element.path);
        openFilePromises.push(nova.workspace.openFile(uri));
    });

    // NOTE: Should be documented in Nova that you need to return a promise here
    // for async operations, and the promise can't return an object.
    return Promise.all(openFilePromises).then(() => null);
});
