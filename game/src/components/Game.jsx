import { useEffect, useRef } from 'react'
import { addItem, findItem, getTotal } from '../engine'

const W = 640
const H = 220
const GROUND = 168       // y-coordinate of platform tops
const PLAYER_X = 80      // fixed horizontal position
const PLAYER_W = 26
const PLAYER_H = 26
const GRAVITY = 0.55
const JUMP_FORCE = -11
const SCROLL_SPEED = 3

function Game({ onGameOver, character }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.focus()

    const s = {
      playerY: GROUND - PLAYER_H,
      playerVY: 0,
      onGround: true,
      scrollX: 0,
      platforms: [{ x: 0, w: 380 }],
      nextPlatformEnd: 380,
      collectibles: [],
      inventory: [],
      raf: null,
      dead: false,
      paused: false,
      elapsed: 0,
      lastTime: null,
      poweredUp: false,
      powerUpTimer: 0,
      bonusScore: 0,
    }

    for (let i = 0; i < 6; i++) spawnPlatform()

    function spawnPlatform() {
      const gap = 55 + Math.random() * 65
      const w = 110 + Math.random() * 160
      const x = s.nextPlatformEnd + gap
      s.platforms.push({ x, w })
      s.nextPlatformEnd = x + w

      if (Math.random() > 0.3) {
        const isStar = Math.random() > 0.72
        s.collectibles.push({
          x: x + w * (0.25 + Math.random() * 0.5),
          y: GROUND - 44 - Math.random() * 20,
          type: isStar ? 'star' : 'coin',
          r: isStar ? 10 : 8,
          collected: false,
        })
      }

      if (Math.random() > 0.85) {
        s.collectibles.push({
          x: x + w * (0.25 + Math.random() * 0.5),
          y: GROUND - 44 - Math.random() * 20,
          type: 'mushroom',
          r: 10,
          collected: false,
        })
      }
    }

    function onKey(e) {
      if (e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault()
        if (s.onGround && !s.dead) {
          s.playerVY = JUMP_FORCE
          s.onGround = false
        }
      }
      if (e.code === 'KeyP') {
        e.preventDefault()
        if (s.paused) {
          s.lastTime = null
          s.paused = false
        } else {
          s.paused = true
          s.lastTime = null
        }
      }
    }
    window.addEventListener('keydown', onKey)


    function update(dt) {
      if (s.poweredUp) {
        s.powerUpTimer -= dt
        if (s.powerUpTimer <= 0) {
          s.poweredUp = false
          s.powerUpTimer = 0
        }
      }

      s.scrollX += SCROLL_SPEED

      while (s.nextPlatformEnd - s.scrollX < W + 300) spawnPlatform()

      s.platforms = s.platforms.filter((p) => p.x + p.w > s.scrollX - 50)
      s.collectibles = s.collectibles.filter((c) => c.x > s.scrollX - 50)

      s.playerVY += GRAVITY
      s.playerY += s.playerVY

      s.onGround = false
      const pb = s.playerY + PLAYER_H
      for (const p of s.platforms) {
        const plx = p.x - s.scrollX
        const prx = plx + p.w
        if (
          PLAYER_X + PLAYER_W > plx &&
          PLAYER_X < prx &&
          pb >= GROUND &&
          pb <= GROUND + 20 &&
          s.playerVY >= 0
        ) {
          s.playerY = GROUND - PLAYER_H
          s.playerVY = 0
          s.onGround = true
          break
        }
      }

      if (s.playerY > H + 40) {
        s.dead = true
        const finalInv = [...s.inventory]
        if (s.bonusScore > 0) {
          finalInv.push({ name: 'power-up bonus', value: s.bonusScore, quantity: 1 })
        }
        onGameOver(finalInv)
        return
      }

      for (const c of s.collectibles) {
        if (c.collected) continue
        const hitX = c.x - s.scrollX
        if (
          PLAYER_X < hitX + c.r &&
          PLAYER_X + PLAYER_W > hitX - c.r &&
          s.playerY < c.y + c.r &&
          pb > c.y - c.r
        ) {
          c.collected = true
          if (c.type === 'mushroom') {
            s.poweredUp = true
            s.powerUpTimer = 10
          } else {
            const baseValue = c.type === 'star' ? 5 : 1
            s.inventory = addItem(s.inventory, c.type, baseValue, 1)
            if (s.poweredUp) s.bonusScore += baseValue
          }
        }
      }
    }

    // ── draw helpers ─────────────────────────────────────────────────────────

    function drawStar(cx, cy, r) {
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? r : r * 0.42
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const x = cx + radius * Math.cos(angle)
        const y = cy + radius * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = '#ffe566'
      ctx.fill()
      ctx.strokeStyle = '#e0a020'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    function drawCoin(cx, cy, r) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = '#ffd700'
      ctx.fill()
      ctx.strokeStyle = '#b8860b'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = '#b8860b'
      ctx.font = `bold ${Math.floor(r * 1.1)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('$', cx, cy + 0.5)
    }

    function drawMushroom(cx, cy, r) {
      // Stem
      ctx.fillStyle = '#f5deb3'
      ctx.fillRect(cx - r * 0.35, cy, r * 0.7, r * 0.75)
      // Cap
      ctx.beginPath()
      ctx.arc(cx, cy, r, Math.PI, 0)
      ctx.closePath()
      ctx.fillStyle = '#e63946'
      ctx.fill()
      // White spots
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(cx - r * 0.3, cy - r * 0.25, r * 0.18, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + r * 0.28, cy - r * 0.3, r * 0.14, 0, Math.PI * 2)
      ctx.fill()
    }

    // ── draw ─────────────────────────────────────────────────────────────────

    function draw() {
      ctx.fillStyle = '#16213e'
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      const bgDots = [
        [50, 18], [130, 42], [210, 12], [295, 55], [380, 28],
        [460, 50], [545, 18], [610, 38], [90, 68], [170, 32],
        [340, 72], [500, 62], [620, 80], [260, 48], [420, 82],
      ]
      for (const [bx, by] of bgDots) ctx.fillRect(bx, by, 2, 2)

      for (const p of s.platforms) {
        const px = p.x - s.scrollX
        ctx.fillStyle = '#2d6a4f'
        ctx.fillRect(px, GROUND, p.w, H - GROUND)
        ctx.fillStyle = '#52b788'
        ctx.fillRect(px, GROUND, p.w, 5)
      }

      for (const c of s.collectibles) {
        if (c.collected) continue
        const cx = c.x - s.scrollX
        if (c.type === 'coin') drawCoin(cx, c.y, c.r)
        else if (c.type === 'star') drawStar(cx, c.y, c.r)
        else drawMushroom(cx, c.y, c.r)
      }

      // Draw player as selected emoji
      ctx.font = `${PLAYER_H + 2}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(character, PLAYER_X + PLAYER_W / 2, s.playerY)

      const coins = findItem(s.inventory, 'coin')
      const stars = findItem(s.inventory, 'star')
      ctx.textBaseline = 'top'
      ctx.font = 'bold 13px monospace'

      ctx.fillStyle = '#ffd700'
      ctx.textAlign = 'left'
      ctx.fillText(`Coins: ${coins ? coins.quantity : 0}`, 10, 10)

      ctx.fillStyle = '#ffe566'
      ctx.fillText(`Stars: ${stars ? stars.quantity : 0}`, 10, 30)

      const displayScore = getTotal(s.inventory) + s.bonusScore
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'right'
      ctx.fillText(`Score: ${displayScore}`, W - 10, 10)

      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.textAlign = 'right'
      ctx.fillText(`Time: ${s.elapsed.toFixed(1)}s`, W - 10, 30)

      if (s.poweredUp) {
        ctx.fillStyle = '#ff6b35'
        ctx.font = 'bold 13px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(`⚡ 2× POWER UP — ${s.powerUpTimer.toFixed(1)}s`, W / 2, 10)
      }
    }

    // ── loop ─────────────────────────────────────────────────────────────────

    function loop(timestamp) {
      if (s.paused) {
        draw()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 20px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('PAUSED  —  press P to resume', W / 2, H / 2)
        s.raf = requestAnimationFrame(loop)
        return
      }

      let dt = 0
      if (s.lastTime !== null) {
        dt = (timestamp - s.lastTime) / 1000
        s.elapsed += dt
      }
      s.lastTime = timestamp

      update(dt)
      if (!s.dead) {
        draw()
        s.raf = requestAnimationFrame(loop)
      }
    }

    s.raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(s.raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [onGameOver, character])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="game-canvas"
      tabIndex={0}
    />
  )
}

export default Game
