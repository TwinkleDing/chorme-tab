/** 从 localStorage 读取最佳成绩 */
function loadBest(tier: number): { time: number; steps: number } | null {
  try {
    const raw = localStorage.getItem(`puzzle_best_${tier}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBest(tier: number, time: number, steps: number): void {
  localStorage.setItem(`puzzle_best_${tier}`, JSON.stringify({ time, steps }));
}

export default class Puzzle {
  private tier: number;
  private width: number;
  private blockSize: number;
  private img: string;

  public playing: boolean = false;
  public over: boolean = false;

  private count: number = 0;
  private elapsed: number = 0;
  private blockList: Block[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private onChange: (() => void) | null = null;

  public bestTime: number | null = null;
  public bestSteps: number | null = null;

  constructor(img: string, tier: number, width: number) {
    this.img = img;
    this.tier = tier || 3;
    this.width = width || 600;
    this.blockSize = this.width / this.tier;
    const best = loadBest(this.tier);
    this.bestTime = best?.time ?? null;
    this.bestSteps = best?.steps ?? null;
    this.init();
  }

  private init(): void {
    const total = this.tier * this.tier;
    this.blockList = [];
    for (let i = 0; i < this.tier; i++) {
      for (let j = 0; j < this.tier; j++) {
        const coordinate: [number, number] = [i * this.blockSize, j * this.blockSize];
        const isImg = i * this.tier + j + 1 !== total;
        this.blockList.push(new Block(isImg, coordinate));
      }
    }
    this.notify();
  }

  public end(): void {
    this.clearTimer();
    this.playing = false;
    this.notify();
  }

  public reset(): void {
    this.clearTimer();
    this.playing = false;
    this.over = false;
    this.count = 0;
    this.elapsed = 0;
    this.blockList.forEach((item) => item.setRandom(item.getCoordinate()));
    this.notify();
  }

  /** 模拟 N 次合法移动来打乱（保证可解） */
  private randomBlock(shuffleMoves: number): void {
    this.blockList.forEach((item) => item.setRandom(item.getCoordinate()));

    const emptyIdx = this.blockList.length - 1;
    const empty = this.blockList[emptyIdx];
    let lastEmptyPos = [...empty.getRandom()];

    for (let n = 0; n < shuffleMoves; n++) {
      const [ex, ey] = empty.getRandom();
      const neighbors = this.getNeighborBlocks(ex, ey, lastEmptyPos);
      if (neighbors.length === 0) break;

      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      lastEmptyPos = [...empty.getRandom()];
      const pickPos = [...pick.getRandom()];
      pick.setRandom([ex, ey]);
      empty.setRandom(pickPos as [number, number]);
    }
  }

  private getNeighborBlocks(x: number, y: number, excludePos: number[]): Block[] {
    const result: Block[] = [];
    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of directions) {
      const nx = x + dx * this.blockSize;
      const ny = y + dy * this.blockSize;
      if (nx === excludePos[0] && ny === excludePos[1]) continue;
      if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.width) continue;
      const found = this.blockList.find(
        (b) => b.getRandom()[0] === nx && b.getRandom()[1] === ny
      );
      if (found) result.push(found);
    }
    return result;
  }

  public start(): void {
    if (this.playing) return;

    const shuffleCount = this.tier * this.tier * 20;
    this.randomBlock(shuffleCount);

    this.count = 0;
    this.elapsed = 0;
    this.playing = true;
    this.over = false;

    const startTime = Date.now();
    this.timer = setInterval(() => {
      this.elapsed = Date.now() - startTime;
      this.notify();
    }, 50);

    this.notify();
  }

  public blockClick(item: Block): void {
    if (!this.playing || this.over) return;
    const [x, y] = item.getRandom();
    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const empty = this.blockList[this.blockList.length - 1];
    const [ex, ey] = empty.getRandom();

    for (const [dx, dy] of directions) {
      if (x + dx * this.blockSize === ex && y + dy * this.blockSize === ey) {
        empty.setRandom([x, y]);
        item.setRandom([ex, ey]);
        this.count++;
        this.checkWin();
        this.notify();
        return;
      }
    }
  }

  private checkWin(): void {
    for (const item of this.blockList) {
      const [cx, cy] = item.getCoordinate();
      const [rx, ry] = item.getRandom();
      if (cx !== rx || cy !== ry) return;
    }
    this.over = true;
    this.clearTimer();
    const prev = loadBest(this.tier);
    if (!prev || this.elapsed < prev.time || (this.elapsed === prev.time && this.count < prev.steps)) {
      saveBest(this.tier, this.elapsed, this.count);
      this.bestTime = this.elapsed;
      this.bestSteps = this.count;
    }
  }

  public destroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private notify(): void {
    if (this.onChange) this.onChange();
  }

  public puzzleChange(cb: (puzzle: Puzzle) => void): void {
    this.onChange = () => cb(this);
  }

  getTier(): number { return this.tier; }
  getImg(): string { return this.img; }
  getItemSize(): number { return this.blockSize; }
  getCount(): number { return this.count; }
  getElapsed(): number { return this.elapsed; }
  getBlockList(): readonly Block[] { return this.blockList; }
  getEmptyBlock(): Block { return this.blockList[this.blockList.length - 1]; }
  getBestTime(): number | null { return this.bestTime; }
  getBestSteps(): number | null { return this.bestSteps; }
  getPlaying(): boolean { return this.playing; }
  getOver(): boolean { return this.over; }

  public moveDirection(dx: number, dy: number): void {
    if (!this.playing || this.over) return;
    const empty = this.blockList[this.blockList.length - 1];
    const [ex, ey] = empty.getRandom();
    const tx = ex + dx * this.blockSize;
    const ty = ey + dy * this.blockSize;
    const target = this.blockList.find(
      (b) => b.getIsImg() && b.getRandom()[0] === tx && b.getRandom()[1] === ty
    );
    if (target) this.blockClick(target);
  }
}

export class Block {
  private readonly isImg: boolean;
  private readonly coordinate: [number, number];
  private random: [number, number];

  constructor(isImg: boolean, coordinate: [number, number]) {
    this.isImg = isImg;
    this.coordinate = coordinate;
    this.random = coordinate;
  }

  getIsImg(): boolean { return this.isImg; }
  getCoordinate(): [number, number] { return this.coordinate; }
  getRandom(): [number, number] { return this.random; }
  setRandom(random: [number, number]): void { this.random = random; }
}
