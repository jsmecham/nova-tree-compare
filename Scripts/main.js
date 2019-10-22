// 
// main.js
//
// Created by Justin Mecham on 10/21/19.
// Copyright © 2019 Justin Mecham. All rights reserved.
// 

var treeView = null;
var dataProvider = null;
var changedFiles = [];

exports.activate = function() {
    // Do work when the extension is activated
    
    // Create the TreeView
    treeView = new TreeView("mysidebar", {
        dataProvider: new FruitDataProvider()
    });

    const process = new Process("/usr/bin/env", {
        args: ["git", "diff", "-z", "--name-status", "master..."],
        cwd: nova.workspace.path
    });
    
    process.onStdout(function(output) {
        console.log("processResult", output);
        const rootItems = [];
        
        output.match(/([A-Z]{1})\0([^\0]+\0)/g).forEach((match) => {
            const file = match.split("\0");
            const mode = file[0];
            const path = file[1];
            console.log(mode, path);
            rootItems.push([mode, path]);
        })

        changedFiles = rootItems;
        treeView = new TreeView("mysidebar", {
            dataProvider: new FruitDataProvider()
        });
    });
    process.onStderr(function(line) {
        // TODO: Display an alert if not a git repository
        console.log("Error! ", line);
    });
    
    process.start();


    treeView.onDidChangeSelection((selection) => {
        // console.log("New selection: " + selection.map((e) => e.name));
    });
    
    treeView.onDidExpandElement((element) => {
        // console.log("Expanded: " + element.name);
    });
    
    treeView.onDidCollapseElement((element) => {
        // console.log("Collapsed: " + element.name);
    });
    
    treeView.onDidChangeVisibility(() => {
        // console.log("Visibility Changed");
    });
    
    // TreeView implements the Disposable interface
    nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
    treeView = null;
}

nova.commands.register("mysidebar.refresh", () => {
    // Invoked when the "add" header button is clicked
    console.log("Add");
    return treeView.reload(null);
});

nova.commands.register("mysidebar.remove", () => {
    // Invoked when the "remove" header button is clicked
    let selection = treeView.selection;
    console.log("Remove: " + selection.map((e) => e.name));
});

nova.commands.register("mysidebar.doubleClick", () => {
    // Invoked when an item is double-clicked
    let selection = treeView.selection;
    console.log("DoubleClick:", JSON.stringify(selection));
    
    const openFilePromises = [];
    selection.map((element) => {
        const uri = encodeURI("file://" + element.path);
        openFilePromises.push(nova.workspace.openFile(uri));
    });

    return Promise.all(openFilePromises).then(() => { return null; });
});


class FruitItem {
    constructor(name) {
        this.name = name;
        this.path = `${nova.workspace.path}/${name}`;
        this.children = [];
        this.parent = null;
    }
    
    addChild(element) {
        element.parent = this;
        this.children.push(element);
    }
}

class FruitDataProvider {
    
    constructor() {
        this.rootItems = [];

        changedFiles.forEach((file) => {
            console.log("Flag: ", file[0], "Path:", file[1]);
            let element = new FruitItem(file[1]);
            this.rootItems.push(element);
        });
    }
        
    getChildren(element) {
        // Requests the children of an element
        console.log("getChildren", element);
        if (!element) {
            return this.rootItems;
        }
        else {
            return element.children;
        }
    }
    
    getParent(element) {
        // Requests the parent of an element, for use with the reveal() method
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
            item.command = "mysidebar.doubleClick";
            item.contextValue = "info";
        // }
        return item;
    }
}

