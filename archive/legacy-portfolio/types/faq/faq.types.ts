import { ReactElement } from 'react';

export interface IFaqItem {
  id: string;
  question: string;
  answer: string | ReactElement;
}
