import express from 'express';

let musics = [
  { id: 1, title: 'Song One', artist: 'Artist A' },
  { id: 2, title: 'Song Two', artist: 'Artist B' }
]

const app = express();
const PORT = process.env.PORT || 2500;
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    data: musics
  })
});

app.get('/:id', (req, res) => {
  const musicId = parseInt(req.params.id, 10);
  const music = musics.find(m => m.id === musicId);

  if (!music) {
    return res.status(404).json({ error: 'Music not found' });
  }

  res.json({
    data: music
  });
})



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Music API listening on port ${PORT}`)
})
