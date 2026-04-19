"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const CW = 360, CH = 200;
const GROUND = 160;
const DOG_X = 60, DOG_R = 16;
const GRAVITY = 0.55, JUMP_V = -11;
const OBS_W = 22;

type Obs = { x: number; h: number };

type GS = {
  playing: boolean; over: boolean; score: number;
  dogY: number; dogVY: number; onGround: boolean;
  obs: Obs[]; speed: number; frame: number;
};

function initGS(): GS {
  return { playing: false, over: false, score: 0, dogY: GROUND - DOG_R, dogVY: 0, onGround: true, obs: [], speed: 4, frame: 0 };
}

export default function MiniGameTab({ onEarnCoins }: { onEarnCoins: (n: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef     = useRef<GS>(initGS());
  const rafRef    = useRef(0);
  const [phase, setPhase]   = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore]   = useState(0);
  const [coins, setCoins]   = useState(0);

  const draw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const g = gsRef.current;

    // Sky
    ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, CW, CH);
    // Ground
    ctx.fillStyle = "#228B22"; ctx.fillRect(0, GROUND, CW, 8);
    ctx.fillStyle = "#8B4513"; ctx.fillRect(0, GROUND + 8, CW, CH - GROUND - 8);

    // Obstacles
    for (const o of g.obs) {
      ctx.fillStyle = "#7c3f00";
      ctx.beginPath(); ctx.roundRect(o.x, GROUND - o.h, OBS_W, o.h, 4); ctx.fill();
      // bone on top
      ctx.font = "14px serif"; ctx.fillText("🦴", o.x + 2, GROUND - o.h - 2);
    }

    // Dog body
    ctx.fillStyle = g.over ? "#aaa" : "#F5A623";
    ctx.beginPath(); ctx.arc(DOG_X, g.dogY, DOG_R, 0, Math.PI * 2); ctx.fill();
    // Ears
    ctx.fillStyle = "#D4880A";
    ctx.beginPath(); ctx.ellipse(DOG_X - 9, g.dogY - DOG_R + 4, 5, 7, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(DOG_X + 9, g.dogY - DOG_R + 4, 5, 7, 0.3, 0, Math.PI * 2); ctx.fill();
    // Eye
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(DOG_X + 6, g.dogY - 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(DOG_X + 7, g.dogY - 4, 1, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(DOG_X + 12, g.dogY + 3, 2, 0, Math.PI * 2); ctx.fill();
    // Tail (wagging when playing)
    if (!g.over) {
      const wag = Math.sin(g.frame / 5) * 8;
      ctx.strokeStyle = "#D4880A"; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(DOG_X - DOG_R, g.dogY); ctx.quadraticCurveTo(DOG_X - DOG_R - 12, g.dogY - 10 + wag, DOG_X - DOG_R - 8, g.dogY - 18 + wag); ctx.stroke();
    }

    // Score
    ctx.fillStyle = "#444"; ctx.font = "bold 14px sans-serif";
    ctx.fillText(`${g.score}m`, 10, 22);
    ctx.font = "11px sans-serif"; ctx.fillStyle = "#666";
    ctx.fillText(`🎟️ ${Math.floor(g.score / 5)}`, CW - 55, 22);
  }, []);

  const update = useCallback(() => {
    const g = gsRef.current;
    if (!g.playing || g.over) return;
    g.frame++;

    // Physics
    g.dogVY += GRAVITY;
    g.dogY  += g.dogVY;
    const groundLine = GROUND - DOG_R;
    if (g.dogY >= groundLine) { g.dogY = groundLine; g.dogVY = 0; g.onGround = true; }
    else { g.onGround = false; }

    // Obstacles
    for (const o of g.obs) o.x -= g.speed;
    g.obs = g.obs.filter(o => o.x > -OBS_W - 10);
    const spawnInterval = Math.max(55, 110 - Math.floor(g.score / 30));
    if (g.frame % spawnInterval === 0) {
      g.obs.push({ x: CW + 10, h: 22 + Math.random() * 52 });
    }

    // Collision (shrunk hitbox)
    const dLeft = DOG_X - DOG_R + 6, dRight = DOG_X + DOG_R - 4, dTop = g.dogY - DOG_R + 4;
    for (const o of g.obs) {
      if (dRight > o.x + 3 && dLeft < o.x + OBS_W - 3 && dTop < GROUND && g.dogY + DOG_R > GROUND - o.h) {
        g.over = true; g.playing = false;
        const earned = Math.floor(g.score / 5);
        setCoins(earned); onEarnCoins(earned);
        setPhase("over"); setScore(g.score);
        return;
      }
    }

    g.score++;
    g.speed = 4 + g.score / 350;
    if (g.frame % 10 === 0) setScore(g.score);
  }, [onEarnCoins]);

  const loop = useCallback(() => {
    update(); draw();
    if (gsRef.current.playing) rafRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  const startGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    gsRef.current = { ...initGS(), playing: true };
    setScore(0); setCoins(0); setPhase("playing");
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const jump = useCallback(() => {
    const g = gsRef.current;
    if (!g.playing) return;
    if (g.onGround || g.dogY > GROUND - DOG_R * 2.5) { g.dogVY = JUMP_V; g.onGround = false; }
  }, []);

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4">
      <div className="text-center pt-2">
        <h2 className="text-xl font-black text-gray-900">🏃 ちくわジャンプ！</h2>
        <p className="text-xs text-gray-500">障害物を避けて「ちくわ券」をゲット！(5m = 1券)</p>
      </div>

      <canvas
        ref={canvasRef}
        width={CW} height={CH}
        className="rounded-2xl shadow-md w-full"
        style={{ maxWidth: CW, touchAction: "none" }}
        onClick={phase === "playing" ? jump : undefined}
        onTouchStart={phase === "playing" ? (e) => { e.preventDefault(); jump(); } : undefined}
      />

      {phase === "idle" && (
        <button onClick={startGame} className="text-white font-black py-4 px-10 rounded-2xl text-lg shadow-md"
          style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}>
          スタート！
        </button>
      )}

      {phase === "playing" && (
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900 tabular-nums">{score}m</p>
          <p className="text-sm text-gray-500">タップでジャンプ！</p>
        </div>
      )}

      {phase === "over" && (
        <div className="bg-white rounded-2xl p-6 text-center w-full max-w-sm shadow-sm border border-gray-100">
          <p className="text-2xl font-black text-gray-900 mb-1">ゲームオーバー！</p>
          <p className="text-lg text-gray-600 mb-1">{score}m 走ったよ！</p>
          <p className="text-2xl font-bold mb-5" style={{ color: "#E1306C" }}>🎟️ +{coins} ちくわ券 ゲット！</p>
          <button onClick={startGame} className="text-white font-black py-3 px-8 rounded-2xl"
            style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}>
            もう一度！
          </button>
        </div>
      )}
    </div>
  );
}
