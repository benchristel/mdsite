export interface ProjectGlobalInfo {
  // orderedLinkables contains the information about each HTML page needed
  // to construct a user-friendly link to it. The array is in "page order",
  // i.e. the order in which you'd visit the pages if you repeatedly clicked
  // the "next" link.
  orderedLinkables: Array<Linkable>;
  // index maps each output path to the position in orderedLinkables where
  // information about that path can be found. This is most useful when
  // combined with pointer arithmetic; e.g. orderedLinkables[index[path] + 1]
  // gets the information needed to construct the "next" link on the page
  // at `path`.
  index: Record<string, number>;
  // template is the HTML template into which to render content
  template: string;
}

export type Linkable = {
  path: string;
  title: string;
};

export const dummyProjectGlobalInfo = {
  orderedLinkables: [],
  index: {},
  template: "dummy template",
};
