/**
 * Label text for the collapsed rows of the nested arrays in Resource Sections.
 *
 * Pure and free of React or Payload imports so it can be exercised directly;
 * RowLabels.tsx is the thin client component that feeds it Payload's row data.
 */

/**
 * Payload's built-in placeholder for a row with no usable label, e.g.
 * "Group 01". Matches the format in @payloadcms/ui's ArrayRow so an unnamed
 * row looks exactly as it did before these labels existed.
 *
 * `rowNumber` is 0-based, matching what Payload passes down.
 */
export function positionalFallback(
  singular: string,
  rowNumber?: number,
): string {
  return `${singular} ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`;
}

export type GroupRowData = {
  label?: string;
};

export function groupRowLabel(
  data: GroupRowData | undefined,
  rowNumber?: number,
): string {
  return data?.label?.trim() || positionalFallback("Group", rowNumber);
}

export type LinkRowData = {
  label?: string;
  url?: string;
  file?: unknown;
};

export type LinkRowLabelParts = {
  text: string;
  /**
   * Set when the row is named but has nowhere to point. Such a link renders as
   * an inert pill on the page, so surfacing it here saves opening every row to
   * find the ones still to be filled in.
   */
  hint: string | null;
};

export function linkRowLabel(
  data: LinkRowData | undefined,
  rowNumber?: number,
): LinkRowLabelParts {
  const label = data?.label?.trim();
  const hasDestination = Boolean(data?.url?.trim() || data?.file);

  return {
    text: label || positionalFallback("Link", rowNumber),
    hint: label && !hasDestination ? "— no destination yet" : null,
  };
}
