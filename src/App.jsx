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

// Actions
const SET_TIME = 'setTime';
const SET_LOTS = 'setLots';
const CHANGE_LOT_PRICE = 'changeLotPrice';

// Initial state
const clockInitialState = {
  time: new Date(),
};

const auctionInitialState = {
  lots: null,
};

// Reducers
const clockReducer = (state = clockInitialState, action) => {
  switch (action.type) {
    case SET_TIME:
      return {
        ...state,
        time: action.time,
      };
    default:
      return state;
  }
};

const auctionReducer = (state = auctionInitialState, action) => {
  switch (action.type) {
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

// Actions creators
const setTime = (time) => ({ type: SET_TIME, time });
const setLots = (lots) => ({ type: SET_LOTS, lots });
const changeLotPrice = (id, price) => ({ type: CHANGE_LOT_PRICE, id, price });

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

const combineReducers =
  (reducers) =>
  (state = {}, action) => {
    return Object.entries(reducers).reduce((acc, [key, reducer]) => {
      acc[key] = reducer(state[key], action);
      return acc;
    }, {});
  };

const store = new Store(combineReducers({ clock: clockReducer, auction: auctionReducer }));

// ##########################

function App({ state }) {
  return (
    <div className="app">
      <Header />
      <Clock time={state.clock.time} />
      <Lots lots={state.auction.lots} />
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
  store.dispatch(setTime(new Date()));
}, 1000);

api.get('/lots').then((lots) => {
  store.dispatch(setLots(lots));

  lots.forEach((lot) => {
    stream.subscribe(`price-${lot.id}`, (data) => {
      store.dispatch(changeLotPrice(data.id, data.price));
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
