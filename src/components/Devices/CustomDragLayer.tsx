import React, { useMemo } from "react";
import { useDragLayer } from "react-dnd";

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

function getItemStyles(
  initialOffset: any,
  currentOffset: any
): React.CSSProperties {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }
  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const CustomDragLayer: React.FC<{ title: string }> = ({ title }) => {
  const { itemType, isDragging, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  const itemStyles = useMemo(
    () => getItemStyles(initialOffset, currentOffset),
    [initialOffset, currentOffset]
  );

  const renderItem = useMemo(() => {
    switch (itemType) {
      case "SOURCE":
        return <div style={{ display: "inline-block" }}>{title}</div>;
      default:
        return null;
    }
  }, [itemType, title]);

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={itemStyles}>{renderItem}</div>
    </div>
  );
};
