import { useEffect, useState } from "react";
import { SkillListProps } from "@/types/Habilities";
import { PiWrenchLight } from "react-icons/pi";
import { IoMdAdd } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

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
        {skills.map((skill, index) => (
          <Skill key={index} skill={skill} />
        ))}
      </div>
    </div>
  );
};

const WidgetHabilidades = () => {
  const [technicalSkills, setTechnicalSkills] = useState<string[]>(
    Array(10).fill("React")
  );
  const [softSkills, setSoftSkills] = useState<string[]>(
    Array(10).fill("React")
  );
  const allSkills = [
    "React",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "SQL",
    "NoSQL",
    "REST APIs",
    "GraphQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "DevOps",
    "Agile",
    "Scrum",
    "Kanban",
    "CI/CD",
    "Git",
    "Linux",
    "Microservices",
    "Cloud Computing",
    "Data Analysis",
    "Machine Learning",
    "Artificial Intelligence",
    "Data Science",
    "Cybersecurity",
    "Node.js",
    "Python",
    "Java",
    "Communication",
    "Leadership",
    "Teamwork",
    "Problem Solving",
    "Time Management",
    "Adaptability",
    "Creativity",
    "Critical Thinking",
    "Emotional Intelligence",
    "Conflict Resolution",
    "Negotiation",
    "Decision Making",
    "Networking Skills for IT Professionals and Developers in order to build a strong professional network and stay updated with industry trends.",
  ]
    .filter(
      (skill) => !technicalSkills.includes(skill) && !softSkills.includes(skill)
    )
    .map((skill) => (skill.length > 30 ? skill.slice(0, 30) + "..." : skill));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<string[]>(
    allSkills.filter((skill) =>
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    setFilteredSkills(
      allSkills.filter(
        (skill) =>
          !selectedSkills.includes(skill) &&
          skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [selectedSkills, searchQuery]);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    setSearchQuery("");
    setOpenDropdown(false);
    setSelectedSkills([]);
  };

  return (
    <div className="card w-full">
      <div className="p-6 bg-base-100 rounded-lg border border-base-300 h-full box-border">
        <div className="flex flex-row w-full gap-x-2 mb-8 items-center">
          <PiWrenchLight className="text-3xl" />
          <h2 className="text-3xl font-bold">Habilidades</h2>
          <button
            className="btn btn-circle btn-accent btn-md ml-auto text-base-100"
            onClick={handleModalToggle}
          >
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
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100"
          onClick={handleModalToggle}
        >
          <div
            className="flex flex-col gap-y-5 bg-white px-6 py-8 rounded-lg shadow-lg w-4/12"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-2xl font-bold mb-4">Agregar Habilidad</p>
            <div className="dropdown w-full">
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Buscar habilidad..."
                  className="input input-bordered bg-accent/30 w-full outline-none focus:outline-none border-primary text-primary font-light placeholder:text-primary placeholder:font-light text-base py-6 px-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setOpenDropdown(true)}
                  onBlur={() => setTimeout(() => setOpenDropdown(false), 100)}
                />
              </div>

              {openDropdown && (
                <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full mt-2">
                  <div className="overflow-y-scroll max-h-60">
                    {filteredSkills.map((skill, index) => (
                      <li key={index} className="w-full">
                        <button
                          className="btn btn-ghost justify-start w-full truncate"
                          onClick={() => {
                            setOpenDropdown(false);
                            setSelectedSkills((prev) => {
                              return [...prev, skill];
                            });
                            setSearchQuery("");
                          }}
                        >
                          {skill}
                        </button>
                      </li>
                    ))}
                  </div>
                </ul>
              )}
            </div>

            <div className="flex flex-wrap flex-row gap-3 w-full justify-center my-2">
              {selectedSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex max-w-6/12 bg-accent/30 p-2 rounded-lg mb-2 truncate items-center gap-2"
                >
                  <span className="text-xs">{skill}</span>
                  <button
                    className="btn btn-circle btn-xs btn-accent text-base-100 text-xs flex text-center items-center justify-center"
                    onClick={() => {
                      setSelectedSkills((prev) =>
                        prev.filter((s) => s !== skill)
                      );
                    }}
                  >
                    <IoMdClose />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-5">
              <button
                className="btn btn-active w-32 bg-white border border-primary font-light text-primary"
                onClick={handleModalToggle}
              >
                Cancelar
              </button>
              <button className="btn btn-primary w-32 font-semibold">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetHabilidades;
