// import types
import { ITechStackLogo } from '../icons/icons.types';

export interface IJourneyListItem {
  id: string;
  designation: string;
  startDate: string;
  endDate?: string;
  organisation?: string;
  organisationLogo?: string;
  summary?: string;
  achievements?: { id: string; text: string }[];
  techStack?: ITechStackLogo[];
}
