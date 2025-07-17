import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Input,
  Button,
  Typography,
  Chip,
  Alert,
  Tooltip,
  ButtonGroup,
  Divider,
} from "@mui/material";
import { validateOwnedInput, formatOwnedForModal } from "../utils/ownedItems";

interface OwnedItemsManagerProps {
  currentOwned: number[];
  total: number;
  onUpdate: (newOwned: number[]) => void;
  isLoading?: boolean;
  saveError?: string | null;
  onRetry?: () => void;
  onClose?: () => void; // For handling Escape key to close modal
}

interface OwnedItemsState {
  owned: number[];
  inputValue: string;
  error: string | null;
  isValid: boolean;
  successMessage: string | null;
  lastAction: string | null;
}

export default function OwnedItemsManager({
  currentOwned,
  total,
  onUpdate,
  onClose,
}: OwnedItemsManagerProps) {
  const [state, setState] = useState<OwnedItemsState>({
    owned: [...currentOwned].sort((a, b) => a - b),
    inputValue: "",
    error: null,
    isValid: true,
    successMessage: null,
    lastAction: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const clearAllButtonRef = useRef<HTMLButtonElement>(null);

  // Update local state when props change
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      owned: [...currentOwned].sort((a, b) => a - b),
    }));
  }, [currentOwned]);

  // Notify parent of changes (but not when state was just updated from props)
  useEffect(() => {
    // Only notify parent if the owned items are different from the current props
    // This prevents infinite loops when the parent updates currentOwned
    const sortedCurrent = [...currentOwned].sort((a, b) => a - b);
    const sortedState = [...state.owned].sort((a, b) => a - b);

    if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedState)) {
      onUpdate(state.owned);
    }
  }, [state.owned, currentOwned, onUpdate]);

  // Clear success messages after a delay
  useEffect(() => {
    if (state.successMessage) {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          successMessage: null,
          lastAction: null,
        }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.successMessage]);

  // Clear error messages when user starts typing
  useEffect(() => {
    if (state.inputValue && state.error) {
      setState((prev) => ({
        ...prev,
        error: null,
        isValid: true,
      }));
    }
  }, [state.inputValue, state.error]);

  // Focus management - focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      inputValue: value,
      error: null,
      isValid: true,
    }));
  };

  const handleAddItems = () => {
    const validation = validateOwnedInput(state.inputValue, total, state.owned);

    if (!validation.isValid) {
      setState((prev) => ({
        ...prev,
        error: validation.error || "Invalid input",
        isValid: false,
      }));
      return;
    }

    if (validation.parsedNumbers && validation.parsedNumbers.length > 0) {
      const newOwned = [...state.owned, ...validation.parsedNumbers].sort(
        (a, b) => a - b
      );

      setState((prev) => ({
        ...prev,
        owned: newOwned,
        inputValue: "",
        error: null,
        isValid: true,
        successMessage: `✨ Added ${validation.parsedNumbers?.length} item(s) successfully!`,
        lastAction: "add",
      }));

      // Return focus to input after adding items
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleRemoveItem = (itemToRemove: number) => {
    const newOwned = state.owned.filter((item) => item !== itemToRemove);
    setState((prev) => ({
      ...prev,
      owned: newOwned,
      successMessage: `Removed item ${itemToRemove}`,
      lastAction: "remove",
    }));

    // Return focus to input after removing item
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearAll = () => {
    setState((prev) => ({
      ...prev,
      owned: [],
      successMessage: `Cleared all ${prev.owned.length} items`,
      lastAction: "clear",
    }));

    // Return focus to input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectAll = () => {
    if (total <= 0) {
      setState((prev) => ({
        ...prev,
        error: "Please set a total number of items first",
        isValid: false,
      }));
      return;
    }

    const allItems = Array.from({ length: total }, (_, i) => i + 1);
    const newItems = allItems.filter((item) => !state.owned.includes(item));

    if (newItems.length === 0) {
      setState((prev) => ({
        ...prev,
        successMessage: "All items are already owned",
        lastAction: "select-all",
      }));
    } else {
      setState((prev) => ({
        ...prev,
        owned: allItems,
        successMessage: `Added ${newItems.length} items (now own all ${total} items)`,
        lastAction: "select-all",
      }));
    }

    // Return focus to input after selecting all
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAddRange = (start: number, end: number) => {
    const rangeItems = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
    const newItems = rangeItems.filter((item) => !state.owned.includes(item));

    if (newItems.length === 0) {
      setState((prev) => ({
        ...prev,
        successMessage: `Range ${start}-${end} is already owned`,
        lastAction: "add-range",
      }));
    } else {
      const newOwned = [...state.owned, ...newItems].sort((a, b) => a - b);
      setState((prev) => ({
        ...prev,
        owned: newOwned,
        successMessage: `Added ${newItems.length} items from range ${start}-${end}`,
        lastAction: "add-range",
      }));
    }

    // Return focus to input after adding range
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleQuickRange = (
    rangeType: "first-half" | "second-half" | "first-10" | "last-10"
  ) => {
    if (total <= 0) {
      setState((prev) => ({
        ...prev,
        error: "Please set a total number of items first",
        isValid: false,
      }));
      return;
    }

    let start: number, end: number;

    switch (rangeType) {
      case "first-half":
        start = 1;
        end = Math.ceil(total / 2);
        break;
      case "second-half":
        start = Math.ceil(total / 2) + 1;
        end = total;
        break;
      case "first-10":
        start = 1;
        end = Math.min(10, total);
        break;
      case "last-10":
        start = Math.max(1, total - 9);
        end = total;
        break;
      default:
        return;
    }

    handleAddRange(start, end);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Enter key to add items
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddItems();
      return;
    }

    // Handle Escape key to close modal
    if (event.key === "Escape") {
      event.preventDefault();
      if (onClose) {
        onClose();
      }
      return;
    }

    // Handle Ctrl+A to select all (add range 1-total)
    if (event.key === "a" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (total > 0) {
        setState((prev) => ({
          ...prev,
          inputValue: `1-${total}`,
        }));
      }
      return;
    }

    // Handle Ctrl+Backspace or Ctrl+Delete to clear all
    if (
      (event.key === "Backspace" || event.key === "Delete") &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      handleClearAll();
      return;
    }
  };

  const handleChipKeyDown = (event: React.KeyboardEvent, item: number) => {
    // Handle Delete or Backspace to remove item
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      handleRemoveItem(item);
    }
  };

  // Group consecutive numbers for visual indicators
  const getConsecutiveGroups = (numbers: number[]) => {
    if (numbers.length === 0) return [];

    const sorted = [...numbers].sort((a, b) => a - b);
    const groups: { start: number; end: number; items: number[] }[] = [];
    let currentGroup = { start: sorted[0], end: sorted[0], items: [sorted[0]] };

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === currentGroup.end + 1) {
        // Continue current group
        currentGroup.end = sorted[i];
        currentGroup.items.push(sorted[i]);
      } else {
        // Start new group
        groups.push(currentGroup);
        currentGroup = { start: sorted[i], end: sorted[i], items: [sorted[i]] };
      }
    }
    groups.push(currentGroup);

    return groups;
  };

  const renderOwnedItemsWithRangeIndicators = () => {
    const groups = getConsecutiveGroups(state.owned);

    return groups.map((group, groupIndex) => (
      <Box
        key={`group-${groupIndex}`}
        sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}
      >
        {group.items.length > 2 ? (
          // Show as range for 3+ consecutive items
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip
              title={`Consecutive range: ${group.start}-${group.end} (${group.items.length} items)`}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  p: 0.5,
                  border: "2px dashed",
                  borderColor: "primary.main",
                  borderRadius: 1,
                  backgroundColor: "primary.light",
                  opacity: 0.1,
                }}
              >
                <Typography
                  variant="caption"
                  color="primary.main"
                  sx={{ fontWeight: "bold" }}
                >
                  Range {group.start}-{group.end}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => {
                    const newOwned = state.owned.filter(
                      (item) => !group.items.includes(item)
                    );
                    setState((prev) => ({
                      ...prev,
                      owned: newOwned,
                      successMessage: `Removed range ${group.start}-${group.end} (${group.items.length} items)`,
                      lastAction: "remove-range",
                    }));
                  }}
                  sx={{ minWidth: "auto", p: 0.5 }}
                  aria-label={`Remove entire range ${group.start}-${group.end}`}
                >
                  ×
                </Button>
              </Box>
            </Tooltip>
            {/* Show individual chips for the range */}
            {group.items.map((item) => (
              <Chip
                key={item}
                label={item}
                onDelete={() => handleRemoveItem(item)}
                onKeyDown={(e) => handleChipKeyDown(e, item)}
                size="small"
                variant="filled"
                color="primary"
                tabIndex={0}
                role="listitem"
                aria-label={`Owned item ${item} (part of range ${group.start}-${group.end}). Press Delete or Backspace to remove.`}
                deleteIcon={<div>×</div>}
                sx={{ opacity: 0.8 }}
              />
            ))}
          </Box>
        ) : (
          // Show individual chips for non-consecutive or small groups
          group.items.map((item) => (
            <Chip
              key={item}
              label={item}
              onDelete={() => handleRemoveItem(item)}
              onKeyDown={(e) => handleChipKeyDown(e, item)}
              size="small"
              variant="outlined"
              tabIndex={0}
              role="listitem"
              aria-label={`Owned item ${item}. Press Delete or Backspace to remove.`}
              deleteIcon={<div>×</div>}
            />
          ))
        )}
      </Box>
    ));
  };

  return (
    <Box
      ref={containerRef}
      sx={{ mt: 2, mb: 2 }}
      onKeyDown={handleKeyDown}
      role="region"
      aria-labelledby="owned-items-title"
      aria-describedby="owned-items-description"
    >
      <Typography id="owned-items-title" variant="subtitle1" sx={{ mb: 1 }}>
        Manage Owned Items ({state.owned.length}/{total})
      </Typography>

      <Typography
        id="owned-items-description"
        variant="caption"
        color="text.secondary"
        sx={{ mb: 2, display: "block" }}
      >
        Use Enter to add items, Escape to close, Ctrl+A to select all,
        Ctrl+Delete to clear all
      </Typography>

      {/* Success message */}
      {state.successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          role="status"
          aria-live="polite"
        >
          {state.successMessage}
        </Alert>
      )}

      {/* Input section */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <Input
            ref={inputRef}
            fullWidth
            placeholder="Enter numbers (e.g., 1,3,5-8) or ranges"
            value={state.inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            error={!state.isValid}
            aria-label="Enter owned item numbers or ranges"
            aria-describedby="input-help-text input-error-text"
            aria-invalid={!state.isValid}
          />
          <Typography
            id="input-help-text"
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            Format: 1,2,5-8 or individual numbers (1 to {total})
          </Typography>
        </Box>
        <Button
          ref={addButtonRef}
          variant="contained"
          onClick={handleAddItems}
          disabled={!state.inputValue.trim()}
          sx={{ mt: 0.5 }}
          aria-label="Add entered items to owned list"
        >
          Add
        </Button>
      </Box>

      {/* Error display */}
      {state.error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          role="alert"
          aria-live="assertive"
        >
          <span id="input-error-text">{state.error}</span>
        </Alert>
      )}

      {/* Quick Action Buttons */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Quick Actions:
        </Typography>

        {/* Bulk Operations */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Add all items from 1 to total">
              <Button
                onClick={handleSelectAll}
                disabled={total <= 0}
                aria-label="Select all items"
              >
                Select All
              </Button>
            </Tooltip>
            <Tooltip title="Clear all owned items (Ctrl+Delete)">
              <Button
                ref={clearAllButtonRef}
                onClick={handleClearAll}
                disabled={state.owned.length === 0}
                color="error"
                aria-label={`Clear all ${state.owned.length} owned items`}
              >
                Clear All
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>

        {/* Quick Range Buttons */}
        {total > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ width: "100%", mb: 0.5 }}
            >
              Quick Ranges:
            </Typography>

            <ButtonGroup size="small" variant="outlined" color="secondary">
              {total >= 10 && (
                <Tooltip title="Add items 1-10">
                  <Button
                    onClick={() => handleQuickRange("first-10")}
                    aria-label="Add first 10 items"
                  >
                    First 10
                  </Button>
                </Tooltip>
              )}

              {total > 2 && (
                <Tooltip title={`Add items 1-${Math.ceil(total / 2)}`}>
                  <Button
                    onClick={() => handleQuickRange("first-half")}
                    aria-label="Add first half of items"
                  >
                    First Half
                  </Button>
                </Tooltip>
              )}

              {total > 2 && (
                <Tooltip
                  title={`Add items ${Math.ceil(total / 2) + 1}-${total}`}
                >
                  <Button
                    onClick={() => handleQuickRange("second-half")}
                    aria-label="Add second half of items"
                  >
                    Second Half
                  </Button>
                </Tooltip>
              )}

              {total >= 10 && (
                <Tooltip title={`Add items ${Math.max(1, total - 9)}-${total}`}>
                  <Button
                    onClick={() => handleQuickRange("last-10")}
                    aria-label="Add last 10 items"
                  >
                    Last 10
                  </Button>
                </Tooltip>
              )}
            </ButtonGroup>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
      </Box>

      {/* Currently owned items display */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }} id="owned-list-title">
          Currently Owned:
        </Typography>

        {state.owned.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            role="status"
            aria-live="polite"
          >
            No items owned yet
          </Typography>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
              aria-label={`Owned items summary: ${formatOwnedForModal(state.owned)}`}
            >
              {formatOwnedForModal(state.owned)}
            </Typography>
            <Box
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1,
              }}
              role="list"
              aria-labelledby="owned-list-title"
              aria-describedby="owned-list-help"
            >
              {renderOwnedItemsWithRangeIndicators()}
            </Box>
            <Typography
              id="owned-list-help"
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Consecutive ranges (3+ items) are highlighted with dashed borders.
              Click × on individual items or entire ranges to remove them.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
