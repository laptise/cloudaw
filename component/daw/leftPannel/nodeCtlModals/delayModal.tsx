import { QueryDocumentSnapshot, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { NodeEntity } from "../../../../firebase/firestore";
import { FlexCol } from "../../../flexBox";
import Modal from "../../../modal";

/**コラボレーター検索・追加モーダル */
const DelayModal: React.FC<{ viewState: State<boolean>; node: QueryDocumentSnapshot<NodeEntity> }> = ({ viewState, node }) => {
  const { nodeName, value } = node.data();
  const update = async (value: number) => {
    setCurrentValue(value);
    await updateDoc(node.ref, { value });
  };
  const [currentValue, setCurrentValue] = useState(value);
  return (
    <Modal className="nodeEditModal" viewState={viewState} title={nodeName}>
      <FlexCol className="body">
        <div>
          ゲイン量
          <input onChange={(e) => update(Number(e.currentTarget.value))} type="range" step={0.1} value={currentValue} min={-30} max={30} />
          <input onChange={(e) => update(Number(e.currentTarget.value))} value={currentValue} />
        </div>
      </FlexCol>
    </Modal>
  );
};

export default DelayModal;
