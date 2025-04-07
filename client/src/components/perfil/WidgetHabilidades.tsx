import React from "react";
import { SkillListProps } from "@/types/Habilities";
import { PiWrenchLight } from "react-icons/pi";
import { IoMdAdd } from "react-icons/io";

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
  size = "md",
  titleWidth = "w-1/5",
  skillsWidth = "w-4/5",
}: SkillListProps) => {
  return (
    <div className="flex w-full flex-row gap-2 items-start">
      <div className={`${titleWidth} flex items-start`}>
        <h3 className="text-xl m-0 ml-4">{title}</h3>
      </div>
      <div className={`flex flex-wrap gap-x-7 gap-y-5 ${skillsWidth}`}>
        {skills.map((skill, index) => (
          <Skill key={index} skill={skill} />
        ))}
      </div>
    </div>
  );
};

const WidgetHabilidades = () => {
  const technicalSkills = Array(10).fill("React");
  const softSkills = Array(10).fill("React");

  return (
    <div className="card w-full min-h-40 max-h-64">
      <div className="p-6 bg-base-100 rounded-lg border border-base-300 h-full box-border">
        <div className="flex flex-row w-full gap-x-2 mb-8 items-center">
          <PiWrenchLight className="text-3xl" />
          <h2 className="text-3xl font-bold">Habilidades</h2>
          <button className="btn btn-circle btn-accent btn-md ml-auto text-base-100">
            <div className="flex items-center justify-center w-full h-full">
              <IoMdAdd className="text-2xl" />
            </div>
          </button>
        </div>
        <div className="flex flex-col gap-y-14 max-h-64 pb-10 overflow-scroll">
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

export default WidgetHabilidades;
