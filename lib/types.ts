/** A single downloadable or linked resource — one dark pill in the design. */
export type ResourceLink = {
  id: string;
  label: string;
  /** External destination. Null renders the button as an inert pill. */
  url: string | null;
};

/** A labelled row (or rows) of links, e.g. "Wallpapers". */
export type ResourceGroup = {
  id: string;
  label: string;
  /** Optional italic note rendered above the group label. */
  note: string | null;
  links: ResourceLink[];
};

/** A titled band of the page, e.g. "Email Signatures". */
export type ResourceSection = {
  id: string;
  title: string;
  groups: ResourceGroup[];
};
