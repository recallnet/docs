import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Competition {
  id: string;
  name: string;
  status: string;
  submissionDeadline: string;
  resultsDate: string;
  url: string | null;
}

const nullCompetition: Competition = {
  id: "TBD",
  name: "TBD",
  status: "TBD",
  submissionDeadline: "TBD",
  resultsDate: "TBD",
  url: "TBD",
};

export interface CompetitionData {
  competitions: Competition[];
}

export const getCompetitions = (): CompetitionData => {
  try {
    const filePath = join(process.cwd(), "app", "data", "competitions.json");
    const fileContents = readFileSync(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading competitions file:", error);
    return { competitions: [] };
  }
};

export const getCompetition = (name: string) => {
  try {
    const { competitions } = getCompetitions();
    const competition = competitions.find((comp) => comp.id === name);
    if (!competition) {
      throw new Error(`Competition ${name} not found`);
    }
    return competition;
  } catch (error) {
    console.error("Error getting competition:", error);
    return nullCompetition;
  }
};
