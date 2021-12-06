import { useContext, useEffect } from "react";
import { ContextMenuContext } from "../../pages/project/[id]";

/**コンテクストメニュー */
export const ContextMenu = () => {
  const { contextMenuViewState, leftState, topState, contextMenuGroupState } = useContext(ContextMenuContext);
  const [groups] = contextMenuGroupState;
  const [view, setView] = contextMenuViewState;
  const [left] = leftState;
  const [top] = topState;
  useEffect(() => {
    if (view)
      document.onmousedown = (e) => {
        const target = e.target as HTMLElement;
        const isIn = !!target.closest("#contextMenu");
        if (!isIn) setView(false);
      };
    else document.onmousedown = () => {};
  }, [view, setView]);
  return view ? (
    <div id="contextMenu" style={{ left, top }}>
      {groups.map((group, index) => (
        <div className="group" key={index}>
          {group.label ? <span className="groupTitle">{group.label}</span> : ""}
          {group.items.map((item, iIndex) => (
            <button
              onClick={async () => {
                await item.action();
                setView(false);
              }}
              disabled={item.disabled}
              key={iIndex}
            >
              {item.label}
              {item.shortCut && <span className="shortCut">{item.shortCut}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
};

export default ContextMenu;
