import { browser } from '$app/environment';
import {
  ReadingGoalFrequency,
  TrackerAutoPause,
  TrackerSkipThresholdAction
} from '$lib/components/book-reader/book-reading-tracker/tracker-domain';
import { HeatmapDataAggregration } from '$lib/components/statistics/statistics-heatmap/statistics-heatmap';
import {
  defaultStatisticsView,
  type StatisticsView
} from '$lib/components/statistics/statistics-view';
import {
  StatisticsRangeTemplate,
  type BookStatistic,
  StatisticsReadingDataAggregationMode
} from '$lib/components/statistics/statistics-types';
import { BlurMode } from '$lib/data/blur-mode';
import type { UserFont } from '$lib/data/fonts';
import type { MergeMode } from '$lib/data/merge-mode';
import type { ReadingGoal } from '$lib/data/reading-goal';
import {
  appearanceSettingsDefaults,
  appearanceSettingsLimits,
  readerModeSettingsDefaults,
  readingSettingsDefaults,
  trackingSettingsDefaults
} from '$lib/data/settings-defaults';
import { SortDirection, type SortOption } from '$lib/functions/sorting';
import { AutoReplicationType } from '$lib/functions/replication/replication-options';
import { derived, type Writable } from 'svelte/store';
import { DatabaseService } from './database/books-db/database.service.svelte';
import { createBooksDb } from './database/books-db/factory';
import { FuriganaStyle } from './furigana-style';
import { ImportHTMLFixMode } from './import-html-fix-mode';
import {
  arrayLocalStorageStore,
  booleanLocalStorageStore,
  numberLocalStorageStore,
  objectLocalStorageStore,
  setLocalStorageStore,
  stringLocalStorageStore
} from './internal/persistent-local-storage-store';
import { localStorage as appLocalStorage } from './window/local-storage';
import type { TextMarginMode } from './text-margin-mode';
import type { ThemeOption } from './theme-option';
import type { VerticalTextOrientation } from './vertical-text-orientation';
import { ViewMode } from './view-mode';
import type { WritingMode } from './writing-mode';

// Normalize redesigned value domains before their stores snapshot `localStorage`. This also handles
// values restored from an older backup on the ensuing reload without making Settings-page visits
// mutate unrelated preferences.
normalizeRedesignedSettingValues();

export const theme$ = stringLocalStorageStore<string>('theme', appearanceSettingsDefaults.theme);
export const customThemes$ = objectLocalStorageStore<Record<string, ThemeOption>>(
  'customThemes',
  {}
);
export const multiplier$ = numberLocalStorageStore('autoScrollMultiplier', 20);
export const fontFamilyGroupOne$ = stringLocalStorageStore<string>(
  'fontFamilyGroupOne',
  appearanceSettingsDefaults.fontFamilyGroupOne
);
export const fontFamilyGroupTwo$ = stringLocalStorageStore<string>(
  'fontFamilyGroupTwo',
  appearanceSettingsDefaults.fontFamilyGroupTwo
);
export const fontSize$ = numberLocalStorageStore('fontSize', appearanceSettingsDefaults.fontSize);
export const lineHeight$ = numberLocalStorageStore(
  'lineHeight',
  appearanceSettingsDefaults.lineHeight
);
export const textIndentation$ = numberLocalStorageStore(
  'textIndentation',
  appearanceSettingsDefaults.textIndentation
);
export const textMarginValue$ = numberLocalStorageStore(
  'textMarginValue',
  appearanceSettingsDefaults.textMarginValue
);
export const blurImageMode$ = stringLocalStorageStore<BlurMode>(
  'hideSpoilerImageMode',
  appearanceSettingsDefaults.blurImageMode
);
export const furiganaStyle$ = stringLocalStorageStore<FuriganaStyle>(
  'furiganaStyle',
  appearanceSettingsDefaults.furiganaStyle
);
export const writingMode$ = stringLocalStorageStore<WritingMode>(
  'writingMode',
  readerModeSettingsDefaults.writingMode
);
export const enableFontVPAL$ = booleanLocalStorageStore(
  'enableFontVPAL',
  appearanceSettingsDefaults.enableFontVPAL
);
export const verticalTextOrientation$ = stringLocalStorageStore<VerticalTextOrientation>(
  'verticalTextOrientation',
  appearanceSettingsDefaults.verticalTextOrientation
);
export const prioritizeReaderStyles$ = booleanLocalStorageStore(
  'prioritizeReaderStyles',
  appearanceSettingsDefaults.prioritizeReaderStyles
);
export const enableTextJustification$ = booleanLocalStorageStore(
  'enableTextJustification',
  appearanceSettingsDefaults.enableTextJustification
);
export const enableTextWrapPretty$ = booleanLocalStorageStore(
  'enableTextWrapPretty',
  appearanceSettingsDefaults.enableTextWrapPretty
);
export const textMarginMode$ = stringLocalStorageStore<TextMarginMode>(
  'textMarginMode',
  appearanceSettingsDefaults.textMarginMode
);
export const enableReaderWakeLock$ = booleanLocalStorageStore(
  'enableReaderWakeLock',
  readingSettingsDefaults.enableReaderWakeLock
);
export const verticalMode$ = derived(writingMode$, (writingMode) => writingMode === 'vertical-rl');
export const showCharacterCounter$ = booleanLocalStorageStore(
  'showCharacterCounter',
  readingSettingsDefaults.showCharacterCounter
);
export const showPercentage$ = booleanLocalStorageStore(
  'showPercentage',
  readingSettingsDefaults.showPercentage
);
export { simplifyBookTitles$ } from '$lib/data/book-title-settings';
export const showFooterChapterCharacterCounter$ = booleanLocalStorageStore(
  'showFooterChapterCharacterCounter',
  readingSettingsDefaults.showFooterChapterCharacterCounter
);
export const showFooterChapterPercentage$ = booleanLocalStorageStore(
  'showFooterChapterPercentage',
  readingSettingsDefaults.showFooterChapterPercentage
);
export const viewMode$ = stringLocalStorageStore<ViewMode>(
  'viewMode',
  readerModeSettingsDefaults.viewMode
);

export const secondDimensionMaxValue$ = numberLocalStorageStore(
  'secondDimensionMaxValue',
  readingSettingsDefaults.secondDimensionMaxValue
);
export const firstDimensionMargin$ = numberLocalStorageStore(
  'firstDimensionMargin',
  readingSettingsDefaults.firstDimensionMargin
);

export const swipeThreshold$ = numberLocalStorageStore(
  'swipeThreshold',
  readingSettingsDefaults.swipeThreshold
);

export const disableWheelNavigation$ = booleanLocalStorageStore(
  'disableWheelNavigation',
  !readingSettingsDefaults.wheelNavigationEnabled
);

export const wheelNavigationEnabled$ = invertedBooleanStore(disableWheelNavigation$);

export const avoidPageBreak$ = booleanLocalStorageStore(
  'avoidPageBreak',
  readingSettingsDefaults.avoidPageBreak
);

export const pauseTrackerOnCustomPointChange$ = booleanLocalStorageStore(
  'pauseTrackerOnCustomPointChange',
  readingSettingsDefaults.pauseTrackerOnCustomPointChange
);

export const selectionToBookmarkEnabled$ = booleanLocalStorageStore(
  'selectionToBookmarkEnabled',
  readingSettingsDefaults.selectionToBookmarkEnabled
);

export const enableTapEdgeToFlip$ = booleanLocalStorageStore(
  'enableTapEdgeToFlip',
  readingSettingsDefaults.enableTapEdgeToFlip
);

export const confirmClose$ = booleanLocalStorageStore(
  'confirmClose',
  readingSettingsDefaults.confirmClose
);

export const manualBookmark$ = booleanLocalStorageStore(
  'manualBookmark',
  !readingSettingsDefaults.savePositionOnExit
);

export const savePositionOnExit$ = invertedBooleanStore(manualBookmark$);

export const autoBookmark$ = booleanLocalStorageStore(
  'autoBookmark',
  readingSettingsDefaults.autoBookmark
);

export const autoBookmarkTime$ = numberLocalStorageStore(
  'autoBookmarkTime',
  readingSettingsDefaults.autoBookmarkTime
);

export const pageColumns$ = numberLocalStorageStore(
  'pageColumns',
  readingSettingsDefaults.pageColumns
);

export const importHTMLFixMode$ = stringLocalStorageStore<ImportHTMLFixMode>(
  'importHTMLFixMode',
  ImportHTMLFixMode.OFF
);

export const restrictImportFixToAnchor$ = booleanLocalStorageStore(
  'restrictImportFixToAnchor',
  true
);

export const cacheStorageData$ = booleanLocalStorageStore('cacheStorageData', false);

export const autoReplication$ = stringLocalStorageStore<AutoReplicationType>(
  'autoReplication',
  AutoReplicationType.All
);

// Renamed from `keepLocalStatisticsOnDeletion` when it grew to also cover
// bookmarks; the old stored value is deliberately not migrated.
export const keepLocalReadingDataOnDeletion$ = booleanLocalStorageStore(
  'keepLocalReadingDataOnDeletion',
  trackingSettingsDefaults.keepLocalReadingDataOnDeletion
);

export const overwriteBookCompletion$ = booleanLocalStorageStore(
  'overwriteBookCompletion',
  trackingSettingsDefaults.overwriteBookCompletion
);

export const dayBoundaryTime$ = stringLocalStorageStore<string>(
  'dayBoundaryTime',
  trackingSettingsDefaults.dayBoundaryTime
);

export const statisticsEnabled$ = booleanLocalStorageStore(
  'statisticsEnabled',
  trackingSettingsDefaults.statisticsEnabled
);

export const statisticsMergeMode$ = stringLocalStorageStore<MergeMode>(
  'statisticsMergeMode',
  'merge'
);

export const readingGoalsMergeMode$ = stringLocalStorageStore<MergeMode>(
  'readingGoalsMergeMode',
  'merge'
);

export const trackerAutoPause$ = stringLocalStorageStore<TrackerAutoPause>(
  'trackerAutoPause',
  trackingSettingsDefaults.trackerAutoPause
);

export const openTrackerOnCompletion$ = booleanLocalStorageStore(
  'openTrackerOnCompletion',
  trackingSettingsDefaults.openTrackerOnCompletion
);

export const addCharactersOnCompletion$ = booleanLocalStorageStore(
  'addCharactersOnCompletion',
  trackingSettingsDefaults.addCharactersOnCompletion
);

export const trackerAutostartTime$ = numberLocalStorageStore(
  'trackerAutoStartTime',
  trackingSettingsDefaults.trackerAutostartTime
);

export const trackerIdleTime$ = numberLocalStorageStore(
  'trackerIdleTime',
  trackingSettingsDefaults.trackerIdleTime
);

export const trackerForwardSkipThreshold$ = numberLocalStorageStore(
  'trackerForwardSkipThreshold',
  trackingSettingsDefaults.trackerForwardSkipThreshold
);

export const trackerBackwardSkipThreshold$ = numberLocalStorageStore(
  'trackerBackwardSkipThreshold',
  trackingSettingsDefaults.trackerBackwardSkipThreshold
);

export const trackerSkipThresholdAction$ = stringLocalStorageStore<TrackerSkipThresholdAction>(
  'trackerSkipThresholdAction',
  trackingSettingsDefaults.trackerSkipThresholdAction
);

export const trackerPopupDetection$ = booleanLocalStorageStore(
  'trackerPopupDetection',
  trackingSettingsDefaults.trackerPopupDetection
);

export const adjustStatisticsAfterIdleTime$ = booleanLocalStorageStore(
  'adjustStatisticsAfterIdleTime',
  trackingSettingsDefaults.adjustStatisticsAfterIdleTime
);

export const readingGoal$ = objectLocalStorageStore<ReadingGoal>('readingGoal', {
  timeGoal: 0,
  characterGoal: 0,
  goalFrequency: ReadingGoalFrequency.DAILY,
  goalStartDate: '',
  lastGoalModified: Date.now()
});

export const lastBlurredTrackerItems$ = setLocalStorageStore<string>(
  'lastBlurredTrackerItems',
  new Set<string>()
);

export const lastReadingGoalsModified$ = numberLocalStorageStore('lastReadingGoalsModified', 0);

export const lastStatisticsView$ = stringLocalStorageStore<StatisticsView>(
  'lastStatisticsView',
  defaultStatisticsView
);

export const lastStatisticsRangeTemplate$ = stringLocalStorageStore<StatisticsRangeTemplate>(
  'lastStatisticsRangeTemplate',
  StatisticsRangeTemplate.TODAY
);

export const lastStatisticsStartDate$ = stringLocalStorageStore<string>(
  'lastStatisticsStartDate',
  ''
);

export const lastStatisticsEndDate$ = stringLocalStorageStore<string>('lastStatisticsEndDate', '');

export const lastStartDayOfWeek$ = numberLocalStorageStore('lastStartDayOfWeek', 1);

export const lastReadingTimeDataSource$ = stringLocalStorageStore<keyof BookStatistic>(
  'lastReadingTimeDataSource',
  'readingTime'
);

export const lastCharactersDataSource$ = stringLocalStorageStore<keyof BookStatistic>(
  'lastCharactersDataSource',
  'charactersRead'
);

export const lastReadingSpeedDataSource$ = stringLocalStorageStore<keyof BookStatistic>(
  'lastReadingSpeedDataSource',
  'lastReadingSpeed'
);

export const lastPrimaryReadingDataAggregationMode$ =
  stringLocalStorageStore<StatisticsReadingDataAggregationMode>(
    'lastPrimaryReadingDataAggregationMode',
    StatisticsReadingDataAggregationMode.NONE
  );

export const confirmStatisticsDeletion$ = booleanLocalStorageStore(
  'confirmStatisticsDeletion',
  true
);

export const lastStatisticsFilterDateRangeOnly$ = booleanLocalStorageStore(
  'lastStatisticsFilterDateRangeOnly',
  false
);

export const lastReadingDataHeatmapAggregationMode$ =
  stringLocalStorageStore<HeatmapDataAggregration>(
    'lastReadingDataHeatmapAggregationMode',
    HeatmapDataAggregration.ALL_TIME
  );

export const lastReadingGoalsHeatmapAggregationMode$ =
  stringLocalStorageStore<HeatmapDataAggregration>(
    'lastReadingGoalsHeatmapAggregationMode',
    HeatmapDataAggregration.ALL_TIME
  );

export const lastStatisticsSummarySortProperty$ = stringLocalStorageStore<keyof BookStatistic>(
  'lastStatisticsSummarySortProperty',
  'readingTime'
);

export const lastStatisticsSummarySortDirection$ = stringLocalStorageStore<SortDirection>(
  'lastStatisticsSummarySortDirection',
  SortDirection.DESC
);

const db = browser ? createBooksDb() : import('fake-indexeddb/auto').then(() => createBooksDb());

function invertedBooleanStore(source: Writable<boolean>): Writable<boolean> {
  const inverted = derived(source, (value) => !value);

  return {
    subscribe: inverted.subscribe,
    set(value) {
      source.set(!value);
    },
    update(updater) {
      source.update((value) => !updater(!value));
    }
  };
}

export const database = new DatabaseService(db);

export const booklistSortOptions$ = objectLocalStorageStore<SortOption>('booklistSortOptions', {
  property: 'lastBookOpen',
  direction: SortDirection.DESC
});

const DEFAULT_VERTICAL_READING_MARKER_POSITION = 100;
const DEFAULT_HORIZONTAL_READING_MARKER_POSITION = 0;

export const verticalCustomReadingPosition$ = numberLocalStorageStore(
  'verticalCustomReadingPosition',
  DEFAULT_VERTICAL_READING_MARKER_POSITION
);

export const horizontalCustomReadingPosition$ = numberLocalStorageStore(
  'horizontalCustomReadingPosition',
  DEFAULT_HORIZONTAL_READING_MARKER_POSITION
);

export const userFonts$ = arrayLocalStorageStore<UserFont>('userfonts', []);

function normalizeRedesignedSettingValues() {
  normalizeStoredNumber(
    'fontSize',
    (value) =>
      clamp(
        value,
        appearanceSettingsLimits.fontSize.minimum,
        appearanceSettingsLimits.fontSize.maximum
      ),
    appearanceSettingsDefaults.fontSize
  );
  normalizeStoredNumber('firstDimensionMargin', (value) => normalizeOptionalRange(value, 1, 1000));
  normalizeStoredNumber('secondDimensionMaxValue', (value) =>
    normalizeOptionalRange(value, 100, 4000)
  );
  normalizeStoredNumber(
    'swipeThreshold',
    (value) => (value <= 15 ? 10 : value <= 55 ? 40 : 80),
    10
  );
  normalizeStoredNumber('autoBookmarkTime', (value) => (value < 1 ? 3 : Math.min(value, 300)), 3);
  normalizeStoredNumber('pageColumns', (value) => clamp(Math.round(value), 0, 2));
  normalizeStoredNumber('trackerAutoStartTime', (value) =>
    value <= 0 ? 0 : clamp(Math.floor(value), 1, 300)
  );
  normalizeStoredNumber('trackerIdleTime', (value) =>
    value <= 0 ? 0 : clamp(Math.floor(value), 30, 43_200)
  );
}

function normalizeStoredNumber(
  key: string,
  normalize: (value: number) => number,
  invalidFallback = 0
) {
  const storedValue = appLocalStorage.getItem(key);
  if (!storedValue) return;

  const parsedValue = Number(storedValue);
  const normalizedValue = normalize(Number.isFinite(parsedValue) ? parsedValue : invalidFallback);
  if (normalizedValue !== parsedValue) {
    appLocalStorage.setItem(key, `${normalizedValue}`);
  }
}

function normalizeOptionalRange(value: number, minimum: number, maximum: number) {
  return value <= 0 ? 0 : clamp(value, minimum, maximum);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
