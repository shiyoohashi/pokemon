"use client";

import { useState } from "react";
import { questions, resultLevels } from "../data/questions";

type Phase = "welcome" | "quiz" | "result";

export default function QuizApp() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.answers.map((a) => a.score)), 0);

  const handleAnswerSelect = (index: number) => {
    if (isAnimating) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null || isAnimating) return;

    setIsAnimating(true);
    const score = questions[currentQuestion].answers[selectedAnswer].score;
    const newTotal = totalScore + score;

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setTotalScore(newTotal);
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnimating(false);
      } else {
        setTotalScore(newTotal);
        setPhase("result");
        setIsAnimating(false);
      }
    }, 300);
  };

  const handleReset = () => {
    setPhase("welcome");
    setCurrentQuestion(0);
    setTotalScore(0);
    setSelectedAnswer(null);
    setIsAnimating(false);
  };

  const getResult = () => {
    const percentage = Math.round((totalScore / maxScore) * 100);
    const level = resultLevels.find((r) => percentage >= r.min) ?? resultLevels[resultLevels.length - 1];
    return { percentage, level };
  };

  if (phase === "welcome") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-8xl mb-4">🐶</div>
          <h1 className="text-3xl font-bold text-amber-700 mb-2">愛犬との相性診断</h1>
          <p className="text-amber-600 mb-2 text-sm">8つの質問に答えて</p>
          <p className="text-amber-800 font-semibold mb-8">あなたと愛犬の相性を調べよう！</p>
          <div className="flex flex-col gap-3 mb-8 text-left bg-amber-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <span>✅</span>
              <span>質問は全部で 8問</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <span>✅</span>
              <span>直感で答えてね！</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <span>✅</span>
              <span>最後に相性パーセントを表示</span>
            </div>
          </div>
          <button
            onClick={() => setPhase("quiz")}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors shadow-md"
          >
            診断スタート 🐾
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const { percentage, level } = getResult();
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-amber-500 font-medium mb-2 text-sm">診断結果</p>
          <div className="text-6xl mb-3">{level.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{level.title}</h2>

          <div className="mb-6">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500 mb-1">
              {percentage}%
            </div>
            <p className="text-gray-500 text-sm">相性度</p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 mb-8 text-left">
            <p className="text-amber-800 text-sm leading-relaxed">{level.description}</p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors shadow-md"
          >
            もう一度診断する 🔄
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-amber-600 mb-2">
            <span>問 {currentQuestion + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{q.emoji}</div>
          <h2 className="text-lg font-bold text-gray-800">{q.text}</h2>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {q.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`text-left w-full py-3 px-4 rounded-2xl border-2 transition-all font-medium text-sm ${
                selectedAnswer === index
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              <span className="mr-2">{["A", "B", "C", "D"][index]}.</span>
              {answer.text}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className={`w-full font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-md ${
            selectedAnswer !== null
              ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {currentQuestion < questions.length - 1 ? "次の質問へ →" : "結果を見る 🐾"}
        </button>
      </div>
    </div>
  );
}
