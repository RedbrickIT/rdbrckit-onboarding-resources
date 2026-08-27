/** A single downloadable or linked resource — one dark pill in the design. */
export type ResourceLink = {
  id: string;
  label: string;
  /** External destination, used when no file is attached. */
  url: string | null;
  /** Absolute URL of a file uploaded to Strapi. Takes precedence over `url`. */
  fileUrl: string | null;
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
