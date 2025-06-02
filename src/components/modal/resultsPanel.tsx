import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';
import { ResultsList } from '../resultsList/resultsList';
import { Button } from '@mui/material';
import { get } from 'lodash';
import { IFeature } from '../../types';

interface IResultsPanel {
  features: any;
  isRetrievingMoreFeature: boolean;
  highlightOnTableFeature: IFeature | null;
  handleClickFeature: (productId: string) => void;
  handleZoomFeature: (productId: string) => any;
  handleHoverTableFeature: (productId: string | null) => void;
  handleRetrieveMoreFeature: () => Promise<void>;
  handleGenerateQuery: () => void;
  selectedFeature: IFeature | null;
}

const tooltipDark: VariantType = 'dark';
const tooltipBottom: PlacesType = 'bottom';

export const ResultsPanel: React.FC<IResultsPanel> = ({
  features,
  isRetrievingMoreFeature,
  highlightOnTableFeature,
  handleClickFeature,
  handleZoomFeature,
  handleHoverTableFeature,
  handleRetrieveMoreFeature,
  selectedFeature,
  handleGenerateQuery
}) => {
  const { displayedResults, totalResults } = useMemo(() => {
    const displayedResults = get(features, 'features', []).length;
    const totalResults = get(features, 'properties.totalResults', 0);
    return { displayedResults, totalResults };
  }, [features]);

  return (
    <div className={'jp-EodagWidget-modal-results'}>
      <div className={'jp-EodagWidget-results-wrapper'}>
        <div className={'jp-EodagWidget-results-title'}>
          <h2>{`Results (${totalResults})`}</h2>
          <div className={'jp-EodagWidget-results-subtitle'}>
            <span>{`Showing the first ${displayedResults} items that matched your filter`}</span>
            {isRetrievingMoreFeature && (
              <div
                data-tooltip-id="load-tooltip"
                data-tootip-content="Loading more products"
                data-tooltip-variant={tooltipDark}
                data-tooltip-place={tooltipBottom}
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
            features={features}
            highlightFeature={highlightOnTableFeature}
            handleClickFeature={handleClickFeature}
            handleZoomFeature={handleZoomFeature}
            handleHoverFeature={handleHoverTableFeature}
            isRetrievingMoreFeature={isRetrievingMoreFeature}
            handleRetrieveMoreFeature={handleRetrieveMoreFeature}
            selectedFeature={selectedFeature}
          />
        </div>
        <div className="jp-EodagWidget-results-footer">
          <Button
            variant={'contained'}
            className="jp-EodagWidget-apply"
            onClick={handleGenerateQuery}
          >
            {'Generate code'}
          </Button>
        </div>
      </div>
    </div>
  );
};
