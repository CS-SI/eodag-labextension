import React, { CSSProperties } from 'react';

export interface ISVGProps {
  strokeColor?: string;
  strokeWidth?: string;
  strokeWidth2?: string;
  strokeWidth3?: string;
  strokeFill?: string;
  fillColor?: string;
  fillColor2?: string;
  fillColor3?: string;
  fillColor4?: string;
  fillColor5?: string;
  fillColor6?: string;
  fillColor7?: string;
  imageWidth?: string;
  imageHeight?: string;
  width?: string;
  height?: string;
  rotateCenter?: number;
  className?: string;
  className2?: string;
  className3?: string;
  className4?: string;
  className5?: string;
  style?: CSSProperties;
}

export const CodiconOpenPreview = (props: ISVGProps) => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3 1h11l1 1v5.3a3.21 3.21 0 0 0-1-.3V2H9v10.88L7.88 14H3l-1-1V2l1-1zm0 12h5V2H3v11zm10.379-4.998a2.53 2.53 0 0 0-1.19.348h-.03a2.51 2.51 0 0 0-.799 3.53L9 14.23l.71.71l2.35-2.36c.325.22.7.358 1.09.4a2.47 2.47 0 0 0 1.14-.13a2.51 2.51 0 0 0 1-.63a2.46 2.46 0 0 0 .58-1a2.63 2.63 0 0 0 .07-1.15a2.53 2.53 0 0 0-1.35-1.81a2.53 2.53 0 0 0-1.211-.258zm.24 3.992a1.5 1.5 0 0 1-.979-.244a1.55 1.55 0 0 1-.56-.68a1.49 1.49 0 0 1-.08-.86a1.49 1.49 0 0 1 1.18-1.18a1.49 1.49 0 0 1 .86.08c.276.117.512.311.68.56a1.5 1.5 0 0 1-1.1 2.324z"
      clipRule="evenodd"
    ></path>
  </svg>
);

export const PhFileCode = (props: ISVGProps) => (
  <svg width="1em" height="1em" viewBox="0 0 256 256" {...props}>
    <path
      fill="currentColor"
      d="M216 88a7.7 7.7 0 0 0-2.4-5.7l-55.9-56A8.1 8.1 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88Zm-56-36.7L188.7 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48v120Zm-22.3-69.7a8.1 8.1 0 0 1 0 11.4l-24 24a8.5 8.5 0 0 1-5.7 2.3a8.3 8.3 0 0 1-5.7-2.3a8.1 8.1 0 0 1 0-11.4l18.4-18.3l-18.4-18.3a8.1 8.1 0 0 1 11.4-11.4Zm-64-12.6L95.3 152l18.4 18.3a8.1 8.1 0 0 1 0 11.4a8.5 8.5 0 0 1-5.7 2.3a8.3 8.3 0 0 1-5.7-2.3l-24-24a8.1 8.1 0 0 1 0-11.4l24-24a8.1 8.1 0 0 1 11.4 11.4Z"
    ></path>
  </svg>
);

export const CarbonTrashCan = (props: ISVGProps) => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" {...props}>
    <path fill="currentColor" d="M12 12h2v12h-2zm6 0h2v12h-2z"></path>
    <path
      fill="currentColor"
      d="M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6zm4 22V8h16v20zm4-26h8v2h-8z"
    ></path>
  </svg>
);

export const CarbonCalendarAddAlt = (props: ISVGProps) => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" {...props}>
    <path fill="currentColor" d="M26 21h-3v-3h-2v3h-3v2h3v3h2v-3h3z"></path>
    <path
      fill="currentColor"
      d="M22 30c-4.4 0-8-3.6-8-8s3.6-8 8-8s8 3.6 8 8s-3.6 8-8 8zm0-14c-3.3 0-6 2.7-6 6s2.7 6 6 6s6-2.7 6-6s-2.7-6-6-6z"
    ></path>
    <path
      fill="currentColor"
      d="M28 6c0-1.1-.9-2-2-2h-4V2h-2v2h-8V2h-2v2H6c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h6v-2H6V6h4v2h2V6h8v2h2V6h4v6h2V6z"
    ></path>
  </svg>
);

export const CarbonAddFilled = (props: ISVGProps) => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" {...props}>
    <path
      fill="currentColor"
      d="M16 2A14.172 14.172 0 0 0 2 16a14.172 14.172 0 0 0 14 14a14.172 14.172 0 0 0 14-14A14.172 14.172 0 0 0 16 2Zm8 15h-7v7h-2v-7H8v-2h7V8h2v7h7Z"
    ></path>
    <path fill="none" d="M24 17h-7v7h-2v-7H8v-2h7V8h2v7h7v2z"></path>
  </svg>
);

export const IcBaselineRefresh = (props: ISVGProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
    ></path>
  </svg>
);

export const NoImage = (props: ISVGProps) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="120" height="120" fill="#EFF1F3" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M33.2503 38.4816C33.2603 37.0472 34.4199 35.8864 35.8543 35.875H83.1463C84.5848 35.875 85.7503 37.0431 85.7503 38.4816V80.5184C85.7403 81.9528 84.5807 83.1136 83.1463 83.125H35.8543C34.4158 83.1236 33.2503 81.957 33.2503 80.5184V38.4816ZM80.5006 41.1251H38.5006V77.8751L62.8921 53.4783C63.9172 52.4536 65.5788 52.4536 66.6039 53.4783L80.5006 67.4013V41.1251ZM43.75 51.6249C43.75 54.5244 46.1005 56.8749 49 56.8749C51.8995 56.8749 54.25 54.5244 54.25 51.6249C54.25 48.7254 51.8995 46.3749 49 46.3749C46.1005 46.3749 43.75 48.7254 43.75 51.6249Z"
      fill="#687787"
    />
  </svg>
);
