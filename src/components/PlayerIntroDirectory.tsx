import React, { useState } from 'react';
import { Camera, Plus, Search, Sparkles, UserCheck, Users } from 'lucide-react';
import {
  PhotoCardTemplateId,
  Player,
  PlayerRole,
  Team,
} from '../types/tournament';
import {
  calculateEconomy,
  calculateStrikeRate,
  hasText,
  toBengaliNumber,
  validateNewPlayerInput,
} from '../utils/tournamentLogic';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerIntroDirectoryProps {
  players: Player[];
  teams: Team[];
  onAddPlayer: (newPlayer: Player) => void;
  onGeneratePlayerCard: (player: Player, templateId: PhotoCardTemplateId) => void;
}

const ROLES: Array<'সকল' | PlayerRole> = [
  'সকল',
  'ব্যাটসম্যান',
  'অলরাউন্ডার',
  'বোলার',
  'উইকেটকিপার',
];

export const PlayerIntroDirectory: React.FC<PlayerIntroDirectoryProps> = ({
  players,
  teams,
  onAddPlayer,
  onGeneratePlayerCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'সকল' | PlayerRole>('সকল');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New player form state
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [role, setRole] = useState<PlayerRole>('অলরাউন্ডার');
  const [jerseyNumber, setJerseyNumber] = useState('75');
  const [battingStyle, setBattingStyle] = useState('ডানহাতি ব্যাটসম্যান');
  const [bowlingStyle, setBowlingStyle] = useState('ডানহাতি মিডিয়াম ফাস্ট');
  const [hypeQuote, setHypeQuote] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'সকল' || p.role === selectedRole;
    const matchesTeam = selectedTeamId === 'all' || p.teamId === selectedTeamId;
    return matchesSearch && matchesRole && matchesTeam;
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNewPlayerInput({
      name,
      teamId,
      role,
      jerseyNumber,
    });
    if (!validation.valid) {
      setFormError(validation.error || 'সঠিক তথ্য দিন।');
      return;
    }

    const foundTeam = teams.find((t) => t.id === teamId) || teams[0];
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: name.trim(),
      teamId: foundTeam.id,
      teamName: foundTeam.name,
      role,
      jerseyNumber: jerseyNumber.trim() ? Number(jerseyNumber) : '',
      isCaptain: false,
      battingStyle,
      bowlingStyle,
      photoUrl: uploadedPhoto || '/assets/aistudio/image_7beb3144.png',
      photoCrop: uploadedPhoto
        ? undefined
        : { x: 0.242, y: 0.268, w: 0.495, h: 0.368 },
      stats: {
        matches: 1,
        runs: 0,
        ballsFaced: 0,
        sixes: 0,
        fours: 0,
        wickets: 0,
        oversBowled: 0,
        runsConceded: 0,
        motmAwards: 0,
        highestScore: '০',
        bestBowling: '-',
      },
      hypeQuote:
        hypeQuote.trim() ||
        `${foundTeam.name}-এর হয়ে সিজন ২ মাতিয়ে তুলতে আমি প্রস্তুত!`,
    };

    onAddPlayer(newPlayer);
    setName('');
    setHypeQuote('');
    setUploadedPhoto('');
    setFormError(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              সিজন ২ · খেলোয়াড় ডাটাবেস ও ওয়ান-ক্লিক পরিচিতি কার্ড
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              খেলোয়াড় পরিচিতি ডিরেক্টরি ({toBengaliNumber(filteredPlayers.length)} জন খেলোয়াড়)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন খেলোয়াড় যুক্ত করুন'}
          </button>
        </div>

        {/* Add Player Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreatePlayer}
            className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              নতুন খেলোয়াড় নিবন্ধন করুন (নিবন্ধনের পর এক ক্লিকে পরিচিতি কার্ড তৈরি হবে)
            </h3>

            {formError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-400"
              >
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="new-player-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  খেলোয়াড়ের পূর্ণ নাম *
                </label>
                <input
                  id="new-player-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: আবদুল্লা আল যোবায়ের"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-player-team"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  দল নির্বাচন করুন *
                </label>
                <select
                  id="new-player-team"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-player-role"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  পজিশন / ভূমিকা *
                </label>
                <select
                  id="new-player-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as PlayerRole)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="অলরাউন্ডার">অলরাউন্ডার</option>
                  <option value="ব্যাটসম্যান">ব্যাটসম্যান</option>
                  <option value="বোলার">বোলার</option>
                  <option value="উইকেটকিপার">উইকেটকিপার</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-player-jersey"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  জার্সি নম্বর (ঐচ্ছিক — না থাকলে খালি রাখুন)
                </label>
                <input
                  id="new-player-jersey"
                  type="text"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  placeholder="যেমন: 75 বা খালি রাখুন"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="new-player-quote"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  উৎসাহমূলক বার্তা (ফটোকার্ডের জন্য)
                </label>
                <input
                  id="new-player-quote"
                  type="text"
                  value={hypeQuote}
                  onChange={(e) => setHypeQuote(e.target.value)}
                  placeholder="খেলাধুলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-player-photo"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  খেলোয়াড়ের ছবি আপলোড
                </label>
                <input
                  id="new-player-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  খেলোয়াড় সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Role Segmented Filter */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedRole === r
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              aria-label="দল অনুযায়ী ফিল্টার"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">সকল দল ({toBengaliNumber(teams.length)}টি দল)</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খেলোয়াড় বা দলের নাম খুঁজুন..."
                aria-label="খেলোয়াড় খুঁজুন"
                className="w-full sm:w-64 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player Cards Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            কোনো খেলোয়াড় পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করুন অথবা নতুন খেলোয়াড় যুক্ত করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => {
            const sr = calculateStrikeRate(player.stats.runs, player.stats.ballsFaced);
            const econ = calculateEconomy(player.stats.runsConceded, player.stats.oversBowled);

            return (
              <article
                key={player.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
              >
                {/* Top Header Strip */}
                <div>
                  <div className="px-5 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>সিজন ২ · খেলোয়াড় পরিচিতি</span>
                    {hasText(player.jerseyNumber) && (
                      <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                        জার্সি #{toBengaliNumber(player.jerseyNumber)}
                      </span>
                    )}
                  </div>

                  {/* Player Info Body */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <PlayerAvatar
                        photoUrl={player.photoUrl}
                        photoCrop={player.photoCrop}
                        alt={player.name}
                        className="w-20 h-20 rounded-lg"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                          {player.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>পজিশন : {player.role}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{player.isCaptain ? 'দলীয় অধিনায়ক' : 'স্কোয়াড সদস্য'}</span>
                        </p>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 truncate">
                          দল : {player.teamName}
                        </p>
                      </div>
                    </div>

                    {/* Structured Stats Strip */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">মোট রান</p>
                        <p className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                          {toBengaliNumber(player.stats.runs)}{' '}
                          <span className="text-[11px] font-normal text-slate-400">
                            (SR {toBengaliNumber(sr)})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">উইকেট</p>
                        <p className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                          {toBengaliNumber(player.stats.wickets)}{' '}
                          <span className="text-[11px] font-normal text-slate-400">
                            ({econ > 0 ? `Econ ${toBengaliNumber(econ)}` : '-'})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">ছক্কা / চার</p>
                        <p className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                          {toBengaliNumber(player.stats.sixes)} / {toBengaliNumber(player.stats.fours)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer: 1-Click Photo Card Generation */}
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onGeneratePlayerCard(player, 'player_intro')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    পরিচিতি কার্ড বানান
                  </button>
                  <button
                    type="button"
                    onClick={() => onGeneratePlayerCard(player, 'player_hype')}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    উৎসাহ কার্ড
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
