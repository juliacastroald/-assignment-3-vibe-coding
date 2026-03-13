import { useState } from 'react'
import { loadItems, saveItems } from './storage'
import Game from './components/Game'
import GameOver from './components/GameOver'
import './App.css'

const CHARACTERS = [
  { emoji: '🐱', label: 'Cat' },
  { emoji: '🐸', label: 'Frog' },
  { emoji: '🤖', label: 'Robot' },
  { emoji: '🦊', label: 'Fox' },
]

function App() {
  const [screen, setScreen] = useState('start') // 'start' | 'playing' | 'gameover'
  const [finalInventory, setFinalInventory] = useState(loadItems)
  const [character, setCharacter] = useState('🐱')

  const handleGameOver = (inventory) => {
    saveItems(inventory)
    setFinalInventory(inventory)
    setScreen('gameover')
  }

  const handleRestart = () => {
    saveItems([])
    setFinalInventory([])
    setScreen('playing')
  }

  return (
    <div className="app">
      {screen === 'start' && (
        <div className="overlay-screen">
          <h1>Catalog Runner</h1>
          <p>Collect coins and stars. Don't fall into the gaps!</p>
          <div className="legend">
            <span className="legend-coin">● Coin = 1 pt</span>
            <span className="legend-star">★ Star = 5 pts</span>
          </div>
          <div className="character-select">
            <p className="character-label">Choose your character:</p>
            <div className="character-options">
              {CHARACTERS.map((c) => (
                <button
                  key={c.emoji}
                  className={`character-btn${character === c.emoji ? ' selected' : ''}`}
                  onClick={() => setCharacter(c.emoji)}
                  title={c.label}
                >
                  {c.emoji}
                </button>
              ))}
            </div>
          </div>
          <p className="controls-hint">
            Press <kbd>↑</kbd> or <kbd>Space</kbd> to jump
          </p>
          <button onClick={() => setScreen('playing')}>Start Game</button>
        </div>
      )}
      {screen === 'playing' && <Game onGameOver={handleGameOver} character={character} />}
      {screen === 'gameover' && (
        <GameOver inventory={finalInventory} onRestart={handleRestart} />
      )}
    </div>
  )
}

export default App
