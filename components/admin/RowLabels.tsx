"use client";

import { useRowLabel } from "@payloadcms/ui";

import {
  groupRowLabel,
  linkRowLabel,
  type GroupRowData,
  type LinkRowData,
} from "./rowLabelText";

/**
 * Row labels for the nested arrays in Resource Sections.
 *
 * Without these, Payload collapses every row to a positional placeholder
 * ("Group 01", "Group 02"), which stops being useful the moment a section has
 * more than a couple of rows — you have to expand each one to find the one you
 * want. These show the row's own label instead.
 *
 * The text itself comes from ./rowLabelText so it can be tested without
 * standing up React or Payload's admin.
 */

export function GroupRowLabel() {
  const { data, rowNumber } = useRowLabel<GroupRowData>();

  return <span>{groupRowLabel(data, rowNumber)}</span>;
}

export function LinkRowLabel() {
  const { data, rowNumber } = useRowLabel<LinkRowData>();
  const { text, hint } = linkRowLabel(data, rowNumber);

  return (
    <span>
      {text}
      {hint ? <span style={{ opacity: 0.5 }}> {hint}</span> : null}
    </span>
  );
}
