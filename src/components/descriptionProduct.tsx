import React, { useCallback, useMemo, useState } from 'react';
import _ from 'lodash';
import { IFeatureProperty } from '../types';

const MEANPROPERTIES = [
  'platformSerialIdentifier',
  'instrument',
  'productType',
  'processingLevel',
  'sensorMode',
  'startTimeFromAscendingNode',
  'completionTimeFromAscendingNode',
  'orbitDirection',
  'orbitNumber',
  'cloudCover'
];

const formatProperty = (name: string, value: unknown): string | unknown => {
  if (name === 'cloudCover') {
    return `${Math.round(value as number)} %`;
  }
  return value;
};

interface IDescriptionProductProps {
  feature: any;
}

export const DescriptionProduct: React.FC<IDescriptionProductProps> = ({
  feature
}) => {
  const [smallQuicklook, setSmallQuicklook] = useState(true);

  const toggleQuicklookSize = useCallback(() => {
    setSmallQuicklook(prev => !prev);
  }, []);

  const featureProperties = useMemo<IFeatureProperty[] | undefined>(() => {
    if (!feature?.properties) {
      return undefined;
    }

    const { properties } = feature;

    const meanProperties: [string, any][] = MEANPROPERTIES.flatMap(key => {
      const value = properties[key];
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        value.length !== 0
      ) {
        return [[key, formatProperty(key, value)]];
      }
      return [];
    });

    const otherProperties = _.toPairs(
      _.pickBy(
        properties,
        (v, k) =>
          (_.isNumber(v) ||
            _.isString(v) ||
            (_.isArray(v) && v.length !== 0 && v.every(_.isString))) &&
          !MEANPROPERTIES.includes(k) &&
          !k.startsWith('eodag') &&
          v !== undefined &&
          v !== null &&
          v !== ''
      )
    ).sort();

    return [...meanProperties, ...otherProperties].map(([key, value]) => ({
      key: _.capitalize(key.split(/(?=[A-Z])/).join(' ')),
      value
    }));
  }, [feature]);

  if (!feature || !featureProperties) {
    return null;
  }

  return (
    <div className="jp-EodagWidget-product">
      <h4>Quicklook</h4>
      <div className="jp-EodagWidget-quicklook-wrapper">
        <img
          src={feature.properties.quicklook}
          alt="Quicklook not available"
          className={smallQuicklook ? 'jp-EodagWidget-small-quicklook' : ''}
          onClick={toggleQuicklookSize}
        />
      </div>
      <h4>Metadata</h4>
      <table className="result-table">
        <tbody>
          {featureProperties.map(({ key, value }) => (
            <tr key={key}>
              <td>{key}</td>
              <td>
                {typeof value === 'string' && value.startsWith('http') ? (
                  <a href={value} target="_blank" rel="noopener noreferrer">
                    {value}
                  </a>
                ) : Array.isArray(value) ? (
                  value.join(', ')
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
