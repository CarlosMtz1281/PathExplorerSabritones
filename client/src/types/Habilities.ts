export type SkillListProps = {
  title: string;
  skills?: string[];
  size?: string;
  titleWidth?: string;
  skillsWidth?: string;
};

export type SkillAPI = {
  skill_id: number;
  skill_name: string;
  skill_technical: boolean;
};
