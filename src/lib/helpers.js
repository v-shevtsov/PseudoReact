export const api = {
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

export const stream = {
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
