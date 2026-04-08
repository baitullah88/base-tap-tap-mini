'use client';

import { useState, useEffect } from 'react';
import useSound from 'use-sound';

export default function Home() {
  const [points, setPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [tapEffect, setTapEffect] = useState<{ x: number; y: number; id: number }[]>([]);
  const [counter, setCounter] = useState(0);

  // Shop form states
  const [formReward, setFormReward] = useState<{ points: number; reward: string; color: string } | null>(null);
  const [baseAddress, setBaseAddress] = useState('');

  // Load points & leaderboard
  useEffect(() => {
    const savedPoints = localStorage.getItem('points');
    const savedBoard = localStorage.getItem('leaderboard');
    if (savedPoints) setPoints(Number(savedPoints));
    if (savedBoard) setLeaderboard(JSON.parse(savedBoard));
  }, []);

  // Update leaderboard automatically
  useEffect(() => {
    const newBoard = [...leaderboard.filter((p) => p !== points), points]
      .sort((a, b) => b - a)
      .slice(0, 10);
    setLeaderboard(newBoard);
    localStorage.setItem('points', points.toString());
    localStorage.setItem('leaderboard', JSON.stringify(newBoard));
  }, [points]);

  const [play] = useSound('/tap.mp3');

  const handleTap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    play();
    setPoints(points + 1);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    setTapEffect((prev) => [...prev, { x, y, id: counter }]);
    setCounter((c) => c + 1);
    setTimeout(() => setTapEffect((prev) => prev.filter((t) => t.id !== counter)), 800);
  };

  const rewardShop = [
    { points: 1_000_000, reward: '3 USDC', color: '#FF6B6B' },
    { points: 10_000_000, reward: '10 USDC', color: '#FFD93D' },
  ];

  const handleSubmitReward = () => {
    if (!baseAddress) return alert('Please enter your Base address!');
    const submissions = JSON.parse(localStorage.getItem('rewardSubmissions') || '[]');
    submissions.push({ reward: formReward?.reward, address: baseAddress, points: formReward?.points });
    localStorage.setItem('rewardSubmissions', JSON.stringify(submissions));
    alert(`Reward ${formReward?.reward} submitted!`);
    setFormReward(null);
    setBaseAddress('');
  };

  return (
    <div className="w-screen h-screen relative flex items-center justify-center overflow-hidden">

      {/* Animated Gradient Background + Logo */}
      <div className="absolute inset-0 bg-cover bg-center animate-gradientBlur" 
        style={{ backgroundImage: `url('/d3a1c569-fc38-4a60-b173-0138a29ebd97.png')`, filter: 'blur(2px) brightness(0.7)' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-white to-blue-300 opacity-70 animate-gradientBG"></div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* App Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          Base Tap Tap Mini App
        </h1>

        {/* Tap Button */}
        <button
          onClick={handleTap}
          className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full text-2xl sm:text-3xl md:text-4xl font-bold shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-150 flex items-center justify-center"
        >
          TAP
        </button>

        {/* Points */}
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white drop-shadow-md">
          Points: {points.toLocaleString()}
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6 mt-4">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="px-5 py-2 bg-white/20 text-white rounded-lg backdrop-blur-md hover:bg-white/30 transition"
          >
            Leaderboard
          </button>
          <button
            onClick={() => setShowShop(true)}
            className="px-5 py-2 bg-white/20 text-white rounded-lg backdrop-blur-md hover:bg-white/30 transition"
          >
            Shop
          </button>
        </div>
      </div>

      {/* Floating +1 effect */}
      {tapEffect.map((t) => (
        <span
          key={t.id}
          style={{ left: t.x, top: t.y }}
          className="absolute text-white font-bold text-xl animate-float pointer-events-none"
        >
          +1
        </span>
      ))}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-72 sm:w-80 md:w-96 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Leaderboard</h2>
            <ol className="list-decimal pl-5 space-y-2">
              {leaderboard.map((score, idx) => (
                <li key={idx} className="text-lg font-semibold">
                  {score.toLocaleString()} pts
                </li>
              ))}
            </ol>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="mt-6 w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-bold shadow-lg hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-72 sm:w-80 md:w-96 text-white shadow-xl relative">
            <h2 className="text-2xl font-bold mb-4 text-center">Reward Shop</h2>

            {!formReward ? (
              <ul className="space-y-3">
                {rewardShop.map((item, idx) => (
                  <li
                    key={idx}
                    className={`px-4 py-2 rounded-lg font-semibold text-lg cursor-pointer`}
                    style={{ backgroundColor: item.color }}
                    onClick={() => setFormReward(item)}
                  >
                    {item.points.toLocaleString()} pts = {item.reward}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-3">
                <p className="text-lg font-semibold">
                  Claim your reward: <span className="font-bold">{formReward.reward}</span>
                </p>
                <input
                  type="text"
                  placeholder="Enter your Base address"
                  className="w-full px-3 py-2 rounded-lg text-black font-semibold text-sm sm:text-base"
                  value={baseAddress}
                  onChange={(e) => setBaseAddress(e.target.value)}
                />
                <button
                  onClick={handleSubmitReward}
                  className="mt-2 w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-bold shadow-lg hover:opacity-90 transition"
                >
                  Submit
                </button>
                <button
                  onClick={() => setFormReward(null)}
                  className="mt-2 w-full py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={() => { setShowShop(false); setFormReward(null); }}
              className="absolute top-3 right-3 text-white text-xl font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tailwind animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
        .animate-float { animation: float 0.8s ease-out forwards; }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradientBG {
          background-size: 200% 200%;
          animation: gradientBG 8s ease infinite;
        }

        @keyframes gradientBlur {
          0% { filter: blur(2px) brightness(0.7) contrast(1); }
          50% { filter: blur(3px) brightness(0.75) contrast(1.05); }
          100% { filter: blur(2px) brightness(0.7) contrast(1); }
        }
        .animate-gradientBlur {
          animation: gradientBlur 10s ease infinite;
        }
      `}</style>
    </div>
  );
}