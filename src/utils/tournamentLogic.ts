import {
  FinanceRecord,
  LiveMatchState,
  LotteryBuyerRecord,
  PhotoCardConfig,
  Player,
  PlayerRole,
  SpecialAwardRecord,
  Team,
} from '../types/tournament';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)] ?? digit);
}

export function hasText(value?: string | number | null): boolean {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > 0;
}

export function formatOvers(legalBalls: number, ballsPerOver = 6): string {
  const safeBalls = Math.max(0, Math.floor(legalBalls));
  const completedOvers = Math.floor(safeBalls / ballsPerOver);
  const remainingBalls = safeBalls % ballsPerOver;
  return `${completedOvers}.${remainingBalls}`;
}

export function formatOversBengali(legalBalls: number, ballsPerOver = 6): string {
  return toBengaliNumber(formatOvers(legalBalls, ballsPerOver));
}

export function calculateStrikeRate(runs: number, ballsFaced: number): number {
  if (ballsFaced <= 0) return 0;
  return Number(((runs / ballsFaced) * 100).toFixed(1));
}

export function calculateEconomy(runsConceded: number, oversBowled: number): number {
  if (oversBowled <= 0) return 0;
  return Number((runsConceded / oversBowled).toFixed(2));
}

export function calculateNetRunRate(
  runsFor: number,
  oversFor: number,
  runsAgainst: number,
  oversAgainst: number
): number {
  if (oversFor <= 0 || oversAgainst <= 0) return 0;
  const forRate = runsFor / oversFor;
  const againstRate = runsAgainst / oversAgainst;
  return Number((forRate - againstRate).toFixed(3));
}

export function sortPointsTable(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.netRunRate !== a.netRunRate) return b.netRunRate - a.netRunRate;
    if (b.won !== a.won) return b.won - a.won;
    return a.name.localeCompare(b.name, 'bn');
  });
}

export function applyMatchResultToStandings(
  teams: Team[],
  result: {
    teamAId: string;
    teamBId: string;
    teamARuns: number;
    teamAOvers: number;
    teamBRuns: number;
    teamBOvers: number;
  }
): Team[] {
  const { teamAId, teamBId, teamARuns, teamAOvers, teamBRuns, teamBOvers } = result;
  if (teamAId === teamBId || teamAOvers <= 0 || teamBOvers <= 0) {
    return teams;
  }

  return sortPointsTable(
    teams.map((team) => {
      if (team.id !== teamAId && team.id !== teamBId) return team;

      const isTeamA = team.id === teamAId;
      const myRuns = isTeamA ? teamARuns : teamBRuns;
      const myOvers = isTeamA ? teamAOvers : teamBOvers;
      const oppRuns = isTeamA ? teamBRuns : teamARuns;
      const oppOvers = isTeamA ? teamBOvers : teamAOvers;

      const isWin = myRuns > oppRuns;
      const isLoss = myRuns < oppRuns;
      const isTie = myRuns === oppRuns;

      const newRunsFor = team.runsFor + myRuns;
      const newOversFor = Number((team.oversFor + myOvers).toFixed(2));
      const newRunsAgainst = team.runsAgainst + oppRuns;
      const newOversAgainst = Number((team.oversAgainst + oppOvers).toFixed(2));
      const newNrr = calculateNetRunRate(newRunsFor, newOversFor, newRunsAgainst, newOversAgainst);

      const outcomeBadge: 'W' | 'L' | 'T' = isWin ? 'W' : isLoss ? 'L' : 'T';
      const updatedForm = [outcomeBadge, ...team.recentForm].slice(0, 5);

      return {
        ...team,
        played: team.played + 1,
        won: team.won + (isWin ? 1 : 0),
        lost: team.lost + (isLoss ? 1 : 0),
        tied: team.tied + (isTie ? 1 : 0),
        points: team.points + (isWin ? 2 : isTie ? 1 : 0),
        runsFor: newRunsFor,
        oversFor: newOversFor,
        runsAgainst: newRunsAgainst,
        oversAgainst: newOversAgainst,
        netRunRate: newNrr,
        recentForm: updatedForm,
      };
    })
  );
}

export function getTopRunScorers(players: Player[], limit = 10): Player[] {
  return [...players]
    .sort((a, b) => {
      if (b.stats.runs !== a.stats.runs) return b.stats.runs - a.stats.runs;
      return (
        calculateStrikeRate(b.stats.runs, b.stats.ballsFaced) -
        calculateStrikeRate(a.stats.runs, a.stats.ballsFaced)
      );
    })
    .slice(0, limit);
}

export function getTopWicketTakers(players: Player[], limit = 10): Player[] {
  return [...players]
    .sort((a, b) => {
      if (b.stats.wickets !== a.stats.wickets) return b.stats.wickets - a.stats.wickets;
      const econA = calculateEconomy(a.stats.runsConceded, a.stats.oversBowled) || 99;
      const econB = calculateEconomy(b.stats.runsConceded, b.stats.oversBowled) || 99;
      return econA - econB;
    })
    .slice(0, limit);
}

export function getMvpLeaders(players: Player[], limit = 10): Array<Player & { mvpScore: number }> {
  return players
    .map((p) => {
      const mvpScore =
        p.stats.runs + p.stats.wickets * 20 + p.stats.sixes * 3 + p.stats.motmAwards * 25;
      return { ...p, mvpScore };
    })
    .sort((a, b) => b.mvpScore - a.mvpScore)
    .slice(0, limit);
}

export function getTopLotteryBuyers(buyers: LotteryBuyerRecord[]): LotteryBuyerRecord[] {
  return [...buyers].sort((a, b) => {
    if (b.ticketCount !== a.ticketCount) return b.ticketCount - a.ticketCount;
    return b.totalAmount - a.totalAmount;
  });
}

export function calculateFinanceSummary(records: FinanceRecord[]): {
  totalIncome: number;
  totalExpense: number;
  balance: number;
} {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const r of records) {
    if (r.category === 'INCOME') totalIncome += r.amount;
    else totalExpense += r.amount;
  }
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export type BallEventCode = '0' | '1' | '2' | '3' | '4' | '6' | 'WD' | 'NB' | 'W';

export function applyBallEvent(
  match: LiveMatchState,
  event: BallEventCode,
  strikerName = 'স্ট্রাইকার',
  bowlerName = 'বোলার'
): LiveMatchState {
  if (match.status === 'COMPLETED') {
    return match;
  }

  let addedRuns = 0;
  let addedExtras = 0;
  let isLegalBall = true;
  let isWicket = false;
  let batterRunsAdded = 0;

  switch (event) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '6':
      batterRunsAdded = Number(event);
      addedRuns = batterRunsAdded;
      break;
    case 'WD':
      addedRuns = 1;
      addedExtras = 1;
      isLegalBall = false;
      break;
    case 'NB':
      addedRuns = 1;
      addedExtras = 1;
      isLegalBall = false;
      break;
    case 'W':
      isWicket = true;
      break;
  }

  const nextRuns = match.runs + addedRuns;
  const nextWickets = Math.min(10, match.wickets + (isWicket ? 1 : 0));
  const nextLegalBalls = match.legalBalls + (isLegalBall ? 1 : 0);
  const nextExtras = match.extras + addedExtras;

  const nextStrikerRuns = isWicket ? 0 : match.strikerRuns + batterRunsAdded;
  const nextStrikerBalls = isWicket ? 0 : match.strikerBalls + (isLegalBall ? 1 : 0);
  const nextBowlerRuns = match.bowlerRuns + addedRuns;
  const nextBowlerBalls = match.bowlerBalls + (isLegalBall ? 1 : 0);
  const nextBowlerWickets = match.bowlerWickets + (isWicket ? 1 : 0);

  const overStr = formatOversBengali(nextLegalBalls);
  const newMoments = [...match.keyMoments];
  let highlightHeadline = match.highlightHeadline;

  if (event === '6') {
    highlightHeadline = `${strikerName}-এর বিশাল ছক্কা! (${overStr} ওভার)`;
    newMoments.unshift({
      id: `m-${Date.now()}-${nextLegalBalls}`,
      overBall: overStr,
      type: 'SIX',
      title: 'বিশাল ছক্কা!',
      description: `${bowlerName}-এর বলে ${strikerName}-এর দুর্দান্ত ছক্কা!`,
      timestamp: 'এইমাত্র',
    });
  } else if (event === '4') {
    highlightHeadline = `${strikerName}-এর দৃষ্টিনন্দন বাউন্ডারি! (${overStr} ওভার)`;
    newMoments.unshift({
      id: `m-${Date.now()}-${nextLegalBalls}`,
      overBall: overStr,
      type: 'FOUR',
      title: 'দৃষ্টিনন্দন চার!',
      description: `${strikerName} গ্যাপ খুঁজে বাউন্ডারি আদায় করলেন।`,
      timestamp: 'এইমাত্র',
    });
  } else if (event === 'W') {
    highlightHeadline = `ব্রেকথ্রু! ${bowlerName} নিলেন গুরুত্বপূর্ণ উইকেট (${overStr} ওভার)`;
    newMoments.unshift({
      id: `m-${Date.now()}-${nextLegalBalls}`,
      overBall: overStr,
      type: 'WICKET',
      title: 'উইকেট পতন!',
      description: `${bowlerName}-এর দুর্দান্ত ডেলিভারিতে আউট হলেন ${strikerName}।`,
      timestamp: 'এইমাত্র',
    });
  }

  const shouldSwapEnds =
    (batterRunsAdded % 2 === 1) !== (isLegalBall && nextLegalBalls % 6 === 0);

  const maxBalls = match.totalOvers * 6;
  const targetReached = match.targetRuns !== null && nextRuns >= match.targetRuns;
  const inningsEnded = nextLegalBalls >= maxBalls || nextWickets >= 10 || targetReached;

  let nextStatus: LiveMatchState['status'] = match.status;
  if (targetReached || (match.targetRuns !== null && inningsEnded)) {
    nextStatus = 'COMPLETED';
    if (targetReached) {
      highlightHeadline = `${match.battingTeamName} জয়ী! দুর্দান্ত রান চেজ সম্পন্ন।`;
    } else if (nextRuns === (match.targetRuns ?? 0) - 1) {
      highlightHeadline = `শ্বাসরুদ্ধকর ম্যাচ টাই!`;
    } else {
      highlightHeadline = `${match.bowlingTeamName} জয়ী! দারুণ বোলিং নৈপুণ্য।`;
    }
  }

  return {
    ...match,
    status: nextStatus,
    runs: nextRuns,
    wickets: nextWickets,
    legalBalls: nextLegalBalls,
    extras: nextExtras,
    strikerId: shouldSwapEnds ? match.nonStrikerId : match.strikerId,
    nonStrikerId: shouldSwapEnds ? match.strikerId : match.nonStrikerId,
    strikerRuns: shouldSwapEnds ? match.nonStrikerRuns : nextStrikerRuns,
    strikerBalls: shouldSwapEnds ? match.nonStrikerBalls : nextStrikerBalls,
    nonStrikerRuns: shouldSwapEnds ? nextStrikerRuns : match.nonStrikerRuns,
    nonStrikerBalls: shouldSwapEnds ? nextStrikerBalls : match.nonStrikerBalls,
    bowlerRuns: nextBowlerRuns,
    bowlerBalls: nextBowlerBalls,
    bowlerWickets: nextBowlerWickets,
    recentBalls: [...match.recentBalls, event].slice(-12),
    keyMoments: newMoments.slice(0, 12),
    highlightHeadline,
  };
}

export function validateNewPlayerInput(input: {
  name: string;
  teamId: string;
  role: PlayerRole;
  jerseyNumber?: string | number;
}): { valid: boolean; error?: string } {
  if (!input.name || input.name.trim().length < 2) {
    return { valid: false, error: 'খেলোয়াড়ের সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)।' };
  }
  if (!input.teamId) {
    return { valid: false, error: 'অনুগ্রহ করে একটি দল নির্বাচন করুন।' };
  }
  if (hasText(input.jerseyNumber)) {
    const num = Number(input.jerseyNumber);
    if (Number.isNaN(num) || num < 0 || num > 999) {
      return { valid: false, error: 'সঠিক জার্সি নম্বর দিন (০ - ৯৯৯) অথবা খালি রাখুন।' };
    }
  }
  return { valid: true };
}

export function validateNewTeamInput(input: {
  name: string;
  captainName: string;
}): { valid: boolean; error?: string } {
  if (!input.name || input.name.trim().length < 3) {
    return { valid: false, error: 'দলের পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)।' };
  }
  if (!input.captainName || input.captainName.trim().length < 2) {
    return { valid: false, error: 'দলীয় অধিনায়কের নাম লিখুন।' };
  }
  return { valid: true };
}

export function buildCardConfigFromTeam(
  current: PhotoCardConfig,
  team: Team
): PhotoCardConfig {
  return {
    ...current,
    templateId: 'captain_welcome',
    teamName: team.name,
    personName: team.captainName,
    personRoleLabel: 'দলীয় অধিনায়ক',
    seasonLabel: 'সিজন ২ এ অংশগ্রহণকারী দল',
    greetingOrSlogan:
      'টুর্নামেন্টে অংশগ্রহণ করার জন্য পরিচালনা কমিটির পক্ষ থেকে আন্তরিক শুভেচ্ছা ও অভিনন্দন',
    footerSlogan: team.slogan || 'খেলাধুলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল',
    photoUrl: team.captainPhotoUrl,
    photoCrop: team.captainPhotoCrop,
    photoZoom: 1,
    photoOffsetX: 0,
    photoOffsetY: 0,
  };
}

export function buildCardConfigFromPlayer(
  current: PhotoCardConfig,
  player: Player,
  targetTemplate: PhotoCardConfig['templateId'] = 'player_intro'
): PhotoCardConfig {
  const jerseyStr = hasText(player.jerseyNumber)
    ? toBengaliNumber(player.jerseyNumber)
    : '';

  return {
    ...current,
    templateId: targetTemplate,
    teamName: player.teamName,
    personName: player.name,
    personRoleLabel: player.isCaptain ? 'দলীয় অধিনায়ক' : 'স্কোয়াড সদস্য',
    playerPosition: player.role,
    jerseyNumber: jerseyStr,
    greetingOrSlogan:
      player.hypeQuote ||
      `${player.teamName}-এর হয়ে সিজন ২ মাতিয়ে তুলতে আমি প্রস্তুত!`,
    footerSlogan: 'খেলাধুলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল',
    performanceLine1: `${toBengaliNumber(player.stats.runs)} রান (${toBengaliNumber(player.stats.ballsFaced)} বল) · ${toBengaliNumber(player.stats.sixes)}টি ছক্কা`,
    performanceLine2: `${toBengaliNumber(player.stats.wickets)} উইকেট · সেরা: ${player.stats.bestBowling}`,
    photoUrl: player.photoUrl,
    photoCrop: player.photoCrop,
    photoZoom: 1,
    photoOffsetX: 0,
    photoOffsetY: 0,
  };
}

export function buildCardConfigFromSpecialAward(
  current: PhotoCardConfig,
  award: SpecialAwardRecord
): PhotoCardConfig {
  return {
    ...current,
    templateId: award.category,
    personName: award.personName,
    teamName: award.subtitleOrTeam,
    personRoleLabel: award.title,
    badgeTopRight: award.badgeText || 'সিজন ২',
    badgeSubtitle: award.dateLabel || 'বিশেষ সম্মাননা',
    performanceLine1: award.detailLine1,
    performanceLine2: award.detailLine2,
    greetingOrSlogan: award.detailLine1,
    footerSlogan: 'আপনার অংশগ্রহণ ও ভালোবাসায় আমাদের টুর্নামেন্ট সার্থক!',
    photoUrl: award.photoUrl,
    photoCrop: award.photoCrop,
    photoZoom: 1,
    photoOffsetX: 0,
    photoOffsetY: 0,
  };
}

export function buildCardConfigFromLotteryBuyer(
  current: PhotoCardConfig,
  buyer: LotteryBuyerRecord
): PhotoCardConfig {
  return {
    ...current,
    templateId: 'top_lottery_buyer',
    personName: buyer.buyerName,
    teamName: buyer.areaOrVillage,
    personRoleLabel: 'আজকের সর্বোচ্চ লটারি ক্রেতা',
    badgeTopRight: `${toBengaliNumber(buyer.ticketCount)}টি`,
    badgeSubtitle: 'সর্বোচ্চ কুপন',
    performanceLine1: `মোট কুপন ক্রয়: ${toBengaliNumber(buyer.ticketCount)}টি (কুপন নং: ${buyer.couponRange})`,
    performanceLine2: `তারিখ: ${buyer.dateLabel} · এলাকা: ${buyer.areaOrVillage}`,
    greetingOrSlogan: 'টুর্নামেন্টের র‍্যাফেল ড্র-তে সর্বোচ্চ কুপন ক্রয় করে সহযোগিতা করার জন্য',
    footerSlogan: 'আপনাকে আন্তরিক ধন্যবাদ ও অভিনন্দন!',
    photoUrl: buyer.photoUrl,
    photoCrop: buyer.photoCrop,
    photoZoom: 1,
    photoOffsetX: 0,
    photoOffsetY: 0,
  };
}

export function buildCardConfigFromLiveMatch(
  current: PhotoCardConfig,
  match: LiveMatchState,
  striker?: Player,
  bowler?: Player
): PhotoCardConfig {
  const oversFormatted = formatOversBengali(match.legalBalls);
  const totalOversBn = toBengaliNumber(match.totalOvers);
  const runsBn = toBengaliNumber(match.runs);
  const wicketsBn = toBengaliNumber(match.wickets);

  return {
    ...current,
    templateId: 'live_score_moment',
    matchTitle: `ম্যাচ নং ${toBengaliNumber(match.matchNumber)} · ${match.stage}`,
    team1Name: match.battingTeamName,
    team1Score: `${runsBn}/${wicketsBn} (${oversFormatted}/${totalOversBn} ওভার)`,
    team2Name: match.bowlingTeamName,
    team2Score: match.firstInningsSummary || 'বোলিং করছে',
    matchStatusBadge:
      match.status === 'COMPLETED'
        ? 'ম্যাচ সমাপ্ত'
        : match.status === 'INNINGS_BREAK'
          ? 'ইনিংস বিরতি'
          : 'লাইভ স্কোর আপডেট',
    personName: striker ? striker.name : current.personName,
    teamName: match.battingTeamName,
    performanceLine1: striker
      ? `ব্যাটিং: ${striker.name} — ${toBengaliNumber(match.strikerRuns)}* (${toBengaliNumber(match.strikerBalls)} বল)`
      : `ব্যাটিং: ${toBengaliNumber(match.strikerRuns)}* (${toBengaliNumber(match.strikerBalls)} বল)`,
    performanceLine2: bowler
      ? `বোলিং: ${bowler.name} — ${toBengaliNumber(match.bowlerWickets)}/${toBengaliNumber(match.bowlerRuns)} (${formatOversBengali(match.bowlerBalls)} ওভার)`
      : `বোলিং: ${toBengaliNumber(match.bowlerWickets)}/${toBengaliNumber(match.bowlerRuns)}`,
    keyMomentHeadline: match.highlightHeadline,
    photoUrl: striker ? striker.photoUrl : current.photoUrl,
    photoCrop: striker ? striker.photoCrop : current.photoCrop,
    photoZoom: 1,
    photoOffsetX: 0,
    photoOffsetY: 0,
  };
}
