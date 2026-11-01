import { useEffect, useState } from "react";
import Modal from "../common/modal";
import BaseInput from "../common/input";
import { chunkTiling, MAX_CHUNKS_PER_FILE } from "../../../world/worker/export/exportSchem";
import type { ExportInfoResponse } from "../../../world/worker/export/exportSchem";

const CHUNK = 32;
const SECONDS_PER_CHUNK = 0.02; // 目安(チャンク生成+圧縮)

type Offset = { x: number; y: number; z: number };

interface Props {
  fetchInfo: () => Promise<ExportInfoResponse>;
  yChunkStart: number; // チャンク番号
  yChunkCount: number;
  defaultName: string;
  onExport: (
    name: string,
    margin: number,
    onProgress: (done: number, total: number) => void,
  ) => Promise<Offset[]>;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ fetchInfo, yChunkStart, yChunkCount, defaultName, onExport, isOpen, onClose }: Props) {
  const [name, setName] = useState(defaultName);
  const [margin, setMargin] = useState(1);
  const [info, setInfo] = useState<ExportInfoResponse | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ offsets: Offset[]; origin: Offset } | null>(null);
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState("");

  // 開くたびに、編集のある範囲を取り直す
  useEffect(() => {
    if (!isOpen) return;
    setInfo(null);
    setProgress(null);
    setResult(null);
    setState("idle");
    setError("");
    let alive = true;
    fetchInfo()
      .then((r) => { if (alive) setInfo(r); })
      .catch((e) => {
        if (alive) {
          setState("error");
          setError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      alive = false;
    };
    // fetchInfo は、毎回作り直されるので、依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const plan = (() => {
    if (!info || info.empty) return null;
    const m = Math.max(0, Math.floor(margin));
    const xs = info.maxCX - info.minCX + 1 + 2 * m;
    const zs = info.maxCZ - info.minCZ + 1 + 2 * m;
    const total = xs * zs * yChunkCount;
    const tooTall = yChunkCount > MAX_CHUNKS_PER_FILE;
    const { tx, tz } = chunkTiling(xs, yChunkCount, zs, MAX_CHUNKS_PER_FILE);
    return {
      m,
      total,
      tooTall,
      // 上の空のチャンクを落とすと、実際は、これ以下になることがある
      files: tooTall ? 0 : Math.ceil(xs / tx) * Math.ceil(zs / tz),
      sizeX: xs * CHUNK,
      sizeZ: zs * CHUNK,
      origin: {
        x: (info.minCX - m) * CHUNK,
        y: yChunkStart * CHUNK,
        z: (info.minCZ - m) * CHUNK,
      },
      seconds: Math.ceil(total * SECONDS_PER_CHUNK),
    };
  })();

  const running = state === "running";

  const handleExport = async () => {
    if (!plan || plan.tooTall) return;
    setState("running");
    setError("");
    setResult(null);
    setProgress({ done: 0, total: plan.total });
    try {
      const offsets = await onExport(name.trim() || "schem", plan.m, (done, total) => {
        if (done === total || done % 8 === 0) setProgress({ done, total });
      });
      setResult({ offsets, origin: plan.origin }); // 書き出し時点の基準を、保存しておく
      setState("done");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={running ? () => { } : onClose}>
      <div style={{ minWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Export .bloxdschem</h3>

        <fieldset disabled={running} style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="setting-group">
            <label htmlFor="exportName">name</label>
            <BaseInput type="text" id="exportName" value={name} onChange={(v: string) => setName(v)} />
          </div>
          <div className="setting-group">
            <label htmlFor="exportMargin">margin (chunks)</label>
            <BaseInput
              type="number"
              id="exportMargin"
              min={0}
              max={4}
              value={margin}
              onChange={(v: number) => setMargin(v)}
            />
          </div>
        </fieldset>

        {!info && state !== "error" && <div>範囲を調べています…</div>}
        {info?.empty && <div>まだ編集がありません。地形かバイオームを編集してから、書き出してください。</div>}

        {plan && (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>範囲: {plan.sizeX} × {plan.sizeZ} ブロック(x × z)、縦 {yChunkCount} チャンク</li>
            <li>チャンク数: {plan.total}(約 {plan.seconds} 秒)</li>
            <li>
              ファイル数: {plan.tooTall ? "-" : `最大 ${plan.files}(1つにつき最大 ${MAX_CHUNKS_PER_FILE} チャンク)`}
            </li>
            <li>
              全体の基準の座標(最小の角): x = {plan.origin.x}, y = {plan.origin.y}, z = {plan.origin.z}
            </li>
          </ul>
        )}
        {plan?.tooTall && (
          <div style={{ color: "#e5484d" }}>
            縦のチャンク数だけで、1ファイルの上限({MAX_CHUNKS_PER_FILE})を超えています。
          </div>
        )}
        {plan && plan.total > 3000 && !plan.tooTall && (
          <div style={{ color: "#d9a300" }}>チャンク数が多いので、時間がかかります。その間、画面は、更新されません。</div>
        )}

        {progress && state !== "idle" && (
          <div>
            <progress value={progress.done} max={progress.total} style={{ width: "100%" }} />
            <div>{progress.done} / {progress.total}</div>
          </div>
        )}

        {state === "done" && result && (
          <div>
            <div>書き出しました({result.offsets.length} ファイル)。貼る座標(ファイル順):</div>
            <ol start={0} style={{ margin: 0, paddingLeft: 24 }}>
              {result.offsets.map((o, i) => (
                <li key={i}>
                  {result.origin.x + o.x} {result.origin.y + o.y} {result.origin.z + o.z}
                </li>
              ))}
            </ol>
          </div>
        )}
        {state === "error" && <div style={{ color: "#e5484d" }}>失敗しました: {error}</div>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={handleExport} disabled={!plan || plan.tooTall || running}>
            {running ? "書き出し中…" : "Export"}
          </button>
          <button onClick={onClose} disabled={running}>Close</button>
        </div>
      </div>
    </Modal>
  );
}