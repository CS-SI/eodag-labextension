import React from 'react';
import { FixedSizeList as List } from 'react-window';

const heightPerItem = 44;
const maxVisibleItems = 7;

export const MenuList = (props: any) => {
  const { options, children, maxHeight, getValue } = props;
  const [value] = getValue();
  const initialIndex = options.findIndex(
    (option: any) => option.value === value?.value
  );
  const initialOffset = initialIndex >= 0 ? initialIndex * heightPerItem : 0;

  const height = Math.min(
    maxHeight,
    maxVisibleItems * heightPerItem,
    children.length * heightPerItem
  );

  const Row = ({
    index,
    style
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const child = children[index];
    return <div style={style}>{child}</div>;
  };

  return (
    <List
      height={height}
      itemCount={children.length}
      itemSize={heightPerItem}
      initialScrollOffset={initialOffset}
      width="100%"
    >
      {Row}
    </List>
  );
};
