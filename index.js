const _ = require('lodash');

const cardKinds = Array(9).fill(0).map((v, i) => `${i + 1}`);
const cardSuits = ['♠', '♡', '♢', '♣'];

const cardsSrc = cardKinds.reduce((acc, k) => {
  acc.push(...cardSuits.map(s => `${k}${s}`));
  return acc;
}, []);

const strategies = {
  random: () => cardsSrc[_.random(0, cardsSrc.length - 1)],
  smart1: state => {
    const rest = cardsSrc.filter(c => !state.outs.list.includes(c));
    return rest[_.random(0, rest.length - 1)]
  },
  smart2: state => {
    //...
  }
};

function game() {
  const state = {
    outs: {
      list: [],
      kinds: cardKinds.reduce((acc, k) => Object.assign(acc, {[k]: 0}), {}),
      suits: cardSuits.reduce((acc, s) => Object.assign(acc, {[s]: 0}), {}),
      add(card) {
        this.list.push(card);
        this.kinds[card[0]]++;
        this.suits[card[1]]++;
      }
    },
    p0: 0,
    p1: 0,
    turn: 0,
  };
  const cards = _.shuffle(cardsSrc);
  while (cards.length > 0) {
    const guess = state.turn ? strategies.random(state) : strategies.smart1(state);
    const card = cards.pop();
    state.outs.add(card);

    //console.log('>', state.turn, [guess, card]);

    if (guess === card) {
      state[`p${state.turn}`] += 4;
    } else if (guess[0] === card[0]) {
      state[`p${state.turn}`] += 2;
    } else if (guess[1] === card[1]) {
      state[`p${state.turn}`] += 1;
    } else if (state[`p${state.turn}`] > 0) {
      state[`p${state.turn}`]--;
      state[`p${state.turn ^ 1}`]++;
      state.turn ^= 1;
    }

    // console.log('>', [state.p0, state.p1]);
    // console.log('-------------------------');
  }

  return state;
}

const stat = {won: 0, eq: 0, lost: 0, maxScore: 0, minScore: 1e4};
const iterations = 1e4;

for (let i = 0; i < iterations; i++) {
  const {p0, p1} = game();
  if (p0 > p1) {
    stat.won++;
  } else if (p0 === p1) {
    stat.eq++;
  } else {
    stat.lost++;
  }
  if (p0 > stat.maxScore) stat.maxScore = p0;
  if (p0 < stat.minScore) stat.minScore = p0;
}

console.log('Simulation result:');
// console.log(stat.minScore, '...', stat.maxScore);
console.log(stat.won / iterations, stat.eq / iterations, stat.lost / iterations);
