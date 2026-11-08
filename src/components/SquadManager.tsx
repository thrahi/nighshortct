import React, { useState } from 'react';
import { Camera, Plus, Shield, Sparkles, UserPlus, Users } from 'lucide-react';
import {
  PhotoCardTemplateId,
  Player,
  PlayerRole,
  Team,
} from '../types/tournament';
import {
  hasText,
  toBengaliNumber,
  validateNewPlayerInput,
  validateNewTeamInput,
} from '../utils/tournamentLogic';

interface SquadManagerProps {
  teams: Team[];
  players: Player[];
  onAddTeam: (team: Team) => void;
  onAddPlayer: (player: Player) => void;
  onGenerateTeamCard: (team: Team) => void;
  onGeneratePlayerCard: (player: Player, templateId: PhotoCardTemplateId) => void;
}

export const SquadManager: React.FC<SquadManagerProps> = ({
  teams,
  players,
  onAddTeam,
  onAddPlayer,
  onGenerateTeamCard,
  onGeneratePlayerCard,
}) => {
  const [activeTeamId, setActiveTeamId] = useState<string>(teams[0]?.id || '');
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [showAddSquadPlayer, setShowAddSquadPlayer] = useState(false);

  // Add Team State
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [villageOrArea, setVillageOrArea] = useState('');
  const [teamSlogan, setTeamSlogan] = useState('');
  const [captainPhoto, setCaptainPhoto] = useState('');
  const [teamError, setTeamError] = useState<string | null>(null);

  // Add Player to Squad State
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<PlayerRole>('অলরাউন্ডার');
  const [playerJersey, setPlayerJersey] = useState('12');
  const [playerError, setPlayerError] = useState<string | null>(null);

  const selectedTeam = teams.find((t) => t.id === activeTeamId) || teams[0];
  const teamSquad = players.filter((p) => p.teamId === selectedTeam?.id);

  const handleCaptainPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCaptainPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateNewTeamInput({ name: teamName, captainName });
    if (!check.valid) {
      setTeamError(check.error || 'সঠিক তথ্য দিন।');
      return;
    }

    const newTeamId = `team-${Date.now()}`;
    const createdTeam: Team = {
      id: newTeamId,
      name: teamName.trim(),
      shortName: shortName.trim() || 'NHC',
      captainName: captainName.trim(),
      captainPhotoUrl: captainPhoto || '/assets/aistudio/image_fe6bf5ca.png',
      captainPhotoCrop: captainPhoto
        ? undefined
        : { x: 0.745, y: 0.758, w: 0.218, h: 0.218 },
      primaryColor: '#1d4ed8',
      secondaryColor: '#f59e0b',
      managerName: managerName.trim() || 'পরিচালনা পর্ষদ',
      villageOrArea: villageOrArea.trim() || 'নূরিয়া হাজির হাট',
      slogan: teamSlogan.trim() || 'জয়ের লক্ষ্যে অবিচল',
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      runsFor: 0,
      oversFor: 0,
      runsAgainst: 0,
      oversAgainst: 0,
      netRunRate: 0,
      recentForm: [],
    };

    onAddTeam(createdTeam);

    // Also add the captain to the player database automatically
    const captainPlayer: Player = {
      id: `cap-${Date.now()}`,
      name: captainName.trim(),
      teamId: newTeamId,
      teamName: createdTeam.name,
      role: 'অলরাউন্ডার',
      jerseyNumber: 1,
      isCaptain: true,
      battingStyle: 'ডানহাতি ব্যাটসম্যান',
      bowlingStyle: 'ডানহাতি মিডিয়াম',
      photoUrl: createdTeam.captainPhotoUrl,
      photoCrop: createdTeam.captainPhotoCrop,
      stats: {
        matches: 0,
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
      hypeQuote: `${createdTeam.name}-এর অধিনায়ক হিসেবে সিজন ২-এ সেরা খেলার প্রত্যয়!`,
    };
    onAddPlayer(captainPlayer);

    setActiveTeamId(newTeamId);
    setTeamName('');
    setShortName('');
    setCaptainName('');
    setManagerName('');
    setVillageOrArea('');
    setTeamSlogan('');
    setCaptainPhoto('');
    setTeamError(null);
    setShowAddTeamForm(false);
  };

  const handleAddSquadMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    const check = validateNewPlayerInput({
      name: playerName,
      teamId: selectedTeam.id,
      role: playerRole,
      jerseyNumber: playerJersey,
    });
    if (!check.valid) {
      setPlayerError(check.error || 'সঠিক তথ্য দিন।');
      return;
    }

    const newMember: Player = {
      id: `sq-${Date.now()}`,
      name: playerName.trim(),
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      role: playerRole,
      jerseyNumber: playerJersey.trim() ? Number(playerJersey) : '',
      isCaptain: false,
      battingStyle: 'ডানহাতি',
      bowlingStyle: 'ডানহাতি মিডিয়াম',
      photoUrl: selectedTeam.captainPhotoUrl,
      photoCrop: selectedTeam.captainPhotoCrop,
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
      hypeQuote: `${selectedTeam.name}-এর হয়ে মাঠে নামতে প্রস্তুত!`,
    };

    onAddPlayer(newMember);
    setPlayerName('');
    setPlayerError(null);
    setShowAddSquadPlayer(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Teams Overview & Add New Team Trigger */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              টুর্নামেন্ট দল নিবন্ধন ও অধিনায়ক ফটোকার্ড অটোমেশন
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              অংশগ্রহণকারী দল ও স্কোয়াড ম্যানেজমেন্ট ({toBengaliNumber(teams.length)}টি দল)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAddTeamForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddTeamForm ? 'ফর্ম বন্ধ করুন' : 'নতুন দল ও অধিনায়ক যুক্ত করুন'}
          </button>
        </div>

        {/* New Team Registration Form */}
        {showAddTeamForm && (
          <form
            onSubmit={handleCreateTeam}
            className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              নতুন দল নিবন্ধন করুন (নিবন্ধনের সাথে সাথেই দলীয় অধিনায়কের ফটোকার্ড তৈরি করা যাবে)
            </h3>

            {teamError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-500"
              >
                {teamError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="new-team-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  দলের পূর্ণ নাম *
                </label>
                <input
                  id="new-team-name"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="যেমন: আলিফ মেমোরিয়াল স্পোর্টিং ক্লাব"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-team-captain"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  দলীয় অধিনায়কের নাম *
                </label>
                <input
                  id="new-team-captain"
                  type="text"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  placeholder="যেমন: সম্রাট আব্দুর রহমান"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-team-area"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  এলাকা / গ্রাম
                </label>
                <input
                  id="new-team-area"
                  type="text"
                  value={villageOrArea}
                  onChange={(e) => setVillageOrArea(e.target.value)}
                  placeholder="নূরিয়া হাজির হাট"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-team-manager"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  টিম ম্যানেজারের নাম
                </label>
                <input
                  id="new-team-manager"
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="কামরুল হাসান"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-team-photo"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  অধিনায়কের ছবি আপলোড
                </label>
                <input
                  id="new-team-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleCaptainPhotoUpload}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  দল সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Main Split: Team Selector Cards Left + Active Team Squad Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Participating Teams List */}
        <div className="lg:col-span-5 space-y-3">
          {teams.map((team) => {
            const isSelected = team.id === selectedTeam?.id;
            const squadCount = players.filter((p) => p.teamId === team.id).length;

            return (
              <div
                key={team.id}
                className={`rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTeamId(team.id)}
                    className="text-left flex-1 cursor-pointer"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>অধিনায়ক: {team.captainName}</span>
                      <span aria-hidden="true"> · </span>
                      <span>স্কোয়াড: {toBengaliNumber(squadCount)} জন</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>এলাকা: {team.villageOrArea}</span>
                      <span aria-hidden="true"> · </span>
                      <span>ম্যানেজার: {team.managerName}</span>
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onGenerateTeamCard(team)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    অধিনায়ক ফটোকার্ড
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Team Squad & Quick Member Adder */}
        {selectedTeam && (
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  দলীয় স্কোয়াড তালিকা · {selectedTeam.villageOrArea}
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedTeam.name} — স্কোয়াড ({toBengaliNumber(teamSquad.length)} জন)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  দলীয় অধিনায়ক: <strong className="text-slate-800 dark:text-slate-200">{selectedTeam.captainName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onGenerateTeamCard(selectedTeam)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  দলের ফটোকার্ড বানান
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSquadPlayer((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  স্কোয়াডে খেলোয়াড় যোগ
                </button>
              </div>
            </div>

            {showAddSquadPlayer && (
              <form
                onSubmit={handleAddSquadMember}
                className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-3"
              >
                {playerError && (
                  <p role="alert" className="text-xs font-semibold text-rose-500">
                    {playerError}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="খেলোয়াড়ের নাম লিখুন..."
                      aria-label="স্কোয়াড খেলোয়াড়ের নাম"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      aria-label="স্কোয়াড খেলোয়াড়ের পজিশন"
                      value={playerRole}
                      onChange={(e) => setPlayerRole(e.target.value as PlayerRole)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="অলরাউন্ডার">অলরাউন্ডার</option>
                      <option value="ব্যাটসম্যান">ব্যাটসম্যান</option>
                      <option value="বোলার">বোলার</option>
                      <option value="উইকেটকিপার">উইকেটকিপার</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {teamSquad.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {member.name}
                      </span>
                      {member.isCaptain && (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          · দলীয় অধিনায়ক
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>পজিশন: {member.role}</span>
                      {hasText(member.jerseyNumber) && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span>জার্সি #{toBengaliNumber(member.jerseyNumber)}</span>
                        </>
                      )}
                      <span aria-hidden="true"> · </span>
                      <span>রান: {toBengaliNumber(member.stats.runs)}</span>
                      <span aria-hidden="true"> · </span>
                      <span>উইকেট: {toBengaliNumber(member.stats.wickets)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onGeneratePlayerCard(member, 'player_intro')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      পরিচিতি কার্ড
                    </button>
                    <button
                      type="button"
                      onClick={() => onGeneratePlayerCard(member, 'player_hype')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      উৎসাহ কার্ড
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
