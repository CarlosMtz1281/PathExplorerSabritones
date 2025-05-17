import { useEffect, useState } from "react";
import { SkillListProps, SkillAPI } from "@/types/Habilities";
import { PiWrenchLight } from "react-icons/pi";
import axios from "axios";

const Skill = ({ skill }: { skill: string }) => {
  return (
    <span className={`badge badge-outline badge-primary px-8 py-3.5 text-xs`}>
      {skill}
    </span>
  );
};

const SkillList = ({
  title,
  skills,
  titleWidth = "w-1/5",
  skillsWidth = "w-4/5",
}: SkillListProps) => {
  return (
    <div className="flex w-full flex-row gap-2 items-start">
      <div className={`${titleWidth} flex items-start`}>
        <h3 className="text-xl m-0 ml-4">{title}</h3>
      </div>
      <div className={`flex flex-wrap gap-x-7 gap-y-5 ${skillsWidth}`}>
        {skills?.map((skill, index) => (
          <Skill key={index} skill={skill} />
        ))}
      </div>
    </div>
  );
};

const WidgetHabilidadesColegas = ({ userId }: { userId: number }) => {
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/employee/getsSkillsId/${userId}`
        );

        setTechnicalSkills(
          res.data
            .filter((skill: SkillAPI) => skill.skill_technical === true)
            .map((skill: SkillAPI) => skill.skill_name)
        );

        setSoftSkills(
          res.data
            .filter((skill: SkillAPI) => skill.skill_technical === false)
            .map((skill: SkillAPI) => skill.skill_name)
        );
      } catch (error) {
        console.error("Error fetching colleague's skills:", error);
      }
    };

    fetchSkills();
  }, [userId]);

  return (
    <div className="card w-full h-full border border-base-300 bg-base-100">
      <div className="card body p-3 md:p-4">
        <div className="flex flex-row w-full gap-x-2 mb-4 items-center">
          <h2 className="card-title text-3xl">
            <PiWrenchLight />
            Habilidades
          </h2>
        </div>
        <div className="flex flex-col gap-y-14 max-h-80 overflow-scroll pt-3 pb-6 scroll-pb-10">
          <SkillList
            title="Técnicas"
            skills={technicalSkills}
            size="md"
            titleWidth="w-1/5"
            skillsWidth="w-4/5"
          />
          <SkillList
            title="Blandas"
            skills={softSkills}
            size="md"
            titleWidth="w-1/5"
            skillsWidth="w-4/5"
          />
        </div>
      </div>
    </div>
  );
};

export default WidgetHabilidadesColegas;
