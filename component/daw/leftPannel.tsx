import { useState } from "react";

const LeftPannel: React.FC = () => {
  const [width, setWidth] = useState(120);
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  return (
    <div id="pannels" style={{ width }}>
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

export default LeftPannel;
