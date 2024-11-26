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

// ##########################

const SET_TIME = 'setTime';
const SET_LOTS = 'setLots';
const CHANGE_LOT_PRICE = 'changeLotPrice';

const initialState = {
  time: new Date(),
  lots: null,
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TIME:
      return {
        ...state,
        time: action.time,
      };
    case SET_LOTS:
      return {
        ...state,
        lots: action.lots,
      };
    case CHANGE_LOT_PRICE:
      return {
        ...state,
        lots: state.lots.map((lot) => {
          if (lot.id === action.id) {
            return {
              ...lot,
              price: action.price,
            };
          }

          return lot;
        }),
      };
    default:
      return state;
  }
};

class Store {
  constructor(reducer, initialState) {
    this.reducer = reducer;
    this.state = reducer(initialState, { type: null });
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = typeof state === 'function' ? state(this.state) : state;

    this.listeners.forEach((listener) => listener());
  }

  dispatch(action) {
    this.setState((state) => this.reducer(state, action));
  }

  subscribe(listener) {
    this.listeners.push(listener);

    return () => (this.listeners = this.listeners.filter((l) => l !== listener));
  }
}

const store = new Store(appReducer);

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
  store.dispatch({ type: SET_TIME, time: new Date() });
}, 1000);

api.get('/lots').then((lots) => {
  store.dispatch({ type: SET_LOTS, lots });

  lots.forEach((lot) => {
    stream.subscribe(`price-${lot.id}`, (data) => {
      store.dispatch({ type: CHANGE_LOT_PRICE, id: data.id, price: data.price });
    });
  });
});

// ##########################

function renderView(state) {
  root.render(React.createElement(App, { state }));
}

const unsubscribe = store.subscribe(() => {
  renderView(store.getState());
});

renderView(store.getState());
