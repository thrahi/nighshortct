import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyBallEvent,
  applyMatchResultToStandings,
  buildCardConfigFromPlayer,
  calculateEconomy,
  calculateFinanceSummary,
  calculateNetRunRate,
  calculateStrikeRate,
  formatOvers,
  formatOversBengali,
  getTopLotteryBuyers,
  hasText,
  sortPointsTable,
  toBengaliNumber,
  validateNewPlayerInput,
  validateNewTeamInput,
} from './tournamentLogic';
import { INITIAL_CARD_CONFIG } from '../data/initialTournamentData';
import { LiveMatchState, Player, Team } from '../types/tournament';

test('toBengaliNumber and hasText handle digits and empty strings accurately', () => {
  assert.equal(toBengaliNumber(2026), '২০২৬');
  assert.equal(toBengaliNumber('75'), '৭৫');
  assert.equal(hasText(''), false);
  assert.equal(hasText('   '), false);
  assert.equal(hasText(undefined), false);
  assert.equal(hasText('১০'), true);
});

test('formatOvers and formatOversBengali compute completed overs and balls', () => {
  assert.equal(formatOvers(0), '0.0');
  assert.equal(formatOvers(6), '1.0');
  assert.equal(formatOvers(15), '2.3');
  assert.equal(formatOversBengali(15), '২.৩');
});

test('calculateStrikeRate, calculateEconomy, and calculateNetRunRate handle normal and zero inputs', () => {
  assert.equal(calculateStrikeRate(45, 20), 225);
  assert.equal(calculateStrikeRate(0, 0), 0);
  assert.equal(calculateEconomy(24, 3), 8);
  assert.equal(calculateEconomy(10, 0), 0);
  assert.equal(calculateNetRunRate(120, 12, 96, 12), 2);
});

test('sortPointsTable and applyMatchResultToStandings update points and NRR accurately', () => {
  const sampleTeams: Team[] = [
    {
      id: 't1',
      name: 'আলিফ মেমোরিয়াল স্পোর্টিং ক্লাব',
      shortName: 'AMSC',
      captainName: 'সম্রাট আব্দুর রহমান',
      captainPhotoUrl: '/assets/aistudio/image_fe6bf5ca.png',
      primaryColor: '#1d4ed8',
      secondaryColor: '#f59e0b',
      managerName: 'কামরুল হাসান',
      villageOrArea: 'নূরিয়া হাজির হাট',
      slogan: 'জয়ের লক্ষ্যে অবিচল',
      played: 1,
      won: 1,
      lost: 0,
      tied: 0,
      points: 2,
      runsFor: 72,
      oversFor: 6,
      runsAgainst: 60,
      oversAgainst: 6,
      netRunRate: 2.0,
      recentForm: ['W'],
    },
    {
      id: 't2',
      name: 'নোয়াখালী সুপার জায়ান্টস',
      shortName: 'NSG',
      captainName: 'হামিদ রায়হান',
      captainPhotoUrl: '/assets/aistudio/image_2b721d7c.png',
      primaryColor: '#047857',
      secondaryColor: '#fbbf24',
      managerName: 'রাশেদ উদ্দিন',
      villageOrArea: 'মাইজদী',
      slogan: 'সুপার জায়ান্টস গর্জন',
      played: 1,
      won: 0,
      lost: 1,
      tied: 0,
      points: 0,
      runsFor: 60,
      oversFor: 6,
      runsAgainst: 72,
      oversAgainst: 6,
      netRunRate: -2.0,
      recentForm: ['L'],
    },
  ];

  const updated = applyMatchResultToStandings(sampleTeams, {
    teamAId: 't2',
    teamBId: 't1',
    teamARuns: 90,
    teamAOvers: 6,
    teamBRuns: 66,
    teamBOvers: 6,
  });

  const sorted = sortPointsTable(updated);
  assert.equal(sorted[0].id, 't2');
  assert.equal(sorted[0].points, 2);
  assert.equal(sorted[0].netRunRate > sorted[1].netRunRate, true);
});

test('applyBallEvent updates runs, legal balls, strike rotation, and key moments', () => {
  const initialMatch: LiveMatchState = {
    id: 'm1',
    matchNumber: 7,
    stage: 'গ্রুপ পর্ব · হাই-ভোল্টেজ নাইট ম্যাচ',
    totalOvers: 6,
    status: 'LIVE',
    battingTeamId: 't1',
    bowlingTeamId: 't2',
    battingTeamName: 'আলিফ মেমোরিয়াল স্পোর্টিং ক্লাব',
    bowlingTeamName: 'নোয়াখালী সুপার জায়ান্টস',
    runs: 50,
    wickets: 2,
    legalBalls: 20,
    extras: 2,
    targetRuns: 65,
    firstInningsSummary: '৬৪/৪ (৬.০ ওভার)',
    strikerId: 'p1',
    nonStrikerId: 'p2',
    currentBowlerId: 'p3',
    strikerRuns: 24,
    strikerBalls: 10,
    nonStrikerRuns: 14,
    nonStrikerBalls: 7,
    bowlerWickets: 1,
    bowlerRuns: 15,
    bowlerBalls: 8,
    recentBalls: ['1', '4'],
    keyMoments: [],
    highlightHeadline: 'জয়ের জন্য ১৬ বলে ১৫ রান প্রয়োজন',
  };

  const afterSix = applyBallEvent(initialMatch, '6', 'সম্রাট আব্দুর রহমান', 'হামিদ রায়হান');
  assert.equal(afterSix.runs, 56);
  assert.equal(afterSix.legalBalls, 21);
  assert.equal(afterSix.strikerRuns, 30);
  assert.equal(afterSix.keyMoments[0].type, 'SIX');

  const afterSingle = applyBallEvent(afterSix, '1', 'সম্রাট আব্দুর রহমান', 'হামিদ রায়হান');
  assert.equal(afterSingle.runs, 57);
  assert.equal(afterSingle.strikerId, 'p2');
});

test('validation and card builders preserve empty jersey numbers without fallback', () => {
  assert.equal(
    validateNewPlayerInput({ name: 'আবদুল্লা আল যোবায়ের', teamId: 't1', role: 'অলরাউন্ডার', jerseyNumber: '' })
      .valid,
    true
  );

  const playerWithoutJersey: Player = {
    id: 'p-no-jersey',
    name: 'আবদুল্লা আল যোবায়ের',
    teamId: 't1',
    teamName: 'আলিফ স্মৃতি স্মরণ স্পোর্টিং ক্লাব',
    role: 'অলরাউন্ডার',
    jerseyNumber: '',
    battingStyle: 'ডানহাতি',
    bowlingStyle: 'ডানহাতি',
    photoUrl: '/assets/aistudio/image_7beb3144.png',
    stats: {
      matches: 1,
      runs: 25,
      ballsFaced: 10,
      sixes: 3,
      fours: 1,
      wickets: 1,
      oversBowled: 2,
      runsConceded: 12,
      motmAwards: 0,
      highestScore: '২৫',
      bestBowling: '১/১২',
    },
  };

  const configWithLogo = {
    ...INITIAL_CARD_CONFIG,
    customLogoUrl: 'data:image/png;base64,CUSTOM_LOGO',
    showLogo: true,
  };
  const built = buildCardConfigFromPlayer(configWithLogo, playerWithoutJersey);
  assert.equal(built.jerseyNumber, '');
  assert.equal(built.customLogoUrl, 'data:image/png;base64,CUSTOM_LOGO');
  assert.equal(built.showLogo, true);
});

test('getTopLotteryBuyers and calculateFinanceSummary compute rankings and balances', () => {
  const buyers = getTopLotteryBuyers([
    {
      id: 'b1',
      buyerName: 'কামাল উদ্দিন',
      areaOrVillage: 'হাজির হাট',
      phone: '01700000000',
      ticketCount: 15,
      couponRange: '101-115',
      totalAmount: 300,
      dateLabel: 'আজ',
      photoUrl: '',
    },
    {
      id: 'b2',
      buyerName: 'তাহসীন হোসেন রাহি',
      areaOrVillage: 'নূরিয়া বাজার',
      phone: '01800000000',
      ticketCount: 35,
      couponRange: '201-235',
      totalAmount: 700,
      dateLabel: 'আজ',
      photoUrl: '',
    },
  ]);
  assert.equal(buyers[0].id, 'b2');

  const fin = calculateFinanceSummary([
    { id: 'f1', title: 'এন্ট্রি ফি', category: 'INCOME', tag: 'টিম ফি', amount: 18000, dateStr: 'আজ' },
    { id: 'f2', title: 'ফ্লাডলাইট', category: 'EXPENSE', tag: 'মাঠ', amount: 6500, dateStr: 'আজ' },
  ]);
  assert.equal(fin.totalIncome, 18000);
  assert.equal(fin.totalExpense, 6500);
  assert.equal(fin.balance, 11500);
});
