// ##########################

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

// ##########################

const root = ReactDOM.createRoot(document.getElementById('root'));

let state = {
  time: new Date(),
  lots: null,
};

// ##########################

function App({ state }) {
  return (
    <div className="app">
      <Header />
      <Clock time={state.time} />
      <Lots lots={state.lots} />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <Logo />
    </header>
  );
}

function Logo() {
  return <img className="logo" src="logo.jpg" alt="Logo" />;
}

function Clock({ time }) {
  const isDay = time.getHours() >= 7 && time.getHours() <= 21;

  return (
    <div className="clock">
      <span className="value">{time.toLocaleTimeString()}</span>
      <span className={isDay ? 'icon day' : 'icon night'} />
    </div>
  );
}

function Loading() {
  return <div className="loading">Loading...</div>;
}

function Lots({ lots }) {
  if (!lots) {
    return <Loading />;
  }
  return (
    <div className="lots">
      {lots.map((lot) => (
        <Lot lot={lot} key={lot.id} />
      ))}
    </div>
  );
}

function Lot({ lot }) {
  return (
    <article className="lot">
      <div className="price">{lot.price}</div>
      <h1>{lot.name}</h1>
      <p>{lot.description}</p>
    </article>
  );
}

// ##########################

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

// ##########################

function renderView(state) {
  root.render(React.createElement(App, { state }));
}

renderView(state);
