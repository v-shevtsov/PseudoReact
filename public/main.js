let state = {
  time: new Date(),
  lots: null,
};

const api = {
  get(url) {
    switch (url) {
      case '/lots':
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              {
                id: 1,
                name: 'Apple',
                description: 'A fruit that keeps the doctor away',
                price: 16,
              },
              {
                id: 2,
                name: 'Banana',
                description: 'A fruit that monkeys love',
                price: 42,
              },
            ]);
          }, 2000);
        });
      default:
        throw new Error(`Unknown url: ${url}`);
    }
  },
};

function App({ state }) {
  const app = document.createElement('div');
  app.className = 'app';
  app.append(Header());
  app.append(Clock({ time: state.time }));
  app.append(Lots({ lots: state.lots }));

  return app;
}

function Header() {
  const header = document.createElement('header');
  header.className = 'header';
  header.append(Logo());

  return header;
}

function Logo() {
  const logo = document.createElement('img');
  logo.src = 'logo.jpg';
  logo.className = 'logo';

  return logo;
}

function Clock({ time }) {
  const clock = document.createElement('div');
  clock.className = 'clock';

  const value = document.createElement('span');
  value.className = 'value';
  value.innerText = time.toLocaleTimeString();

  clock.append(value);

  const icon = document.createElement('span');

  if (time.getHours() >= 7 && time.getHours() <= 21) {
    icon.className = 'icon day';
  } else {
    icon.className = 'icon night';
  }

  clock.append(icon);

  return clock;
}

function Loading() {
  const node = document.createElement('div');
  node.className = 'loading';
  node.innerText = 'Loading...';

  return node;
}

function Lots({ lots }) {
  if (!lots) {
    return Loading();
  }

  const list = document.createElement('div');
  list.className = 'lots';

  lots.forEach((lot) => {
    list.append(Lot({ lot }));
  });

  return list;
}

function Lot({ lot }) {
  const node = document.createElement('article');
  node.className = 'lot';

  const price = document.createElement('div');
  price.className = 'price';
  price.innerText = lot.price;
  node.append(price);

  const name = document.createElement('h1');
  name.innerText = lot.name;
  node.append(name);

  const description = document.createElement('p');
  description.innerText = lot.description;
  node.append(description);

  return node;
}

setInterval(() => {
  state = {
    ...state,
    time: new Date(),
  };

  renderView(state);
}, 1000);

api.get('/lots').then((lots) => {
  state = {
    ...state,
    lots,
  };

  renderView(state);

  const onPrice = (data) => {
    state = {
      ...state,
      lots: state.lots.map((lot) => {
        if (lot.id === data.id) {
          return {
            ...lot,
            price: data.price,
          };
        }

        return lot;
      }),
    };

    renderView(state);
  };

  lots.forEach((lot) => {
    stream.subscribe(`price-${lot.id}`, onPrice);
  });
});

const stream = {
  subscribe(channel, listener) {
    const match = /^price-(\d+)/.exec(channel);
    if (match) {
      setInterval(() => {
        listener({
          id: parseInt(match[1], 10),
          price: Math.round(Math.random() * 10 + 30),
        });
      }, 400);
    }
  },
};

function render(virtualDom, realDomRoot) {
  const virtualDomRoot = document.createElement(realDomRoot.tagName);
  virtualDomRoot.id = realDomRoot.id;
  virtualDomRoot.append(virtualDom);

  sync(virtualDomRoot, realDomRoot);
}

function sync(virtualNode, realNode) {
  // Sync element

  if (virtualNode.id !== realNode.id) {
    realNode.id = virtualNode.id;
  }

  if (virtualNode.className !== realNode.className) {
    realNode.className = virtualNode.className;
  }

  if (virtualNode.attributes) {
    Array.from(virtualNode.attributes).forEach((attr) => {
      realNode[attr.name] = attr.value;
    });
  }

  if (virtualNode.nodeValue !== realNode.nodeValue) {
    realNode.nodeValue = virtualNode.nodeValue;
  }

  // Sync child nodes
  const virtualChildren = virtualNode.childNodes;
  const realChildren = realNode.childNodes;

  for (let i = 0; i < virtualChildren.length || i < realChildren.length; i++) {
    const virtual = virtualChildren[i];
    const real = realChildren[i];

    // Remove
    if (!virtual && real) {
      realNode.remove(real);
    }

    // Update
    if (virtual && real && virtual.tagName === real.tagName) {
      sync(virtual, real);
    }

    // Replace
    if (virtual && real && virtual.tagName !== real.tagName) {
      const newReal = createRealNodeByVirtual(virtual);
      sync(virtual, newReal);
      realNode.replaceChild(newReal, real);
    }

    // Add
    if (virtual && !real) {
      const newReal = createRealNodeByVirtual(virtual);
      sync(virtual, newReal);
      realNode.appendChild(newReal);
    }
  }
}

function createRealNodeByVirtual(virtual) {
  if (virtual.nodeType === Node.TEXT_NODE) {
    return document.createTextNode('');
  }

  return document.createElement(virtual.tagName);
}

function renderView(state) {
  render(App({ state }), document.getElementById('root'));
}

renderView(state);
