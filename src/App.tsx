/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  INITIAL_CARD_CONFIG,
  INITIAL_FINANCE_RECORDS,
  INITIAL_FIXTURES,
  INITIAL_LIVE_MATCH,
  INITIAL_LOTTERY_BUYERS,
  INITIAL_PLAYERS,
  INITIAL_SPECIAL_AWARDS,
  INITIAL_TEAMS,
  TOURNAMENT_META,
} from './data/initialTournamentData';
import {
  FinanceRecord,
  FixtureMatch,
  LiveMatchState,
  LotteryBuyerRecord,
  PhotoCardConfig,
  PhotoCardTemplateId,
  Player,
  SpecialAwardRecord,
  Team,
} from './types/tournament';
import {
  applyMatchResultToStandings,
  buildCardConfigFromLiveMatch,
  buildCardConfigFromLotteryBuyer,
  buildCardConfigFromPlayer,
  buildCardConfigFromSpecialAward,
  buildCardConfigFromTeam,
  toBengaliNumber,
} from './utils/tournamentLogic';
import { PhotoCardStudio } from './components/PhotoCardStudio';
import { PlayerIntroDirectory } from './components/PlayerIntroDirectory';
import { LiveMatchCenter } from './components/LiveMatchCenter';
import { StandingsAndLeaderboard } from './components/StandingsAndLeaderboard';
import { SquadManager } from './components/SquadManager';
import { TournamentDirectorHub } from './components/TournamentDirectorHub';

type ActiveSection =
  | 'studio'
  | 'players'
  | 'director'
  | 'live'
  | 'standings'
  | 'squads';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('studio');
  const [isDark, setIsDark] = useState<boolean>(true);

  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem('nhc2026_v2_teams');
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('nhc2026_v2_players');
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [liveMatch, setLiveMatch] = useState<LiveMatchState>(() => {
    try {
      const saved = localStorage.getItem('nhc2026_v2_live_match');
      return saved ? JSON.parse(saved) : INITIAL_LIVE_MATCH;
    } catch {
      return INITIAL_LIVE_MATCH;
    }
  });

  const [specialAwards, setSpecialAwards] = useState<SpecialAwardRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nhc2026_v2_special_awards');
      return saved ? JSON.parse(saved) : INITIAL_SPECIAL_AWARDS;
    } catch {
      return INITIAL_SPECIAL_AWARDS;
    }
  });

  const [lotteryBuyers, setLotteryBuyers] = useState<LotteryBuyerRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nhc2026_v2_lottery_buyers');
      return saved ? JSON.parse(saved) : INITIAL_LOTTERY_BUYERS;
    } catch {
      return INITIAL_LOTTERY_BUYERS;
    }
  });

  const [fixtures, setFixtures] = useState<FixtureMatch[]>(() => {
    try {
      const saved = localStorage.getItem('nhc2026_v2_fixtures');
      return saved ? JSON.parse(saved) : INITIAL_FIXTURES;
    } catch {
      return INITIAL_FIXTURES;
    }
  });

  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nhc2026_v2_finance');
      return saved ? JSON.parse(saved) : INITIAL_FINANCE_RECORDS;
    } catch {
      return INITIAL_FINANCE_RECORDS;
    }
  });

  const [cardConfig, setCardConfig] = useState<PhotoCardConfig>(() => {
    try {
      const savedLogo = localStorage.getItem('nhc2026_default_logo_settings');
      if (savedLogo) {
        const parsed = JSON.parse(savedLogo);
        return {
          ...INITIAL_CARD_CONFIG,
          customLogoUrl: parsed.customLogoUrl ?? '',
          customLogoCrop: parsed.customLogoCrop ?? undefined,
          showLogo: parsed.showLogo ?? true,
        };
      }
    } catch {
      // Ignore parse errors
    }
    return INITIAL_CARD_CONFIG;
  });

  const handleSaveDefaultLogo = (logoSettings: {
    customLogoUrl: string;
    customLogoCrop?: PhotoCardConfig['customLogoCrop'];
    showLogo: boolean;
  }) => {
    try {
      localStorage.setItem(
        'nhc2026_default_logo_settings',
        JSON.stringify(logoSettings)
      );
    } catch {
      // Ignore storage quota errors
    }
    setCardConfig((prev) => ({
      ...prev,
      customLogoUrl: logoSettings.customLogoUrl,
      customLogoCrop: logoSettings.customLogoCrop,
      showLogo: logoSettings.showLogo,
    }));
  };

  useEffect(() => {
    try {
      localStorage.setItem('nhc2026_v2_teams', JSON.stringify(teams));
    } catch {
      // Ignore storage quota errors
    }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('nhc2026_v2_players', JSON.stringify(players));
    } catch {
      // Ignore storage quota errors
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem('nhc2026_v2_live_match', JSON.stringify(liveMatch));
    } catch {
      // Ignore storage quota errors
    }
  }, [liveMatch]);

  useEffect(() => {
    try {
      localStorage.setItem('nhc2026_v2_special_awards', JSON.stringify(specialAwards));
    } catch {
      // Ignore storage quota errors
    }
  }, [specialAwards]);

  useEffect(() => {
    try {
      localStorage.setItem('nhc2026_v2_lottery_buyers', JSON.stringify(lotteryBuyers));
    } catch {
      // Ignore storage quota errors
    }
  }, [lotteryBuyers]);

  useEffect(() => {
    try {
      localStorage.setItem('nhc2026_v2_fixtures', JSON.stringify(fixtures));
    } catch {
      // Ignore storage quota errors
    }
  }, [fixtures]);

  useEffect(() => {
    try {
      localStorage.setItem('nhc2026_v2_finance', JSON.stringify(financeRecords));
    } catch {
      // Ignore storage quota errors
    }
  }, [financeRecords]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleOpenTeamCardInStudio = (team: Team) => {
    setCardConfig((prev) => buildCardConfigFromTeam(prev, team));
    setActiveSection('studio');
  };

  const handleOpenPlayerCardInStudio = (
    player: Player,
    templateId: PhotoCardTemplateId
  ) => {
    setCardConfig((prev) => buildCardConfigFromPlayer(prev, player, templateId));
    setActiveSection('studio');
  };

  const handleOpenSpecialAwardInStudio = (award: SpecialAwardRecord) => {
    setCardConfig((prev) => buildCardConfigFromSpecialAward(prev, award));
    setActiveSection('studio');
  };

  const handleOpenLotteryBuyerInStudio = (buyer: LotteryBuyerRecord) => {
    setCardConfig((prev) => buildCardConfigFromLotteryBuyer(prev, buyer));
    setActiveSection('studio');
  };

  const handleSendLiveScoreToStudio = () => {
    const striker = players.find((p) => p.id === liveMatch.strikerId);
    const bowler = players.find((p) => p.id === liveMatch.currentBowlerId);
    setCardConfig((prev) =>
      buildCardConfigFromLiveMatch(prev, liveMatch, striker, bowler)
    );
    setActiveSection('studio');
  };

  const handleSendMotmToStudio = (player: Player) => {
    setCardConfig((prev) => ({
      ...buildCardConfigFromPlayer(prev, player, 'man_of_the_match'),
      matchTitle: `ম্যাচ নং ${toBengaliNumber(liveMatch.matchNumber)} · ${liveMatch.stage}`,
      team1Name: liveMatch.battingTeamName,
      team1Score: `${toBengaliNumber(liveMatch.runs)}/${toBengaliNumber(liveMatch.wickets)}`,
      team2Name: liveMatch.bowlingTeamName,
      team2Score: liveMatch.firstInningsSummary || '৮১/৪ (৬.০ ওভার)',
    }));
    setActiveSection('studio');
  };

  const handleRecordMatchResult = (result: {
    teamAId: string;
    teamBId: string;
    teamARuns: number;
    teamAOvers: number;
    teamBRuns: number;
    teamBOvers: number;
  }) => {
    setTeams((prev) => applyMatchResultToStandings(prev, result));
  };

  const handleUpdateFixtureStatus = (
    id: string,
    status: FixtureMatch['status'],
    resultNote?: string
  ) => {
    setFixtures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, resultNote } : f))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar Contract: Zone 1 (Single-line Brand) — Zone 2 (5 Single-line Nav Links) — Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('studio');
          }}
          className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          নূরিয়া হাজির হাট ক্রিকেট ২০২৬
        </a>

        <nav
          aria-label="প্রধান নেভিগেশন"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <button
            type="button"
            onClick={() => setActiveSection('studio')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'studio'
                ? 'text-amber-600 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            ফটোকার্ড স্টুডিও
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('director')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'director'
                ? 'text-amber-600 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            পুরস্কার, লটারি ও পরিচালনা
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('players')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'players'
                ? 'text-amber-600 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            খেলোয়াড় পরিচিতি
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('live')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'live'
                ? 'text-amber-600 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            লাইভ স্কোর
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('standings')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'standings' || activeSection === 'squads'
                ? 'text-amber-600 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            পয়েন্ট ও দলসমূহ
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('studio')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            ফটোকার্ড তৈরি করুন
          </button>
        </div>
      </header>

      {/* Secondary Context Bar & Quick Section Switcher */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{TOURNAMENT_META.season}</span>
              <span aria-hidden="true">·</span>
              <span>{TOURNAMENT_META.location}</span>
              <span aria-hidden="true">·</span>
              <span>মোট দল: {toBengaliNumber(teams.length)}টি</span>
              <span aria-hidden="true">·</span>
              <span>নিবন্ধিত খেলোয়াড়: {toBengaliNumber(players.length)} জন</span>
              <span aria-hidden="true">·</span>
              <span>ফটোকার্ড টেমপ্লেট: ১০টি (এস্থেটিক ও ব্রডকাস্ট)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 text-balance">
              {TOURNAMENT_META.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Section Switcher Bar (Always accessible for all 6 modules including Squads) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'studio', label: 'ফটোকার্ড স্টুডিও' },
                  { id: 'director', label: 'পুরস্কার, সেরা দর্শক ও লটারি' },
                  { id: 'players', label: 'খেলোয়াড় পরিচিতি' },
                  { id: 'squads', label: 'দল ও স্কোয়াড' },
                  { id: 'live', label: 'লাইভ স্কোর' },
                  { id: 'standings', label: 'পয়েন্ট ও লিডারবোর্ড' },
                ] as Array<{ id: ActiveSection; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    activeSection === tab.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'লাইট থিম চালু করুন' : 'ডার্ক থিম চালু করুন'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  লাইট মোড
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  ডার্ক মোড
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeSection === 'studio' && (
          <PhotoCardStudio
            config={cardConfig}
            onChangeConfig={setCardConfig}
            onSaveDefaultLogo={handleSaveDefaultLogo}
            teams={teams}
            players={players}
            liveMatch={liveMatch}
            specialAwards={specialAwards}
            lotteryBuyers={lotteryBuyers}
          />
        )}

        {activeSection === 'director' && (
          <TournamentDirectorHub
            specialAwards={specialAwards}
            onAddSpecialAward={(award) =>
              setSpecialAwards((prev) => [award, ...prev])
            }
            onGenerateAwardCard={handleOpenSpecialAwardInStudio}
            lotteryBuyers={lotteryBuyers}
            onAddLotteryBuyer={(buyer) =>
              setLotteryBuyers((prev) => [buyer, ...prev])
            }
            onGenerateLotteryCard={handleOpenLotteryBuyerInStudio}
            fixtures={fixtures}
            onAddFixture={(fix) => setFixtures((prev) => [...prev, fix])}
            onUpdateFixtureStatus={handleUpdateFixtureStatus}
            financeRecords={financeRecords}
            onAddFinanceRecord={(rec) =>
              setFinanceRecords((prev) => [rec, ...prev])
            }
            teams={teams}
          />
        )}

        {activeSection === 'players' && (
          <PlayerIntroDirectory
            players={players}
            teams={teams}
            onAddPlayer={(newPlayer) => setPlayers((prev) => [newPlayer, ...prev])}
            onGeneratePlayerCard={handleOpenPlayerCardInStudio}
          />
        )}

        {activeSection === 'live' && (
          <LiveMatchCenter
            liveMatch={liveMatch}
            onUpdateMatch={setLiveMatch}
            teams={teams}
            players={players}
            onSendLiveScoreToStudio={handleSendLiveScoreToStudio}
            onSendMotmToStudio={handleSendMotmToStudio}
            onCommitMatchToStandings={handleRecordMatchResult}
          />
        )}

        {activeSection === 'standings' && (
          <StandingsAndLeaderboard
            teams={teams}
            players={players}
            onRecordMatchResult={handleRecordMatchResult}
            onGeneratePlayerCard={handleOpenPlayerCardInStudio}
            onGenerateTeamCard={handleOpenTeamCardInStudio}
          />
        )}

        {activeSection === 'squads' && (
          <SquadManager
            teams={teams}
            players={players}
            onAddTeam={(newTeam) => setTeams((prev) => [...prev, newTeam])}
            onAddPlayer={(newPlayer) => setPlayers((prev) => [newPlayer, ...prev])}
            onGenerateTeamCard={handleOpenTeamCardInStudio}
            onGeneratePlayerCard={handleOpenPlayerCardInStudio}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>{TOURNAMENT_META.title} · পরিচালনা কমিটির অফিসিয়াল ওয়েব অ্যাপ</p>
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            {TOURNAMENT_META.slogan}
          </p>
        </div>
      </footer>
    </div>
  );
}
