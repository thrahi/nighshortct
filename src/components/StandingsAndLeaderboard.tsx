import React, { useState } from 'react';
import { Award, Plus, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { PhotoCardTemplateId, Player, Team } from '../types/tournament';
import {
  calculateEconomy,
  calculateStrikeRate,
  getMvpLeaders,
  getTopRunScorers,
  getTopWicketTakers,
  sortPointsTable,
  toBengaliNumber,
} from '../utils/tournamentLogic';

interface StandingsAndLeaderboardProps {
  teams: Team[];
  players: Player[];
  onRecordMatchResult: (result: {
    teamAId: string;
    teamBId: string;
    teamARuns: number;
    teamAOvers: number;
    teamBRuns: number;
    teamBOvers: number;
  }) => void;
  onGeneratePlayerCard: (player: Player, templateId: PhotoCardTemplateId) => void;
  onGenerateTeamCard: (team: Team) => void;
}

export const StandingsAndLeaderboard: React.FC<StandingsAndLeaderboardProps> = ({
  teams,
  players,
  onRecordMatchResult,
  onGeneratePlayerCard,
  onGenerateTeamCard,
}) => {
  const [leaderboardTab, setLeaderboardTab] = useState<'runs' | 'wickets' | 'mvp'>('runs');
  const [showMatchRecorder, setShowMatchRecorder] = useState(false);

  const [teamAId, setTeamAId] = useState(teams[0]?.id || '');
  const [teamBId, setTeamBId] = useState(teams[1]?.id || '');
  const [teamARuns, setTeamARuns] = useState('78');
  const [teamAOvers, setTeamAOvers] = useState('6');
  const [teamBRuns, setTeamBRuns] = useState('64');
  const [teamBOvers, setTeamBOvers] = useState('6');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sortedTeams = sortPointsTable(teams);
  const topRunScorers = getTopRunScorers(players, 8);
  const topWicketTakers = getTopWicketTakers(players, 8);
  const mvpLeaders = getMvpLeaders(players, 8);

  const handleSubmitMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAId || !teamBId || teamAId === teamBId) {
      setErrorMsg('দুটি ভিন্ন দল নির্বাচন করুন।');
      return;
    }
    const rA = Number(teamARuns);
    const oA = Number(teamAOvers);
    const rB = Number(teamBRuns);
    const oB = Number(teamBOvers);
    if (oA <= 0 || oB <= 0 || Number.isNaN(rA) || Number.isNaN(rB)) {
      setErrorMsg('সঠিক রান ও ওভার সংখ্যা লিখুন।');
      return;
    }
    onRecordMatchResult({
      teamAId,
      teamBId,
      teamARuns: rA,
      teamAOvers: oA,
      teamBRuns: rB,
      teamBOvers: oB,
    });
    setErrorMsg(null);
    setShowMatchRecorder(false);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Tournament Points Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              নূরিয়া হাজির হাট নাইট শর্টপিচ ক্রিকেট টুর্নামেন্ট ২০২৬ · সিজন ২
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              পূর্ণাঙ্গ পয়েন্ট টেবিল ও নেট রান রেট (NRR)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowMatchRecorder((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showMatchRecorder ? 'ফর্ম বন্ধ করুন' : 'নতুন ম্যাচের ফলাফল যোগ করুন'}
          </button>
        </div>

        {/* Match Result Entry Form */}
        {showMatchRecorder && (
          <form
            onSubmit={handleSubmitMatch}
            className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ম্যাচের ফলাফল এন্ট্রি করুন (পয়েন্ট ও নেট রান রেট স্বয়ংক্রিয়ভাবে হিসাব হবে)
            </h3>

            {errorMsg && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-500"
              >
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ১ম দল
                </label>
                <select
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ১ম দলের রান / ওভার
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={teamARuns}
                    onChange={(e) => setTeamARuns(e.target.value)}
                    placeholder="রান"
                    className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={teamAOvers}
                    onChange={(e) => setTeamAOvers(e.target.value)}
                    placeholder="ওভার"
                    className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ২য় দল
                </label>
                <select
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ২য় দলের রান / ওভার
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={teamBRuns}
                    onChange={(e) => setTeamBRuns(e.target.value)}
                    placeholder="রান"
                    className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={teamBOvers}
                    onChange={(e) => setTeamBOvers(e.target.value)}
                    placeholder="ওভার"
                    className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                ফলাফল সংরক্ষণ ও টেবিল আপডেট করুন
              </button>
            </div>
          </form>
        )}

        {/* High-Density Points Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">দল ও অধিনায়ক</th>
                <th className="py-3 px-3 text-right">ম্যাচ</th>
                <th className="py-3 px-3 text-right">জয়</th>
                <th className="py-3 px-3 text-right">হার</th>
                <th className="py-3 px-3 text-right">ড্র</th>
                <th className="py-3 px-3 text-right">NRR</th>
                <th className="py-3 px-3 text-right">পয়েন্ট</th>
                <th className="py-3 px-4 text-center">সাম্প্রতিক ফর্ম</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {sortedTeams.map((team, index) => {
                const isTop4 = index < 4;
                const formattedNrr =
                  team.netRunRate >= 0
                    ? `+${toBengaliNumber(team.netRunRate.toFixed(3))}`
                    : toBengaliNumber(team.netRunRate.toFixed(3));

                return (
                  <tr
                    key={team.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-slate-700 dark:text-slate-300">
                      {toBengaliNumber(index + 1)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {team.name}
                        {isTop4 && (
                          <span className="ml-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            · কোয়ালিফায়ার জোন
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        অধিনায়ক: {team.captainName}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {toBengaliNumber(team.played)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      {toBengaliNumber(team.won)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-rose-500">
                      {toBengaliNumber(team.lost)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-500">
                      {toBengaliNumber(team.tied)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                      {formattedNrr}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-extrabold text-base text-amber-600 dark:text-amber-400">
                      {toBengaliNumber(team.points)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1 font-mono text-xs">
                        {team.recentForm.map((f, i) => (
                          <span
                            key={`${team.id}-f-${i}`}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold ${
                              f === 'W'
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : f === 'L'
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : 'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onGenerateTeamCard(team)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap cursor-pointer"
                      >
                        টিম কার্ড বানান
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Tournament Player Leaderboard */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              টুর্নামেন্ট পরিসংখ্যান ও সেরা পারফর্মার তালিকা
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              সিজন ২ লিডারবোর্ড (ব্যাটিং, বোলিং ও এমভিপি)
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setLeaderboardTab('runs')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                leaderboardTab === 'runs'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              সর্বোচ্চ রান সংগ্রাহক
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab('wickets')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                leaderboardTab === 'wickets'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              সর্বোচ্চ উইকেট শিকারী
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab('mvp')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                leaderboardTab === 'mvp'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              টুর্নামেন্ট এমভিপি (MVP)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">র‍্যাংক</th>
                <th className="py-3 px-4">খেলোয়াড় ও দল</th>
                <th className="py-3 px-3 text-right">ম্যাচ</th>
                {leaderboardTab === 'runs' && (
                  <>
                    <th className="py-3 px-3 text-right">মোট রান</th>
                    <th className="py-3 px-3 text-right">স্ট্রাইক রেট</th>
                    <th className="py-3 px-3 text-right">ছক্কা / চার</th>
                    <th className="py-3 px-3 text-right">সেরা ইনিংস</th>
                  </>
                )}
                {leaderboardTab === 'wickets' && (
                  <>
                    <th className="py-3 px-3 text-right">মোট উইকেট</th>
                    <th className="py-3 px-3 text-right">ইকোনমি</th>
                    <th className="py-3 px-3 text-right">ওভার</th>
                    <th className="py-3 px-3 text-right">সেরা বোলিং</th>
                  </>
                )}
                {leaderboardTab === 'mvp' && (
                  <>
                    <th className="py-3 px-3 text-right">রান</th>
                    <th className="py-3 px-3 text-right">উইকেট</th>
                    <th className="py-3 px-3 text-right">ম্যাচ সেরা</th>
                    <th className="py-3 px-3 text-right">MVP পয়েন্ট</th>
                  </>
                )}
                <th className="py-3 px-4 text-right">ফটোকার্ড অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {(leaderboardTab === 'runs'
                ? topRunScorers
                : leaderboardTab === 'wickets'
                  ? topWicketTakers
                  : mvpLeaders
              ).map((player, idx) => {
                const sr = calculateStrikeRate(player.stats.runs, player.stats.ballsFaced);
                const econ = calculateEconomy(
                  player.stats.runsConceded,
                  player.stats.oversBowled
                );
                const mvpPoints =
                  'mvpScore' in player
                    ? (player as Player & { mvpScore: number }).mvpScore
                    : player.stats.runs + player.stats.wickets * 20;

                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-slate-700 dark:text-slate-300">
                      #{toBengaliNumber(idx + 1)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{player.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {player.teamName} · {player.role}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {toBengaliNumber(player.stats.matches)}
                    </td>

                    {leaderboardTab === 'runs' && (
                      <>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums font-extrabold text-amber-500">
                          {toBengaliNumber(player.stats.runs)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {toBengaliNumber(sr)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {toBengaliNumber(player.stats.sixes)} /{' '}
                          {toBengaliNumber(player.stats.fours)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {player.stats.highestScore}
                        </td>
                      </>
                    )}

                    {leaderboardTab === 'wickets' && (
                      <>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums font-extrabold text-emerald-500">
                          {toBengaliNumber(player.stats.wickets)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {toBengaliNumber(econ)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {toBengaliNumber(player.stats.oversBowled)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {player.stats.bestBowling}
                        </td>
                      </>
                    )}

                    {leaderboardTab === 'mvp' && (
                      <>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {toBengaliNumber(player.stats.runs)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {toBengaliNumber(player.stats.wickets)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {toBengaliNumber(player.stats.motmAwards)} বার
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums font-extrabold text-amber-500">
                          {toBengaliNumber(mvpPoints)}
                        </td>
                      </>
                    )}

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onGeneratePlayerCard(player, 'man_of_the_match')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 hover:underline whitespace-nowrap cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        সেরা খেলোয়াড় কার্ড
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
