import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Result } from './result';

interface IResultsListProps {
  features: {
    features: Array<{ id: string; properties: any }>;
    properties: { totalResults: number };
  };
  handleClickFeature: (id: string) => void;
  handleHoverFeature: (id: string | null) => void;
  highlightFeature: any;
  selectedFeature: any;
  isRetrievingMoreFeature: () => boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
}

export const ResultsList: React.FC<IResultsListProps> = ({
  features,
  handleClickFeature,
  handleHoverFeature,
  highlightFeature,
  selectedFeature,
  isRetrievingMoreFeature,
  handleRetrieveMoreFeature
}) => {
  const totalCount = features.properties.totalResults;
  const loadedCount = features.features.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  const getRowData = useCallback(
    (index: number) => {
      if (index >= loadedCount) {
        return null;
      }
      const feature = features.features[index];
      return {
        id: feature.id,
        ...feature.properties
      };
    },
    [features.features, loadedCount]
  );

  useEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        setHeight(containerRef.current.clientHeight);
      }
    }

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
    if (
      !isRetrievingMoreFeature() &&
      visibleStopIndex >= loadedCount - 1 &&
      loadedCount < totalCount
    ) {
      handleRetrieveMoreFeature();
    }
  };

  // Renderer of an item in the list
  const Row = ({ index, style }: ListChildComponentProps) => {
    const rowData = getRowData(index);
    if (!rowData) {
      return (
        <div style={style} className="result-list-row loading">
          Chargement...
        </div>
      );
    }

    const isSelected = selectedFeature?.id === rowData.id;
    const isHighlighted = highlightFeature?.id === rowData.id && !isSelected;

    return (
      <Result
        isHighlighted={isHighlighted}
        isSelected={isSelected}
        onClick={handleClickFeature}
        onHover={handleHoverFeature}
        rowData={rowData}
        style={style}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%'
      }}
    >
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
