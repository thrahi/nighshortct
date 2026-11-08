import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Camera,
  CheckCircle2,
  Coins,
  Crown,
  Gift,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
} from 'lucide-react';
import {
  FinanceRecord,
  FixtureMatch,
  LotteryBuyerRecord,
  SpecialAwardRecord,
  Team,
} from '../types/tournament';
import {
  calculateFinanceSummary,
  getTopLotteryBuyers,
  toBengaliNumber,
} from '../utils/tournamentLogic';
import { PlayerAvatar } from './PlayerAvatar';

interface TournamentDirectorHubProps {
  specialAwards: SpecialAwardRecord[];
  onAddSpecialAward: (award: SpecialAwardRecord) => void;
  onGenerateAwardCard: (award: SpecialAwardRecord) => void;
  lotteryBuyers: LotteryBuyerRecord[];
  onAddLotteryBuyer: (buyer: LotteryBuyerRecord) => void;
  onGenerateLotteryCard: (buyer: LotteryBuyerRecord) => void;
  fixtures: FixtureMatch[];
  onAddFixture: (fixture: FixtureMatch) => void;
  onUpdateFixtureStatus: (
    id: string,
    status: FixtureMatch['status'],
    resultNote?: string
  ) => void;
  financeRecords: FinanceRecord[];
  onAddFinanceRecord: (record: FinanceRecord) => void;
  teams: Team[];
}

type DirectorSubTab = 'awards_lottery' | 'fixtures' | 'finance' | 'rules';

const CATEGORY_LABELS: Record<SpecialAwardRecord['category'], string> = {
  man_of_the_match: 'ম্যান অব দ্য ম্যাচ',
  player_of_the_match: 'প্লেয়ার অব দ্য ম্যাচ',
  player_of_the_tournament: 'প্লেয়ার অব দ্য টুর্নামেন্ট',
  best_spectator: 'আজকের সেরা দর্শক',
  top_lottery_buyer: 'আজকের সর্বোচ্চ লটারি ক্রেতা',
};

export const TournamentDirectorHub: React.FC<TournamentDirectorHubProps> = ({
  specialAwards,
  onAddSpecialAward,
  onGenerateAwardCard,
  lotteryBuyers,
  onAddLotteryBuyer,
  onGenerateLotteryCard,
  fixtures,
  onAddFixture,
  onUpdateFixtureStatus,
  financeRecords,
  onAddFinanceRecord,
  teams,
}) => {
  const [subTab, setSubTab] = useState<DirectorSubTab>('awards_lottery');
  const [awardFilter, setAwardFilter] = useState<
    'all' | SpecialAwardRecord['category']
  >('all');

  // New Special Award Form State
  const [showAddAward, setShowAddAward] = useState(false);
  const [awardCategory, setAwardCategory] =
    useState<SpecialAwardRecord['category']>('best_spectator');
  const [awardTitle, setAwardTitle] = useState('আজকের সেরা দর্শক');
  const [personName, setPersonName] = useState('');
  const [subtitleOrTeam, setSubtitleOrTeam] = useState('নূরিয়া হাজির হাট');
  const [dateLabel, setDateLabel] = useState('ম্যাচ ডে ৪ · সিজন ২');
  const [detailLine1, setDetailLine1] = useState(
    'মাঠে উপস্থিত থেকে দলকে সর্বোচ্চ উৎসাহ প্রদান'
  );
  const [detailLine2, setDetailLine2] = useState('সৌজন্যে: পরিচালনা কমিটি');
  const [awardPhoto, setAwardPhoto] = useState('');

  // New Lottery Buyer Form State
  const [showAddBuyer, setShowAddBuyer] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [areaOrVillage, setAreaOrVillage] = useState('নূরিয়া হাজির হাট');
  const [ticketCount, setTicketCount] = useState('25');
  const [couponRange, setCouponRange] = useState('#১০৮০ - #১১০৪');
  const [buyerPhone, setBuyerPhone] = useState('০১৮XXXXXXXX');
  const [buyerPhoto, setBuyerPhoto] = useState('');

  // Lucky Draw State
  const [luckyWinner, setLuckyWinner] = useState<{
    buyer: LotteryBuyerRecord;
    winningCoupon: string;
  } | null>(null);

  // New Fixture Form State
  const [showAddFixture, setShowAddFixture] = useState(false);
  const [matchNo, setMatchNo] = useState(String(fixtures.length + 1));
  const [stage, setStage] = useState('গ্রুপ পর্ব · রাউন্ড ২');
  const [teamAName, setTeamAName] = useState(teams[0]?.name || '');
  const [teamBName, setTeamBName] = useState(teams[1]?.name || '');
  const [dateStr, setDateStr] = useState('আগামীকাল');
  const [timeStr, setTimeStr] = useState('রাত ৮:৩০ মিনিট');
  const [umpireNames, setUmpireNames] = useState('মো. রাশেদ ও সাইফুল ইসলাম');

  // New Finance Form State
  const [finTitle, setFinTitle] = useState('');
  const [finCategory, setFinCategory] =
    useState<FinanceRecord['category']>('INCOME');
  const [finTag, setFinTag] = useState('স্পন্সর ও অনুদান');
  const [finAmount, setFinAmount] = useState('');

  const sortedBuyers = getTopLotteryBuyers(lotteryBuyers);
  const topBuyer = sortedBuyers[0];
  const financeSummary = calculateFinanceSummary(financeRecords);

  const filteredAwards =
    awardFilter === 'all'
      ? specialAwards
      : specialAwards.filter((a) => a.category === awardFilter);

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (cat: SpecialAwardRecord['category']) => {
    setAwardCategory(cat);
    setAwardTitle(CATEGORY_LABELS[cat]);
    if (cat === 'best_spectator') {
      setDetailLine1('মাঠে উপস্থিত থেকে দলকে সর্বোচ্চ উৎসাহ প্রদান');
      setDetailLine2('সৌজন্যে: পরিচালনা কমিটি');
    } else if (cat === 'player_of_the_tournament') {
      setDetailLine1('সর্বমোট রান: ২৪৫ · উইকেট: ৯টি');
      setDetailLine2('টুর্নামেন্ট সেরা পারফরম্যান্স');
    } else {
      setDetailLine1('৪৮* রান (১৮ বল) · ৫টি ছক্কা');
      setDetailLine2('বোলিং: ২/১২ (২.০ ওভার)');
    }
  };

  const handleCreateAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;
    const newAward: SpecialAwardRecord = {
      id: `aw-${Date.now()}`,
      category: awardCategory,
      title: awardTitle.trim() || CATEGORY_LABELS[awardCategory],
      personName: personName.trim(),
      subtitleOrTeam: subtitleOrTeam.trim(),
      detailLine1: detailLine1.trim(),
      detailLine2: detailLine2.trim(),
      badgeText: CATEGORY_LABELS[awardCategory],
      dateLabel: dateLabel.trim(),
      photoUrl: awardPhoto || '/assets/aistudio/image_57442804.png',
      photoCrop: awardPhoto
        ? undefined
        : { x: 0.145, y: 0.145, w: 0.52, h: 0.56 },
    };
    onAddSpecialAward(newAward);
    setPersonName('');
    setAwardPhoto('');
    setShowAddAward(false);
  };

  const handleCreateBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) return;
    const count = Math.max(1, Number(ticketCount) || 1);
    const newBuyer: LotteryBuyerRecord = {
      id: `lb-${Date.now()}`,
      buyerName: buyerName.trim(),
      areaOrVillage: areaOrVillage.trim(),
      phone: buyerPhone.trim() || '০১৮XXXXXXXX',
      ticketCount: count,
      couponRange: couponRange.trim(),
      totalAmount: count * 20,
      dateLabel: 'আজকের র‍্যাফেল ড্র · রাত ১০:৩০',
      photoUrl: buyerPhoto || '/assets/aistudio/image_57442804.png',
      photoCrop: buyerPhoto
        ? undefined
        : { x: 0.145, y: 0.145, w: 0.52, h: 0.56 },
    };
    onAddLotteryBuyer(newBuyer);
    setBuyerName('');
    setBuyerPhoto('');
    setShowAddBuyer(false);
  };

  const handleRunLuckyDraw = () => {
    if (sortedBuyers.length === 0) return;
    const totalTickets = sortedBuyers.reduce((sum, b) => sum + b.ticketCount, 0);
    let rand = Math.floor(Math.random() * totalTickets);
    let chosen = sortedBuyers[0];
    for (const buyer of sortedBuyers) {
      if (rand < buyer.ticketCount) {
        chosen = buyer;
        break;
      }
      rand -= buyer.ticketCount;
    }
    const randomCouponNum =
      1001 + Math.floor(Math.random() * Math.max(80, totalTickets));
    setLuckyWinner({
      buyer: chosen,
      winningCoupon: `#${toBengaliNumber(randomCouponNum)}`,
    });
  };

  const handleCreateFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAName.trim() || !teamBName.trim()) return;
    const newFix: FixtureMatch = {
      id: `fix-${Date.now()}`,
      matchNo: Number(matchNo) || fixtures.length + 1,
      stage: stage.trim() || 'গ্রুপ পর্ব',
      teamAName: teamAName.trim(),
      teamBName: teamBName.trim(),
      dateStr: dateStr.trim() || 'আগামীকাল',
      timeStr: timeStr.trim() || 'রাত ৮:৩০ মিনিট',
      umpireNames: umpireNames.trim() || 'পরিচালনা পর্ষদ',
      status: 'UPCOMING',
    };
    onAddFixture(newFix);
    setMatchNo(String(fixtures.length + 2));
    setShowAddFixture(false);
  };

  const handleCreateFinance = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(finAmount);
    if (!finTitle.trim() || !Number.isFinite(amt) || amt <= 0) return;
    const newRec: FinanceRecord = {
      id: `fin-${Date.now()}`,
      title: finTitle.trim(),
      category: finCategory,
      tag: finTag.trim() || 'টুর্নামেন্ট তহবিল',
      amount: amt,
      dateStr: 'আজ',
    };
    onAddFinanceRecord(newRec);
    setFinTitle('');
    setFinAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Sub-Navigation Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              টুর্নামেন্ট ডিরেক্টর কমান্ড সেন্টার · সিজন ২
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              পুরস্কার, সেরা দর্শক, লটারি ড্র, ফিক্সচার ও তহবিল ব্যবস্থাপনা
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                {
                  id: 'awards_lottery',
                  label: 'পুরস্কার, সেরা দর্শক ও লটারি কার্ড',
                  icon: Award,
                },
                {
                  id: 'fixtures',
                  label: 'ম্যাচ ফিক্সচার ও সময়সূচী',
                  icon: Calendar,
                },
                {
                  id: 'finance',
                  label: 'আয়-ব্যয় ও এন্ট্রি ফি হিসাব',
                  icon: Coins,
                },
                {
                  id: 'rules',
                  label: 'নিয়মাবলী ও কমিটি প্যানেল',
                  icon: ShieldCheck,
                },
              ] as Array<{
                id: DirectorSubTab;
                label: string;
                icon: React.ComponentType<{ className?: string }>;
              }>
            ).map((tab) => {
              const Icon = tab.icon;
              const active = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: SPECIAL AWARDS, BEST SPECTATOR & DAILY LOTTERY HUB */}
      {subTab === 'awards_lottery' && (
        <div className="space-y-8">
          {/* Section A: Special Awards & Best Spectator Photo Card Hub */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  এস্থেটিক ফটোকার্ড অটোমেশন · ওয়ান-ক্লিক প্রজন্ম
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  ম্যান অব দ্য ম্যাচ, প্লেয়ার অব দ্য ম্যাচ, টুর্নামেন্ট সেরা ও আজকের সেরা দর্শক
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAward((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {showAddAward
                  ? 'ফর্ম বন্ধ করুন'
                  : 'নতুন পুরস্কার / সেরা দর্শক যোগ করুন'}
              </button>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'সকল ক্যাটাগরি' },
                  { id: 'man_of_the_match', label: 'ম্যান অব দ্য ম্যাচ' },
                  { id: 'player_of_the_match', label: 'প্লেয়ার অব দ্য ম্যাচ' },
                  {
                    id: 'player_of_the_tournament',
                    label: 'প্লেয়ার অব দ্য টুর্নামেন্ট',
                  },
                  { id: 'best_spectator', label: 'আজকের সেরা দর্শক' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAwardFilter(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    awardFilter === item.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Add New Award / Best Spectator Form */}
            {showAddAward && (
              <form
                onSubmit={handleCreateAward}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  নতুন পুরস্কার বিজয়ী অথবা আজকের সেরা দর্শকের তথ্য দিন
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ফটোকার্ড ক্যাটাগরি *
                    </label>
                    <select
                      value={awardCategory}
                      onChange={(e) =>
                        handleCategoryChange(
                          e.target.value as SpecialAwardRecord['category']
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="best_spectator">আজকের সেরা দর্শক</option>
                      <option value="man_of_the_match">ম্যান অব দ্য ম্যাচ</option>
                      <option value="player_of_the_match">
                        প্লেয়ার অব দ্য ম্যাচ
                      </option>
                      <option value="player_of_the_tournament">
                        প্লেয়ার অব দ্য টুর্নামেন্ট
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      বিজয়ী / দর্শকের নাম *
                    </label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="যেমন: মো. শাখাওয়াত হোসেন"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      দল বা এলাকার নাম
                    </label>
                    <input
                      type="text"
                      value={subtitleOrTeam}
                      onChange={(e) => setSubtitleOrTeam(e.target.value)}
                      placeholder="নূরিয়া হাজির হাট"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ম্যাচ বা তারিখের বিবরণ
                    </label>
                    <input
                      type="text"
                      value={dateLabel}
                      onChange={(e) => setDateLabel(e.target.value)}
                      placeholder="ম্যাচ নং ৮ · সিজন ২"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      হাইলাইট তথ্য ১ (খালি রাখলে ফটোকার্ডে দেখাবে না)
                    </label>
                    <input
                      type="text"
                      value={detailLine1}
                      onChange={(e) => setDetailLine1(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ছবি আপলোড (ঐচ্ছিক)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setAwardPhoto)}
                      className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-slate-200 dark:file:bg-slate-800"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAwards.map((award) => (
                <article
                  key={award.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {CATEGORY_LABELS[award.category]}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {award.dateLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <PlayerAvatar
                        photoUrl={award.photoUrl}
                        photoCrop={award.photoCrop}
                        alt={award.personName}
                        className="w-14 h-14 rounded-full"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {award.personName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {award.subtitleOrTeam}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <p className="font-semibold">{award.detailLine1}</p>
                      {award.detailLine2 && (
                        <p className="text-slate-500 dark:text-slate-400">
                          {award.detailLine2}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onGenerateAwardCard(award)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    এস্থেটিক ফটোকার্ড তৈরি করুন
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Section B: Today's Top Lottery Buyer & Interactive Raffle Draw */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  দৈনিক র‍্যাফেল ড্র ও লটারি ক্রেতা সম্মাননা কার্ড
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  আজকের সর্বোচ্চ লটারি ক্রেতা ও লাকি কুপন ড্র
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunLuckyDraw}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  লটারি লাকি ড্র করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBuyer((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {showAddBuyer
                    ? 'ফর্ম বন্ধ করুন'
                    : 'নতুন লটারি ক্রেতা যোগ করুন'}
                </button>
              </div>
            </div>

            {/* Lucky Draw Winner Banner */}
            {luckyWinner && (
              <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    অভিনন্দন! র‍্যাফেল ড্র বিজয়ী কুপন নির্বাচিত হয়েছে
                  </p>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    বিজয়ী: {luckyWinner.buyer.buyerName} (
                    {luckyWinner.buyer.areaOrVillage}) · কুপন নং{' '}
                    {luckyWinner.winningCoupon}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    মোট ক্রয়কৃত টিকিট:{' '}
                    {toBengaliNumber(luckyWinner.buyer.ticketCount)}টি (
                    {luckyWinner.buyer.couponRange}) · মোট মূল্য: ৳
                    {toBengaliNumber(luckyWinner.buyer.totalAmount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onGenerateLotteryCard(luckyWinner.buyer)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  বিজয়ীর ফটোকার্ড তৈরি করুন
                </button>
              </div>
            )}

            {/* Add Lottery Buyer Form */}
            {showAddBuyer && (
              <form
                onSubmit={handleCreateBuyer}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  নতুন লটারি টিকিট ক্রেতার তথ্য যুক্ত করুন
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ক্রেতার পূর্ণ নাম *
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="যেমন: আলহাজ্ব মো. করিম উল্লাহ"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      এলাকা / বাজার / প্রতিষ্ঠান
                    </label>
                    <input
                      type="text"
                      value={areaOrVillage}
                      onChange={(e) => setAreaOrVillage(e.target.value)}
                      placeholder="হাজির হাট বাজার"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ক্রয়কৃত টিকিট সংখ্যা *
                    </label>
                    <input
                      type="number"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      কুপন সিরিয়াল রেঞ্জ
                    </label>
                    <input
                      type="text"
                      value={couponRange}
                      onChange={(e) => setCouponRange(e.target.value)}
                      placeholder="#১০৮০ - #১১০৪"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      ক্রেতার ছবি আপলোড (ঐচ্ছিক)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setBuyerPhoto)}
                      className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-slate-200 dark:file:bg-slate-800"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      লটারি ক্রেতা সংরক্ষণ করুন
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Top #1 Buyer Spotlight + Ranked List */}
            {topBuyer && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* #1 Highest Buyer Spotlight */}
                <div className="lg:col-span-5 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <Crown className="w-4 h-4" />
                        ১নং সর্বোচ্চ লটারি ক্রেতা (আজকের সেরা)
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {toBengaliNumber(topBuyer.ticketCount)}টি টিকিট
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <PlayerAvatar
                        photoUrl={topBuyer.photoUrl}
                        photoCrop={topBuyer.photoCrop}
                        alt={topBuyer.buyerName}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {topBuyer.buyerName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {topBuyer.areaOrVillage} · কুপন: {topBuyer.couponRange}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                          মোট ক্রয় মূল্য: ৳{toBengaliNumber(topBuyer.totalAmount)} ({topBuyer.dateLabel})
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onGenerateLotteryCard(topBuyer)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    সর্বোচ্চ লটারি ক্রেতার ফটোকার্ড তৈরি করুন
                  </button>
                </div>

                {/* All Daily Buyers Leaderboard */}
                <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                  {sortedBuyers.map((buyer, idx) => (
                    <div
                      key={buyer.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                          #{toBengaliNumber(idx + 1)}
                        </span>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                            {buyer.buyerName}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {buyer.areaOrVillage} · টিকিট:{' '}
                            {toBengaliNumber(buyer.ticketCount)}টি (
                            {buyer.couponRange})
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onGenerateLotteryCard(buyer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-500" />
                        ফটোকার্ড বানান
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: MATCH FIXTURES & SCHEDULE MANAGER */}
      {subTab === 'fixtures' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                ম্যাচ সময়সূচী ও আম্পায়ার প্যানেল
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                টুর্নামেন্ট ফিক্সচার তালিকা ({toBengaliNumber(fixtures.length)}টি ম্যাচ)
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowAddFixture((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showAddFixture
                ? 'ফর্ম বন্ধ করুন'
                : 'নতুন ম্যাচ ফিক্সচার যুক্ত করুন'}
            </button>
          </div>

          {showAddFixture && (
            <form
              onSubmit={handleCreateFixture}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  ম্যাচ পর্ব
                </label>
                <input
                  type="text"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  placeholder="কোয়ার্টার ফাইনাল ১"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  প্রথম দল (Team A)
                </label>
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  দ্বিতীয় দল (Team B)
                </label>
                <input
                  type="text"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  তারিখ ও সময়
                </label>
                <input
                  type="text"
                  value={`${dateStr} · ${timeStr}`}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  দায়িত্বপ্রাপ্ত আম্পায়ারবৃন্দ
                </label>
                <input
                  type="text"
                  value={umpireNames}
                  onChange={(e) => setUmpireNames(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  ফিক্সচার তালিকায় যুক্ত করুন
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {fixtures.map((fix) => (
              <div
                key={fix.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      ম্যাচ #{toBengaliNumber(fix.matchNo)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {fix.stage}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500">
                      {fix.dateStr}, {fix.timeStr}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {fix.teamAName}{' '}
                    <span className="text-amber-500 px-1">বনাম</span>{' '}
                    {fix.teamBName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    আম্পায়ার: {fix.umpireNames}
                    {fix.resultNote ? ` · ফলাফল: ${fix.resultNote}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {fix.status !== 'FINISHED' && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateFixtureStatus(
                          fix.id,
                          'FINISHED',
                          `${fix.teamAName} জয়ী`
                        )
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      সম্পন্ন মার্ক করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: TOURNAMENT FINANCE & ENTRY FEE LEDGER */}
      {subTab === 'finance' && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                মোট তহবিল জমা (এন্ট্রি ফি, স্পন্সর ও লটারি)
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                ৳ {toBengaliNumber(financeSummary.totalIncome)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                মোট ব্যয় (লাইটিং, ট্রফি, সাউন্ড ও মাঠ)
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
                ৳ {toBengaliNumber(financeSummary.totalExpense)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                বর্তমান নিট উদ্বৃত্ত তহবিল
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
                ৳ {toBengaliNumber(financeSummary.balance)}
              </p>
            </div>
          </div>

          {/* Add Finance Entry + Ledger Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              নতুন আয় বা ব্যয়ের হিসাব যুক্ত করুন
            </h3>
            <form
              onSubmit={handleCreateFinance}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
            >
              <div className="lg:col-span-2">
                <input
                  type="text"
                  value={finTitle}
                  onChange={(e) => setFinTitle(e.target.value)}
                  placeholder="বিবরণ (যেমন: ফাইনাল ম্যাচ আতশবাজি বা নতুন স্পন্সর)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={finCategory}
                  onChange={(e) =>
                    setFinCategory(e.target.value as FinanceRecord['category'])
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="INCOME">আয় (জমা)</option>
                  <option value="EXPENSE">ব্যয় (খরচ)</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  value={finAmount}
                  onChange={(e) => setFinAmount(e.target.value)}
                  placeholder="টাকার পরিমাণ (যেমন: 5000)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  হিসাবে যোগ করুন
                </button>
              </div>
            </form>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {financeRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="py-3.5 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      খাত: {rec.tag} · {rec.dateStr}
                    </p>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm tabular-nums ${
                      rec.category === 'INCOME'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {rec.category === 'INCOME' ? '+' : '-'} ৳
                    {toBengaliNumber(rec.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL SHORT-PITCH RULES & COMMITTEE PANEL */}
      {subTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              নাইট শর্টপিচ টুর্নামেন্টের অফিসিয়াল নিয়মাবলী (সিজন ২)
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>
                প্রতিটি ম্যাচ নির্ধারিত ৬ ওভারে অনুষ্ঠিত হবে এবং একজন বোলার
                সর্বোচ্চ ২ ওভার বোলিং করতে পারবেন।
              </li>
              <li>
                শর্টপিচ নির্ধারিত বাউন্ডারি লাইনের বাইরে সরাসরি বল গেলে আউট
                অথবা নির্দিষ্ট রান নিয়ম প্রযোজ্য হবে (টসের সময় আম্পায়ার স্পষ্ট
                করবেন)।
              </li>
              <li>
                মাঠে আম্পায়ারের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে। কোনো প্রকার
                তর্ক বা অসদাচরণে দল থেকে পয়েন্ট কর্তন করা হবে।
              </li>
              <li>
                নির্ধারিত সময়ের ১৫ মিনিট পূর্বে উভয় দলের অধিনায়ক ও খেলোয়াড়দের
                মাঠে রিপোর্ট করতে হবে।
              </li>
              <li>
                প্রতিটি ম্যাচে ম্যান অব দ্য ম্যাচ, আজকের সেরা দর্শক এবং র‍্যাফেল
                ড্র বিজয়ীদের তাৎক্ষণিক ফটোকার্ড ও পুরস্কার প্রদান করা হবে।
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              টুর্নামেন্ট পুরস্কার ও পরিচালনা কমিটি হেল্পডেস্ক
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">
                  চ্যাম্পিয়ন ও রানার্স-আপ পুরস্কার
                </p>
                <p className="mt-0.5">
                  চ্যাম্পিয়ন দল: মেগা ট্রফি ও নগদ অর্থ পুরস্কার · রানার্স-আপ
                  দল: বিশেষ ট্রফি ও প্রাইজমানি।
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">
                  বিশেষ ফটোকার্ড ও সম্মাননা ক্যাটাগরি
                </p>
                <p className="mt-0.5">
                  ম্যান অব দ্য ম্যাচ, প্লেয়ার অব দ্য ম্যাচ, প্লেয়ার অব দ্য
                  টুর্নামেন্ট, আজকের সেরা দর্শক এবং আজকের সর্বোচ্চ লটারি ক্রেতা।
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
