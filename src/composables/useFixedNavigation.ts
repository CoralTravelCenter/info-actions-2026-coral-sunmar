import {
  useEventListener,
  useMediaQuery,
  useResizeObserver,
} from "@vueuse/core";
import {
  computed,
  onMounted,
  ref,
  type CSSProperties,
  type Ref,
} from "vue";

interface FixedNavigationOptions {
  desktopQuery: string;
  tabletQuery?: string;
  mobileTop: number;
  tabletTop?: number;
  desktopTop: number;
  hideStep?: number;
  showDistance?: number;
  hideConfirmations?: number;
}

interface NavigationState {
  isFixed: boolean;
  isVisible: boolean;
  downwardConfirmations: number;
}

interface NavigationStateInput {
  anchorTop: number;
  topOffset: number;
  scrollDelta: number;
  hideStep: number;
  showDistance: number;
  hideConfirmations: number;
  distanceSinceFixed: number;
  initialHideDistance: number;
}

export function resolveNavigationState(
  current: NavigationState,
  input: NavigationStateInput,
): NavigationState {
  const isFixed = input.anchorTop <= input.topOffset;

  if (!isFixed) {
    return {isFixed: false, isVisible: true, downwardConfirmations: 0};
  }
  if (!current.isFixed) {
    return {isFixed: true, isVisible: true, downwardConfirmations: 0};
  }
  if (current.isVisible && input.distanceSinceFixed < input.initialHideDistance) {
    return {...current, downwardConfirmations: 0};
  }
  if (input.scrollDelta >= input.hideStep) {
    const downwardConfirmations = Math.min(
      current.downwardConfirmations + 1,
      input.hideConfirmations,
    );
    return {
      isFixed: true,
      isVisible: downwardConfirmations < input.hideConfirmations,
      downwardConfirmations,
    };
  }
  if (input.scrollDelta <= -input.showDistance) {
    return {isFixed: true, isVisible: true, downwardConfirmations: 0};
  }

  return current;
}

export function useFixedNavigation(
  anchorRef: Ref<HTMLElement | null>,
  navigationRef: Ref<HTMLElement | null>,
  options: FixedNavigationOptions,
) {
  const isDesktop = useMediaQuery(options.desktopQuery);
  const isTablet = useMediaQuery(options.tabletQuery ?? options.desktopQuery);
  const topOffset = computed(() => {
    if (isDesktop.value) return options.desktopTop;
    if (isTablet.value) return options.tabletTop ?? options.mobileTop;
    return options.mobileTop;
  });
  const hideStep = options.hideStep ?? 48;
  const showDistance = options.showDistance ?? 24;
  const hideConfirmations = options.hideConfirmations ?? 2;
  const state = ref<NavigationState>({
    isFixed: false,
    isVisible: true,
    downwardConfirmations: 0,
  });
  const geometry = ref({left: 0, width: 0, height: 0});
  let referenceScrollY = 0;
  let fixedAtScrollY: number | null = null;

  function measure(): void {
    const anchor = anchorRef.value;
    const navigation = navigationRef.value;
    if (!anchor || !navigation) return;

    const anchorRect = anchor.getBoundingClientRect();
    const navigationRect = navigation.getBoundingClientRect();
    geometry.value = {
      left: anchorRect.left,
      width: anchorRect.width,
      height: navigationRect.height,
    };

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - referenceScrollY;
    const previousState = state.value;
    const nextState = resolveNavigationState(previousState, {
      anchorTop: anchorRect.top,
      topOffset: topOffset.value,
      scrollDelta,
      hideStep,
      showDistance,
      hideConfirmations,
      distanceSinceFixed: fixedAtScrollY === null
        ? 0
        : Math.max(0, currentScrollY - fixedAtScrollY),
      initialHideDistance: navigationRect.height,
    });
    state.value = nextState;

    if (!previousState.isFixed && nextState.isFixed) {
      fixedAtScrollY = currentScrollY;
      referenceScrollY = currentScrollY;
    } else if (!nextState.isFixed) {
      fixedAtScrollY = null;
    }

    if (
      (previousState.isFixed &&
        (scrollDelta >= hideStep || scrollDelta <= -showDistance)) ||
      !nextState.isFixed
    ) {
      referenceScrollY = currentScrollY;
    }
  }

  useEventListener(window, "scroll", measure, {passive: true});
  useEventListener(window, "resize", measure, {passive: true});
  useResizeObserver(navigationRef, measure);
  onMounted(() => {
    referenceScrollY = window.scrollY;
    measure();
  });

  const anchorStyle = computed<CSSProperties>(() =>
    state.value.isFixed ? {height: `${geometry.value.height}px`} : {},
  );
  const navigationStyle = computed<CSSProperties>(() => {
    if (!state.value.isFixed) return {};

    return {
      left: `${geometry.value.left}px`,
      top: `${topOffset.value}px`,
      width: `${geometry.value.width}px`,
      transform: state.value.isVisible
        ? "translateY(0)"
        : `translateY(calc(-100% - ${topOffset.value}px))`,
    };
  });

  return {
    anchorStyle,
    isFixed: computed(() => state.value.isFixed),
    isVisible: computed(() => state.value.isVisible),
    navigationStyle,
  };
}
