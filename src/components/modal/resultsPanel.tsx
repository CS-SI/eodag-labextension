import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import { ResultsList } from '../resultsList/resultsList';
import { Button } from '../button';
import { get } from 'lodash';
import { IParameter, IProduct } from '../../types';

interface IResultsPanel {
  features: any;
  isRetrievingMoreFeature: boolean;
  hoveredFeatureId: IProduct['id'] | null;
  handleClickFeature: (productId: IProduct['id']) => void;
  handleZoomFeature: (productId: IProduct['id']) => any;
  setHoveredFeature: (productId: IProduct['id'] | null) => any;
  handleRetrieveMoreFeature: () => Promise<void>;
  handleGenerateQuery: (params: IParameter[]) => void;
  selectedFeature: IProduct | null;
}

export const ResultsPanel: React.FC<IResultsPanel> = ({
  features,
  isRetrievingMoreFeature,
  setHoveredFeature,
  handleClickFeature,
  handleZoomFeature,
  hoveredFeatureId,
  handleRetrieveMoreFeature,
  selectedFeature,
  handleGenerateQuery
}) => {
  const { displayedResults, ResultsTitle } = useMemo(() => {
    const displayedResults = get(features, 'features', []).length;
    const totalResults = get(features, 'properties.totalResults', 0);
    const ResultsTitle =
      totalResults !== null ? `Results (${totalResults})` : 'Results';
    return { displayedResults, ResultsTitle };
  }, [features]);

  return (
    <div className={'jp-EodagWidget-modal-results'}>
      <div className={'jp-EodagWidget-results-wrapper'}>
        <div className={'jp-EodagWidget-results-title'}>
          <h2>{ResultsTitle}</h2>
          <div className={'jp-EodagWidget-results-subtitle'}>
            <span>{`Showing the first ${displayedResults} items that matched your filter`}</span>
            {isRetrievingMoreFeature && (
              <div
                data-tooltip-id="load-tooltip"
                data-tootip-content="Loading more products"
                data-tooltip-variant={'dark'}
                data-tooltip-place={'bottom'}
                className="jp-EodagWidget-loading-wrapper"
              >
                <FontAwesomeIcon icon={faSpinner} spin />
                <Tooltip id="load-tooltip" className="jp-Eodag-tooltip" />
              </div>
            )}
          </div>
        </div>
        <div className="jp-EodagWidget-results-content">
          <ResultsList
            hoveredFeatureId={hoveredFeatureId}
            features={features}
            setHoveredFeature={setHoveredFeature}
            handleClickFeature={handleClickFeature}
            handleZoomFeature={handleZoomFeature}
            isRetrievingMoreFeature={isRetrievingMoreFeature}
            handleRetrieveMoreFeature={handleRetrieveMoreFeature}
            selectedFeature={selectedFeature}
          />
        </div>
        <div className="jp-EodagWidget-results-footer">
          <Button
            variant={'contained'}
            className="jp-EodagWidget-apply"
            onClick={() => handleGenerateQuery([])}
            label={'Generate code'}
          />
        </div>
      </div>
    </div>
  );
};
