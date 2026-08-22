import {
  TrackerAutoPause,
  TrackerSkipThresholdAction
} from '$lib/components/book-reader/book-reading-tracker/tracker-domain';
import { BlurMode } from '$lib/data/blur-mode';
import { defaultFonts } from '$lib/data/fonts';
import { FuriganaStyle } from '$lib/data/furigana-style';
import type { TextMarginMode } from '$lib/data/text-margin-mode';
import type { VerticalTextOrientation } from '$lib/data/vertical-text-orientation';
import { ViewMode } from '$lib/data/view-mode';
import type { WritingMode } from '$lib/data/writing-mode';

export const readerModeSettingsDefaults = {
  writingMode: 'vertical-rl' as WritingMode,
  viewMode: ViewMode.Paginated
};

export const appearanceSettingsDefaults = {
  simplifyBookTitles: true,
  theme: 'light-theme',
  fontFamilyGroupOne: defaultFonts.serif,
  fontFamilyGroupTwo: defaultFonts['sans-serif'],
  fontSize: 20,
  lineHeight: 1.65,
  textIndentation: 0,
  textMarginMode: 'auto' as TextMarginMode,
  textMarginValue: 0,
  enableTextJustification: false,
  furiganaStyle: FuriganaStyle.Default,
  blurImageMode: BlurMode.OFF,
  prioritizeReaderStyles: false,
  enableTextWrapPretty: false,
  verticalTextOrientation: 'mixed' as VerticalTextOrientation,
  enableFontVPAL: false
};

export const appearanceSettingsLimits = {
  fontSize: { minimum: 1, maximum: 200 }
};

export const readingSettingsDefaults = {
  firstDimensionMargin: 0,
  secondDimensionMaxValue: 0,
  pageColumns: 0,
  avoidPageBreak: false,
  wheelNavigationEnabled: true,
  enableTapEdgeToFlip: false,
  swipeThreshold: 10,
  enableReaderWakeLock: false,
  autoBookmark: true,
  autoBookmarkTime: 3,
  savePositionOnExit: true,
  confirmClose: false,
  selectionToBookmarkEnabled: false,
  pauseTrackerOnCustomPointChange: true,
  showCharacterCounter: true,
  showPercentage: true,
  showFooterChapterCharacterCounter: false,
  showFooterChapterPercentage: false
};

export const trackingSettingsDefaults = {
  statisticsEnabled: false,
  trackerAutostartTime: 0,
  trackerAutoPause: TrackerAutoPause.MODERATE,
  trackerPopupDetection: false,
  trackerIdleTime: 0,
  adjustStatisticsAfterIdleTime: true,
  openTrackerOnCompletion: true,
  addCharactersOnCompletion: false,
  overwriteBookCompletion: false,
  dayBoundaryTime: '00:00',
  keepLocalReadingDataOnDeletion: true,
  trackerForwardSkipThreshold: 2700,
  trackerBackwardSkipThreshold: 2700,
  trackerSkipThresholdAction: TrackerSkipThresholdAction.IGNORE
};
