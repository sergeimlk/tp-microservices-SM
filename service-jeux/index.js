import express from 'express';

let games = [
  { id: 1, title: 'Game One' },
  { id: 2, title: 'Mario et Sonic' }
]

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    data: games
  })
});

app.get('/:id', (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const game = games.find(m => m.id === gameId);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json({
    data: game
  });
})


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Game API listening on port ${PORT}`)
})
