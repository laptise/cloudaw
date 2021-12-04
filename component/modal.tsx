import { faTimes, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { HTMLAttributes, useState } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  chidren?: React.Component;
  viewState: [boolean, (value: boolean) => void];
  title: string;
}
const Modal: React.FC<Props> = (props) => {
  const [viewOn, setViewon] = props.viewState;
  const [left, setLeft] = useState(100);
  const [top, setTop] = useState(100);
  const attr = { ...props, ...{ title: undefined } };
  const dragStart = (e: React.MouseEvent) => {
    const picked = e.nativeEvent.target as HTMLElement;
    if (picked.closest("button")) return;
    const offsetX = e.nativeEvent.offsetX;
    const offsetY = e.nativeEvent.offsetY;
    document.onmousemove = (e: MouseEvent) => {
      setLeft(e.clientX - offsetX);
      setTop(e.clientY - offsetY);
    };
    document.onmouseup = () => {
      document.onmousemove = () => {};
      document.onmouseup = () => {};
    };
  };
  return (
    <div data-component="modal" data-view={viewOn} style={{ left, top }} {...attr}>
      <div onMouseDown={dragStart} className="modalTitle">
        {props.title}
        <button onClick={() => setViewon(false)}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </button>
      </div>
      {props.children}
    </div>
  );
};
export default Modal;
