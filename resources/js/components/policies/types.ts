/** O texto de uma versão de política (resources/policies, D73). */
export type PolicyItem = {
    id: string;
    title: string;
    text: string;
    bad: string;
    good: string;
};

export type PolicyBlock =
    | { p: string }
    | { list: string[] }
    | { note: string }
    | {
          table: {
              caption: string;
              columns: string[];
              rows: string[][];
          };
      }
    | { items: PolicyItem[] };

export type PolicySection = {
    id: string;
    title: string;
    blocks: PolicyBlock[];
};

export type PolicyDocument = {
    title: string;
    description: string;
    summary: { icon: string; title: string; text: string }[];
    sections: PolicySection[];
    changes: string[];
    readingMinutes: number;
};
