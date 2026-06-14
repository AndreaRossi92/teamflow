import Autocomplete, {
  type AutocompleteProps,
} from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import {
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useEventCallback, useForkRef } from "@mui/material/utils";
import useTimeout from "@mui/utils/useTimeout";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Virtualizer } from "@tanstack/react-virtual";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type Key,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";
import type { PaginatedResponse } from "../types/paginatedResponse";
import type { AxiosError } from "axios";
import { Controller, useFormContext } from "react-hook-form";

const ITEM_HEIGHT_PX = 36;
const MAX_LISTBOX_HEIGHT_PX = 8 * ITEM_HEIGHT_PX;
const OVERSCAN = 5;
const PREFETCH_WITHIN_ITEMS = 5;
const INPUT_DEBOUNCE_MS = 400;

// Autocomplete invokes `renderOption(props, option)` for every option that
// would be rendered. Returning this tuple lets the virtual listbox own layout
// and mount only the rows that are visible.
type OptionTuple<T = unknown> = readonly [
  HTMLAttributes<HTMLLIElement> & { key: Key },
  T,
];

type ListboxVirtualizer = Virtualizer<HTMLUListElement, Element>;

/** Props added to the Autocomplete listbox slot for infinite loading and virtualization. */
interface VirtualListboxProps extends HTMLAttributes<HTMLUListElement> {
  /** Called when the rendered window gets close enough to the end to load another page. */
  onReachEnd: () => void;
  /** Changes when the search context changes so the listbox can reset to the first row. */
  resetScrollKey: string;
  /** Exposes the virtualizer to the parent so keyboard navigation can scroll highlighted rows into view. */
  virtualizerRef: RefObject<ListboxVirtualizer | null>;
  /** Extracts a display label from any option, keeping VirtualListbox decoupled from T. */
  getOptionLabel: (option: unknown) => string;
}

/**
 * Virtualized Autocomplete listbox.
 * It mounts only visible options and triggers pagination as the rendered range approaches the end.
 */
const VirtualListbox = forwardRef<HTMLUListElement, VirtualListboxProps>(
  function VirtualListbox(props, forwardedRef) {
    const {
      children,
      onReachEnd,
      resetScrollKey,
      virtualizerRef,
      getOptionLabel,
      style,
      ...listboxProps
    } = props;
    const items = children as OptionTuple[];

    // One DOM node must serve both Autocomplete's listbox ref and the virtualizer's
    // scroll observer, so merge the forwarded ref with the local ref.
    const scrollContainerRef = useRef<HTMLUListElement | null>(null);
    const setScrollContainerRef = useForkRef(scrollContainerRef, forwardedRef);

    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => scrollContainerRef.current,
      estimateSize: () => ITEM_HEIGHT_PX,
      overscan: OVERSCAN,
      // Avoids forcing synchronous updates while Autocomplete is rendering.
      useFlushSync: false,
    });

    useEffect(() => {
      virtualizerRef.current = virtualizer;
      return () => {
        if (virtualizerRef.current === virtualizer) {
          virtualizerRef.current = null;
        }
      };
    }, [virtualizer, virtualizerRef]);

    useEffect(() => {
      scrollContainerRef.current?.scrollTo({ top: 0 });
      virtualizer.scrollToOffset(0);
    }, [resetScrollKey, virtualizer]);

    const virtualItems = virtualizer.getVirtualItems();
    const lastRenderedIndex =
      virtualItems[virtualItems.length - 1]?.index ?? -1;

    // Trigger pagination from the virtualizer's rendered range, not raw scroll
    // offsets, so overscan and keyboard scrolling behave consistently.
    useEffect(() => {
      if (
        items.length > 0 &&
        lastRenderedIndex >= items.length - PREFETCH_WITHIN_ITEMS
      ) {
        onReachEnd();
      }
    }, [lastRenderedIndex, items.length, onReachEnd]);

    return (
      <ul
        ref={setScrollContainerRef}
        {...listboxProps}
        style={{
          ...style,
          boxSizing: "border-box",
          maxHeight: MAX_LISTBOX_HEIGHT_PX,
          overflow: "auto",
          paddingBlock: 0,
          paddingInline: 0,
          margin: 0,
          position: "relative",
          listStyle: "none",
        }}
      >
        {/* This spacer gives the <ul> its scroll height without nesting a div inside the listbox. */}
        <li
          aria-hidden
          role="presentation"
          style={{
            height: virtualizer.getTotalSize(),
            pointerEvents: "none",
          }}
        />
        {virtualItems.map((virtualItem) => {
          const [optionProps, option] = items[virtualItem.index];
          const { key, style: optionStyle, ...htmlProps } = optionProps;
          const label = getOptionLabel(option);

          return (
            <li
              key={key}
              {...htmlProps}
              style={{
                ...optionStyle,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <span
                title={label}
                style={{
                  display: "block",
                  flexGrow: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    );
  },
);

type ControlledInfiniteQueryAutocompleteProps<
  TOption,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> = {
  name: string;
  label?: string;
  infiniteQuery: UseInfiniteQueryResult<
    InfiniteData<PaginatedResponse<TOption>, number>,
    AxiosError<unknown, any>
  >;
  getOptionKey: (option: TOption) => string;
  getOptionLabel: (option: TOption) => string;
  textFieldProps?: Omit<
    TextFieldProps,
    "name" | "label" | "error" | "helperText"
  >;
} & Omit<
  AutocompleteProps<TOption, Multiple, DisableClearable, FreeSolo>,
  "renderInput" | "name" | "getOptionKey" | "getOptionLabel" | "options"
>;

export default function ControlledInfiniteQueryAutocomplete<T>({
  name,
  label,
  infiniteQuery,
  getOptionLabel,
  getOptionKey,
  textFieldProps,
  ...autocompleteProps
}: ControlledInfiniteQueryAutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [queryInputValue, setQueryInputValue] = useState("");
  const virtualizerRef = useRef<ListboxVirtualizer | null>(null);
  const wasOpenRef = useRef(false);
  const queryDebounce = useTimeout();

  useEffect(() => {
    // Opening the popup should query for whatever text is already visible in the
    // input, but reopening should not retrigger this sync while it is already open.
    if (open && !wasOpenRef.current) {
      setSearchInputValue(inputValue);
      setQueryInputValue(inputValue);
    }
    wasOpenRef.current = open;
  }, [inputValue, open]);

  useEffect(() => {
    if (!open || searchInputValue === queryInputValue) {
      queryDebounce.clear();
      return undefined;
    }

    queryDebounce.start(INPUT_DEBOUNCE_MS, () => {
      setQueryInputValue(searchInputValue);
    });

    return queryDebounce.clear;
  }, [open, queryDebounce, queryInputValue, searchInputValue]);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    infiniteQuery;

  const options = useMemo(
    () =>
      data?.pages.reduce((acc, page) => [...acc, ...page.data], [] as T[]) ??
      [],
    [data],
  );

  const optionIndexMap = useMemo(() => {
    const indexMap = new Map<string, number>();

    options.forEach((option, index) => {
      indexMap.set(getOptionKey(option), index);
    });

    return indexMap;
  }, [options]);

  const handleReachEnd = useEventCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const handleInputChange = useEventCallback(
    (
      _event: SyntheticEvent,
      newInputValue: string,
      reason:
        | "input"
        | "reset"
        | "clear"
        | "blur"
        | "selectOption"
        | "removeOption",
    ) => {
      setInputValue(newInputValue);

      // Autocomplete also calls `onInputChange` for selection and blur resets.
      // Only real typing should advance the remote query.
      if (reason === "input") {
        setSearchInputValue(newInputValue);
      }

      if (reason === "clear") {
        setSearchInputValue(newInputValue);
        setQueryInputValue(newInputValue);
      }
    },
  );

  const handleHighlightChange = useEventCallback(
    (_event: SyntheticEvent, option: T | null) => {
      const virtualizer = virtualizerRef.current;
      if (!option || !virtualizer) {
        return;
      }

      // Keep keyboard navigation aligned with virtualization. Autocomplete can
      // highlight rows that are not mounted, so its default scrollIntoView would
      // otherwise no-op for off-screen options.
      const index = optionIndexMap.get(getOptionKey(option));
      if (index !== undefined) {
        virtualizer.scrollToIndex(index, { align: "auto" });
      }
    },
  );

  // The listbox scrolls back to the top when the popup opens or the search
  // query changes, matching what users expect from a newly loaded result set.
  const listboxResetKey = open ? queryInputValue : `closed:${queryInputValue}`;

  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete<T>
          {...autocompleteProps}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          options={options}
          value={field.value ?? (autocompleteProps.multiple ? [] : null)}
          onBlur={field.onBlur}
          onChange={(_event, newValue) => field.onChange(newValue)}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          // Results are already filtered by the query key, so disable the built-in
          // client filter.
          filterOptions={(x) => x}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(option, candidate) =>
            getOptionKey(option) === getOptionKey(candidate)
          }
          loading={isFetching}
          disableListWrap
          onHighlightChange={handleHighlightChange}
          renderOption={(optionProps, option) =>
            [optionProps, option] as unknown as ReactNode
          }
          renderInput={(params) => {
            const { endAdornment, ...inputSlotProps } = params.slotProps.input;

            return (
              <TextField
                {...params}
                {...textFieldProps}
                label={label}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...inputSlotProps,
                    endAdornment: (
                      <>
                        {isFetching ? (
                          <CircularProgress color="inherit" size={18} />
                        ) : null}
                        {endAdornment}
                      </>
                    ),
                  },
                }}
              />
            );
          }}
          slotProps={{
            // The cast is only for the extra props injected into this custom slot.
            listbox: {
              component: VirtualListbox,
              onReachEnd: handleReachEnd,
              resetScrollKey: listboxResetKey,
              virtualizerRef,
              getOptionLabel,
            } as any,
          }}
        />
      )}
    />
  );
}
