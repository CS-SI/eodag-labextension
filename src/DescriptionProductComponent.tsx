/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import _ from 'lodash';
import * as React from 'react';
import { FeaturePropertie } from './types';

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

export interface IProps {
  feature: any;
}

export interface IState {
  smallQuicklook: any;
  featureProperties: FeaturePropertie[];
}

export default class DescriptionProductComponent extends React.Component<
  IProps,
  IState
> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      smallQuicklook: true,
      featureProperties: undefined
    };
  }
  toggleQuicklookSize = () => {
    const { smallQuicklook } = this.state;
    this.setState({
      smallQuicklook: !smallQuicklook
    });
  };

  componentDidUpdate(prevProps: IProps) {
    if (
      prevProps.feature !== this.props.feature &&
      Boolean(this.props.feature)
    ) {
      const featureProperties = this.organizeProperties();
      this.setState({ featureProperties });
    }
  }

  organizeProperties(): FeaturePropertie[] {
    const { properties } = this.props.feature;
    const meanProperties: [string, any][] = [];
    MEANPROPERTIES.forEach(p => {
      const fp = properties[p];
      if (fp !== undefined && fp !== null && fp !== '' && fp.length !== 0) {
        meanProperties.push([p, fp]);
      }
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

    // Split keys on Upper letters and make a new capitalized string
    const featureProperties: FeaturePropertie[] = meanProperties
      .concat(otherProperties)
      .map(([k, v]: [string, any]) => ({
        key: _.capitalize(k.split(/(?=[A-Z])/).join(' ')),
        value: v
      }));
    return featureProperties;
  }

  render() {
    const { feature } = this.props;
    const { featureProperties, smallQuicklook } = this.state;
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
            onClick={this.toggleQuicklookSize}
          />
        </div>
        <h4>Metadata</h4>
        <table className="result-table">
          {featureProperties.map(({ key, value }: FeaturePropertie) => (
            <tr>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </table>
      </div>
    );
  }
}
