import { time } from "console";

  
  export type  Team = {
    id: string;
    name : string;
    ageGrade: string;
    players: string[]   // player names
  }

  export type DBTeam = Omit<Team, "id"> & {
    pk: `m#${Team['id']}`;  
    sk: `m#${Team['id']}`; 
  }
  
  type IncidentType = 'Score' | 'Foul' | 'Substitute' | 'Card'

  export type  MatchIncident = {
    team1Id: Team['id']; 
    team2Id: Team['id']; 
    details : {
      type: IncidentType;
      time: number;
      description: string;
  }
}

  export type DBMatchIncident = Omit<MatchIncident, "team1Id" | 'team2Id'> & {
    pk: `i#${MatchIncident['team1Id']}-${MatchIncident['team2Id']}`;
    sk: `${MatchIncident['details']['time']}`;  // the time of the incident, as a string 
  }