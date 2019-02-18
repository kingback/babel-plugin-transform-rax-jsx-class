module.exports = function(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      JSXOpeningElement: function(path) {
        let attributes = path.container.openingElement.attributes;
        for (let i = 0, len = attributes.length; i < len; i++) {
          if (attributes[i].name) {
            if (attributes[i].name.name == "className") {
              const value = attributes[i].value;
              if (t.isStringLiteral(value)) {
                // className="a b c"
                attributes.push(
                  t.jSXAttribute(t.jSXIdentifier("__class"), value)
                );
              } else if (t.isJSXExpressionContainer(value)) {
                if (t.isStringLiteral(value.expression)) {
                  // className={"a b c"}
                  attributes.push(
                    t.jSXAttribute(t.jSXIdentifier("__class"), value.expression)
                  );
                } else {
                  // className={["a", "b", "c"]}
                  // className={{ a: true, b: false }}
                  // className={cx({a: true})}
                  // className={this.props.a ? "a" : "b"}
                  // =>
                  // className={typeof _getClassName === "function" ? _getClassName(expression) : (expression)}
                  // @see https://github.com/alibaba/rax/blob/master/packages/babel-plugin-transform-jsx-stylesheet/src/index.js#L28
                  attributes.push(
                    t.jSXAttribute(
                      t.jSXIdentifier("__class"),
                      t.jSXExpressionContainer(
                        t.conditionalExpression(
                          t.binaryExpression(
                            "===",
                            t.unaryExpression(
                              "typeof",
                              t.identifier("_getClassName")
                            ),
                            t.stringLiteral("function")
                          ),
                          t.callExpression(t.identifier("_getClassName"), [
                            value.expression
                          ]),
                          t.callExpression(t.identifier(""), [value.expression])
                        )
                      )
                    )
                  );
                }
              }
              break;
            }
          }
        }
      }
    }
  };
};
