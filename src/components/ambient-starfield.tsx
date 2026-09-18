import type { CSSProperties } from "react";

type StarStyle = CSSProperties & {
  "--star-x": string;
  "--star-y": string;
  "--star-size": string;
  "--star-delay": string;
  "--star-duration": string;
};

const stars = Array.from({ length: 28 }, (_, index): StarStyle => ({
  "--star-x": `${(index * 37 + 7) % 97}%`,
  "--star-y": `${(index * 53 + 11) % 101}%`,
  "--star-size": `${index % 7 === 0 ? 2 : 1}px`,
  "--star-delay": `${-(index % 13) * 1.7}s`,
  "--star-duration": `${24 + (index % 6) * 4}s`,
}));

export function AmbientStarfield() {
  return (
    <div className="ambient-starfield" aria-hidden="true">
      {stars.map((style, index) => (
        <span key={index} style={style} />
      ))}
    </div>
  );
}
