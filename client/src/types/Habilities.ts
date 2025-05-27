export type SkillListProps = {
  title: string;
  skills: SkillAPI[];
  isEditing?: boolean;
  onDelete?: (skill: SkillAPI) => void;
  size?: string;
  titleWidth?: string;
  skillsWidth?: string;
};

export type SkillAPI = {
  skill_id: number;
  skill_name: string;
  skill_technical: boolean;
};
