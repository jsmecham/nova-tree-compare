// 
// Tree Compare for Nova
// GitBranchDataProvider.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
//

const GitFileItem = require("GitFileItem");
const buildTreeFromPaths = require("buildTreeFromPaths");

class GitBranchDataProvider {

    constructor(files = []) {
        this.rootItems = [];
        this.files = files;
    }

    set files(files) {
        this._files = files;

        files.forEach((file) => {
            console.log("Flag: ", file[0], "Path:", file[1]);
            const element = new GitFileItem(file[1]);
            this.rootItems.push(element);
        });

        // const fileTree = buildTreeFromPaths(files);
        // console.log("fileTree:", JSON.stringify(fileTree, null, "  "));
    }
    
    get files() {
      return this._files;
    }

    // Requests the children of an element
    getChildren(element) {
        if (!element) {
            return this.rootItems;
        }
        else {
            return element.children;
        }
    }

    // Requests the parent of an element, for use with the reveal() method
    getParent(element) {
        return element.parent;
    }

    getTreeItem(element) {
        // Converts an element into its display (TreeItem) representation
        let item = new TreeItem(element.name);
        // if (element.children.length > 0) {
        //     item.collapsibleState = TreeItemCollapsibleState.Collapsed;
        //     item.path = element.name;
        //     // item.image = "__filetype.png";
        //     item.contextValue = "fruit";
        // }
        // else {
            // item.image = "__filetype.txt";
            item.path = element.path;
            item.command = "treeCompare.doubleClick";
            item.contextValue = "info";
        // }
        return item;
    }
}

module.exports = GitBranchDataProvider;