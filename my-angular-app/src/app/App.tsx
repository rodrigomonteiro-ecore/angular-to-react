import { useState, useMemo, useCallback } from 'react';
import styles from './App.module.css';

const DISK_COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f',
  '#2ecc71', '#1abc9c', '#3498db', '#9b59b6',
];

const PEG_LABELS = ['A', 'B', 'C'];

function App() {
  const [diskCount, setDiskCountState] = useState(4);
  const [pegs, setPegs] = useState<number[][]>(() => buildInitialPegs(4));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const minMoves = useMemo(() => Math.pow(2, diskCount) - 1, [diskCount]);

  const initGame = useCallback((n?: number) => {
    const count = n ?? diskCount;
    setPegs(buildInitialPegs(count));
    setSelected(null);
    setMoves(0);
    setWon(false);
  }, [diskCount]);

  const setDiskCount = useCallback((n: number) => {
    setDiskCountState(n);
    // Reset with new count directly
    setPegs(buildInitialPegs(n));
    setSelected(null);
    setMoves(0);
    setWon(false);
  }, []);

  const selectPeg = useCallback((pegIndex: number) => {
    if (won) return;

    if (selected === null) {
      if (pegs[pegIndex].length > 0) {
        setSelected(pegIndex);
      }
    } else {
      if (selected === pegIndex) {
        setSelected(null);
        return;
      }
      const fromPeg = pegs[selected];
      const toPeg = pegs[pegIndex];
      const topDisk = fromPeg[fromPeg.length - 1];

      if (toPeg.length === 0 || toPeg[toPeg.length - 1] > topDisk) {
        const newPegs = pegs.map(p => [...p]);
        newPegs[pegIndex].push(newPegs[selected].pop()!);
        setPegs(newPegs);
        setMoves(m => m + 1);
        setSelected(null);

        if (newPegs[2].length === diskCount) {
          setWon(true);
        }
      } else {
        setSelected(pegs[pegIndex].length > 0 ? pegIndex : null);
      }
    }
  }, [won, selected, pegs, diskCount]);

  const diskColor = (size: number): string => {
    return DISK_COLORS[(size - 1) % DISK_COLORS.length];
  };

  const diskWidth = (size: number): number => {
    const minPct = 20;
    const maxPct = 85;
    return minPct + ((size - 1) / ((diskCount - 1) || 1)) * (maxPct - minPct);
  };

  return (
    <div className={styles['hanoi-app']}>
      <header>
        <h1>Tower of Hanoi</h1>
        <p className={styles['subtitle']}>Move all disks to the rightmost peg. You can only place a smaller disk on a larger one.</p>
      </header>

      <div className={styles['controls']}>
        <div className={styles['control-group']}>
          <label>Disks</label>
          <div className={styles['disk-buttons']}>
            {[3, 4, 5, 6, 7].map(n => (
              <button
                key={n}
                className={`${styles['disk-btn']}${diskCount === n ? ` ${styles['active']}` : ''}`}
                onClick={() => setDiskCount(n)}
              >{n}</button>
            ))}
          </div>
        </div>

        <div className={styles['stats']}>
          <div className={styles['stat']}>
            <span className={styles['stat-label']}>Moves</span>
            <span className={styles['stat-value']}>{moves}</span>
          </div>
          <div className={styles['stat']}>
            <span className={styles['stat-label']}>Optimal</span>
            <span className={styles['stat-value']}>{minMoves}</span>
          </div>
        </div>

        <button className={styles['reset-btn']} onClick={() => initGame()}>↺ Reset</button>
      </div>

      {won && (
        <div className={styles['win-banner']}>
          🎉 Solved in {moves} moves!
          {moves === minMoves && (
            <span className={styles['perfect']}>Perfect score!</span>
          )}
        </div>
      )}

      <div className={styles['game-area']}>
        {pegs.map((peg, index) => (
          <div
            key={index}
            className={`${styles['peg-column']}${selected === index ? ` ${styles['selected']}` : ''}`}
            onClick={() => selectPeg(index)}
            aria-label={`Peg ${index + 1}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectPeg(index);
              }
            }}
          >
            <div className={styles['peg-label']}>{PEG_LABELS[index]}</div>

            <div className={styles['peg-area']}>
              <div className={styles['peg-rod']}></div>
              <div className={styles['peg-base']}></div>

              <div className={styles['disks-stack']}>
                {peg.map(disk => (
                  <div
                    key={disk}
                    className={styles['disk']}
                    style={{
                      width: `${diskWidth(disk)}%`,
                      backgroundColor: diskColor(disk),
                    }}
                    aria-label={`Disk ${disk}`}
                  >
                    <span className={styles['disk-label']}>{disk}</span>
                  </div>
                ))}
              </div>
            </div>

            {selected === index && (
              <div className={styles['selection-indicator']}>✦ selected</div>
            )}
          </div>
        ))}
      </div>

      <p className={styles['hint']}>
        {selected === null && !won && 'Click a peg to pick up its top disk.'}
        {selected !== null && 'Click another peg to place the disk, or click the same peg to deselect.'}
      </p>
    </div>
  );
}

function buildInitialPegs(n: number): number[][] {
  return [Array.from({ length: n }, (_, i) => n - i), [], []];
}

export default App;
