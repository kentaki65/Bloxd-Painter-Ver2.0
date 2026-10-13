import type { BiomeId } from "../../../core/types";
import type { BiomeOverrideLayer } from "../../../world/overrideLayers/BiomeOverrideLayer";
import type { HeightOverrideLayer } from "../../../world/overrideLayers/HeightOverrideLayer";
import { MAX_HISTORY } from "./historyLimit";

const NONE = -2147483648; // 「上書きなし」を表す印
const MAX_ENTRIES = 4_000_000; // 履歴の列の合計の上限

class IntList {
  data = new Int32Array(1024);
  length = 0;
  push(v: number) {
    if (this.length === this.data.length) {
      const next = new Int32Array(this.length * 2);
      next.set(this.data);
      this.data = next;
    }
    this.data[this.length++] = v;
  }
}

class Entries {
  x = new IntList();
  z = new IntList();
  prev = new IntList();
  seen = new Set<number>();

  get length() {
    return this.x.length;
  }

  // ストロークの中で、最初に触ったときの値だけを記録する
  add(x: number, z: number, prev: number | undefined) {
    const key = (x + 1048576) * 2097152 + (z + 1048576);
    if (this.seen.has(key)) return;
    this.seen.add(key);
    this.addRaw(x, z, prev ?? NONE);
  }

  addRaw(x: number, z: number, prev: number) {
    this.x.push(x);
    this.z.push(z);
    this.prev.push(prev);
  }
}

export class Stroke {
  id: number;
  h = new Entries();
  b = new Entries();
  constructor(id: number) {
    this.id = id;
  }
  get size() {
    return this.h.length + this.b.length;
  }
}

export class EditHistory {
  private undoStack: Stroke[] = [];
  private redoStack: Stroke[] = [];
  private current: Stroke | null = null;

  // 編集のたびに呼ぶ。新しいストロークなら、履歴に積む(やり直しは捨てる)
  begin(id: number): Stroke {
    const top = this.undoStack[this.undoStack.length - 1];
    if (this.current && this.current.id === id && top === this.current) return this.current;

    const s = new Stroke(id);
    this.undoStack.push(s);
    this.redoStack.length = 0;
    this.current = s;

    let total = 0;
    for (const t of this.undoStack) total += t.size;
    while (this.undoStack.length > MAX_HISTORY || (total > MAX_ENTRIES && this.undoStack.length > 1)) {
      total -= this.undoStack.shift()!.size;
    }
    return s;
  }

  // 一番新しいストロークが id と一致するときだけ、戻す(やり直す)
  revert(
    kind: "undo" | "redo",
    id: number,
    heightLayer: HeightOverrideLayer,
    biomeLayer: BiomeOverrideLayer,
  ): boolean {
    const from = kind === "undo" ? this.undoStack : this.redoStack;
    const to = kind === "undo" ? this.redoStack : this.undoStack;
    const top = from[from.length - 1];

    if (!top || top.id !== id) return false;
    from.pop();

    // 今の値を逆の記録に入れながら、前の値に戻す
    const inv = new Stroke(top.id);

    for (let i = 0; i < top.h.length; i++) {
      const x = top.h.x.data[i]!;
      const z = top.h.z.data[i]!;

      const prev = top.h.prev.data[i]!;
      inv.h.addRaw(x, z, heightLayer.get(x, z) ?? NONE);

      if (prev === NONE) heightLayer.clear(x, z);
      else heightLayer.set(x, z, prev);
    }

    for (let i = 0; i < top.b.length; i++) {
      const x = top.b.x.data[i]!;
      const z = top.b.z.data[i]!;

      const prev = top.b.prev.data[i]!;
      inv.b.addRaw(x, z, biomeLayer.get(x, z) ?? NONE);

      if (prev === NONE) biomeLayer.clear(x, z);
      else biomeLayer.set(x, z, prev as BiomeId);
    }
    
    to.push(inv);
    this.current = null;
    return true;
  }
}