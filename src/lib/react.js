export const VDom = {
  createElement(type, props = {}, ...children) {
    const key = props.key ?? null;

    if (children.length === 1) {
      props.children = children[0];
    } else {
      props.children = children;
    }

    return {
      type,
      key,
      props,
    };
  },
};
