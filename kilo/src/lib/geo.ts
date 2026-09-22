import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import statesTopo from "us-atlas/states-10m.json";

/** Canonical viewport for geoAlbersUsa at its default scale. */
export const MAP_W = 975;
export const MAP_H = 610;

const topo = statesTopo as unknown as Topology<{
  states: GeometryCollection<{ name: string }>;
}>;

export const projection = geoAlbersUsa()
  .scale(1300)
  .translate([MAP_W / 2, MAP_H / 2]);

export const pathGen = geoPath(projection);

export type StateFeature = Feature<Geometry, { name: string }>;

export const STATE_FEATURES: StateFeature[] = (
  feature(topo, topo.objects.states) as unknown as {
    features: StateFeature[];
  }
).features;

/** Interior borders only — drawn once as a mesh so shared edges aren't doubled. */
export const STATE_MESH = mesh(topo, topo.objects.states, (a, b) => a !== b);
export const NATION_MESH = mesh(topo, topo.objects.states, (a, b) => a === b);

export function project(coords: [number, number]): [number, number] | null {
  const p = projection(coords);
  return p ? [p[0], p[1]] : null;
}

/* ────────────────────── Search geographies ────────────────────── */

export interface Geography {
  id: string;
  label: string;
  states: string[];
  /** Short descriptor used in the search summary line. */
  blurb: string;
}

export const GEOGRAPHIES: Geography[] = [
  {
    id: "east-coast",
    label: "East Coast",
    blurb: "PJM, Carolinas and the Northeast",
    states: [
      "Maine", "New Hampshire", "Vermont", "Massachusetts", "Rhode Island", "Connecticut",
      "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland",
      "District of Columbia", "Virginia", "West Virginia", "North Carolina",
      "South Carolina", "Georgia", "Florida", "Ohio",
    ],
  },
  {
    id: "pjm",
    label: "PJM Footprint",
    blurb: "13 states plus the District of Columbia",
    states: [
      "Pennsylvania", "New Jersey", "Maryland", "Delaware", "Virginia",
      "West Virginia", "Ohio", "Kentucky", "Indiana", "Illinois",
      "Michigan", "North Carolina", "Tennessee", "District of Columbia",
    ],
  },
  {
    id: "texas",
    label: "Texas / ERCOT",
    blurb: "ERCOT interconnection",
    states: ["Texas"],
  },
  {
    id: "southeast",
    label: "Southeast",
    blurb: "Carolinas, Georgia, Tennessee Valley",
    states: [
      "Virginia", "North Carolina", "South Carolina", "Georgia",
      "Tennessee", "Alabama", "Mississippi", "Florida", "Kentucky",
    ],
  },
  {
    id: "midwest",
    label: "Midwest",
    blurb: "MISO and PJM West",
    states: [
      "Ohio", "Indiana", "Illinois", "Michigan", "Wisconsin", "Minnesota",
      "Iowa", "Missouri", "Kansas", "Nebraska", "North Dakota", "South Dakota",
    ],
  },
  {
    id: "national",
    label: "National",
    blurb: "All interconnections",
    states: [],
  },
];

export function geographyById(id: string) {
  return GEOGRAPHIES.find((g) => g.id === id) ?? GEOGRAPHIES[0];
}

export function isInGeography(stateName: string, geo: Geography) {
  if (geo.states.length === 0) return true;
  return geo.states.includes(stateName);
}
