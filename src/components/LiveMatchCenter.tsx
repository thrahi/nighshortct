import React, { useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Flame,
  Plus,
  RotateCcw,
  Share2,
  Zap,
} from 'lucide-react';
import { LiveMatchState, Player, Team } from '../types/tournament';
import {
  applyBallEvent,
  BallEventCode,
  formatOversBengali,
  toBengaliNumber,
} from '../utils/tournamentLogic';

interface LiveMatchCenterProps {
  liveMatch: LiveMatchState;
  onUpdateMatch: React.Dispatch<React.SetStateAction<LiveMatchState>>;
  teams: Team[];
  players: Player[];
  onSendLiveScoreToStudio: () => void;
  onSendMotmToStudio: (player: Player) => void;
  onCommitMatchToStandings: (result: {
    teamAId: string;
    teamBId: string;
    teamARuns: number;
    teamAOvers: number;
    teamBRuns: number;
    teamBOvers: number;
  }) => void;
}

const BALL_BUTTONS: Array<{
  code: BallEventCode;
  label: string;
  sub: string;
  color: string;
}> = [
  { code: '0', label: '০', sub: 'ডট বল', color: 'bg-slate-800 hover:bg-slate-700 text-white' },
  { code: '1', label: '১', sub: 'সিঙ্গেল', color: 'bg-slate-800 hover:bg-slate-700 text-white' },
  { code: '2', label: '২', sub: 'ডাবলস', color: 'bg-slate-800 hover:bg-slate-700 text-white' },
  { code: '3', label: '৩', sub: 'তিন রান', color: 'bg-slate-800 hover:bg-slate-700 text-white' },
  {
    code: '4',
    label: '৪',
    sub: 'বাউন্ডারি',
    color: 'bg-blue-600 hover:bg-blue-500 text-white',
  },
  {
    code: '6',
    label: '৬',
    sub: 'বিশাল ছক্কা',
    color: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
  },
  {
    code: 'WD',
    label: 'WD',
    sub: 'ওয়াইড (+১)',
    color: 'bg-emerald-700 hover:bg-emerald-600 text-white',
  },
  {
    code: 'NB',
    label: 'NB',
    sub: 'নো বল (+১)',
    color: 'bg-emerald-700 hover:bg-emerald-600 text-white',
  },
  {
    code: 'W',
    label: 'W',
    sub: 'উইকেট পতন!',
    color: 'bg-rose-600 hover:bg-rose-500 text-white',
  },
];

export const LiveMatchCenter: React.FC<LiveMatchCenterProps> = ({
  liveMatch,
  onUpdateMatch,
  teams,
  players,
  onSendLiveScoreToStudio,
  onSendMotmToStudio,
  onCommitMatchToStandings,
}) => {
  const [customMomentText, setCustomMomentText] = useState('');
  const [motmPlayerId, setMotmPlayerId] = useState(liveMatch.strikerId);
  const [standingsSynced, setStandingsSynced] = useState(false);

  const striker = players.find((p) => p.id === liveMatch.strikerId) || players[0];
  const nonStriker = players.find((p) => p.id === liveMatch.nonStrikerId) || players[1];
  const bowler = players.find((p) => p.id === liveMatch.currentBowlerId) || players[2];

  const handleBallClick = (code: BallEventCode) => {
    onUpdateMatch((prev) =>
      applyBallEvent(prev, code, striker?.name || 'ব্যাটসম্যান', bowler?.name || 'বোলার')
    );
  };

  const handleAddCustomMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMomentText.trim()) return;
    const overStr = formatOversBengali(liveMatch.legalBalls);
    onUpdateMatch((prev) => ({
      ...prev,
      highlightHeadline: customMomentText.trim(),
      keyMoments: [
        {
          id: `custom-${Date.now()}`,
          overBall: overStr,
          type: 'MOMENT',
          title: 'গুরুত্বপূর্ণ মুহূর্ত',
          description: customMomentText.trim(),
          timestamp: 'এইমাত্র',
        },
        ...prev.keyMoments,
      ],
    }));
    setCustomMomentText('');
  };

  const handleFinalizeMatchToPointsTable = () => {
    const oversPlayed = Math.max(1, Number((liveMatch.legalBalls / 6).toFixed(2)));
    onCommitMatchToStandings({
      teamAId: liveMatch.battingTeamId,
      teamBId: liveMatch.bowlingTeamId,
      teamARuns: liveMatch.runs,
      teamAOvers: oversPlayed,
      teamBRuns: (liveMatch.targetRuns || 82) - 1,
      teamBOvers: liveMatch.totalOvers,
    });
    onUpdateMatch((prev) => ({
      ...prev,
      status: 'COMPLETED',
    }));
    setStandingsSynced(true);
    setTimeout(() => setStandingsSynced(false), 3000);
  };

  const currentRunRate =
    liveMatch.legalBalls > 0
      ? ((liveMatch.runs / liveMatch.legalBalls) * 6).toFixed(2)
      : '0.00';

  const ballsRemaining = Math.max(0, liveMatch.totalOvers * 6 - liveMatch.legalBalls);
  const runsNeeded =
    liveMatch.targetRuns !== null ? Math.max(0, liveMatch.targetRuns - liveMatch.runs) : 0;

  return (
    <div className="space-y-6">
      {/* Top Broadcast Scoreboard Card */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-500 font-bold">
              <span>ম্যাচ নং {toBengaliNumber(liveMatch.matchNumber)}</span>
              <span aria-hidden="true">·</span>
              <span>{liveMatch.stage}</span>
              <span aria-hidden="true">·</span>
              <span>
                {liveMatch.status === 'COMPLETED' ? 'ম্যাচ সমাপ্ত' : 'সরাসরি স্কোরবোর্ড'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {liveMatch.battingTeamName} বনাম {liveMatch.bowlingTeamName}
            </h2>
          </div>

          {/* 1-Click Photo Card Automation Triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSendLiveScoreToStudio}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              লাইভ স্কোর ফটোকার্ড তৈরি করুন
            </button>

            <button
              type="button"
              onClick={() => {
                const chosen = players.find((p) => p.id === motmPlayerId) || striker;
                if (chosen) onSendMotmToStudio(chosen);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              ম্যান অব দ্য ম্যাচ কার্ড বানান
            </button>
          </div>
        </div>

        {/* Main Score Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
          <div className="lg:col-span-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ব্যাটিং দল ({toBengaliNumber(liveMatch.totalOvers)} ওভারের শর্টপিচ ম্যাচ)
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {liveMatch.battingTeamName}
            </p>
            <div className="flex items-baseline gap-3">
              <span
                data-testid="live-score-runs"
                className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-amber-500"
              >
                {toBengaliNumber(liveMatch.runs)}/{toBengaliNumber(liveMatch.wickets)}
              </span>
              <span className="text-base font-mono tabular-nums text-slate-600 dark:text-slate-300">
                ({formatOversBengali(liveMatch.legalBalls)} /{' '}
                {toBengaliNumber(liveMatch.totalOvers)}.০ ওভার)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span>রান রেট (CRR): {toBengaliNumber(currentRunRate)}</span>
              <span aria-hidden="true"> · </span>
              <span>অতিরিক্ত: {toBengaliNumber(liveMatch.extras)}</span>
              {liveMatch.targetRuns && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span>টার্গেট: {toBengaliNumber(liveMatch.targetRuns)}</span>
                </>
              )}
            </p>
          </div>

          {/* Current Batter & Bowler Mini Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                স্ট্রাইকে ব্যাটসম্যান *
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {striker?.name}
              </p>
              <p className="text-base font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-1">
                {toBengaliNumber(liveMatch.strikerRuns)}*{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({toBengaliNumber(liveMatch.strikerBalls)} বল)
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                নন-স্ট্রাইকার
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {nonStriker?.name}
              </p>
              <p className="text-base font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-1">
                {toBengaliNumber(liveMatch.nonStrikerRuns)}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({toBengaliNumber(liveMatch.nonStrikerBalls)} বল)
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                বর্তমান বোলার
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {bowler?.name}
              </p>
              <p className="text-base font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-1">
                {toBengaliNumber(liveMatch.bowlerWickets)}/{toBengaliNumber(liveMatch.bowlerRuns)}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({formatOversBengali(liveMatch.bowlerBalls)} ওভার)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Equation & Recent Balls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            সমীকরণ: {liveMatch.highlightHeadline} (বাকি {toBengaliNumber(ballsRemaining)} বলে{' '}
            {toBengaliNumber(runsNeeded)} রান)
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">সাম্প্রতিক বল:</span>
            {liveMatch.recentBalls.map((b, idx) => (
              <span
                key={`${b}-${idx}`}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  b === '6'
                    ? 'bg-amber-500 text-slate-950'
                    : b === '4'
                      ? 'bg-blue-600 text-white'
                      : b === 'W'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {toBengaliNumber(b)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Two-Column Controls: Ball-by-Ball Scorer Left + Key Moments & Match Settings Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ball-by-Ball Quick Scorer Pad */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              বল-বাই-বল লাইভ স্কোরার কন্ট্রোল প্যাড
            </h3>
            <button
              type="button"
              onClick={() =>
                onUpdateMatch((prev) => ({
                  ...prev,
                  status: 'LIVE',
                  runs: 68,
                  wickets: 2,
                  legalBalls: 27,
                  strikerRuns: 44,
                  strikerBalls: 16,
                  highlightHeadline:
                    'জয়ের জন্য ৯ বলে ১৪ রান প্রয়োজন আলিফ মেমোরিয়াল স্পোর্টিং ক্লাবের!',
                }))
              }
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              রিসেট ডেমো ওভার
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
            {BALL_BUTTONS.map((btn) => (
              <button
                key={btn.code}
                type="button"
                onClick={() => handleBallClick(btn.code)}
                className={`p-3.5 rounded-xl font-bold transition-transform active:scale-95 flex flex-col items-center justify-center cursor-pointer ${btn.color}`}
              >
                <span className="text-xl font-mono">{btn.label}</span>
                <span className="text-[11px] opacity-90 mt-0.5">{btn.sub}</span>
              </button>
            ))}
          </div>

          {/* Active Players & Match Setup Selectors */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="scorer-striker-select"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
              >
                স্ট্রাইকার নির্বাচন
              </label>
              <select
                id="scorer-striker-select"
                value={liveMatch.strikerId}
                onChange={(e) =>
                  onUpdateMatch((prev) => ({ ...prev, strikerId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="scorer-bowler-select"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
              >
                বোলার নির্বাচন
              </label>
              <select
                id="scorer-bowler-select"
                value={liveMatch.currentBowlerId}
                onChange={(e) =>
                  onUpdateMatch((prev) => ({ ...prev, currentBowlerId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="motm-candidate-select"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
              >
                ম্যান অব দ্য ম্যাচ নির্বাচন
              </label>
              <select
                id="motm-candidate-select"
                value={motmPlayerId}
                onChange={(e) => setMotmPlayerId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.teamName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Complete Match & Sync to Points Table */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ম্যাচ শেষে ফলাফল পয়েন্ট টেবিলে যুক্ত করুন:
            </span>
            <button
              type="button"
              onClick={handleFinalizeMatchToPointsTable}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {standingsSynced
                ? 'পয়েন্ট টেবিল আপডেট হয়েছে!'
                : 'ম্যাচ সমাপ্ত ও পয়েন্ট টেবিলে যোগ করুন'}
            </button>
          </div>
        </div>

        {/* Right: Key Moments Feed & Custom Broadcast Alert Creator */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            ম্যাচের গুরুত্বপূর্ণ মুহূর্ত (Key Moments)
          </h3>

          <form onSubmit={handleAddCustomMoment} className="flex gap-2">
            <input
              type="text"
              value={customMomentText}
              onChange={(e) => setCustomMomentText(e.target.value)}
              placeholder="যেমন: হ্যাটট্রিক করলেন আরিফুল ইসলাম!"
              aria-label="গুরুত্বপূর্ণ মুহূর্ত লিখুন"
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              মুহূর্ত যোগ করুন
            </button>
          </form>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {liveMatch.keyMoments.map((km) => (
              <div
                key={km.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-amber-500">
                      ওভার {km.overBall}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-slate-900 dark:text-white">{km.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {km.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateMatch((prev) => ({
                      ...prev,
                      highlightHeadline: km.description,
                    }));
                    onSendLiveScoreToStudio();
                  }}
                  className="text-[11px] font-semibold text-amber-500 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  কার্ড বানান
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
