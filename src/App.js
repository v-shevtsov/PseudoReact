import { render } from './lib/react-dom';
import { VDom } from './lib/react.js';
import { api, stream } from './lib/helpers.js';

let state = {
  time: new Date(),
  lots: null,
};

// ##########################

function App({ state }) {
  return VDom.createElement(
    'div',
    { className: 'app' },
    VDom.createElement(Header),
    VDom.createElement(Clock, { time: state.time }),
    VDom.createElement(Lots, { lots: state.lots })
  );
}

function Header() {
  return VDom.createElement('header', { className: 'header' }, VDom.createElement(Logo));
}

function Logo() {
  return VDom.createElement('img', { className: 'logo', src: 'logo.jpg' });
}

function Clock({ time }) {
  const isDay = time.getHours() >= 7 && time.getHours() <= 21;

  return VDom.createElement(
    'div',
    { className: 'clock' },
    VDom.createElement('span', { className: 'value' }, time.toLocaleTimeString()),
    VDom.createElement('span', { className: isDay ? 'icon day' : 'icon night' })
  );
}

function Loading() {
  return VDom.createElement('div', { className: 'loading' }, 'Loading...');
}

function Lots({ lots }) {
  if (!lots) {
    return VDom.createElement(Loading);
  }

  return VDom.createElement(
    'div',
    { className: 'lots' },
    lots.map((lot) => VDom.createElement(Lot, { lot, key: lot.id }))
  );
}

function Lot({ lot, key }) {
  return VDom.createElement(
    'article',
    { className: 'lot', key },
    VDom.createElement('div', { className: 'price' }, lot.price),
    VDom.createElement('h1', {}, lot.name),
    VDom.createElement('p', {}, lot.description)
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
  render(VDom.createElement(App, { state }), document.getElementById('root'));
}

renderView(state);
