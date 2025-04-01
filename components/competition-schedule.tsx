import fs from 'fs';
import path from 'path';

interface Competition {
  id: string;
  name: string;
  status: string;
  submissionDeadline: string;
  resultsDate: string;
  url: string | null;
}

interface CompetitionScheduleProps {
  className?: string;
}

export async function CompetitionSchedule({ className }: CompetitionScheduleProps) {
  // Read the competition data from the JSON file
  const filePath = path.join(process.cwd(), 'config', 'competitions.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const competitionData = JSON.parse(fileContents);
  const competitions: Competition[] = competitionData.competitions;

  return (
    <div className={className}>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Competition</th>
            <th className="text-left">Status</th>
            <th className="text-right">Submission Deadline</th>
            <th className="text-right">Results Date</th>
          </tr>
        </thead>
        <tbody>
          {competitions.map((competition) => (
            <tr key={competition.id}>
              <td className="py-2">
                {competition.url ? (
                  <a href={competition.url} className="text-primary hover:underline">
                    {competition.name}
                  </a>
                ) : (
                  competition.name
                )}
              </td>
              <td className="py-2">
                {competition.status === 'OPEN' ? (
                  <span className="font-bold text-green-500">**OPEN**</span>
                ) : (
                  competition.status
                )}
              </td>
              <td className="py-2 text-right">{competition.submissionDeadline}</td>
              <td className="py-2 text-right">{competition.resultsDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}