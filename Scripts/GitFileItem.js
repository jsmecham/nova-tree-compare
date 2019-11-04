// 
// Tree Compare for Nova
// GitFileItem.js
//
// Copyright © 2019 Justin Mecham. All rights reserved.
//

class GitFileItem {

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

module.exports = GitFileItem;
