import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

const WidgetTrayectoria = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [jobs] = useState([
    {
      company: "CEMEX",
      position: "Software Developer I",
      startDate: "10-02-2021",
      endDate: "10-02-2022",
    },
    {
      company: "Accenture",
      position: "Software Developer I",
      startDate: "10-02-2022",
      endDate: "10-02-2023",
    },
    {
      company: "Accenture",
      position: "Software Developer II",
      startDate: "10-02-2023",
      endDate: "Current",
    },
  ]);

  const [trees] = useState(() => {
    const treePositions = [];
    const treeTypes = ['tree-1', 'tree-2'];
    const sections = 4;
    
    for (let i = 0; i < sections; i++) {
      const sectionWidth = 80 / sections;
      const minLeft = 10 + (i * sectionWidth);
      
      treePositions.push({
        type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
        left: minLeft + (Math.random() * sectionWidth),
        top: 5 + (Math.random() * 25),
        bottom: 'auto'
      });
      
      treePositions.push({
        type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
        left: minLeft + (Math.random() * sectionWidth),
        top: 'auto',
        bottom: 5 + (Math.random() * 25)
      });
    }
    
    return treePositions;
  });

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="card w-full h-full min-h-[350px]">
      <div className="p-3 md:p-4 bg-base-100 rounded-lg border border-base-300 h-full flex flex-col">
        {/* Header - smaller */}
        <div className="flex flex-row w-full gap-x-2 mb-2 items-center">
          <h2 className="text-xl md:text-2xl font-bold">Trayectoria</h2>
          <button
            className="btn btn-circle btn-accent btn-xs md:btn-sm ml-auto text-base-100"
            onClick={handleModalToggle}
          >
            <IoMdAdd className="text-lg md:text-xl" />
          </button>
        </div>

        {/* Timeline container */}
        <div className="flex-1 relative bg-base-200 rounded-lg overflow-hidden min-h-[250px] mb-4">
          {/* Road - thinner */}
          <div className="absolute top-1/2 left-0 right-0 h-6 md:h-8 transform -translate-y-1/2 z-0 bg-[#464F5D]">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2 flex justify-around">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-6 md:w-10 h-full bg-white mx-2 md:mx-4" 
                  style={{
                    marginLeft: i === 0 ? '0.5rem' : undefined,
                    marginRight: i === 4 ? '0.5rem' : undefined
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Trees - smaller */}
          {trees.map((tree, index) => (
            <div 
              key={index}
              className="absolute w-5 h-5 md:w-7 md:h-7 z-10"
              style={{
                left: `${tree.left}%`,
                top: tree.top !== 'auto' ? `${tree.top}%` : undefined,
                bottom: tree.bottom !== 'auto' ? `${tree.bottom}%` : undefined,
              }}
            >
              <img 
                src={`/trayectoria/${tree.type}.svg`} 
                alt="Tree" 
                className="w-full h-full"
              />
            </div>
          ))}

          {/* Timeline content */}
          <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
            <div 
              className="relative h-full"
              style={{ minWidth: `${Math.max(jobs.length * 180, 500)}px` }}
            >
              {jobs.map((job, index) => (
                <div 
                  key={index}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${(index + 0.5) * (100 / jobs.length)}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20,
                  }}
                >
                  {/* Smaller building icons */}
                  <div className="mt-4 md:mt-5 mb-3 md:mb-4 w-9 h-9 md:w-12 md:h-12">
                    <img
                      src={job.company === "Accenture" 
                        ? "/trayectoria/Accenture.png" 
                        : "/trayectoria/building.svg"}
                      alt={job.company}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Smaller dot */}
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-accent border border-white shadow"></div>

                  {/* Compact job card */}
                  <div className="mt-2 md:mt-3 bg-base-100 p-1.5 md:p-2 rounded border border-base-300 shadow-sm w-40 md:w-48 text-center">
                    <h3 className="text-sm md:text-md font-semibold text-secondary">{job.company}</h3>
                    <p className="text-xs md:text-sm">{job.position}</p>
                    <p className="text-xs mt-0 text-accent">
                      {job.startDate} - {job.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Smaller modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="flex flex-col gap-y-3 bg-white px-4 py-4 rounded-lg shadow-lg w-11/12 max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold">Agregar Habilidad</p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-active btn-sm w-20 bg-white border border-primary text-primary"
                onClick={handleModalToggle}
              >
                Cancelar
              </button>
              <button className="btn btn-primary btn-sm w-20">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetTrayectoria;