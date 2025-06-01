import { FaUserFriends, FaRegCommentDots } from "react-icons/fa";
import { BsCalendar3 } from "react-icons/bs";

type ProjectCardProps = {
  toggleModal: () => void;
};

export default function ProjectCardDL(props: ProjectCardProps) {
  return (
    <div
      className="card bg-base-200 p-4 rounded-2xl hover:bg-base-100 hover:shadow-xl hover:scale-105 transition-transform duration-300 hover:cursor-pointer"
      onClick={props.toggleModal}
    >
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">🇲🇽 Migración a la nube</h2>
          <span className="text-xs text-gray-400">01/06/2024 - 15/03/2025</span>
        </div>
        <p className="text-gray-400 text-sm">Banco Nacional</p>
        <div className="min-h-14 items-start text-start ">
          <p className="text-gray-400 text-sm mt-2">
            Migración de infraestructura on-premise a AWS
          </p>
        </div>
      </div>

      <div className="flex flex-row gap-x-5 items-center mt-6 text-sm">
        <div className="flex items-center gap-2">
          <FaUserFriends className="text-lg" />
          <span className="text-xs">15 personas</span>
        </div>
        <div className="flex items-center gap-2">
          <FaRegCommentDots className="text-lg" />
          <span className="text-xs">7 feedbacks</span>
        </div>
        <div className="flex items-center gap-2">
          <BsCalendar3 className="text-lg" />
          <span className="text-xs">37 días restantes</span>
        </div>
      </div>

      <progress
        className="progress progress-success w-full mt-4"
        value="85"
        max="100"
      ></progress>
    </div>
  );
}
