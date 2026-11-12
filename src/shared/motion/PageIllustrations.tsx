export type GraphicVariant =
  | 'report'
  | 'updates'
  | 'packs'
  | 'account'
  | 'privacy'
  | 'terms'
  | 'license'
  | 'cookies'
  | 'refunds'
  | 'copyright'
  | 'not-found'
  | 'screens'
  | 'workflow'
  | 'phone-preview'
  | 'desktop-preview'
  | 'artwork';

function Paper() {
  return (
    <g>
      <path className="semantic-paper" d="M79 34h104l39 39v184H79z" />
      <path d="M183 34v39h39M101 105h94M101 127h72M101 149h83" className="semantic-muted" />
    </g>
  );
}
function Picture({
  x = 75,
  y = 68,
  width = 150,
  height = 126,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  return (
    <g>
      <rect className="semantic-paper" x={x} y={y} width={width} height={height} rx="8" />
      <circle
        cx={x + width * 0.73}
        cy={y + height * 0.28}
        r={height * 0.1}
        className="semantic-accent"
      />
      <path
        d={`M${x + 12} ${y + height - 16}l${width * 0.27} -${height * 0.42} ${width * 0.18} ${height * 0.22} ${width * 0.16} -${height * 0.16} ${width * 0.25} ${height * 0.36}`}
      />
    </g>
  );
}
function Shield({ children }: { children?: any }) {
  return (
    <g>
      <path
        className="semantic-paper"
        d="M150 40l89 33v70c0 60-45 96-89 120-44-24-89-60-89-120V73z"
      />
      {children}
    </g>
  );
}
function Check({ x = 218, y = 214 }: { x?: number; y?: number }) {
  return (
    <g className="semantic-confirm">
      <circle className="semantic-accent" cx={x} cy={y} r="33" />
      <path d={`M${x - 15} ${y}l10 10 22-23`} />
    </g>
  );
}

/** Each scene describes the action or subject of the page that owns it. */
export default function PageIllustration({ variant }: { variant: GraphicVariant }) {
  switch (variant) {
    case 'report':
      return (
        <>
          <g className="semantic-ticket">
            <path className="semantic-paper" d="M165 48h70l27 27v151h-97z" />
            <path d="M235 48v27h27M183 102h56M183 122h42M183 142h49" className="semantic-muted" />
            <rect x="182" y="173" width="59" height="30" rx="5" className="semantic-accent" />
            <path d="M194 188h32m-8-7 8 7-8 7" />
          </g>
          <g className="semantic-bug">
            <ellipse cx="100" cy="146" rx="29" ry="39" className="semantic-accent" />
            <path d="M100 111v72M87 107l-8-18m34 18 8-18M73 128l-21-12m19 31H47m27 20-20 15M127 128l21-12m-19 31h24m-27 20 20 15" />
            <path d="M83 112c0-25 34-25 34 0" className="semantic-paper" />
          </g>
          <g className="semantic-magnifier">
            <circle cx="100" cy="143" r="62" />
            <path d="m144 187 37 38" strokeWidth="10" strokeLinecap="round" />
            <path className="semantic-scan" d="M49 143h102" />
          </g>
        </>
      );
    case 'updates':
      return (
        <>
          <path className="semantic-muted" d="M50 42v216" />
          <circle className="semantic-release-dot semantic-accent" cx="50" cy="70" r="9" />
          {[0, 1, 2].map((i) => (
            <g key={i} className="semantic-release-card" style={{ '--step': i } as any}>
              <circle cx="50" cy={70 + i * 78} r="5" className="semantic-paper" />
              <rect
                x="82"
                y={43 + i * 78}
                width="177"
                height="58"
                rx="9"
                className="semantic-paper"
              />
              <path d={`M100 ${61 + i * 78}h95M100 ${78 + i * 78}h61`} />
              <path className="semantic-accent-stroke" d={`m222 ${69 + i * 78} 7 7 14-17`} />
            </g>
          ))}
        </>
      );
    case 'packs':
      return (
        <>
          <g className="semantic-pack-back">
            <Picture x={77} y={32} width={158} height={143} />
          </g>
          <g className="semantic-pack-front">
            <Picture x={55} y={58} width={158} height={143} />
          </g>
          <path className="semantic-paper" d="M33 146h83l18 21h132v93H33z" />
          <path className="semantic-muted" d="M33 167h233" />
          <path d="M59 202h72m-72 18h49" />
          <g className="semantic-download">
            <path className="semantic-accent" d="M195 184h47v59h-47z" />
            <path d="M218 196v29m-10-10 10 10 10-10" />
          </g>
        </>
      );
    case 'account':
      return (
        <>
          <rect x="46" y="46" width="176" height="210" rx="14" className="semantic-paper" />
          <path className="semantic-muted" d="M67 72h35m-35 160h118" />
          <circle cx="133" cy="118" r="28" />
          <path d="M86 193v-11c0-45 94-45 94 0v11z" className="semantic-accent" />
          <g className="semantic-key">
            <circle cx="219" cy="199" r="24" className="semantic-paper" />
            <circle cx="219" cy="199" r="7" />
            <path d="m202 216-42 42m12-12 9 9m3-21 9 9" strokeWidth="5" />
          </g>
        </>
      );
    case 'privacy':
      return (
        <>
          <Shield>
            <g className="semantic-lock">
              <path d="M123 133v-17c0-38 54-38 54 0v17" />
              <rect x="112" y="133" width="76" height="62" rx="9" className="semantic-accent" />
              <circle cx="150" cy="158" r="7" />
              <path d="M150 165v13" />
            </g>
          </Shield>
          <path className="semantic-shield-trace" d="M150 55l75 28v60c0 51-37 82-75 105" />
        </>
      );
    case 'terms':
      return (
        <>
          <Paper />
          <path className="semantic-write" d="M100 191c8-22 12 23 23 0s7 20 19 0 12 6 25-3" />
          <path d="M100 218h95" className="semantic-muted" />
          <g className="semantic-pen">
            <path className="semantic-accent" d="m204 111 18 12-62 88-23 10 3-25z" />
            <path d="m151 183 20 13m33-85 10-14c8-11 26 2 18 13l-10 13" />
          </g>
        </>
      );
    case 'license':
      return (
        <>
          <Picture x={44} y={52} width={202} height={157} />
          <path className="semantic-muted" d="M65 232h108M65 250h73" />
          <Check />
        </>
      );
    case 'cookies':
      return (
        <>
          <rect x="38" y="44" width="224" height="183" rx="12" className="semantic-paper" />
          <path d="M38 77h224m-207-16h4m10 0h4m10 0h4" className="semantic-muted" />
          <g className="semantic-storage">
            <path d="M61 111h61m-61 25h77m-77 25h55m-55 25h68" />
            <circle className="semantic-accent" cx="140" cy="111" r="7" />
          </g>
          <g className="semantic-cookie">
            <path
              className="semantic-accent"
              d="M222 112a26 26 0 0 0 33 33 22 22 0 0 0 21 27 66 66 0 1 1-54-60Z"
            />
            <circle cx="194" cy="151" r="4" />
            <circle cx="172" cy="184" r="6" />
            <circle cx="206" cy="202" r="5" />
            <circle cx="230" cy="175" r="4" />
            <circle cx="231" cy="222" r="4" />
          </g>
        </>
      );
    case 'refunds':
      return (
        <>
          <path
            className="semantic-paper"
            d="M86 42h130v214l-16-11-16 11-16-11-16 11-16-11-16 11-16-11-18 11z"
          />
          <path className="semantic-muted" d="M106 76h89m-89 23h61m-61 29h89m-89 24h76" />
          <g className="semantic-return">
            <path className="semantic-accent-stroke" d="M76 199a80 80 0 1 0 78-86" />
            <path className="semantic-accent" d="m148 99-14 24 27 5" />
          </g>
        </>
      );
    case 'copyright':
      return (
        <>
          <Picture x={51} y={46} width={188} height={143} />
          <path className="semantic-muted" d="M70 215h66m-66 21h97" />
          <g className="semantic-copyright">
            <circle className="semantic-accent" cx="214" cy="215" r="49" />
            <path d="M231 197a25 25 0 1 0 0 36" />
          </g>
        </>
      );
    case 'not-found':
      return (
        <>
          <path
            className="semantic-route"
            d="M36 237h49V76h81m49 0h46v161h-70"
            strokeDasharray="7 9"
          />
          <circle cx="36" cy="237" r="12" className="semantic-accent" />
          <path d="M176 225v24m-8-16 8 8m0-8-8 8" />
          <g className="semantic-route-sign">
            <rect x="107" y="42" width="98" height="69" rx="12" className="semantic-paper" />
            <path d="M130 77h51m-11-11 11 11-11 11" />
            <path d="m142 134 11 13m-25-6 10 13" className="semantic-accent-stroke" />
          </g>
        </>
      );
    case 'screens':
      return (
        <>
          <rect x="25" y="57" width="214" height="146" rx="9" />
          <path className="semantic-muted" d="M25 179h214M111 203v29m-38 0h77" />
          <path d="m47 159 40-55 40 35 29-20 54 40" />
          <circle cx="180" cy="91" r="13" className="semantic-accent" />
          <g className="semantic-device-transfer">
            <rect className="semantic-paper" x="205" y="127" width="69" height="127" rx="12" />
            <path d="M227 139h24m-26 102h29m-35-31 17-28 23 28" />
            <circle cx="252" cy="168" r="6" className="semantic-accent" />
          </g>
        </>
      );
    case 'workflow':
      return (
        <>
          <path className="semantic-flow-line" d="M46 150h208" strokeDasharray="5 8" />
          <g>
            <rect x="22" y="100" width="69" height="98" rx="9" className="semantic-paper" />
            <path d="m34 164 15-24 15 14 15-11M38 184h36" />
            <circle cx="74" cy="120" r="5" className="semantic-accent" />
          </g>
          <g>
            <rect x="116" y="100" width="69" height="98" rx="9" className="semantic-paper" />
            <path d="M127 148c14-24 32-24 46 0-14 24-32 24-46 0Z" />
            <circle cx="150" cy="148" r="7" />
          </g>
          <g>
            <rect x="210" y="100" width="69" height="98" rx="9" className="semantic-paper" />
            <g className="semantic-download">
              <path d="M244 123v40m-14-13 14 14 14-14m-31 20v12h34v-12" />
            </g>
          </g>
          <path className="semantic-choice-cursor semantic-accent" d="m49 209 22 5-10 5-5 11z" />
        </>
      );
    case 'phone-preview':
      return (
        <>
          <rect x="97" y="30" width="106" height="237" rx="20" />
          <path
            className="semantic-muted"
            d="M125 44h50m-41 207h32M71 30H48v237h23M230 30h22v237h-22M40 30h16m-16 237h16m188-237h16m-16 237h16"
          />
          <path className="semantic-preview-scan" d="M79 149h142" />
          <path d="m48 44-6 9m6-9 6 9m-6 200-6-9m6 9 6-9" />
        </>
      );
    case 'desktop-preview':
      return (
        <>
          <rect x="27" y="70" width="246" height="151" rx="6" />
          <path
            className="semantic-muted"
            d="M115 221v26m70-26v26m-94 0h118M27 48h246m-246-7v14m246-14v14M27 241h44m158 0h44"
          />
          <path d="m41 48 9-6m-9 6 9 6m209-6-9-6m9 6-9 6" />
          <path className="semantic-preview-scan" d="M41 144h218" />
        </>
      );
    case 'artwork':
      return (
        <>
          <Picture x={52} y={52} width={196} height={196} />
          <g className="semantic-crop-guides">
            <path d="M32 83V32h51m134 0h51v51m0 134v51h-51M83 268H32v-51" />
          </g>
          <path className="semantic-muted" d="M78 52v196M52 78h196m-26-26v196M52 222h196" />
        </>
      );
  }
}
