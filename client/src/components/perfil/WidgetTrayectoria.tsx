import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

const WidgetTrayectoria = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [jobs, setJobs] = useState([
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
    }
  ]);

  const [trees, setTrees] = useState(() => {
    const treePositions = [];
    const treeTypes = ['tree-1', 'tree-2'];
    const sections = 4; // Number of horizontal sections
    
    // Top trees (above road)
    for (let i = 0; i < sections; i++) {
      const sectionWidth = 80 / sections; // 80% of width divided into sections
      const minLeft = 10 + (i * sectionWidth);
      const maxLeft = minLeft + sectionWidth;
      
      treePositions.push({
        type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
        left: minLeft + (Math.random() * sectionWidth), // Random within section
        top: 5 + (Math.random() * 25), // 5-30% from top
        bottom: 'auto'
      });
    }
    
    // Bottom trees (below road)
    for (let i = 0; i < sections; i++) {
      const sectionWidth = 80 / sections;
      const minLeft = 10 + (i * sectionWidth);
      const maxLeft = minLeft + sectionWidth;
      
      treePositions.push({
        type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
        left: minLeft + (Math.random() * sectionWidth),
        top: 'auto',
        bottom: 5 + (Math.random() * 25) // 5-30% from bottom
      });
    }
    
    return treePositions;
  });

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="card w-full h-[500px]">
      <div className="p-6 bg-base-100 rounded-lg border border-base-300 h-full flex flex-col">
        {/* Header section */}
        <div className="flex flex-row w-full gap-x-2 mb-4 items-center h-16">
          <h2 className="text-3xl font-bold">Trayectoria</h2>
          <button
            className="btn btn-circle btn-accent btn-md ml-auto text-base-100"
            onClick={handleModalToggle}
          >
            <IoMdAdd className="text-2xl" />
          </button>
        </div>

        {/* Timeline container */}
        <div className="flex-1 relative bg-base-200 rounded-lg overflow-hidden">
          {/* Custom road implementation */}
          <div className="absolute top-1/2 left-0 right-0 h-12 transform -translate-y-1/2 z-0 bg-[#464F5D]">
            {/* Road lines - manually created to scale properly */}
            <div className="absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2 flex justify-around">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-16 h-1 bg-white mx-8" 
                  style={{
                    marginLeft: i === 0 ? '2rem' : undefined,
                    marginRight: i === 4 ? '2rem' : undefined
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Decorative trees */}
          {trees.map((tree, index) => (
            <div 
              key={index}
              className="absolute w-10 h-10 z-10"
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

          {/* Scrollable timeline area */}
          <div className="absolute inset-0 overflow-x-auto overflow-y-visible">
            <div 
              className="relative h-full"
              style={{ minWidth: `${jobs.length * 250}px` }}
            >
              {/* Jobs positioned with circles directly on the road */}
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
                  {/* Company building image - above the road */}
                  <div className="mt-8 mb-7 w-14 h-14">
                    <img
                      src={job.company === "Accenture" 
                        ? "/trayectoria/Accenture.png" 
                        : "/trayectoria/building.svg"}
                      alt={job.company}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Accent circle - positioned exactly on the road */}
                  <div className="w-5 h-5 rounded-full bg-accent border-2 border-white shadow-lg"></div>

                  {/* Job card - below the road */}
                  <div className="mt-4 bg-base-100 p-3 rounded-lg border border-base-300 shadow-md w-60 text-center">
                    <h3 className="text-lg font-bold text-secondary">{job.company}</h3>
                    <p className="text-md">{job.position}</p>
                    <p className="text-sm mt-0 text-accent">
                      {job.startDate} - {job.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal remains the same */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleModalToggle}
        >
          <div
            className="flex flex-col gap-y-5 bg-white px-6 py-8 rounded-lg shadow-lg w-4/12"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-2xl font-bold mb-4">Agregar Habilidad</p>
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

export default WidgetTrayectoria;