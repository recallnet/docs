import fs from "node:fs";
import path from "node:path";

interface Competition {
  id: string;
  name: string;
  status: string;
  submissionDeadline: string;
  resultsDate: string;
  url: string | null;
}

interface CompetitionData {
  competitions: Competition[];
}

export const getCompetitions = () => {
  const filePath = path.join(process.cwd(), "config", "competitions.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents) as CompetitionData;
};

export const getCompetition = (name: string = "alpha-wave") => {
  const { competitions } = getCompetitions();
  const competition = competitions.find((comp) => comp.id === name);
  if (!competition) {
    throw new Error(`Competition ${name} not found`);
  }
  return competition;
};
