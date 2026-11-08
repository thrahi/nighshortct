export type PlayerRole = 'ব্যাটসম্যান' | 'বোলার' | 'অলরাউন্ডার' | 'উইকেটকিপার';

export type PhotoCardTemplateId =
  | 'captain_welcome'
  | 'player_intro'
  | 'player_hype'
  | 'man_of_the_match'
  | 'player_of_the_match'
  | 'player_of_the_tournament'
  | 'best_spectator'
  | 'top_lottery_buyer'
  | 'premium_gold_frame'
  | 'live_score_moment';

export type CardStyleVariant = 'aesthetic_silk' | 'broadcast_pro';

export type CardColorTheme =
  | 'crimson_silk'
  | 'royal_gold'
  | 'emerald_night'
  | 'cyan_stadium';

export interface CropRegion {
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  w: number; // 0..1 normalized
  h: number; // 0..1 normalized
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  role: PlayerRole;
  jerseyNumber: number | string;
  isCaptain?: boolean;
  battingStyle: string;
  bowlingStyle: string;
  photoUrl: string;
  photoCrop?: CropRegion;
  stats: {
    matches: number;
    runs: number;
    ballsFaced: number;
    sixes: number;
    fours: number;
    wickets: number;
    oversBowled: number;
    runsConceded: number;
    motmAwards: number;
    highestScore: string;
    bestBowling: string;
  };
  hypeQuote?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  captainName: string;
  captainPhotoUrl: string;
  captainPhotoCrop?: CropRegion;
  primaryColor: string;
  secondaryColor: string;
  managerName: string;
  villageOrArea: string;
  slogan: string;
  entryFeeStatus?: 'PAID' | 'PARTIAL' | 'DUE';
  entryFeePaid?: number;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
  netRunRate: number;
  recentForm: ('W' | 'L' | 'T')[];
}

export interface KeyMoment {
  id: string;
  overBall: string;
  type: 'SIX' | 'FOUR' | 'WICKET' | 'FIFTY' | 'MOMENT';
  title: string;
  description: string;
  timestamp: string;
}

export interface LiveMatchState {
  id: string;
  matchNumber: number;
  stage: string;
  totalOvers: number;
  status: 'LIVE' | 'INNINGS_BREAK' | 'COMPLETED';
  battingTeamId: string;
  bowlingTeamId: string;
  battingTeamName: string;
  bowlingTeamName: string;
  runs: number;
  wickets: number;
  legalBalls: number;
  extras: number;
  targetRuns: number | null;
  firstInningsSummary: string | null;
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;
  strikerRuns: number;
  strikerBalls: number;
  nonStrikerRuns: number;
  nonStrikerBalls: number;
  bowlerWickets: number;
  bowlerRuns: number;
  bowlerBalls: number;
  recentBalls: string[];
  keyMoments: KeyMoment[];
  highlightHeadline: string;
}

export interface SpecialAwardRecord {
  id: string;
  category:
    | 'man_of_the_match'
    | 'player_of_the_match'
    | 'player_of_the_tournament'
    | 'best_spectator'
    | 'top_lottery_buyer';
  title: string;
  personName: string;
  subtitleOrTeam: string;
  detailLine1: string;
  detailLine2: string;
  badgeText: string;
  dateLabel: string;
  photoUrl: string;
  photoCrop?: CropRegion;
}

export interface LotteryBuyerRecord {
  id: string;
  buyerName: string;
  areaOrVillage: string;
  phone: string;
  ticketCount: number;
  couponRange: string;
  totalAmount: number;
  dateLabel: string;
  photoUrl: string;
  photoCrop?: CropRegion;
}

export interface FixtureMatch {
  id: string;
  matchNo: number;
  stage: string;
  teamAName: string;
  teamBName: string;
  dateStr: string;
  timeStr: string;
  umpireNames: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  resultNote?: string;
}

export interface FinanceRecord {
  id: string;
  title: string;
  category: 'INCOME' | 'EXPENSE';
  tag: string;
  amount: number;
  dateStr: string;
}

export interface PhotoCardConfig {
  templateId: PhotoCardTemplateId;
  styleVariant: CardStyleVariant;
  colorTheme: CardColorTheme;
  tournamentTitle: string;
  seasonLabel: string;
  teamName: string;
  personName: string;
  personRoleLabel: string;
  playerPosition: string;
  jerseyNumber: string;
  greetingOrSlogan: string;
  footerSlogan: string;
  badgeTopRight: string;
  badgeSubtitle: string;
  organizationTag: string;
  photoUrl: string;
  photoCrop?: CropRegion;
  photoZoom: number;
  photoOffsetX: number;
  photoOffsetY: number;
  // Persistent Custom Logo fields (applied across all photo cards)
  customLogoUrl?: string;
  customLogoCrop?: CropRegion;
  showLogo?: boolean;
  // Match / Award / Lottery / Spectator fields
  matchTitle: string;
  team1Name: string;
  team1Score: string;
  team2Name: string;
  team2Score: string;
  matchStatusBadge: string;
  performanceLine1: string;
  performanceLine2: string;
  keyMomentHeadline: string;
}
