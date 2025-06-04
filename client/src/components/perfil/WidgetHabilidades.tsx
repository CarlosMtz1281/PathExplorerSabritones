import { useEffect, useState } from "react";
import { SkillListProps, SkillAPI } from "@/types/Habilities";
import { PiWrenchLight } from "react-icons/pi";
import { IoIosArrowDown, IoMdAdd, IoMdInformationCircle } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { useSession } from "next-auth/react";
import { IoCheckmarkCircle, IoPencil, IoPencilSharp } from "react-icons/io5";

const Skill = ({
  skill,
  isEditing,
  onDelete,
}: {
  skill: SkillAPI;
  isEditing?: boolean;
  onDelete?: (skill: SkillAPI) => void;
}) => {
  return (
    <div className="relative group">
      <span
        className={`badge badge-outline px-8 py-3.5 text-xs transition-all duration-200 ${
          isEditing
            ? "border-error bg-error/20 text-error hover:scale-105 cursor-pointer"
            : "badge-primary"
        }`}
        onClick={isEditing ? () => onDelete?.(skill) : undefined}
      >
        {skill.skill_name}
      </span>
    </div>
  );
};

const SkillList = ({
  title,
  skills,
  titleWidth = "w-1/5",
  skillsWidth = "w-4/5",
  isEditing,
  onDelete,
}: SkillListProps) => {
  return (
    <div className="flex w-full flex-row gap-2 items-start">
      <div className={`${titleWidth} flex items-start`}>
        <h3 className="text-xl m-0 ml-4">{title}</h3>
      </div>
      <div className={`flex flex-wrap gap-x-7 gap-y-5 ${skillsWidth}`}>
        {skills?.map((skill, index) => (
          <Skill
            key={index}
            skill={skill}
            isEditing={isEditing}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

const fetchAllSkills = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/general/skills`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching skills");
    return [];
  }
};

const fetchUserSkills = async (sessionKey?: string, userId?: number) => {
  try {
    if (userId) {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/getsSkillsId/${userId}`
      );
      return response.data;
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/employee/skills`,
      {
        headers: { "session-key": sessionKey },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user skills");
    return [];
  }
};

const postUserSkills = async (sessionKey: string, skills: number[]) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/employee/skills`,
      { skills: skills },
      {
        headers: {
          "session-key": sessionKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting user skills");
    return null;
  }
};

const WidgetHabilidades = ({ userId }: { userId?: number }) => {
  const { data: status } = useSession();
  const [render, setRender] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState<SkillAPI[]>([]);
  const [softSkills, setSoftSkills] = useState<SkillAPI[]>([]);
  const [allSkills, setAllSkills] = useState<SkillAPI[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<SkillAPI | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      const userSkills = await fetchUserSkills(status?.sessionId || "", userId);
      setTechnicalSkills(
        userSkills.filter((skill: SkillAPI) => skill.skill_technical === true)
      );
      setSoftSkills(
        userSkills.filter((skill: SkillAPI) => skill.skill_technical === false)
      );
    };

    fetchSkills();
    setRender(true);
  }, []);

  useEffect(() => {
    if (render) {
      const fetchSkills = async () => {
        const skills = await fetchAllSkills();
        setAllSkills(
          skills
            .filter(
              (skill: SkillAPI) =>
                !technicalSkills?.includes(skill) && !softSkills.includes(skill)
            )
            .map((skill: SkillAPI) =>
              skill?.skill_name.length > 30
                ? (skill.skill_name = skill.skill_name.slice(0, 30) + "...")
                : skill
            )
        );
      };
      fetchSkills();
    }
  }, [technicalSkills]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<SkillAPI[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<SkillAPI[]>([]);

  useEffect(() => {
    setFilteredSkills(
      allSkills
        .map((skill) => skill)
        .filter((skill) =>
          skill.skill_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [allSkills]);

  useEffect(() => {
    setFilteredSkills(
      allSkills
        .map((skill) => skill)
        .filter(
          (skill) =>
            !selectedSkills.includes(skill) &&
            skill.skill_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [selectedSkills, searchQuery]);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    setSearchQuery("");
    setOpenDropdown(false);
    setSelectedSkills([]);
  };

  const handleSubmitSkills = async () => {
    const skillIds = selectedSkills
      .map((selected) => {
        const match = allSkills.find((s) => s === selected);
        return match?.skill_id;
      })
      .filter((id): id is number => id !== undefined);
    await postUserSkills(status?.sessionId || "", skillIds);
    setTechnicalSkills((prev) => [
      ...(prev || []),
      ...selectedSkills
        .filter((skill) => skill.skill_technical === true)
        .map((skill) => skill),
    ]);
    setSoftSkills((prev) => [
      ...(prev || []),
      ...selectedSkills
        .filter((skill) => skill.skill_technical === false)
        .map((skill) => skill),
    ]);
    handleModalToggle();
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEditSkills = () => {
    setIsEditing(!isEditing);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        const isDropdown = target.closest(".dropdown-container");
        const isToggleButton = target.closest(".dropdown-toggle");

        if (!isDropdown && !isToggleButton) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const deleteSkill = async (skill: SkillAPI) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE}/employee/skills/${skill.skill_id}`,
        {
          headers: {
            "session-key": status?.sessionId,
          },
        }
      );
    } catch (error) {
      console.error("Error deleting skill");
    }
  };

  return (
    <div className="card w-full h-full border border-base-300 bg-base-100 mb-50">
      <div className="card body p-3 md:p-4">
        <div className="flex flex-row w-full gap-x-2 mb-4 items-center">
          <h2 className="card-title text-3xl">
            <PiWrenchLight />
            Habilidades
          </h2>

          {isEditing ? (
            <button className="ml-auto" onClick={handleEditSkills}>
              <IoCheckmarkCircle
                className="text-success rounded-4xl hover:cursor-pointer"
                size={37}
              />
            </button>
          ) : (
            <button
              className="btn btn-circle btn-accent btn-xs md:btn-sm text-base-100 dropdown-toggle ml-auto"
              onClick={handleDropdownToggle}
            >
              <div className="flex items-center justify-center w-full h-full">
                <IoIosArrowDown
                  className={`text-lg md:text-xl transition-transform ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />{" "}
              </div>
            </button>
          )}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-32 mr-5 w-48 bg-base-100 rounded-md shadow-lg border border-base-300 z-50 dropdown-container">
              <div className="py-1">
                <button
                  onClick={handleEditSkills}
                  className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 w-full text-left cursor-pointer"
                >
                  <IoPencil className="mr-2 text-primary" />
                  Editar Habilidades
                </button>
                <button
                  onClick={handleModalToggle}
                  className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 w-full text-left cursor-pointer"
                >
                  <IoMdAdd className="mr-2 text-primary" />
                  Agregar Habilidad
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-14 max-h-80 overflow-scroll pt-3 pb-6 scroll-pb-10">
          <SkillList
            title="Técnicas"
            skills={technicalSkills}
            size="md"
            titleWidth="w-1/5"
            skillsWidth="w-4/5"
            onDelete={(skill) => {
              setSkillToDelete(skill);
              setShowDeleteModal(true);
            }}
            isEditing={isEditing}
          />

          <SkillList
            title="Blandas"
            skills={softSkills}
            size="md"
            titleWidth="w-1/5"
            skillsWidth="w-4/5"
            onDelete={(skill) => {
              setSkillToDelete(skill);
              setShowDeleteModal(true);
            }}
            isEditing={isEditing}
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
                          {skill.skill_name}
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
                  <span className="text-xs">{skill.skill_name}</span>
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
              <button
                className={`btn btn-primary w-32 font-semibold ${
                  selectedSkills.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
                    : "btn-primary"
                }`}
                disabled={selectedSkills.length === 0}
                onClick={handleSubmitSkills}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex items-center gap-2 mb-4">
              <IoMdInformationCircle className="text-error text-2xl" />
              <h3 className="text-xl font-semibold">Eliminar habilidad</h3>
            </div>
            <p className="mb-6">
              ¿Estás seguro que deseas eliminar la habilidad "
              {skillToDelete?.skill_name}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className={"btn btn-error"}
                onClick={() => {
                  deleteSkill(skillToDelete!);
                  if (skillToDelete?.skill_technical) {
                    setTechnicalSkills((prev) =>
                      prev.filter((skill) => skill !== skillToDelete)
                    );
                  } else {
                    setSoftSkills((prev) =>
                      prev.filter((skill) => skill !== skillToDelete)
                    );
                  }
                  setShowDeleteModal(false);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetHabilidades;
