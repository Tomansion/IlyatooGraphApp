const itemsMemory = {};

class Item {
  constructor(label, type, parent = null) {
    this.label = label;
    this.type = type;
    this.parent = parent;
    this.links = [];
  }

  addLinks(items) {
    items.forEach((itemLink) => {
      const linkLabel = itemLink.fkAction.id;

      const possibleTypes = [
        "fkSujetObjet",
        "fkSujetPersonne",
        "fkSujetAction",
        "fkSujetFrancais",
      ];

      let linkItemTargetLabel = null;
      for (let type of possibleTypes) {
        if (type in itemLink) {
          if ("nom" in itemLink[type]) linkItemTargetLabel = itemLink[type].nom;
          else linkItemTargetLabel = itemLink[type].id;
          break;
        }
        if (!itemsMemory[linkItemTargetLabel])
          itemsMemory[linkItemTargetLabel] = new Item(linkItemTargetLabel);
      }

      if (!linkItemTargetLabel) {
        console.error("No link item target label found");
        console.error(itemLink);
        return;
      }

      // Get or create the item and the link
      let itemTarget = itemsMemory[linkItemTargetLabel];
      if (!itemTarget) {
        itemTarget = new Item(linkItemTargetLabel);
        itemsMemory[linkItemTargetLabel] = itemTarget;
      }

      this.addItemLink(itemTarget, linkLabel);
    });
  }

  addItemLink(item, linkLabel) {
    if (!item) {
      console.error("No item provided");
      return;
    }

    if (!linkLabel) {
      console.error("No link label provided");
      return;
    }

    // Search if we already are not linked through the parent
    if (this.parent) {
      const parentLink = this.parent.links.find(
        (link) => link.itemTarget.label === item.label
      );
      if (parentLink) {
        console.log("Already in parent");
        return;
      }
    }

    // Search if we already have an item with the same label
    const existingItem = this.links.find(
      (link) =>
        link.itemTarget.label === item.label && link.linkLabel === linkLabel
    );
    if (existingItem) {
      console.log("Already in links");
      return;
    }

    item.parent = this;
    this.links.push(new Link(item, linkLabel));
  }

  convertToVisData(nodes, edges) {
    // Add the current item
    nodes.push({ id: this.label, label: this.label });

    // Add the links
    this.links.forEach((link) => {
      link.itemTarget.convertToVisData(nodes, edges);

      edges.push({
        from: this.label,
        to: link.itemTarget.label,
        label: link.linkLabel,
        arrows: "from",
      });
    });
  }
}

class Link {
  constructor(itemTarget, linkLabel) {
    this.itemTarget = itemTarget;
    this.linkLabel = linkLabel;
  }
}

const convertToItemObjects = (label, items) => {
  // Create the initial item
  let item = itemsMemory[label];
  if (!item) {
    item = new Item(label);
    itemsMemory[label] = item;
  }

  // Add the links
  items.forEach((itemLink) => {
    const linkLabel = itemLink.fkAction.id;

    const possibleTypes = [
      "fkSujetObjet",
      "fkSujetPersonne",
      "fkSujetAction",
      "fkSujetFrancais",
    ];

    let linkItemTargetLabel = null;
    let itemType = null;
    for (let type of possibleTypes) {
      if (type in itemLink) {
        linkItemTargetLabel = itemLink[type].id;
        itemType = type;
        break;
      }
    }

    if (!linkItemTargetLabel) {
      console.error("No link item target label found");
      console.error(itemLink);
      return;
    }

    // Create the item and the link
    let itemTarget = itemsMemory[linkItemTargetLabel];
    if (!itemTarget) {
      itemTarget = new Item(linkItemTargetLabel, itemType);
      itemsMemory[linkItemTargetLabel] = itemTarget;
    }

    item.addItemLink(itemTarget, linkLabel);
  });

  return item;
};

export { convertToItemObjects, itemsMemory, Item, Link };
