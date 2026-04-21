import { marshall } from "@aws-sdk/util-dynamodb";
import { DBTeam, DBMatchIncident } from "./types";
import { teams, incidents} from '../seed/data'

type Entity = DBTeam | DBMatchIncident ; 

export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
  });
};

export const generateSeedData = () => {
  const tms: any[] = generateBatch(teams)
  const ics: any[] = generateBatch(incidents)

  return [...ics, ...tms]
};
