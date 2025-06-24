import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Result } from './result';
import { IProduct } from '../../types';

interface IResultsListProps {
  features: {
    features: Array<{ id: string; properties: any }>;
    properties: { totalResults: number };
  };
  handleClickFeature: (id: string) => void;
  handleZoomFeature: (id: string) => void;
  hoveredFeatureId: string | null;
  setHoveredFeature: (id: string | null) => void;
  selectedFeature: IProduct | null;
  isRetrievingMoreFeature: boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
}

export const ResultsList: React.FC<IResultsListProps> = ({
  features,
  handleClickFeature,
  handleZoomFeature,
  hoveredFeatureId,
  selectedFeature,
  setHoveredFeature,
  isRetrievingMoreFeature,
  handleRetrieveMoreFeature
}) => {
  const loadedCount = features.features.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  const getRowData = useCallback(
    (index: number) => {
      if (index >= loadedCount) {
        return null;
      }
      const product = features.features[index];
      return {
        id: product.id,
        ...product.properties
      };
    },
    [features.features, loadedCount]
  );

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Infinite scroll
  const onItemsRendered = ({
    visibleStopIndex
  }: {
    visibleStartIndex: number;
    visibleStopIndex: number;
  }) => {
    // Get more data as soon as we reach the end of the container
    if (!isRetrievingMoreFeature && visibleStopIndex >= loadedCount - 1) {
      handleRetrieveMoreFeature();
    }
  };

  // Renderer of an item in the list
  const Row = ({ index, style }: ListChildComponentProps) => {
    const rowData = getRowData(index);
    if (!rowData) {
      return null;
    }

    const isSelected = selectedFeature?.id === rowData.id;

    return (
      <Result
        isHovered={hoveredFeatureId === rowData.id}
        isSelected={isSelected}
        onClick={handleClickFeature}
        onZoom={handleZoomFeature}
        setHoveredFeature={setHoveredFeature}
        rowData={rowData}
        style={style}
      />
    );
  };

  return (
    <div ref={containerRef} className={'sizeFull'}>
      {height > 0 && (
        <FixedSizeList
          height={height}
          width="100%"
          itemCount={features.features.length}
          itemSize={130} // Depending on item's height : 118 height + 12 gap
          overscanCount={5}
          onItemsRendered={onItemsRendered}
        >
          {Row}
        </FixedSizeList>
      )}
    </div>
  );
};
