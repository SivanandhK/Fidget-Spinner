# Fidget Spinner

A minimal, classy fidget spinner for the browser. Drag it, flick it, and watch it coast to a stop.

Built with plain HTML, CSS and vanilla JavaScript. No frameworks, no npm, no build step.

## Fidget Spinner

![Fidget Spinner](https://github.com/user-attachments/assets/7b937e0c-d248-4219-9a02-9a5cbb21d3b6)

## Features

- **Drag to rotate** with mouse or touch (Pointer Events)
- **Realistic inertia**: release mid-flick and the spinner keeps its speed, then slows with friction
- **Spacebar kick** for a strong spin in a random direction
- **Live stats**: current RPM and total rotations
- **Optional sound**: a soft tick generated with the Web Audio API (no audio files), off by default
- **Responsive**: the spinner scales to `min(70vw, 70vh, 420px)`
- **Reduced motion friendly**: respects `prefers-reduced-motion`

## Getting Started

No installation needed.

1. Download or clone this repository:
   ```bash
   git clone https://github.com/SivanandhK/Fidget-Spinner.git
   ```
2. Open the folder and double-click `index.html`.

It runs entirely locally in any modern browser (Chrome, Edge, Firefox, Safari).

## Controls

| Action | Result |
| --- | --- |
| Drag the spinner | Rotate it directly |
| Release while moving | It coasts with the speed you gave it |
| `Space` | Spin kick in a random direction |
| `Sound off / Sound on` (top right) | Toggle the tick sound |

## Project Structure

```
.
├── index.html   # Page markup and the inline SVG spinner
├── style.css    # Theme, layout and colour variables
├── script.js    # Drag, inertia, friction, stats and sound
└── README.md
```

## Customization

**Colours and size** are CSS variables at the top of `style.css`:

| Variable | Controls |
| --- | --- |
| `--bg` | Page background |
| `--accent` | Champagne gold for labels, stats and the mute button |
| `--spinner-fill` | Spinner body colour |
| `--spinner-highlight` | Thin metallic highlight stroke |
| `--ink` | Main text colour |
| `--muted` | Hint text colour |
| `--spinner-size` | Spinner size |

**Physics** constants are at the top of `script.js`:

| Constant | Controls |
| --- | --- |
| `FRICTION` | How quickly it slows down (closer to `1` means it spins longer) |
| `MAX_VEL` | Speed cap in rad/s |
| `STOP_VEL` | Speed below which it counts as stopped |
| `KICK` | Spacebar spin strength |

## How It Works

- The pointer angle around the spinner's centre is measured with `Math.atan2`.
- The angle change per move is wrapped to the shortest turn, so dragging across the ±180° boundary stays smooth.
- On release, the last measured angular velocity is kept. Each frame inside `requestAnimationFrame`, the angle advances by `velocity × dt`, then friction is applied in a frame-rate independent way.
- The AudioContext is created only after the first click or keypress, as browsers require.

## License

MIT. Feel free to use, tweak and share. Add a `LICENSE` file if you want it to be official.
