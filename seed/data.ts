import { DBTeam, DBMatchIncident } from "../shared/types";

export const teams: DBTeam[] = [
  {
    pk: "m#1",
    sk: "m#1",
    name: "Team 1",
    ageGrade: "U14",
    players: ["Joe Bloggs", "Jane Bloggs", "James Bloggs", "Jenny Bloggs", "Jake Bloggs"],
  },
  {
    pk: "m#2",
    sk: "m#2",
    name: "Team 2",
    ageGrade: "U14",
    players: ["Joe Smith", "Jane Smith", "James Smith", "Jenny Smith", "Jake Smith"],
  },
  {
    pk: "m#3",
    sk: "m#3",
    name: "Team 3",
    ageGrade: "U17",
    players: ["Joe Fleming", "Jane ", "James Smith", "Jenny Smith", "Jake Smith"],
  },
];

export const incidents: DBMatchIncident[] = [
    {
      pk: "i#1-2",
      sk: '20',
      details: {
        type: "Score",
        time: 20,
        description: "Joe Bloggs scored for team 1",
      }
    },
    {
      pk: "i#1-2",
      sk: '35',
      details: {
        type: 'Substitute',
       time: 35,
        description: "Joe Smith replaced by Jane Smith on team 2",
      }
    },
  ];