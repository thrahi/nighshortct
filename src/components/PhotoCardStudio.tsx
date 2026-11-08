import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Download,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Move,
  RefreshCw,
  Shield,
  Sliders,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import {
  CardColorTheme,
  CardStyleVariant,
  CropRegion,
  LiveMatchState,
  LotteryBuyerRecord,
  PhotoCardConfig,
  PhotoCardTemplateId,
  Player,
  SpecialAwardRecord,
  Team,
} from '../types/tournament';
import {
  buildCardConfigFromLiveMatch,
  buildCardConfigFromPlayer,
  buildCardConfigFromSpecialAward,
  buildCardConfigFromTeam,
} from '../utils/tournamentLogic';
import { renderPhotoCardToCanvas } from '../utils/cardCanvasRenderer';

interface PhotoCardStudioProps {
  config: PhotoCardConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<PhotoCardConfig>>;
  onSaveDefaultLogo: (logoSettings: {
    customLogoUrl: string;
    customLogoCrop?: CropRegion;
    showLogo: boolean;
  }) => void;
  teams: Team[];
  players: Player[];
  liveMatch: LiveMatchState;
  specialAwards: SpecialAwardRecord[];
  lotteryBuyers: LotteryBuyerRecord[];
}

const TEMPLATE_OPTIONS: Array<{
  id: PhotoCardTemplateId;
  shortLabel: string;
  label: string;
  sub: string;
}> = [
  {
    id: 'captain_welcome',
    shortLabel: 'অধিনায়ক ও দল',
    label: '১. দলীয় অধিনায়ক ও দল পরিচিতি',
    sub: 'এস্থেটিক সিল্ক ও গোল্ড রিং টিম কার্ড',
  },
  {
    id: 'player_intro',
    shortLabel: 'খেলোয়াড় পরিচিতি',
    label: '২. খেলোয়াড় পরিচিতি কার্ড',
    sub: 'সিঙ্গেল কাস্টম লোগো ও গোল্ড রিং খেলোয়াড় পরিচিতি',
  },
  {
    id: 'player_hype',
    shortLabel: 'আমি কোন দলে খেলছি',
    label: '৩. আমি কোন দলে খেলছি (উৎসাহ কার্ড)',
    sub: 'এস্থেটিক সিল্ক ওয়েভ ও গোল্ড ফ্রেম দল ঘোষণা পোস্টার',
  },
  {
    id: 'man_of_the_match',
    shortLabel: 'ম্যান অব দ্য ম্যাচ',
    label: '৪. ম্যান অব দ্য ম্যাচ',
    sub: 'ম্যাচ সেরা খেলোয়াড়ের পারফরম্যান্স ও গোল্ডেন ব্যানার',
  },
  {
    id: 'player_of_the_match',
    shortLabel: 'প্লেয়ার অব দ্য ম্যাচ',
    label: '৫. প্লেয়ার অব দ্য ম্যাচ',
    sub: 'অলরাউন্ড নৈপুণ্য ও ম্যাচ সেরা পারফর্মার কার্ড',
  },
  {
    id: 'player_of_the_tournament',
    shortLabel: 'টুর্নামেন্ট সেরা (MVP)',
    label: '৬. প্লেয়ার অব দ্য টুর্নামেন্ট (MVP)',
    sub: 'টুর্নামেন্ট সেরা খেলোয়াড়ের গ্র্যান্ড সম্মাননা কার্ড',
  },
  {
    id: 'best_spectator',
    shortLabel: 'আজকের সেরা দর্শক',
    label: '৭. আজকের সেরা দর্শক',
    sub: 'মাঠের সেরা সমর্থক ও দর্শক সম্মাননা ফটোকার্ড',
  },
  {
    id: 'top_lottery_buyer',
    shortLabel: 'সর্বোচ্চ লটারি ক্রেতা',
    label: '৮. আজকের সর্বোচ্চ লটারি ক্রেতা',
    sub: 'র‍্যাফেল ড্র-এর সর্বোচ্চ কুপন ক্রেতাকে বিশেষ ধন্যবাদ কার্ড',
  },
  {
    id: 'premium_gold_frame',
    shortLabel: 'ভিআইপি গোল্ড ফ্রেম',
    label: '৯. প্রিমিয়াম গোল্ড ফ্রেম (শুভেচ্ছা / ভিআইপি)',
    sub: 'রেফারেন্স ইমেজের এস্থেটিক গোল্ড রিং ও ক্রিমসন ওয়েভ',
  },
  {
    id: 'live_score_moment',
    shortLabel: 'লাইভ স্কোর কার্ড',
    label: '১০. লাইভ স্কোর ও গুরুত্বপূর্ণ মুহূর্ত',
    sub: 'তাৎক্ষণিক ম্যাচ স্কোর ও হাইলাইট ফটোকার্ড',
  },
];

const THEME_OPTIONS: Array<{ id: CardColorTheme; label: string; swatch: string }> = [
  { id: 'crimson_silk', label: 'ক্রিমসন সিল্ক ও গোল্ড', swatch: 'bg-rose-600' },
  { id: 'royal_gold', label: 'রয়্যাল ব্লু ও গোল্ড', swatch: 'bg-blue-600' },
  { id: 'emerald_night', label: 'এমেরাল্ড গ্রিন ও গোল্ড', swatch: 'bg-emerald-600' },
  { id: 'cyan_stadium', label: 'টিল ও অ্যাম্বার', swatch: 'bg-cyan-600' },
];

export const PhotoCardStudio: React.FC<PhotoCardStudioProps> = ({
  config,
  onChangeConfig,
  onSaveDefaultLogo,
  teams,
  players,
  liveMatch,
  specialAwards,
  lotteryBuyers,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [logoSavedBanner, setLogoSavedBanner] = useState(false);
  const [showRefComparison, setShowRefComparison] = useState(false);

  // Touch / Mouse drag state on canvas for direct photo panning
  const dragStartRef = useRef<{ x: number; y: number; startOffX: number; startOffY: number } | null>(
    null
  );

  useEffect(() => {
    if (canvasRef.current) {
      renderPhotoCardToCanvas(canvasRef.current, config);
    }
  }, [config]);

  const handleFieldChange = <K extends keyof PhotoCardConfig>(
    key: K,
    value: PhotoCardConfig[K]
  ) => {
    onChangeConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeConfig((prev) => ({
          ...prev,
          photoUrl: reader.result as string,
          photoCrop: undefined,
          photoZoom: 1,
          photoOffsetX: 0,
          photoOffsetY: 0,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        onSaveDefaultLogo({
          customLogoUrl: dataUrl,
          customLogoCrop: undefined,
          showLogo: true,
        });
        setLogoSavedBanner(true);
        setTimeout(() => setLogoSavedBanner(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectReferenceCrestLogo = () => {
    // Original tournament logo cropped from the user's reference image_7beb3144.png
    const logoSettings = {
      customLogoUrl: '/assets/aistudio/image_7beb3144.png',
      customLogoCrop: { x: 0.778, y: 0.112, w: 0.205, h: 0.172 },
      showLogo: true,
    };
    onSaveDefaultLogo(logoSettings);
    setLogoSavedBanner(true);
    setTimeout(() => setLogoSavedBanner(false), 3000);
  };

  const handleSelectVectorDefaultLogo = () => {
    const logoSettings = {
      customLogoUrl: '',
      customLogoCrop: undefined,
      showLogo: true,
    };
    onSaveDefaultLogo(logoSettings);
    setLogoSavedBanner(true);
    setTimeout(() => setLogoSavedBanner(false), 3000);
  };

  const handleToggleShowLogo = () => {
    const nextShow = config.showLogo === false ? true : false;
    onSaveDefaultLogo({
      customLogoUrl: config.customLogoUrl || '',
      customLogoCrop: config.customLogoCrop,
      showLogo: nextShow,
    });
  };

  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const cleanName = (config.personName || config.teamName || 'cricket-card')
      .trim()
      .replace(/\s+/g, '-');
    link.download = `NHC2026-${config.templateId}-${cleanName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleQuickTeamSelect = (teamId: string) => {
    const found = teams.find((t) => t.id === teamId);
    if (!found) return;
    onChangeConfig((prev) => buildCardConfigFromTeam(prev, found));
  };

  const handleQuickPlayerSelect = (playerId: string) => {
    const found = players.find((p) => p.id === playerId);
    if (!found) return;
    const targetTemplate: PhotoCardTemplateId =
      config.templateId === 'captain_welcome' ? 'player_intro' : config.templateId;
    onChangeConfig((prev) => buildCardConfigFromPlayer(prev, found, targetTemplate));
  };

  const handleQuickAwardSelect = (awardId: string) => {
    const found = specialAwards.find((a) => a.id === awardId);
    if (!found) return;
    onChangeConfig((prev) => buildCardConfigFromSpecialAward(prev, found));
  };

  const handleSyncFromLiveMatch = () => {
    const striker = players.find((p) => p.id === liveMatch.strikerId);
    const bowler = players.find((p) => p.id === liveMatch.currentBowlerId);
    onChangeConfig((prev) => buildCardConfigFromLiveMatch(prev, liveMatch, striker, bowler));
  };

  const handleSelectTemplate = (tplId: PhotoCardTemplateId) => {
    onChangeConfig((prev) => {
      let nextRole = prev.personRoleLabel;
      let nextGreeting = prev.greetingOrSlogan;
      let nextFooter = prev.footerSlogan;
      let nextPerf1 = prev.performanceLine1;
      let nextPerf2 = prev.performanceLine2;
      let nextBadgeMain = prev.badgeTopRight;
      let nextBadgeSub = prev.badgeSubtitle;

      switch (tplId) {
        case 'captain_welcome':
          nextRole = 'দলীয় অধিনায়ক';
          nextGreeting =
            'টুর্নামেন্টে অংশগ্রহণ করার জন্য পরিচালনা কমিটির পক্ষ থেকে আন্তরিক শুভেচ্ছা ও অভিনন্দন';
          nextFooter = 'খেলাধুলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল';
          break;
        case 'player_intro':
          nextRole = 'খেলোয়াড় পরিচিতি';
          nextBadgeMain = 'সিজন ২';
          nextFooter = 'খেলাধুলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল';
          break;
        case 'player_hype':
          nextGreeting = `${prev.teamName || 'আমাদের দল'}-এর হয়ে সিজন ২ মাতিয়ে তুলতে আমি প্রস্তুত!`;
          nextFooter = 'খেলাধুলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল';
          break;
        case 'man_of_the_match':
          nextRole = 'ম্যান অব দ্য ম্যাচ';
          nextBadgeMain = 'ম্যাচ সেরা';
          nextBadgeSub = 'সিজন ২';
          nextGreeting = 'অসাধারণ নৈপুণ্যে দলকে জেতানোর জন্য আন্তরিক অভিনন্দন!';
          nextFooter = 'নূরিয়া হাজির হাট ক্রিকেট টুর্নামেন্ট ২০২৬';
          break;
        case 'player_of_the_match':
          nextRole = 'প্লেয়ার অব দ্য ম্যাচ';
          nextBadgeMain = 'সেরা পারফর্মার';
          nextBadgeSub = 'সিজন ২';
          nextGreeting = 'ব্যাটে ও বলে দুর্দান্ত অলরাউন্ড পারফরম্যান্সের জন্য অভিনন্দন!';
          nextFooter = 'নূরিয়া হাজির হাট ক্রিকেট টুর্নামেন্ট ২০২৬';
          break;
        case 'player_of_the_tournament':
          nextRole = 'প্লেয়ার অব দ্য টুর্নামেন্ট';
          nextBadgeMain = 'MVP';
          nextBadgeSub = 'সিজন ২ সেরা';
          nextPerf1 = 'সর্বোচ্চ রান ও অলরাউন্ড নৈপুণ্যে টুর্নামেন্ট সেরা';
          nextPerf2 = 'সিজন ২ · গ্র্যান্ড চ্যাম্পিয়নশিপ সম্মাননা';
          nextGreeting = 'পুরো টুর্নামেন্ট জুড়ে অবিশ্বাস্য ধারাবাহিকতার জন্য বিশেষ সম্মাননা!';
          nextFooter = 'অভিনন্দন চ্যাম্পিয়ন!';
          break;
        case 'best_spectator':
          nextRole = 'আজকের সেরা দর্শক';
          nextBadgeMain = 'সেরা দর্শক';
          nextBadgeSub = 'বিশেষ সম্মাননা';
          nextPerf1 = 'পুরো ম্যাচ জুড়ে অসাধারণ উৎসাহ ও ক্রীড়াসুলভ সমর্থন';
          nextPerf2 = 'নূরিয়া হাজির হাট ভিআইপি দর্শক গ্যালারি';
          nextGreeting = 'মাঠে উপস্থিত থেকে খেলোয়াড়দের উৎসাহ দেওয়ার জন্য';
          nextFooter = 'আপনাকে আন্তরিক ধন্যবাদ ও ভালোবাসা!';
          break;
        case 'top_lottery_buyer': {
          const topBuyer = lotteryBuyers[0];
          nextRole = 'আজকের সর্বোচ্চ লটারি ক্রেতা';
          nextBadgeMain = topBuyer ? `${topBuyer.ticketCount}টি কুপন` : '৫০টি কুপন';
          nextBadgeSub = 'সর্বোচ্চ ক্রেতা';
          nextPerf1 = topBuyer
            ? `সর্বোচ্চ কুপন ক্রয়: ${topBuyer.ticketCount}টি (কুপন: ${topBuyer.couponRange})`
            : 'আজকের র‍্যাফেল ড্র-তে সর্বোচ্চ কুপন ক্রয়কারী';
          nextPerf2 = 'টুর্নামেন্টের গর্বিত শুভাকাঙ্ক্ষী ও পৃষ্ঠপোষক';
          nextGreeting = 'র‍্যাফেল ড্র-তে সর্বোচ্চ কুপন ক্রয় করে টুর্নামেন্টকে এগিয়ে নেওয়ায়';
          nextFooter = 'আপনাকে আন্তরিক ধন্যবাদ!';
          break;
        }
        case 'premium_gold_frame':
          nextGreeting = 'আপনার আস্থায় আমাদের এক বছরের পথচলা।';
          nextFooter = 'আপনাকে ধন্যবাদ।';
          break;
      }

      return {
        ...prev,
        templateId: tplId,
        personRoleLabel: nextRole,
        greetingOrSlogan: nextGreeting,
        footerSlogan: nextFooter,
        performanceLine1: nextPerf1,
        performanceLine2: nextPerf2,
        badgeTopRight: nextBadgeMain,
        badgeSubtitle: nextBadgeSub,
      };
    });
  };

  // Direct Canvas Pointer Drag Handlers for effortless mobile photo positioning
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffX: config.photoOffsetX,
      startOffY: config.photoOffsetY,
    };
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = Math.max(-50, Math.min(50, Math.round(dragStartRef.current.startOffX + dx * 0.35)));
    const nextY = Math.max(-50, Math.min(50, Math.round(dragStartRef.current.startOffY + dy * 0.35)));
    onChangeConfig((prev) => ({
      ...prev,
      photoOffsetX: nextX,
      photoOffsetY: nextY,
    }));
  };

  const handleCanvasPointerUp = () => {
    dragStartRef.current = null;
  };

  // Determine which contextual fields belong to the active template
  const tpl = config.templateId;
  const isCaptainCard = tpl === 'captain_welcome';
  const isPlayerIntro = tpl === 'player_intro';
  const isPlayerHype = tpl === 'player_hype';
  const isMatchAward =
    tpl === 'man_of_the_match' ||
    tpl === 'player_of_the_match' ||
    tpl === 'player_of_the_tournament';
  const isSpectator = tpl === 'best_spectator';
  const isLottery = tpl === 'top_lottery_buyer';
  const isVipFrame = tpl === 'premium_gold_frame';
  const isLiveScore = tpl === 'live_score_moment';

  const activeTemplateMeta =
    TEMPLATE_OPTIONS.find((t) => t.id === tpl) || TEMPLATE_OPTIONS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* =====================================================================
          LOCKED LIVE PREVIEW DOCK (STICKY ON TOP FOR MOBILE & DESKTOP)
          Ordered FIRST on mobile (`order-first lg:order-last`) so when editing
          photos or text on a phone, the live card stays locked in view!
         ===================================================================== */}
      <div className="order-first lg:order-last lg:col-span-5 sticky top-14 z-20">
        <div className="rounded-xl border-2 border-amber-500/40 dark:border-amber-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-5 shadow-xl">
          {/* Compact Top Header Bar inside Sticky Dock */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  লাইভ প্রিভিউ · {activeTemplateMeta.shortLabel}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] cursor-pointer"
              >
                <Upload className="w-3 h-3 text-amber-500" />
                ছবি
              </button>

              <button
                type="button"
                onClick={handleDownloadCard}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 sm:px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    ডাউনলোড!
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    ডাউনলোড
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Responsive Canvas Container: Compact on mobile so inputs below are always comfortably visible */}
          <div className="relative mx-auto w-full max-w-[210px] sm:max-w-[310px] lg:max-w-full aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md touch-none">
            <canvas
              ref={canvasRef}
              data-testid="photocard-canvas"
              width={1080}
              height={1080}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              className="w-full h-full object-contain block cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Quick Inline Photo Drag Hint + Live Zoom Slider inside the sticky preview dock */}
          <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium whitespace-nowrap">
              <Move className="w-3 h-3 text-amber-500 shrink-0" />
              টেনে ছবি সরান
            </span>

            <div className="flex items-center gap-2 flex-1 max-w-[180px]">
              <span className="text-[10px] whitespace-nowrap">জুম:</span>
              <input
                aria-label="কুইক জুম স্লাইডার"
                type="range"
                min="0.8"
                max="2.2"
                step="0.05"
                value={config.photoZoom}
                onChange={(e) => handleFieldChange('photoZoom', parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onChangeConfig((prev) => ({
                  ...prev,
                  photoZoom: 1,
                  photoOffsetX: 0,
                  photoOffsetY: 0,
                }))
              }
              className="hover:text-slate-900 dark:hover:text-white underline whitespace-nowrap cursor-pointer"
            >
              রিসেট
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          EDITOR CONTROLS COLUMN (SCROLLS SMOOTHLY UNDERNEATH MOBILE PREVIEW)
         ===================================================================== */}
      <div className="order-last lg:order-first lg:col-span-7 space-y-5">
        {/* STEP 1: Focused Contextual Text & Info Editor (ONLY active template's fields!) */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                নির্বাচিত কার্ড: {activeTemplateMeta.label}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                শুধুমাত্র এই কার্ডের প্রয়োজনীয় তথ্যসমূহ
              </h3>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              * যেকোনো বক্স খালি করলে কার্ড থেকে মুছে যাবে
            </span>
          </div>

          {/* Quick Auto-Fill Selector (Contextual to the active card type) */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {isCaptainCard && (
              <div>
                <label
                  htmlFor="studio-quick-team"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  এক ক্লিকে নিবন্ধিত দল ও অধিনায়কের তথ্য লোড করুন:
                </label>
                <select
                  id="studio-quick-team"
                  onChange={(e) => handleQuickTeamSelect(e.target.value)}
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="" disabled>
                    -- এখান থেকে দল বেছে নিন --
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (অধিনায়ক: {t.captainName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(isPlayerIntro || isPlayerHype) && (
              <div>
                <label
                  htmlFor="studio-quick-player"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  এক ক্লিকে নিবন্ধিত খেলোয়াড়ের তথ্য লোড করুন:
                </label>
                <select
                  id="studio-quick-player"
                  onChange={(e) => handleQuickPlayerSelect(e.target.value)}
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="" disabled>
                    -- এখান থেকে খেলোয়াড় বেছে নিন --
                  </option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.role} ({p.teamName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(isMatchAward || isSpectator || isLottery || isVipFrame) && (
              <div>
                <label
                  htmlFor="studio-quick-award"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  এক ক্লিকে নিবন্ধিত পুরস্কার / সেরা দর্শক / লটারি ক্রেতা লোড করুন:
                </label>
                <select
                  id="studio-quick-award"
                  onChange={(e) => handleQuickAwardSelect(e.target.value)}
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="" disabled>
                    -- এখান থেকে তালিকা বেছে নিন --
                  </option>
                  {specialAwards.map((aw) => (
                    <option key={aw.id} value={aw.id}>
                      {aw.title}: {aw.personName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isLiveScore && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  চলমান লাইভ ম্যাচের স্কোর ও ব্যাটসম্যানের তথ্য আনুন:
                </span>
                <button
                  type="button"
                  onClick={handleSyncFromLiveMatch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  লাইভ স্কোর সিঙ্ক করুন
                </button>
              </div>
            )}
          </div>

          {/* =================================================================
              CONTEXTUAL INPUT FIELDS (ONLY SHOWS FIELDS FOR THE ACTIVE CARD!)
             ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Common to all person-based cards: Person Name */}
            {!isLiveScore && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-person-name"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {isCaptainCard
                      ? 'দলীয় অধিনায়কের নাম'
                      : isSpectator
                        ? 'আজকের সেরা দর্শকের নাম'
                        : isLottery
                          ? 'লটারি ক্রেতার নাম'
                          : 'খেলোয়াড় / ব্যক্তির নাম'}
                  </label>
                  {config.personName && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('personName', '')}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
                <input
                  id="card-person-name"
                  type="text"
                  value={config.personName}
                  onChange={(e) => handleFieldChange('personName', e.target.value)}
                  placeholder="নাম লিখুন (খালি রাখলে দেখাবে না)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Common to Team / Player / Spectator / Lottery cards: Team or Area Name */}
            {!isLiveScore && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-team-name"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {isSpectator || isLottery
                      ? 'এলাকা / বাজার বা গ্যালারি পরিচয়'
                      : isVipFrame
                        ? 'প্রতিষ্ঠান / পরিচয় বা দল'
                        : 'দলের নাম'}
                  </label>
                  {config.teamName && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('teamName', '')}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
                <input
                  id="card-team-name"
                  type="text"
                  value={config.teamName}
                  onChange={(e) => handleFieldChange('teamName', e.target.value)}
                  placeholder="দলের নাম বা পরিচয় (খালি রাখলে মুছে যাবে)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Player Position: ONLY shown for Player Intro, Player Hype & Match Awards */}
            {(isPlayerIntro || isPlayerHype || isMatchAward) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-player-position"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    পজিশন (না থাকলে খালি রাখুন)
                  </label>
                  {config.playerPosition && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('playerPosition', '')}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      পজিশন মুছুন
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    id="card-player-position"
                    type="text"
                    value={config.playerPosition}
                    onChange={(e) => handleFieldChange('playerPosition', e.target.value)}
                    placeholder="অলরাউন্ডার / ব্যাটসম্যান"
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <select
                    aria-label="পজিশন প্রিসেট"
                    value=""
                    onChange={(e) => handleFieldChange('playerPosition', e.target.value)}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="" disabled>
                      বাছাই
                    </option>
                    <option value="অলরাউন্ডার">অলরাউন্ডার</option>
                    <option value="ব্যাটসম্যান">ব্যাটসম্যান</option>
                    <option value="বোলার">বোলার</option>
                    <option value="উইকেটকিপার">উইকেটকিপার</option>
                    <option value="">(খালি রাখুন)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Jersey Number: ONLY shown for Captain, Player Intro, Player Hype & Match Awards */}
            {(isCaptainCard || isPlayerIntro || isPlayerHype || isMatchAward) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-jersey-input"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    জার্সি নম্বর (ঐচ্ছিক — না থাকলে মুছুন)
                  </label>
                  {config.jerseyNumber && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('jerseyNumber', '')}
                      aria-label="জার্সি নম্বর মুছুন"
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
                <input
                  id="card-jersey-input"
                  type="text"
                  value={config.jerseyNumber}
                  onChange={(e) => handleFieldChange('jerseyNumber', e.target.value)}
                  placeholder="যেমন: ১০ বা ৭৫ (না থাকলে খালি রাখুন)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Role / Award Title: Shown for Captain, Awards, Spectator, Lottery, VIP */}
            {(isCaptainCard || isMatchAward || isSpectator || isLottery || isVipFrame) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-role-label"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {isCaptainCard ? 'পদবী (যেমন: দলীয় অধিনায়ক)' : 'সম্মাননা / পুরস্কারের শিরোনাম'}
                  </label>
                  {config.personRoleLabel && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('personRoleLabel', '')}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
                <input
                  id="card-role-label"
                  type="text"
                  value={config.personRoleLabel}
                  onChange={(e) => handleFieldChange('personRoleLabel', e.target.value)}
                  placeholder="পদবী বা শিরোনাম"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Badge Text: Shown for Player Intro (সিজন ২), Captain, Awards, Spectator, Lottery, VIP */}
            {!isLiveScore && !isPlayerHype && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-badge-topright"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {isPlayerIntro
                      ? 'উপরের সিজন ট্যাগ (যেমন: সিজন ২)'
                      : isLottery
                        ? 'মোট কুপন ব্যাজ (যেমন: ৫০টি কুপন)'
                        : 'ডানপাশের গোল্ড ব্যাজ টেক্সট'}
                  </label>
                  {(config.badgeTopRight || config.badgeSubtitle) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange('badgeTopRight', '');
                        handleFieldChange('badgeSubtitle', '');
                      }}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      ব্যাজ মুছুন
                    </button>
                  )}
                </div>
                <input
                  id="card-badge-topright"
                  type="text"
                  value={config.badgeTopRight}
                  onChange={(e) => handleFieldChange('badgeTopRight', e.target.value)}
                  placeholder="সিজন ২"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Performance / Highlight Lines: ONLY shown for Match Awards, Best Spectator, Lottery Buyer & Live Score */}
            {(isMatchAward || isSpectator || isLottery || isLiveScore) && (
              <>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="card-perf-1"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {isLottery
                        ? 'ক্রয়কৃত লটারি কুপন সংখ্যা ও সিরিয়াল নং'
                        : isSpectator
                          ? 'সেরা দর্শক নির্বাচনের কারণ / হাইলাইট'
                          : 'ব্যাটিং / মূল পারফরম্যান্স লাইন ১'}
                    </label>
                    {config.performanceLine1 && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('performanceLine1', '')}
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>
                  <input
                    id="card-perf-1"
                    type="text"
                    value={config.performanceLine1}
                    onChange={(e) => handleFieldChange('performanceLine1', e.target.value)}
                    placeholder="যেমন: ৫৪* রান (১৯ বল) বা ৫০টি লটারি কুপন"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="card-perf-2"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {isLottery || isSpectator
                        ? 'অতিরিক্ত তথ্য বা তারিখ লাইন ২ (ঐচ্ছিক)'
                        : 'বোলিং / অতিরিক্ত পারফরম্যান্স লাইন ২'}
                    </label>
                    {config.performanceLine2 && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('performanceLine2', '')}
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>
                  <input
                    id="card-perf-2"
                    type="text"
                    value={config.performanceLine2}
                    onChange={(e) => handleFieldChange('performanceLine2', e.target.value)}
                    placeholder="যেমন: ২ উইকেট (২.০ ওভার) — খালি রাখলে বক্স দেখাবে না"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Live Match Specific Fields: ONLY shown when `live_score_moment` is selected! */}
            {isLiveScore && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যাটিং দলের নাম
                  </label>
                  <input
                    type="text"
                    value={config.team1Name}
                    onChange={(e) => handleFieldChange('team1Name', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যাটিং দলের স্কোর ও ওভার
                  </label>
                  <input
                    type="text"
                    value={config.team1Score}
                    onChange={(e) => handleFieldChange('team1Score', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    প্রতিপক্ষ দলের নাম
                  </label>
                  <input
                    type="text"
                    value={config.team2Name}
                    onChange={(e) => handleFieldChange('team2Name', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    প্রতিপক্ষ দলের স্কোর
                  </label>
                  <input
                    type="text"
                    value={config.team2Score}
                    onChange={(e) => handleFieldChange('team2Score', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ম্যাচের গুরুত্বপূর্ণ মুহূর্তের হেডলাইন
                  </label>
                  <input
                    type="text"
                    value={config.keyMomentHeadline}
                    onChange={(e) => handleFieldChange('keyMomentHeadline', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Greeting / Slogan: Shown for Captain, Hype, Awards, Spectator, Lottery, VIP (NOT Player Intro) */}
            {!isPlayerIntro && !isLiveScore && (
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="card-greeting-text"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {isPlayerHype ? 'আমার দলের উৎসাহ স্লোগান' : 'শুভেচ্ছা বা অভিনন্দন বার্তা'}
                  </label>
                  {config.greetingOrSlogan && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('greetingOrSlogan', '')}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
                <input
                  id="card-greeting-text"
                  type="text"
                  value={config.greetingOrSlogan}
                  onChange={(e) => handleFieldChange('greetingOrSlogan', e.target.value)}
                  placeholder="শুভেচ্ছা বার্তা (খালি রাখলে দেখাবে না)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Footer Slogan: Shown on all cards */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="card-footer-slogan"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  নিচের মূল স্লোগান / ধন্যবাদ বার্তা (ঐচ্ছিক)
                </label>
                {config.footerSlogan && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('footerSlogan', '')}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                )}
              </div>
              <input
                id="card-footer-slogan"
                type="text"
                value={config.footerSlogan}
                onChange={(e) => handleFieldChange('footerSlogan', e.target.value)}
                placeholder="খেলাধুলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* STEP 2: Photo Upload & Precision Sliders */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-500" />
              খেলোয়াড় / ব্যক্তির ছবি ও পজিশন কন্ট্রোল
            </h3>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="card-photo-upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                নিজের ছবি আপলোড করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="photo-zoom-range" className="text-slate-600 dark:text-slate-400">
                  ছবি জুম (Zoom)
                </label>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  {Math.round(config.photoZoom * 100)}%
                </span>
              </div>
              <input
                id="photo-zoom-range"
                type="range"
                min="0.8"
                max="2.2"
                step="0.05"
                value={config.photoZoom}
                onChange={(e) => handleFieldChange('photoZoom', parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="photo-pan-x" className="text-slate-600 dark:text-slate-400">
                  বাম / ডান সরান
                </label>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  {config.photoOffsetX}
                </span>
              </div>
              <input
                id="photo-pan-x"
                type="range"
                min="-50"
                max="50"
                step="2"
                value={config.photoOffsetX}
                onChange={(e) => handleFieldChange('photoOffsetX', parseInt(e.target.value, 10))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="photo-pan-y" className="text-slate-600 dark:text-slate-400">
                  উপর / নিচ সরান
                </label>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
                  {config.photoOffsetY}
                </span>
              </div>
              <input
                id="photo-pan-y"
                type="range"
                min="-50"
                max="50"
                step="2"
                value={config.photoOffsetY}
                onChange={(e) => handleFieldChange('photoOffsetY', parseInt(e.target.value, 10))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </section>

        {/* STEP 3: Persistent Custom Tournament Logo Manager (Saves as Default!) */}
        <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                সকল ফটোকার্ডের জন্য কাস্টম লোগো (একবার সেট করলে ডিফল্ট হিসেবে সেভ থাকবে)
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                টুর্নামেন্ট / ক্লাব লোগো সেটিংস
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomLogoUpload}
                className="hidden"
                id="custom-logo-upload-input"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                কাস্টম লোগো আপলোড করুন
              </button>

              <button
                type="button"
                onClick={handleToggleShowLogo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {config.showLogo === false ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    লোগো চালু করুন
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                    লোগো লুকান
                  </>
                )}
              </button>
            </div>
          </div>

          {logoSavedBanner && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              আপনার লোগোটি ডিফল্ট হিসেবে সেভ হয়েছে! এখন থেকে সব ফটোকার্ডেই এটি স্বয়ংক্রিয়ভাবে যুক্ত থাকবে।
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              কুইক লোগো প্রিসেট:
            </span>
            <button
              type="button"
              onClick={handleSelectReferenceCrestLogo}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                config.customLogoUrl === '/assets/aistudio/image_7beb3144.png'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              অরিজিনাল টুর্নামেন্ট লোগো (ইমেজ)
            </button>
            <button
              type="button"
              onClick={handleSelectVectorDefaultLogo}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                !config.customLogoUrl && config.showLogo !== false
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              এইচডি ভেক্টর ক্রেস্ট লোগো
            </button>
          </div>
        </section>

        {/* STEP 4: 10 Photo Card Template Switcher & Aesthetic Theme Pickers */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                ফটোকার্ডের ধরন ও কালার থিম পরিবর্তন করুন (১০টি ফরম্যাট)
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowRefComparison((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {showRefComparison ? 'রেফারেন্স লুকান' : 'রেফারেন্স গ্যালারি'}
            </button>
          </div>

          {/* Aesthetic Mode & Color Palette Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ফটোকার্ড এস্থেটিক মোড
              </span>
              <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {(
                  [
                    { id: 'aesthetic_silk', label: 'এস্থেটিক সিল্ক ও গোল্ড রিং' },
                    { id: 'broadcast_pro', label: 'নাইট স্টেডিয়াম ফ্লাডলাইট' },
                  ] as Array<{ id: CardStyleVariant; label: string }>
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleFieldChange('styleVariant', st.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      config.styleVariant === st.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                এস্থেটিক কালার প্যালেট
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {THEME_OPTIONS.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleFieldChange('colorTheme', th.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      config.colorTheme === th.id
                        ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${th.swatch}`} />
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 10 Template Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TEMPLATE_OPTIONS.map((tplItem) => {
              const active = config.templateId === tplItem.id;
              return (
                <button
                  key={tplItem.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tplItem.id)}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    active
                      ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm">{tplItem.label}</span>
                    {active && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {tplItem.sub}
                  </p>
                </button>
              );
            })}
          </div>

          {showRefComparison && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950">
                <img
                  src="/assets/aistudio/image_57442804.png"
                  alt="এস্থেটিক গোল্ড রিং ও সিল্ক রেফারেন্স"
                  referrerPolicy="no-referrer"
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const p = players.find((pl) => pl.id === 'p-tahsin');
                    if (p) {
                      onChangeConfig((prev) => ({
                        ...buildCardConfigFromPlayer(prev, p, 'premium_gold_frame'),
                        styleVariant: 'aesthetic_silk',
                        colorTheme: 'crimson_silk',
                        greetingOrSlogan: 'আপনার আস্থায় আমাদের এক বছরের পথচলা।',
                        footerSlogan: 'আপনাকে ধন্যবাদ।',
                      }));
                    }
                  }}
                  className="mt-1.5 w-full py-1 px-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer"
                >
                  লোড করুন
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950">
                <img
                  src="/assets/aistudio/image_fe6bf5ca.png"
                  alt="আলিফ মেমোরিয়াল স্পোর্টিং ক্লাব রেফারেন্স"
                  referrerPolicy="no-referrer"
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleQuickTeamSelect('team-alif-memorial')}
                  className="mt-1.5 w-full py-1 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold cursor-pointer"
                >
                  লোড করুন
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950">
                <img
                  src="/assets/aistudio/image_2b721d7c.png"
                  alt="নোয়াখালী সুপার জায়ান্টস রেফারেন্স"
                  referrerPolicy="no-referrer"
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleQuickTeamSelect('team-noakhali-giants')}
                  className="mt-1.5 w-full py-1 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold cursor-pointer"
                >
                  লোড করুন
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950">
                <img
                  src="/assets/aistudio/image_7beb3144.png"
                  alt="খেলোয়াড় পরিচিতি রেফারেন্স"
                  referrerPolicy="no-referrer"
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const p = players.find((pl) => pl.id === 'p-jobayer');
                    if (p) {
                      onChangeConfig((prev) => buildCardConfigFromPlayer(prev, p, 'player_intro'));
                    }
                  }}
                  className="mt-1.5 w-full py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                >
                  লোড করুন
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
