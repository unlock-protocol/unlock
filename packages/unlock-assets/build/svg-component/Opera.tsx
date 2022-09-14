import * as React from 'react'
import { SVGProps } from 'react'
import PropTypes from 'prop-types'
interface SVGRProps {
  title?: string;
  titleId?: string;
}

const SvgOpera = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <mask
      id="opera_svg__a"
      mask-type="alpha"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={100}
      height={120}
    >
      <path
        d="M59.634 0C26.698 0 0 26.698 0 59.637c0 31.982 25.176 58.079 56.79 59.562.946.046 1.892.07 2.842.07 15.268 0 29.193-5.739 39.741-15.174-6.988 4.636-15.16 7.304-23.895 7.304-14.199 0-26.92-7.047-35.472-18.156-6.592-7.783-10.866-19.291-11.158-32.204v-2.81c.292-12.913 4.565-24.42 11.157-32.202 8.552-11.105 21.273-18.15 35.471-18.15 8.735 0 16.913 2.667 23.902 7.302C88.883 5.792 75.04.059 59.86.006c-.078 0-.152-.006-.229-.006h.002Z"
        fill="#fff"
      />
    </mask>
    <g mask="url(#opera_svg__a)">
      <path d="M99.379 0H0v119.268h99.378V0Z" fill="url(#opera_svg__b)" />
    </g>
    <mask
      id="opera_svg__c"
      mask-type="alpha"
      maskUnits="userSpaceOnUse"
      x={39}
      y={7}
      width={82}
      height={106}
    >
      <path d="M39.293 7.473H120v104.621H39.293V7.473Z" fill="#fff" />
    </mask>
    <g mask="url(#opera_svg__c)">
      <mask
        id="opera_svg__d"
        mask-type="alpha"
        maskUnits="userSpaceOnUse"
        x={40}
        y={7}
        width={80}
        height={105}
      >
        <path
          d="M40.006 26.027c5.47-6.457 12.54-10.352 20.257-10.352 17.363 0 31.434 19.68 31.434 43.962 0 24.276-14.071 43.955-31.434 43.955-7.718 0-14.787-3.893-20.257-10.35 8.551 11.11 21.272 18.157 35.47 18.157 8.735 0 16.907-2.668 23.896-7.304 12.208-10.923 19.897-26.79 19.897-44.458 0-17.666-7.689-33.54-19.891-44.458-6.987-4.635-15.166-7.303-23.9-7.303-14.2 0-26.92 7.046-35.472 18.15Z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#opera_svg__d)">
        <path
          d="M119.271 7.876H40.006V111.4h79.265V7.876Z"
          fill="url(#opera_svg__e)"
        />
      </g>
    </g>
    <defs>
      <linearGradient
        id="opera_svg__b"
        x1={49.689}
        y1={0}
        x2={49.689}
        y2={119.268}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF1B2D" />
        <stop offset={0.25} stopColor="#FF1B2D" />
        <stop offset={0.313} stopColor="#FF1B2D" />
        <stop offset={0.344} stopColor="#FF1B2D" />
        <stop offset={0.375} stopColor="#FE1B2D" />
        <stop offset={0.391} stopColor="#FD1A2D" />
        <stop offset={0.406} stopColor="#FD1A2C" />
        <stop offset={0.422} stopColor="#FC1A2C" />
        <stop offset={0.438} stopColor="#FB1A2C" />
        <stop offset={0.445} stopColor="#FA1A2C" />
        <stop offset={0.453} stopColor="#FA192C" />
        <stop offset={0.461} stopColor="#F9192B" />
        <stop offset={0.469} stopColor="#F9192B" />
        <stop offset={0.477} stopColor="#F8192B" />
        <stop offset={0.484} stopColor="#F8192B" />
        <stop offset={0.492} stopColor="#F7192B" />
        <stop offset={0.5} stopColor="#F6182B" />
        <stop offset={0.508} stopColor="#F6182A" />
        <stop offset={0.516} stopColor="#F5182A" />
        <stop offset={0.523} stopColor="#F4182A" />
        <stop offset={0.531} stopColor="#F4172A" />
        <stop offset={0.539} stopColor="#F3172A" />
        <stop offset={0.547} stopColor="#F21729" />
        <stop offset={0.555} stopColor="#F11729" />
        <stop offset={0.563} stopColor="#F01729" />
        <stop offset={0.57} stopColor="#F01629" />
        <stop offset={0.578} stopColor="#EF1628" />
        <stop offset={0.586} stopColor="#EE1628" />
        <stop offset={0.594} stopColor="#ED1528" />
        <stop offset={0.602} stopColor="#EC1528" />
        <stop offset={0.609} stopColor="#EB1527" />
        <stop offset={0.617} stopColor="#EA1527" />
        <stop offset={0.625} stopColor="#E91427" />
        <stop offset={0.629} stopColor="#E81427" />
        <stop offset={0.633} stopColor="#E81426" />
        <stop offset={0.637} stopColor="#E71426" />
        <stop offset={0.641} stopColor="#E71426" />
        <stop offset={0.645} stopColor="#E61326" />
        <stop offset={0.648} stopColor="#E61326" />
        <stop offset={0.652} stopColor="#E51326" />
        <stop offset={0.656} stopColor="#E51326" />
        <stop offset={0.66} stopColor="#E41325" />
        <stop offset={0.664} stopColor="#E41325" />
        <stop offset={0.668} stopColor="#E31225" />
        <stop offset={0.672} stopColor="#E21225" />
        <stop offset={0.676} stopColor="#E21225" />
        <stop offset={0.68} stopColor="#E11225" />
        <stop offset={0.684} stopColor="#E11224" />
        <stop offset={0.688} stopColor="#E01224" />
        <stop offset={0.691} stopColor="#E01124" />
        <stop offset={0.695} stopColor="#DF1124" />
        <stop offset={0.699} stopColor="#DE1124" />
        <stop offset={0.703} stopColor="#DE1124" />
        <stop offset={0.707} stopColor="#DD1123" />
        <stop offset={0.711} stopColor="#DD1023" />
        <stop offset={0.715} stopColor="#DC1023" />
        <stop offset={0.719} stopColor="#DB1023" />
        <stop offset={0.723} stopColor="#DB1023" />
        <stop offset={0.727} stopColor="#DA1023" />
        <stop offset={0.73} stopColor="#DA1022" />
        <stop offset={0.734} stopColor="#D90F22" />
        <stop offset={0.738} stopColor="#D80F22" />
        <stop offset={0.742} stopColor="#D80F22" />
        <stop offset={0.746} stopColor="#D70F22" />
        <stop offset={0.75} stopColor="#D60F21" />
        <stop offset={0.754} stopColor="#D60E21" />
        <stop offset={0.758} stopColor="#D50E21" />
        <stop offset={0.762} stopColor="#D40E21" />
        <stop offset={0.766} stopColor="#D40E21" />
        <stop offset={0.77} stopColor="#D30E21" />
        <stop offset={0.773} stopColor="#D20D20" />
        <stop offset={0.777} stopColor="#D20D20" />
        <stop offset={0.781} stopColor="#D10D20" />
        <stop offset={0.785} stopColor="#D00D20" />
        <stop offset={0.789} stopColor="#D00C20" />
        <stop offset={0.793} stopColor="#CF0C1F" />
        <stop offset={0.797} stopColor="#CE0C1F" />
        <stop offset={0.801} stopColor="#CE0C1F" />
        <stop offset={0.805} stopColor="#CD0C1F" />
        <stop offset={0.809} stopColor="#CC0B1F" />
        <stop offset={0.813} stopColor="#CB0B1E" />
        <stop offset={0.816} stopColor="#CB0B1E" />
        <stop offset={0.82} stopColor="#CA0B1E" />
        <stop offset={0.824} stopColor="#C90A1E" />
        <stop offset={0.828} stopColor="#C80A1E" />
        <stop offset={0.832} stopColor="#C80A1D" />
        <stop offset={0.836} stopColor="#C70A1D" />
        <stop offset={0.84} stopColor="#C60A1D" />
        <stop offset={0.844} stopColor="#C5091D" />
        <stop offset={0.848} stopColor="#C5091C" />
        <stop offset={0.852} stopColor="#C4091C" />
        <stop offset={0.855} stopColor="#C3091C" />
        <stop offset={0.859} stopColor="#C2081C" />
        <stop offset={0.863} stopColor="#C2081C" />
        <stop offset={0.867} stopColor="#C1081B" />
        <stop offset={0.871} stopColor="#C0081B" />
        <stop offset={0.875} stopColor="#BF071B" />
        <stop offset={0.879} stopColor="#BE071B" />
        <stop offset={0.883} stopColor="#BE071A" />
        <stop offset={0.887} stopColor="#BD071A" />
        <stop offset={0.891} stopColor="#BC061A" />
        <stop offset={0.895} stopColor="#BB061A" />
        <stop offset={0.898} stopColor="#BA061A" />
        <stop offset={0.902} stopColor="#BA0619" />
        <stop offset={0.906} stopColor="#B90519" />
        <stop offset={0.91} stopColor="#B80519" />
        <stop offset={0.914} stopColor="#B70519" />
        <stop offset={0.918} stopColor="#B60518" />
        <stop offset={0.922} stopColor="#B50418" />
        <stop offset={0.926} stopColor="#B50418" />
        <stop offset={0.93} stopColor="#B40418" />
        <stop offset={0.934} stopColor="#B30417" />
        <stop offset={0.938} stopColor="#B20317" />
        <stop offset={0.941} stopColor="#B10317" />
        <stop offset={0.945} stopColor="#B00317" />
        <stop offset={0.949} stopColor="#AF0316" />
        <stop offset={0.953} stopColor="#AE0216" />
        <stop offset={0.957} stopColor="#AE0216" />
        <stop offset={0.961} stopColor="#AD0216" />
        <stop offset={0.965} stopColor="#AC0115" />
        <stop offset={0.969} stopColor="#AB0115" />
        <stop offset={0.973} stopColor="#AA0115" />
        <stop offset={0.977} stopColor="#A90115" />
        <stop offset={0.98} stopColor="#A80014" />
        <stop offset={0.984} stopColor="#A70014" />
        <stop offset={1} stopColor="#A70014" />
      </linearGradient>
      <linearGradient
        id="opera_svg__e"
        x1={79.636}
        y1={7.875}
        x2={79.636}
        y2={111.396}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#9C0000" />
        <stop offset={0.008} stopColor="#9C0000" />
        <stop offset={0.012} stopColor="#9D0000" />
        <stop offset={0.016} stopColor="#9D0101" />
        <stop offset={0.02} stopColor="#9E0101" />
        <stop offset={0.023} stopColor="#9E0202" />
        <stop offset={0.027} stopColor="#9F0202" />
        <stop offset={0.031} stopColor="#9F0202" />
        <stop offset={0.035} stopColor="#A00303" />
        <stop offset={0.039} stopColor="#A00303" />
        <stop offset={0.043} stopColor="#A10404" />
        <stop offset={0.047} stopColor="#A10404" />
        <stop offset={0.051} stopColor="#A20505" />
        <stop offset={0.055} stopColor="#A30505" />
        <stop offset={0.059} stopColor="#A30505" />
        <stop offset={0.063} stopColor="#A40606" />
        <stop offset={0.066} stopColor="#A40606" />
        <stop offset={0.07} stopColor="#A50707" />
        <stop offset={0.074} stopColor="#A50707" />
        <stop offset={0.078} stopColor="#A60808" />
        <stop offset={0.082} stopColor="#A70808" />
        <stop offset={0.086} stopColor="#A70808" />
        <stop offset={0.09} stopColor="#A80909" />
        <stop offset={0.094} stopColor="#A80909" />
        <stop offset={0.098} stopColor="#A90A0A" />
        <stop offset={0.102} stopColor="#A90A0A" />
        <stop offset={0.105} stopColor="#AA0B0B" />
        <stop offset={0.109} stopColor="#AA0B0B" />
        <stop offset={0.113} stopColor="#AB0B0B" />
        <stop offset={0.117} stopColor="#AC0C0C" />
        <stop offset={0.121} stopColor="#AC0C0C" />
        <stop offset={0.125} stopColor="#AD0D0D" />
        <stop offset={0.129} stopColor="#AD0D0D" />
        <stop offset={0.133} stopColor="#AE0D0D" />
        <stop offset={0.137} stopColor="#AE0E0E" />
        <stop offset={0.141} stopColor="#AF0E0E" />
        <stop offset={0.145} stopColor="#AF0F0F" />
        <stop offset={0.148} stopColor="#B00F0F" />
        <stop offset={0.152} stopColor="#B11010" />
        <stop offset={0.156} stopColor="#B11010" />
        <stop offset={0.16} stopColor="#B21010" />
        <stop offset={0.164} stopColor="#B21111" />
        <stop offset={0.168} stopColor="#B31111" />
        <stop offset={0.172} stopColor="#B31212" />
        <stop offset={0.176} stopColor="#B41212" />
        <stop offset={0.18} stopColor="#B51313" />
        <stop offset={0.184} stopColor="#B51313" />
        <stop offset={0.188} stopColor="#B61313" />
        <stop offset={0.191} stopColor="#B61414" />
        <stop offset={0.195} stopColor="#B71414" />
        <stop offset={0.199} stopColor="#B71515" />
        <stop offset={0.203} stopColor="#B81515" />
        <stop offset={0.207} stopColor="#B81616" />
        <stop offset={0.211} stopColor="#B91616" />
        <stop offset={0.215} stopColor="#BA1616" />
        <stop offset={0.219} stopColor="#BA1717" />
        <stop offset={0.223} stopColor="#BB1717" />
        <stop offset={0.227} stopColor="#BB1818" />
        <stop offset={0.23} stopColor="#BC1818" />
        <stop offset={0.234} stopColor="#BC1919" />
        <stop offset={0.238} stopColor="#BD1919" />
        <stop offset={0.242} stopColor="#BD1919" />
        <stop offset={0.246} stopColor="#BE1A1A" />
        <stop offset={0.25} stopColor="#BF1A1A" />
        <stop offset={0.254} stopColor="#BF1B1B" />
        <stop offset={0.258} stopColor="#C01B1B" />
        <stop offset={0.262} stopColor="#C01B1B" />
        <stop offset={0.266} stopColor="#C11C1C" />
        <stop offset={0.27} stopColor="#C11C1C" />
        <stop offset={0.273} stopColor="#C21D1D" />
        <stop offset={0.277} stopColor="#C21D1D" />
        <stop offset={0.281} stopColor="#C31E1E" />
        <stop offset={0.285} stopColor="#C41E1E" />
        <stop offset={0.289} stopColor="#C41E1E" />
        <stop offset={0.293} stopColor="#C51F1F" />
        <stop offset={0.297} stopColor="#C51F1F" />
        <stop offset={0.301} stopColor="#C62020" />
        <stop offset={0.305} stopColor="#C62020" />
        <stop offset={0.309} stopColor="#C72121" />
        <stop offset={0.313} stopColor="#C82121" />
        <stop offset={0.316} stopColor="#C82121" />
        <stop offset={0.32} stopColor="#C92222" />
        <stop offset={0.324} stopColor="#C92222" />
        <stop offset={0.328} stopColor="#CA2323" />
        <stop offset={0.332} stopColor="#CA2323" />
        <stop offset={0.336} stopColor="#CB2424" />
        <stop offset={0.34} stopColor="#CB2424" />
        <stop offset={0.344} stopColor="#CC2424" />
        <stop offset={0.348} stopColor="#CD2525" />
        <stop offset={0.352} stopColor="#CD2525" />
        <stop offset={0.355} stopColor="#CE2626" />
        <stop offset={0.359} stopColor="#CE2626" />
        <stop offset={0.363} stopColor="#CF2626" />
        <stop offset={0.367} stopColor="#CF2727" />
        <stop offset={0.371} stopColor="#D02727" />
        <stop offset={0.375} stopColor="#D02828" />
        <stop offset={0.379} stopColor="#D12828" />
        <stop offset={0.383} stopColor="#D22929" />
        <stop offset={0.387} stopColor="#D22929" />
        <stop offset={0.391} stopColor="#D32929" />
        <stop offset={0.395} stopColor="#D32A2A" />
        <stop offset={0.398} stopColor="#D42A2A" />
        <stop offset={0.402} stopColor="#D42B2B" />
        <stop offset={0.406} stopColor="#D52B2B" />
        <stop offset={0.41} stopColor="#D62C2C" />
        <stop offset={0.414} stopColor="#D62C2C" />
        <stop offset={0.418} stopColor="#D72C2C" />
        <stop offset={0.422} stopColor="#D72D2D" />
        <stop offset={0.426} stopColor="#D82D2D" />
        <stop offset={0.43} stopColor="#D82E2E" />
        <stop offset={0.434} stopColor="#D92E2E" />
        <stop offset={0.438} stopColor="#D92F2F" />
        <stop offset={0.441} stopColor="#DA2F2F" />
        <stop offset={0.445} stopColor="#DB2F2F" />
        <stop offset={0.449} stopColor="#DB3030" />
        <stop offset={0.453} stopColor="#DC3030" />
        <stop offset={0.457} stopColor="#DC3131" />
        <stop offset={0.461} stopColor="#DD3131" />
        <stop offset={0.465} stopColor="#DD3232" />
        <stop offset={0.469} stopColor="#DE3232" />
        <stop offset={0.473} stopColor="#DE3232" />
        <stop offset={0.477} stopColor="#DF3333" />
        <stop offset={0.48} stopColor="#E03333" />
        <stop offset={0.484} stopColor="#E03434" />
        <stop offset={0.488} stopColor="#E13434" />
        <stop offset={0.492} stopColor="#E13434" />
        <stop offset={0.496} stopColor="#E23535" />
        <stop offset={0.5} stopColor="#E23535" />
        <stop offset={0.504} stopColor="#E33636" />
        <stop offset={0.508} stopColor="#E43636" />
        <stop offset={0.512} stopColor="#E43737" />
        <stop offset={0.516} stopColor="#E53737" />
        <stop offset={0.52} stopColor="#E53737" />
        <stop offset={0.523} stopColor="#E63838" />
        <stop offset={0.527} stopColor="#E63838" />
        <stop offset={0.531} stopColor="#E73939" />
        <stop offset={0.535} stopColor="#E73939" />
        <stop offset={0.539} stopColor="#E83A3A" />
        <stop offset={0.543} stopColor="#E93A3A" />
        <stop offset={0.547} stopColor="#E93A3A" />
        <stop offset={0.551} stopColor="#EA3B3B" />
        <stop offset={0.555} stopColor="#EA3B3B" />
        <stop offset={0.559} stopColor="#EB3C3C" />
        <stop offset={0.563} stopColor="#EB3C3C" />
        <stop offset={0.566} stopColor="#EC3D3D" />
        <stop offset={0.57} stopColor="#EC3D3D" />
        <stop offset={0.574} stopColor="#ED3D3D" />
        <stop offset={0.578} stopColor="#EE3E3E" />
        <stop offset={0.582} stopColor="#EE3E3E" />
        <stop offset={0.586} stopColor="#EF3F3F" />
        <stop offset={0.59} stopColor="#EF3F3F" />
        <stop offset={0.594} stopColor="#F03F3F" />
        <stop offset={0.598} stopColor="#F04040" />
        <stop offset={0.602} stopColor="#F14040" />
        <stop offset={0.605} stopColor="#F14141" />
        <stop offset={0.609} stopColor="#F24141" />
        <stop offset={0.613} stopColor="#F34242" />
        <stop offset={0.617} stopColor="#F34242" />
        <stop offset={0.621} stopColor="#F44242" />
        <stop offset={0.625} stopColor="#F44343" />
        <stop offset={0.629} stopColor="#F54343" />
        <stop offset={0.633} stopColor="#F54444" />
        <stop offset={0.637} stopColor="#F64444" />
        <stop offset={0.641} stopColor="#F74545" />
        <stop offset={0.645} stopColor="#F74545" />
        <stop offset={0.648} stopColor="#F84545" />
        <stop offset={0.652} stopColor="#F84646" />
        <stop offset={0.656} stopColor="#F94646" />
        <stop offset={0.66} stopColor="#F94747" />
        <stop offset={0.664} stopColor="#FA4747" />
        <stop offset={0.668} stopColor="#FA4848" />
        <stop offset={0.672} stopColor="#FB4848" />
        <stop offset={0.676} stopColor="#FC4848" />
        <stop offset={0.68} stopColor="#FC4949" />
        <stop offset={0.684} stopColor="#FD4949" />
        <stop offset={0.688} stopColor="#FD4A4A" />
        <stop offset={0.691} stopColor="#FE4A4A" />
        <stop offset={0.695} stopColor="#FE4B4B" />
        <stop offset={0.703} stopColor="#FF4B4B" />
        <stop offset={0.719} stopColor="#FF4B4B" />
        <stop offset={0.75} stopColor="#FF4B4B" />
        <stop offset={1} stopColor="#FF4B4B" />
      </linearGradient>
    </defs>
  </svg>
)

SvgOpera.propTypes = {
  title: PropTypes.string,
}
SvgOpera.defaultProps = {
  title: '',
}
export type { SVGRProps }
export default SvgOpera
