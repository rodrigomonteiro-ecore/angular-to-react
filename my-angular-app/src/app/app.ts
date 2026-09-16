import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly diskCount = signal(4);
  readonly pegs = signal<number[][]>([[], [], []]);
  readonly selected = signal<number | null>(null);
  readonly moves = signal(0);
  readonly won = signal(false);

  readonly minMoves = computed(() => Math.pow(2, this.diskCount()) - 1);

  constructor() {
    this.initGame();
  }

  initGame(): void {
    const n = this.diskCount();
    this.pegs.set([Array.from({ length: n }, (_, i) => n - i), [], []]);
    this.selected.set(null);
    this.moves.set(0);
    this.won.set(false);
  }

  setDiskCount(n: number): void {
    this.diskCount.set(n);
    this.initGame();
  }

  selectPeg(pegIndex: number): void {
    if (this.won()) return;
    const pegs = this.pegs();
    const sel = this.selected();

    if (sel === null) {
      // Select only if peg has disks
      if (pegs[pegIndex].length > 0) {
        this.selected.set(pegIndex);
      }
    } else {
      if (sel === pegIndex) {
        // Deselect
        this.selected.set(null);
        return;
      }
      const fromPeg = pegs[sel];
      const toPeg = pegs[pegIndex];
      const topDisk = fromPeg[fromPeg.length - 1];

      if (toPeg.length === 0 || toPeg[toPeg.length - 1] > topDisk) {
        // Valid move
        const newPegs = pegs.map(p => [...p]);
        newPegs[pegIndex].push(newPegs[sel].pop()!);
        this.pegs.set(newPegs);
        this.moves.update(m => m + 1);
        this.selected.set(null);

        if (newPegs[2].length === this.diskCount()) {
          this.won.set(true);
        }
      } else {
        // Invalid — switch selection to clicked peg if it has disks
        this.selected.set(pegs[pegIndex].length > 0 ? pegIndex : null);
      }
    }
  }

  diskColor(size: number): string {
    const colors = [
      '#e74c3c', '#e67e22', '#f1c40f',
      '#2ecc71', '#1abc9c', '#3498db', '#9b59b6',
    ];
    return colors[(size - 1) % colors.length];
  }

  diskWidth(size: number): number {
    const n = this.diskCount();
    const minPct = 20;
    const maxPct = 85;
    return minPct + ((size - 1) / (n - 1 || 1)) * (maxPct - minPct);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
