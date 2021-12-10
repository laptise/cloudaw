import { QueryDocumentSnapshot } from "firebase/firestore";
import { RegionEntity } from "../../../../firebase/model";

interface Props {
  snapshot: QueryDocumentSnapshot<RegionEntity>;
}

const Region: React.FC<Props> = ({ snapshot }) => {
  const data = snapshot.data();
  return <div className="region">{data.src}</div>;
};

export default Region;
