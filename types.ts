
export interface DAO {
  id: string;
  name: string;
  description: string;
  logo: string;
  proposalsCount: number;
  membersCount: number;
  bannerGradient: string;
}

export interface Proposal {
  id: string;
  daoId: string;
  title: string;
  description: string;
  status: 'Active' | 'Closed' | 'Pending';
  endDate: string;
  voteCount: number;
  choices: {
    name: string;
    percentage: number;
  }[];
  author: string;
  quorum: number;
}
