import type { FaceStyle } from "@/lib/personality";

export function PetFace({
  face,
  label,
}: {
  face: FaceStyle;
  label: string;
}) {
  return (
    <svg
      viewBox="0 0 200 220"
      role="img"
      aria-label={label}
      className="h-full w-full"
    >
      <g transform={face.flip ? "translate(200 0) scale(-1 1)" : undefined}>
        <ellipse cx="52" cy="78" rx="22" ry="26" fill={face.skin} />
        <ellipse cx="148" cy="78" rx="22" ry="26" fill={face.skin} />
        <ellipse cx="52" cy="82" rx="11" ry="14" fill={face.belly} opacity="0.85" />
        <ellipse cx="148" cy="82" rx="11" ry="14" fill={face.belly} opacity="0.85" />
        <ellipse cx="100" cy="128" rx="74" ry="70" fill={face.skin} />
        <ellipse cx="100" cy="146" rx="44" ry="38" fill={face.belly} />
        {face.dressed ? (
          <path
            d="M48 150c18 16 86 16 104 0v16c-20 18-84 18-104 0z"
            fill="#fffaf4"
            opacity="0.92"
          />
        ) : null}
        {face.crown ? (
          <path
            d="M58 62l14 22h56l14-22-18 10-14-24-10 24z"
            fill="#f0b429"
            stroke="#2a1420"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ) : null}
        <Eyes eye={face.eye} />
        <Mouth mouth={face.mouth} />
        <ellipse cx="62" cy="142" rx="10" ry="6" fill={face.blush} opacity="0.85" />
        <ellipse cx="138" cy="142" rx="10" ry="6" fill={face.blush} opacity="0.85" />
        <ellipse cx="72" cy="188" rx="16" ry="10" fill={face.skin} />
        <ellipse cx="128" cy="188" rx="16" ry="10" fill={face.skin} />
      </g>
    </svg>
  );
}

function Eyes({ eye }: { eye: FaceStyle["eye"] }) {
  if (eye === "laser") {
    return (
      <g>
        <rect x="34" y="106" width="52" height="8" rx="4" fill="#ffd15c" />
        <rect x="114" y="106" width="52" height="8" rx="4" fill="#ffd15c" />
        <circle cx="34" cy="110" r="3" fill="#fff4c2" />
        <circle cx="166" cy="110" r="3" fill="#fff4c2" />
      </g>
    );
  }
  if (eye === "heart") {
    return (
      <g fill="#e23b6a">
        <path d="M66 112c0-8 12-10 12-2 0-8 12-6 12 2 0 10-12 16-12 16s-12-6-12-16z" />
        <path d="M110 112c0-8 12-10 12-2 0-8 12-6 12 2 0 10-12 16-12 16s-12-6-12-16z" />
      </g>
    );
  }
  if (eye === "sad") {
    return (
      <g>
        <ellipse cx="70" cy="112" rx="14" ry="16" fill="#fffaf4" />
        <ellipse cx="130" cy="112" rx="14" ry="16" fill="#fffaf4" />
        <ellipse cx="70" cy="116" rx="6" ry="7" fill="#2a1420" />
        <ellipse cx="130" cy="116" rx="6" ry="7" fill="#2a1420" />
        <path d="M84 104c6 8 10 8 16 0" fill="none" stroke="#2a1420" strokeWidth="3" strokeLinecap="round" />
        <path d="M144 104c-6 8-10 8-16 0" fill="none" stroke="#2a1420" strokeWidth="3" strokeLinecap="round" />
        <path d="M82 124c2 8 2 12 0 16" fill="none" stroke="#7eb6e0" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="70" cy="110" rx="16" ry="18" fill="#fffaf4" />
      <ellipse cx="130" cy="110" rx="16" ry="18" fill="#fffaf4" />
      <ellipse cx="74" cy="114" rx="7" ry="8" fill="#2a1420" />
      <ellipse cx="134" cy="114" rx="7" ry="8" fill="#2a1420" />
      <circle cx="77" cy="110" r="2.5" fill="#fffaf4" />
      <circle cx="137" cy="110" r="2.5" fill="#fffaf4" />
    </g>
  );
}

function Mouth({ mouth }: { mouth: FaceStyle["mouth"] }) {
  if (mouth === "bubble") {
    return (
      <g>
        <path
          d="M78 150c14 14 30 14 44 0"
          fill="none"
          stroke="#2a1420"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="132" cy="142" r="8" fill="#ffd0ea" stroke="#2a1420" strokeWidth="3" />
      </g>
    );
  }
  if (mouth === "grit") {
    return (
      <polyline
        points="78,150 90,160 102,150 114,160 126,150"
        fill="none"
        stroke="#2a1420"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  }
  if (mouth === "sad") {
    return (
      <path
        d="M78 162c14-12 30-12 44 0"
        fill="none"
        stroke="#2a1420"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    );
  }
  return (
    <path
      d="M76 150c16 18 34 18 50 0"
      fill="none"
      stroke="#2a1420"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  );
}
