import { FaUserFriends, FaRegCommentDots } from "react-icons/fa";
import { BsCalendar3 } from "react-icons/bs";
import { countryFlag } from "../CountryFlag";

type ProjectCardProps = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  country: string;
  company: string;
  people: number;
  feedbacks: number;
  daysRemaining?: number;
  percentCompletedDays?: number;
  toggleModal: () => void;
  closed?: boolean;
};

export default function ProjectCardDL(props: ProjectCardProps) {
  const { closed = false } = props;

  return (
    <div
      className="card bg-base-200 h-full p-4 rounded-2xl hover:bg-base-100 hover:shadow-xl hover:scale-105 transition-transform duration-300 hover:cursor-pointer"
      onClick={props.toggleModal}
    >
      <div className="flex flex-col">
        <div className="flex flex-row w-full justify-between">
          <div className="max-w-7/12">
            <h2 className="text-lg font-bold">
              {countryFlag(props.country)} {props.name}
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            {props.start_date} -{" "}
            {props.end_date ? props.end_date : "Indefinido"}
          </span>
        </div>
        <p className="text-gray-400 text-sm">{props.company}</p>
        <div className="min-h-14 items-start text-start ">
          <p className="text-gray-400 text-sm mt-2">{props.description}</p>
        </div>
      </div>

      <div className="flex flex-row gap-x-5 items-end mt-6 text-sm flex-1">
        <div className="flex items-center gap-2">
          <FaUserFriends className="text-lg" />
          <span className="text-xs">{props.people} personas</span>
        </div>
        <div className="flex items-center gap-2">
          <FaRegCommentDots className="text-lg" />
          <span className="text-xs">{props.feedbacks} feedbacks</span>
        </div>
        {closed === false && (
          <div className="flex items-center gap-2">
            <BsCalendar3 className="text-lg" />
            <span className="text-xs">
              {!props.end_date
                ? "Fecha por confirmar"
                : `${props.daysRemaining} días restantes`}
            </span>
          </div>
        )}
      </div>

      {closed === false && (
        <progress
          className="progress progress-success w-full mt-4"
          value={props.percentCompletedDays}
          max="100"
        />
      )}
    </div>
  );
}
