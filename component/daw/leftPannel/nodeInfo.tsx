import { deleteDoc, QueryDocumentSnapshot } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { ContextMenuContext } from "..";
import { NodeEntity } from "../../../firebase/firestore";
import DelayModal from "./nodeCtlModals/delayModal";
import GainModal from "./nodeCtlModals/gainModal";

const NodeInfo: React.FC<{ node: QueryDocumentSnapshot<NodeEntity> }> = ({ node }) => {
  const { contextMenuViewState, leftState, topState, contextMenuGroupState } = useContext(ContextMenuContext);
  const [viewContext, setViewContext] = contextMenuViewState;
  const [ctxLeft, setCtxLeft] = leftState;
  const [ctxTop, setCtxTop] = topState;
  const [group, setGroup] = contextMenuGroupState;
  const modalViewState = useState(false);
  const [modalView, setModalView] = modalViewState;
  const data = node.data();
  const { nodeName } = data;
  const callContext = (e: React.MouseEvent) => {
    setCtxLeft(e.clientX);
    setCtxTop(e.clientY);
    setGroup([
      {
        label: data.nodeName,
        items: [
          {
            label: "削除",
            disabled: false,
            action: async () => {
              await deleteDoc(node.ref);
            },
          },
        ],
      },
    ]);
    setViewContext(true);
  };
  const Modal = (() => {
    switch (nodeName) {
      case "Gain":
        return GainModal;
      case "Delay":
        return DelayModal;
      default:
        throw new Error();
    }
  })();
  return (
    <>
      <Modal node={node} viewState={modalViewState} />
      <div onClick={() => setModalView(true)} className="singleNode" onContextMenu={callContext}>
        {data.nodeName}
      </div>
    </>
  );
};

export default NodeInfo;
