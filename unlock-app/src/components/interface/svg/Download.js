import React from 'react';

const SvgDownload = ({ title, ...props }) => (
  <svg {...props}>
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.345 10.395c.406.414.655.98.655 1.605a2.281 2.281 0 0 1-.655 1.605l-.017.017-.017.017a2.283 2.283 0 0 1-2.017.618 2.275 2.275 0 0 1-1-.448v1.168c.428.203.907.317 1.412.317.897 0 1.711-.359 2.305-.941h.048v-.048A3.283 3.283 0 0 0 20 12a3.283 3.283 0 0 0-.941-2.305v-.048h-.048a3.303 3.303 0 0 0-.896-.625A5.179 5.179 0 0 0 12.941 4a5.179 5.179 0 0 0-4.983 3.77 3.765 3.765 0 1 0 .748 7.406V14.13a2.755 2.755 0 0 1-1 .163 2.765 2.765 0 1 1 .202-5.525l.796.04.217-.767a4.177 4.177 0 0 1 8.195 1.01l.018.612.553.262c.232.11.442.258.624.436l.017.017.017.017zm-6.845 9.79l-1.88-2.192a.5.5 0 0 1 .76-.652l1.12 1.307V11a.5.5 0 0 1 1 0v7.648l1.12-1.306a.5.5 0 0 1 .76.65m0 0l-2 2.333a.5.5 0 0 1-.76 0l-.12-.14"
    />
  </svg>
);

export default SvgDownload;
