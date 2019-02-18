module.exports = function(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      JSXOpeningElement: function(path) {
        let attributes = path.container.openingElement.attributes;
        for (let i = 0, len = attributes.length; i < len; i++) {
          if (attributes[i].name && attributes[i].name.name == "className") {
            attributes.push(
              t.jSXAttribute(t.jSXIdentifier("__class"), attributes[i].value)
            );
            break;
          }
        }
      }
    }
  };
};
