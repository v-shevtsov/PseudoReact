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

function render(newDom, realDomRoot) {
  realDomRoot.innerHTML = '';
  realDomRoot.append(newDom);
}

function renderView(state) {
  render(App({ state }), document.getElementById('root'));
}

renderView(state);

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
